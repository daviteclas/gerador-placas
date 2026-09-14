// src/pages/Generator.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Printer, Trash2 } from "lucide-react";
import { useQueueStore } from "../store/useQueueStore";
import type {
  RetornoConsultaProduto,
  RetornoConsultaPreco,
  RetornoConsultaSeguro,
} from "../types";

import { pdf } from "@react-pdf/renderer";
import { PlacasDocument } from "../features/pdf/PlacasDocument";
import { PlacaConfigCard } from "../components/PlacaConfigCard";
import { ProdutoService } from "../services/ProdutoService";

// Adiciona a tipagem para o objeto de ambiente que será injetado no `window`
declare global {
  interface Window { _env_: { VITE_API_URL: string }; }
}

// Lê a URL da API do objeto global (para Docker) ou das variáveis do Vite (para dev local)
const apiUrl = window._env_?.VITE_API_URL || import.meta.env.VITE_API_URL;


export default function Generator() {
  const { layoutId } = useParams();
  const navigate = useNavigate();
  const { filaPlacas, removerPlaca } = useQueueStore();

  // Estados dos inputs de busca
  const [filial, setFilial] = useState<string>(""); // Ex: Filial padrão
  const [codigoProduto, setCodigoProduto] = useState<string>("");
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [buscando, setBuscando] = useState(false);

  // Estados dos dados retornados
  const [produto, setProduto] = useState<RetornoConsultaProduto | null>(null);
  const [preco, setPreco] = useState<RetornoConsultaPreco | null>(null);
  const [precos, setPrecos] = useState<RetornoConsultaPreco[]>([]);
  const [seguros, setSeguros] = useState<RetornoConsultaSeguro[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const handleBuscarProduto = async () => {
    // 1. Validação inicial de tela
    if (!filial || !codigoProduto) {
      alert("Por favor, preencha o número da filial e o código do produto.");
      return;
    }

    setBuscando(true);
    setErro(null);

    try {                                                                                                                                                                  
      const detalhes = await ProdutoService.buscarDetalhesCompletos(filial, codigoProduto);                                                                                
      setProduto(detalhes.produto);                                                                                                                                        
      setPreco(detalhes.preco);                                                                                                                                            
      setPrecos(detalhes.precos);                                                                                                                                          
      setSeguros(detalhes.seguros);                                                                                                                                        
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Ocorreu um erro desconhecido.");

      // Limpa os dados da tela para não gerar placa com erro,
      // mas mantém a 'filial' preenchida para facilitar a vida do operador!
      setCodigoProduto("");
      setProduto(null);
      setPreco(null);
      setPrecos([]);
      setSeguros([]);
    } finally {
      // Desliga o botão de "Buscando..." independente de dar certo ou errado
      setBuscando(false);
    }
    window.scrollTo(0, 200);
  };

  const handlePrecoChange = async (novoPreco: RetornoConsultaPreco) => {
    setPreco(novoPreco);

    // Busca as opções de seguro atualizadas com base no novo preço escolhido
    if (novoPreco && novoPreco.PRECO > 0) {
      try {
        const segurosResponse = await fetch(
          `${apiUrl}/api/seguros/${filial}/${codigoProduto}/${novoPreco.PRECO}`,
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
              : `Gerar Placas (${filaPlacas.length})`}
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
            <PlacaConfigCard
              produto={produto}
              preco={preco}
              precos={precos}
              seguros={seguros}
              onPrecoChange={handlePrecoChange}
              onAddSuccess={() => {
                setCodigoProduto("");
                setProduto(null);
                setPreco(null);
                setPrecos([]);
                setSeguros([]);
              }}
            />
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
                        {item.precoDe && (
                          <span className="text-orange-600 font-medium mr-1">
                            De/Por ({item.percentualDesconto}%) •
                          </span>
                        )}
                        {item.formaPagamentoSelecionada}
                        {item.seguroSelecionado &&
                          ` • Seguro: +${item.seguroSelecionado.TEMPOGARANTIA}m`}
                        {` • Fonte: ${item.fonte || 'PlaypenSans'}`}
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
