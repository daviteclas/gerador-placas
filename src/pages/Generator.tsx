// src/pages/Generator.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Plus, Printer, Trash2 } from "lucide-react";
import { useQueueStore } from "../store/useQueueStore";
import type {
  RetornoConsultaProduto,
  RetornoConsultaPreco,
  RetornoConsultaSeguro,
} from "../types";

import { pdf } from "@react-pdf/renderer";
import { PlacasDocument } from "../features/pdf/PlacasDocument";

const calcularParcelamento = (
  precoVista: number,
  parcelas: number,
  plano: string,
  entrada: boolean,
) => {
  // Se for 1x SEM juros, retorna o preço original
  if (parcelas === 1 && plano === "SEM_JUROS") {
    return { parcela: precoVista, total: precoVista };
  }

  const taxaExata = 0.0135;

  // Tabela Price: [ i * (1 + i)^n ] / [ (1 + i)^n - 1 ]
  // Para n=1, a fórmula simplifica para: precoVista * (1 + i)
  let coeficiente =
    (taxaExata * Math.pow(1 + taxaExata, parcelas)) /
    (Math.pow(1 + taxaExata, parcelas) - 1);

  if (entrada && parcelas > 1) {
    coeficiente = coeficiente / (1 + taxaExata);
  }

  const valorParcela = precoVista * coeficiente;
  const valorTotal = valorParcela * parcelas;

  return {
    parcela: Number(valorParcela.toFixed(2)),
    total: Number(valorTotal.toFixed(2)),
  };
};

