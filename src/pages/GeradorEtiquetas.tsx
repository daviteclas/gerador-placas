import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Printer,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import type {
  LabelProduct,
  ItemFilaPlaca,
} from "../types";
import { PlacaConfigCard } from "../components/PlacaConfigCard";
import { pdf } from "@react-pdf/renderer";
import { PlacasDocument } from "../features/pdf/PlacasDocument";
import { useQueueStore } from "../store/useQueueStore";
import {
  ProdutoService,
  type DetalhesProduto,
} from "../services/ProdutoService";

// Adiciona tipagem global caso não exista
declare global {
  interface Window {
    _env_: { VITE_API_URL: string };
  }
}
const apiUrl = window._env_?.VITE_API_URL || import.meta.env.VITE_API_URL;

export default function GeradorEtiquetas() {

  const [filial, setFilial] = useState("1");

  // Format today as YYYY-MM-DD for the date input default
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const [data, setData] = useState(`${yyyy}-${mm}-${dd}`);
  const [saldoMaiorQueZero, setSaldoMaiorQueZero] = useState(true);

  const [detalhesPorProduto, setDetalhesPorProduto] = useState<
    Record<string, DetalhesProduto>
  >({});

  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<LabelProduct[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [linhaExpandida, setLinhaExpandida] = useState<string | null>(null);

  const [layoutsSelecionados, setLayoutsSelecionados] = useState<
    Record<string, string>
  >({});
  const [configsPersonalizadas, setConfigsPersonalizadas] = useState<
    Record<string, Omit<ItemFilaPlaca, "id">>
  >({});
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const { filaPlacas } = useQueueStore();

  const handleBuscar = async () => {
    if (!filial || !data) {
      alert("Preencha filial e data");
      return;
    }

    setBuscando(true);
    setSelecionados(new Set());
    setLinhaExpandida(null);

    try {
      const res = await fetch(
        `${apiUrl}/api/etiquetas/${filial}/${data}/${saldoMaiorQueZero ? 1 : 2}`,
      );

      if (!res.ok) {
        throw new Error("Erro na API.");
      }

      const result = await res.json();

      if (Array.isArray(result)) {
        setResultados(result);
      } else if (result && Array.isArray(result.listaProg)) {
        setResultados(result.listaProg);
      } else if (result && Array.isArray(result.data)) {
        setResultados(result.data);
      } else {
        setResultados([]);
      }
    } catch {
      console.warn("API indisponível. Utilizando dados mockados para demonstração.");
      setResultados([
        {
          CODIGO: "1010",
          DESC: "LAVADORA AUTOM. CWN13ABANA 13KG 110V BRANCO - CONSUL",
          PRECO: 2199.00,
          FISICO: 5,
          MOSTRUARIO: 1,
          SITUACAO: "ATIVO"
        },
        {
          CODIGO: "2020",
          DESC: "REFRIGERADOR BRE57FKBNA 447L 220V INOX - BRASTEMP",
          PRECO: 5499.00,
          FISICO: 2,
          MOSTRUARIO: 0,
          SITUACAO: "ATIVO"
        }
      ]);
    } finally {
      setBuscando(false);
    }
  };

  const carregarDetalhes = async (codigo: string) => {
    // Se já temos no cache, não busca de novo!
    if (detalhesPorProduto[codigo]) return;

    try {
      const detalhes = await ProdutoService.buscarDetalhesCompletos(
        filial,
        codigo,
      );

      // Atualiza o estado mantendo o que já existia e adicionando o novo
      setDetalhesPorProduto((prev) => ({
        ...prev,
        [codigo]: detalhes,
      }));
    } catch (error) {
      console.error("Erro ao buscar detalhes do produto", codigo, error);
    }
  };

  const handlePrecoChangeLote = async (codigo: string, novoPreco: any) => {
    setDetalhesPorProduto((prev) => {
      if (!prev[codigo]) return prev;
      return {
        ...prev,
        [codigo]: { ...prev[codigo], preco: novoPreco },
      };
    });

    if (novoPreco && novoPreco.PRECO > 0) {
      try {
        const codigoBase = codigo.slice(0, -1);
        const codQuery = codigo.length > 6 ? codigoBase : codigo;
        const res = await fetch(`${apiUrl}/api/seguros/${filial}/${codQuery}/${novoPreco.PRECO}`);
        const segurosData = res.ok ? await res.json() : [];
        
        setDetalhesPorProduto((prev) => {
          if (!prev[codigo]) return prev;
          return {
            ...prev,
            [codigo]: { ...prev[codigo], seguros: segurosData },
          };
        });
      } catch (error) {
        setDetalhesPorProduto((prev) => {
          if (!prev[codigo]) return prev;
          return {
            ...prev,
            [codigo]: { ...prev[codigo], seguros: [] },
          };
        });
      }
    }
  };

  const toggleSelecao = (cod: string) => {
    const next = new Set(selecionados);
    if (next.has(cod)) {
      next.delete(cod);
      if (linhaExpandida === cod) setLinhaExpandida(null);
    } else {
      next.add(cod);
      setLinhaExpandida(cod); // Expande ao selecionar
      carregarDetalhes(cod);
    }
    setSelecionados(next);
  };

  const toggleExpandir = (cod: string) => {
    if (linhaExpandida === cod) {
      setLinhaExpandida(null);
    } else {
      setLinhaExpandida(cod);
      carregarDetalhes(cod);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGerarPlacas = async () => {
    if (selecionados.size === 0) return;
    setGerandoPdf(true);

    try {
      const filaParaImprimir: ItemFilaPlaca[] = [];

      for (const cod of Array.from(selecionados)) {
        const prod = resultados.find((r) => r.CODIGO === cod);
        if (!prod) continue;

        const layout = layoutsSelecionados[cod] || "8x1";

        // 1. Usa config salva globalmente
        const personalizadosGlobais = filaPlacas.filter(
          (i) => String(i.produto.CODPROD) === String(prod.CODIGO),
        );
        if (personalizadosGlobais.length > 0) {
          personalizadosGlobais.forEach((custom) => {
            filaParaImprimir.push({ ...custom, layoutId: layout });
          });
          continue;
        }

        // 2. Usa config ajustada localmente na linha expandida
        if (configsPersonalizadas[cod]) {
          filaParaImprimir.push({
            id: `${Date.now()}-${cod}-${Math.random()}`,
            ...configsPersonalizadas[cod],
            layoutId: layout,
          });
          continue;
        }

        // 3. Usuário só marcou a checkbox (nunca abriu o card): Busca os dados padrão e cria a placa
        let detalhes = detalhesPorProduto[cod];
        if (!detalhes) {
          try {
            detalhes = await ProdutoService.buscarDetalhesCompletos(filial, cod);
          } catch (e) {
            console.error("Falha ao buscar detalhes para impressão padrão", cod);
            continue;
          }
        }

        if (detalhes) {
          filaParaImprimir.push({
            id: `${Date.now()}-${cod}-${Math.random()}`,
            layoutId: layout,
            produto: detalhes.produto,
            preco: detalhes.preco,
            formaPagamentoSelecionada: "À vista",
            valorParcela: detalhes.preco.PRECO,
            valorTotal: detalhes.preco.PRECO,
            numParcelas: 1,
            tipoPlano: "SEM_JUROS",
            comEntrada: false,
            fonte: "Montserrat",
          });
        }
      }

      if (filaParaImprimir.length === 0) {
        alert("Nenhuma placa válida para imprimir.");
        return;
      }

      const docElement = <PlacasDocument layoutId="1x1" fila={filaParaImprimir} />;
      const blob = await pdf(docElement).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar PDF das placas.");
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 print:hidden">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Gerador de Etiquetas
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrint}
            disabled={resultados.length === 0}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors border border-gray-300 disabled:opacity-50 text-sm"
          >
            Imprimir Lista
          </button>
          <button
            onClick={handleGerarPlacas}
            disabled={selecionados.size === 0 || gerandoPdf}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors border border-gray-300 disabled:opacity-50 shadow-sm"
          >
            <Printer
              className={`w-5 h-5 text-white ${gerandoPdf ? "animate-bounce" : ""}`}
            />
            {gerandoPdf
              ? "Preparando..."
              : `Gerar Placas (${selecionados.size})`}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full lg:w-[80%] max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6 print:m-0 print:p-0 print:max-w-none">
        {/* Card de Busca */}
        <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:hidden">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            Filtros
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filial
              </label>
              <input
                type="number"
                value={filial}
                onChange={(e) => setFilial(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center pb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saldoMaiorQueZero}
                  onChange={(e) => setSaldoMaiorQueZero(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className=" font-medium text-gray-700">Saldo &gt; 0</span>
              </label>
            </div>
            <div>
              <button
                onClick={handleBuscar}
                disabled={buscando}
                className="w-45 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 font-medium"
              >
                {buscando ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabela para impressão (visível apenas na impressão) */}
        <div className="hidden print:block">
          <h1 className="text-xl font-bold mb-4">
            Relatório de Produtos - Filial {filial} - {data}
          </h1>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left"></th>
                <th className="border border-gray-300 p-2 text-left">Código</th>
                <th className="border border-gray-300 p-2 text-left">Nome</th>
                <th className="border border-gray-300 p-2 text-center">Preço</th>
                <th className="border border-gray-300 p-2 text-center">Situação</th>
                <th className="border border-gray-300 p-2 text-center">
                  Físico
                </th>
                <th className="border border-gray-300 p-2 text-center">
                  Mostruário
                </th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((item) => (
                <tr key={item.CODIGO}>
                  <th className="border border-gray-300 p-2 text-left">
                    <input type="checkbox" />
                  </th>
                  <td className="border border-gray-300 p-2">{item.CODIGO}</td>
                  <td className="border border-gray-300 p-2">{item.DESC}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.PRECO)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item.SITUACAO}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item.FISICO}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item.MOSTRUARIO}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lista de Resultados na Tela */}
        {resultados.length > 0 && (
          <div className="w-100% bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">
                Resultados da Busca
              </h3>
              <span className="text-sm text-gray-500">
                {resultados.length} produtos encontrados
              </span>
            </div>

            <div className="divide-y divide-gray-200 overflow-y-auto">
              {resultados.map((item) => {
                const isSelected = selecionados.has(item.CODIGO);
                const isExpanded = linhaExpandida === item.CODIGO;

                const detalhes = detalhesPorProduto[item.CODIGO];

                return (
                  <div
                    key={item.CODIGO}
                    className={`transition-colors ${isSelected ? "bg-blue-50/50" : "hover:bg-gray-50"}`}
                  >
                    {/* LINHA VISÍVEL */}
                    <div className="flex items-center gap-6 p-2 w-100%">
                      <div className="flex-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelecao(item.CODIGO)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>

                      <div
                        className="flex-1 flex items-center justify-between gap-4 cursor-pointer min-w-0"
                        onClick={() => toggleExpandir(item.CODIGO)}
                      >
                        <div className="w-20 text-sm font-semibold text-gray-900 shrink-0">
                          {item.CODIGO}
                        </div>

                        <div
                          className="flex-1 text-sm text-gray-800 truncate min-w-0"
                          title={item.DESC}
                        >
                          {item.DESC}
                        </div>

                        <div className="w-24 text-sm font-bold text-green-600 shrink-0 text-right whitespace-nowrap">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(item.PRECO)}
                        </div>

                        <div className="w-2 text-sm font-bold text-green-600 shrink-0 text-right whitespace-nowrap">
                          {item.SITUACAO}
                        </div>

                        <div className="w-32 flex justify-center gap-3 text-xs text-gray-500 shrink-0">
                          <span
                            title="Físico"
                            className="bg-gray-100 px-2 py-1 rounded-md"
                          >
                            Fis: {item.FISICO}
                          </span>
                          <span
                            title="Mostruário"
                            className="bg-gray-100 px-2 py-1 rounded-md"
                          >
                            Mst: {item.MOSTRUARIO}
                          </span>
                        </div>

                        <div
                          className="w-36 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={layoutsSelecionados[item.CODIGO] || "8x1"}
                            onChange={(e) =>
                              setLayoutsSelecionados((prev) => ({
                                ...prev,
                                [item.CODIGO]: e.target.value,
                              }))
                            }
                            className="border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none w-full bg-white shadow-sm hover:border-gray-400 transition-colors cursor-pointer"
                          >
                            <option value="8x1">8x1 (Pequena)</option>
                            <option value="2x1">2x1 (Média)</option>
                            <option value="1x1">1x1 (Grande)</option>
                            <option value="1x2">1x2 (Gigante)</option>
                          </select>
                        </div>

                        <div className="w-6 flex justify-end text-gray-400 shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CONTEÚDO EXPANDIDO (PlacaConfigCard) */}
                    <div className={isExpanded || detalhes ? "block" : "hidden"}>
                      <div className={isExpanded ? "block" : "hidden"}>
                        {detalhes ? (
                          <div className="px-12 py-4 pb-6 bg-white border-t border-gray-100">
                            <PlacaConfigCard
                              produto={detalhes.produto}
                              preco={detalhes.preco}
                              precos={detalhes.precos}
                              seguros={detalhes.seguros}
                              onPrecoChange={(novoPreco) => handlePrecoChangeLote(item.CODIGO, novoPreco)}
                              hideAddButton={true}
                              onConfigChange={(config) => {
                                setConfigsPersonalizadas((prev) => ({
                                  ...prev,
                                  [item.CODIGO]: config,
                                }));
                              }}
                            />
                          </div>
                        ) : isExpanded ? (
                          <div className="px-12 py-8 text-center text-gray-500 bg-gray-50 border-t border-gray-100">
                            Carregando detalhes do produto...
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ESTILO DE IMPRESSÃO INCORPORADO */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