export default function Generator() {
  const { layoutId } = useParams();
  const navigate = useNavigate();
  const { filaPlacas, adicionarPlaca, removerPlaca } = useQueueStore();

  // Estados dos inputs de busca
  const [filial, setFilial] = useState<string>(""); // Ex: Filial padrão
  const [codigoProduto, setCodigoProduto] = useState<string>("");
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [fonte, setFonte] = useState<string>("PlaypenSans");

  // Estados dos dados retornados
  const [produto, setProduto] = useState<RetornoConsultaProduto | null>(null);
  const [preco, setPreco] = useState<RetornoConsultaPreco | null>(null);
  const [precos, setPrecos] = useState<RetornoConsultaPreco[]>([]);
  const [seguros, setSeguros] = useState<RetornoConsultaSeguro[]>([]);

  const [erro, setErro] = useState<string | null>(null);

  const [seguroSelecionado, setSeguroSelecionado] =
    useState<RetornoConsultaSeguro | null>(null);

  // const [numParcelas, setNumParcelas] = useState(1);
  const [tipoPlano, setTipoPlano] = useState<"SEM_JUROS" | "COM_JUROS">(
    "COM_JUROS",
  );
  const [comEntrada, setComEntrada] = useState(false);

  // Estados do modo De/Por
  const [modoDePor, setModoDePor] = useState(false);
  const [precoDe, setPrecoDe] = useState<string>("");
  const [mostrarDesconto, setMostrarDesconto] = useState(true);

  const [modoPagamento, setModoPagamento] = useState<"A_VISTA" | "PARCELADO">(
    "A_VISTA",
  );
  // Mude o valor inicial de parcelas para 10 ou 12 (para quando o usuário clicar em Parcelado já ter um valor sugerido)
  const [numParcelas, setNumParcelas] = useState(12);

  const [buscando, setBuscando] = useState(false);

  const handleBuscarProduto = async () => {
    // 1. Validação inicial de tela
    if (!filial || !codigoProduto) {
      alert("Por favor, preencha o número da filial e o código do produto.");
      return;
    }

    setBuscando(true);

    try {
      // PASSO 1: BUSCAR PRODUTO E PREÇO
      const response = await fetch(
        `http://localhost:3001/api/produto/${filial}/${codigoProduto}`,
      );

      if (!response.ok) {
        throw new Error("Produto não encontrado nesta filial.");
      }

      const data = await response.json();

      // 1. Pega a descrição suja
      const descricaoSuja = data.produto.DESCRICAOPROD;

      // 2. Limpa usando a lógica do Set (Solução 1)
      const descricaoLimpa = [...new Set(descricaoSuja.split(" "))].join(" ");

      // 3. Sobrescreve o valor no objeto antes de mandar para a tela
      data.produto.DESCRICAOPROD = descricaoLimpa;

      // Atualiza a tela com o produto e o preço encontrados
      setProduto(data.produto);
      setPreco(data.preco);
      // Salva a lista completa de preços para o seletor (com fallback caso a API antiga responda)
      setPrecos(data.precos || (data.preco ? [data.preco] : []));

      // PASSO 2: BUSCAR SEGURO (Baseado no Preço)
      // Só busca seguro se a API retornou um preço válido maior que zero
      if (data.preco && data.preco.PRECO > 0) {
        const segurosResponse = await fetch(
          `http://localhost:3001/api/seguros/${filial}/${codigoProduto}/${data.preco.PRECO}`,
        );

        if (segurosResponse.ok) {
          const segurosData = await segurosResponse.json();
          setSeguros(segurosData); // Alimenta o select de garantias
        } else {
          // Se a API de seguros der erro, deixamos a lista vazia
          setSeguros([]);
        }
      } else {
        // Se o produto não tem preço (está zerado), não tem seguro
        setSeguros([]);
      }
    } catch (error) {
      console.error("Erro na busca:", error);

      // TRATAMENTO DE ERROS
      alert("Produto não encontrado nesta filial ou sem preço cadastrado.");

      // Limpa os dados da tela para não gerar placa com erro,
      // mas mantém a 'filial' preenchida para facilitar a vida do operador!
      setCodigoProduto("");
      setProduto(null);
      setPreco(null);
      setPrecos([]);
      setSeguros([]);
      setModoDePor(false);
      setPrecoDe("");
      setMostrarDesconto(true);
    } finally {
      // Desliga o botão de "Buscando..." independente de dar certo ou errado
      setBuscando(false);
    }
    window.scrollTo(0, document.body.scrollHeight);
  };

  const handlePlanoChange = (plano: "SEM_JUROS" | "COM_JUROS") => {
    setTipoPlano(plano);
    if (plano === "SEM_JUROS" && numParcelas > 10) setNumParcelas(10);
  };

  const handlePrecoChange = async (novoPreco: RetornoConsultaPreco) => {
    setPreco(novoPreco);
    setSeguroSelecionado(null); // Reseta o seguro ao trocar o preço

    // Busca as opções de seguro atualizadas com base no novo preço escolhido
    if (novoPreco && novoPreco.PRECO > 0) {
      try {
        const segurosResponse = await fetch(
          `http://localhost:3001/api/seguros/${filial}/${codigoProduto}/${novoPreco.PRECO}`,
        );
        if (segurosResponse.ok) {
          const segurosData = await segurosResponse.json();
          setSeguros(segurosData);
        } else {
          setSeguros([]);
        }
      } catch (error) {
        console.error("Erro na busca de seguros após trocar preço:", error);
        setSeguros([]);
      }
    } else {
      setSeguros([]);
    }
  };

  const handleGerarPDF = async () => {
    if (filaPlacas.length === 0) return;
    setGerandoPdf(true);

    try {
      // 1. Cria o documento React-PDF
      const doc = (
        <PlacasDocument layoutId={layoutId || "1x1"} fila={filaPlacas} />
      );

      // 2. Transforma em Blob (Arquivo em memória)
      const blob = await pdf(doc).toBlob();

      // 3. Cria uma URL temporária e abre em nova aba
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um erro ao preparar o PDF para impressão.");
    } finally {
      setGerandoPdf(false);
    }
  };

  const handleAdicionarFila = () => {
    if (!produto || !preco) return;

    // Validação De/Por
    if (modoDePor) {
      if (!precoDe || Number(precoDe) <= preco.PRECO) {
        alert('O "Preço De" deve ser obrigatório e maior que o "Preço Por" (Preço atual).');
        return;
      }
    }

    const percentualDesconto = modoDePor 
      ? Math.round(((Number(precoDe) - preco.PRECO) / Number(precoDe)) * 100) 
      : 0;

    // Se for à vista, força 1x sem juros. Se for parcelado, usa as configurações escolhidas.
    const parcelasDoInput = modoPagamento === "A_VISTA" ? 1 : numParcelas;
    const planoFinal = modoPagamento === "A_VISTA" ? "SEM_JUROS" : tipoPlano;
    const comEntradaFinal = modoPagamento === "PARCELADO" && comEntrada;

    // Se tem entrada, o número de pagamentos é N+1 (1 de entrada + N parcelas do input)
    const numeroTotalDePagamentos =
      comEntradaFinal && parcelasDoInput > 0
        ? parcelasDoInput + 1
        : parcelasDoInput;

    const math = calcularParcelamento(
      preco.PRECO,
      numeroTotalDePagamentos,
      planoFinal,
      comEntradaFinal,
    );

    let descPagamento: string;
    if (modoPagamento === "A_VISTA") {
      descPagamento = "À vista";
    } else {
      // PARCELADO
      if (comEntradaFinal && parcelasDoInput > 0) {
        // Ex: 1+12x
        descPagamento = `1+${parcelasDoInput}x `;
      } else {
        descPagamento = `${parcelasDoInput}x `;
      }
      descPagamento += planoFinal === "COM_JUROS" ? "com juros" : "sem juros";
    }

    adicionarPlaca({
      id: crypto.randomUUID(),
      produto,
      preco,
      seguroSelecionado,
      formaPagamentoSelecionada: descPagamento,
      valorParcela: math.parcela,
      valorTotal: math.total,
      numParcelas: numeroTotalDePagamentos, // O número total de pagamentos
      tipoPlano: planoFinal, // Usa o plano tratado
      comEntrada: comEntradaFinal,
      fonte: fonte,
      // Novos campos De/Por (Cast para any para evitar erro de tipo se ItemFilaPlaca não estiver atualizado)
      precoDe: modoDePor ? Number(precoDe) : undefined,
      percentualDesconto: modoDePor ? percentualDesconto : undefined,
      mostrarDesconto: modoDePor ? mostrarDesconto : false,
    } as any);

    // Limpa a tela
    setCodigoProduto("");
    setProduto(null);
    setPreco(null);
    setPrecos([]);
    setSeguros([]);
    setSeguroSelecionado(null); // Adicionado: Limpa o seguro selecionado
    setModoPagamento("A_VISTA"); // Reseta para o padrão
    setModoDePor(false);
    setPrecoDe("");
    setMostrarDesconto(true);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Gerador de Placas
            </h1>
            <p className="text-sm text-gray-500">
              Modelo selecionado:{" "}
              <span className="font-semibold text-blue-600">{layoutId}</span>
            </p>
          </div>
        </div>
        {/* HEADER: Substitua o botão antigo por este */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleGerarPDF}
            disabled={filaPlacas.length === 0 || gerandoPdf}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Printer
              className={`w-5 h-5 ${gerandoPdf ? "animate-bounce" : ""}`}
            />
            {gerandoPdf
              ? "Preparando..."
              : `Imprimir PDF (${filaPlacas.length})`}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA ESQUERDA: BUSCA E CONFIGURAÇÃO */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card de Busca */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              Localizar Produto
            </h2>
            {/* BARRA DE BUSCA - FILIAL E PRODUTO */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Campo 1: Input de Filial (Número) */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nº Filial
                </label>
                <input
                  type="number"
                  value={filial}
                  onChange={(e) => setFilial(e.target.value)}
                  placeholder="Ex: 1"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white outline-none"
                />
              </div>

              {/* Campo 2: Código e Botão */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código do Produto
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={codigoProduto}
                    onChange={(e) => setCodigoProduto(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleBuscarProduto()
                    }
                    placeholder="Ex: 505048"
                    className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button
                    onClick={handleBuscarProduto}
                    disabled={buscando || !codigoProduto || !filial}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed font-medium"
                  >
                    {buscando ? "Buscando..." : "Localizar"}
                  </button>
                </div>
              </div>
            </div>
            {erro && (
              <p className="mt-3 text-sm text-red-600 font-medium">{erro}</p>
            )}
          </div>

          {/* Card de Resultados e Seleção (Só aparece se achar o produto) */}
          {produto && preco && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 ring-1 ring-blue-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-2">
                      {produto.FANTASIA}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {produto.DESCRICAOPROD}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Cód. Barras: {produto.codbarra}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <label className="text-xs font-medium text-gray-500 mb-1">
                      Selecionar Preço/Data
                    </label>
                    {precos.length > 1 ? (
                      <select
                        className="mb-1 border border-gray-300 rounded-md p-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white min-w-[140px]"
                        value={Math.max(
                          0,
                          precos.findIndex(
                            (p) =>
                              p.DATA === preco.DATA && p.PRECO === preco.PRECO,
                          ),
                        )}
                        onChange={(e) =>
                          handlePrecoChange(precos[Number(e.target.value)])
                        }
                      >
                        {precos.map((p, idx) => {
                          // Se houver data, formata para visualização UTC
                          const dataFormatada = p.DATA
                            ? new Date(p.DATA).toLocaleDateString("pt-BR", {
                                timeZone: "UTC",
                              })
                            : "Atual";

                          return (
                            <option key={idx} value={idx}>
                              {dataFormatada} -{" "}
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(p.PRECO)}{" "}
                              - {p.CODSITPROD}
                            </option>
                          );
                        })}
                      </select>
                    ) : (
                      <p className="text-sm text-gray-500 mb-1">Preço Base</p>
                    )}
                    <p className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(preco.PRECO)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6 space-y-4">
                {/* NOVO: MODO DE / POR (PROMOÇÃO) */}
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={modoDePor}
                      onChange={(e) => setModoDePor(e.target.checked)}
                      className="w-5 h-5 rounded text-orange-600 border-orange-300 focus:ring-orange-500"
                    />
                    <span className="text-sm font-bold text-orange-900">
                      Ativar Modo De/Por (Promoção)
                    </span>
                  </label>

                  {modoDePor && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-orange-200 animate-in slide-in-from-top-2">
                      <div>
                        <label className="block text-xs font-medium text-orange-800 mb-1">
                          Preço "De" (Original)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={precoDe}
                          onChange={(e) => {
                            const valor = e.target.value.replace(',', '.');
                            // Permite apenas números e um único ponto decimal
                            if (/^\d*\.?\d*$/.test(valor)) {
                              setPrecoDe(valor);
                            }
                          }}
                          placeholder="Ex: 2599.90"
                          className="w-full border border-orange-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                        />
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={mostrarDesconto}
                            onChange={(e) => setMostrarDesconto(e.target.checked)}
                            className="w-4 h-4 rounded text-orange-600 border-orange-300 focus:ring-orange-500"
                          />
                          <span className="text-xs font-medium text-orange-800">
                            Exibir percentual de desconto
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonte da Placa
                </label>
                <select
                  value={fonte}
                  onChange={(e) => setFonte(e.target.value)}
                  className="border border-gray-300 text-gray-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-gray-50 hover:bg-gray-100 transition-colors"
                  title="Selecione a fonte da placa"
                  style={{ fontFamily: fonte }}
                >
                  <option value="PlaypenSans" style={{ fontFamily: 'PlaypenSans' }}>Playpen Sans</option>
                  <option value="Montserrat" style={{ fontFamily: 'Montserrat' }}>Montserrat</option>
                  <option value="Grandstander" style={{ fontFamily: 'Grandstander' }}>Grandstander</option>
                </select>

                {/* 1. SELEÇÃO PRINCIPAL (À Vista ou Parcelado) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de Pagamento
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setModoPagamento("A_VISTA")}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border-2 transition-colors ${modoPagamento === "A_VISTA" ? "bg-blue-50 text-blue-700 border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}
                    >
                      À VISTA
                    </button>
                    <button
                      onClick={() => setModoPagamento("PARCELADO")}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border-2 transition-colors ${modoPagamento === "PARCELADO" ? "bg-blue-50 text-blue-700 border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}
                    >
                      PARCELADO
                    </button>
                  </div>
                </div>

                {/* 2. OPÇÕES DE PARCELAMENTO (Só aparece se selecionar Parcelado) */}
                {modoPagamento === "PARCELADO" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Plano
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePlanoChange("SEM_JUROS")}
                          className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium border ${tipoPlano === "SEM_JUROS" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
                        >
                          Sem Juros
                        </button>
                        <button
                          onClick={() => handlePlanoChange("COM_JUROS")}
                          className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium border ${tipoPlano === "COM_JUROS" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
                        >
                          Com Juros
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Parcelas ({numParcelas}x)
                      </label>
                      <input
                        type="number"
                        min="2" // Começa em 2x, pois 1x é à vista
                        max="48"
                        value={numParcelas}
                        onChange={(e) => setNumParcelas(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      />
                    </div>

                    <div className="flex items-center justify-center">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={comEntrada}
                          onChange={(e) => setComEntrada(e.target.checked)}
                          className="w-5 h-5 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-700">
                          Com Entrada
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 3. SELEÇÃO DE GARANTIA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adicionar Garantia Estendida?
                  </label>
                  <select
                    title="selecionar garantia"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    onChange={(e) => {
                      const seg = seguros.find(
                        (s) => s.TEMPOGARANTIA.toString() === e.target.value,
                      );
                      setSeguroSelecionado(seg || null);
                    }}
                  >
                    <option value="">Nenhuma (Sem garantia)</option>
                    {seguros.map((seg) => (
                      <option key={seg.TEMPOGARANTIA} value={seg.TEMPOGARANTIA}>
                        +{seg.TEMPOGARANTIA} meses -{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(seg.PRECOSEGURO)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleAdicionarFila}
                className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Adicionar Placa à Fila
              </button>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: FILA DE IMPRESSÃO */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-800">Fila de Impressão</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {filaPlacas.length} itens
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filaPlacas.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <Printer className="w-12 h-12 opacity-20" />
                  <p className="text-sm text-center">
                    Sua fila está vazia.
                    <br />
                    Busque um produto e adicione-o aqui.
                  </p>
                </div>
              ) : (
                filaPlacas.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3 group"
                  >
                    <div className="flex-none font-bold text-gray-400">
                      {(index + 1).toString().padStart(2, "0")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.produto.DESCRICAOPROD}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {(item as any).precoDe && (
                          <span className="text-orange-600 font-medium mr-1">
                            De/Por ({(item as any).percentualDesconto}%) •
                          </span>
                        )}
                        {item.formaPagamentoSelecionada}
                        {item.seguroSelecionado &&
                          ` • Seguro: +${item.seguroSelecionado.TEMPOGARANTIA}m`}
                        {` • Fonte: ${(item as any).fonte || 'PlaypenSans'}`}
                      </p>
                    </div>
                    <button
                      onClick={() => removerPlaca(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remover da fila"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
