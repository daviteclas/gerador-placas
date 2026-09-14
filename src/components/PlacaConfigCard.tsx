import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useQueueStore } from "../store/useQueueStore";
import { calcularParcelamento } from "../utils/math";
import type { RetornoConsultaProduto, RetornoConsultaPreco, RetornoConsultaSeguro, ItemFilaPlaca } from "../types";

interface PlacaConfigCardProps {
  produto: RetornoConsultaProduto;
  preco: RetornoConsultaPreco;
  precos: RetornoConsultaPreco[];
  seguros: RetornoConsultaSeguro[];
  onPrecoChange: (novoPreco: RetornoConsultaPreco) => void;
  showLayoutSelector?: boolean;
  onAddSuccess?: () => void;
  hideAddButton?: boolean;
  onConfigChange?: (config: Omit<ItemFilaPlaca, 'id'>) => void;
}

export function PlacaConfigCard({
  produto,
  preco,
  precos,
  seguros,
  onPrecoChange,
  showLayoutSelector = false,
  onAddSuccess,
  hideAddButton = false,
  onConfigChange,
}: PlacaConfigCardProps) {
  const { adicionarPlaca } = useQueueStore();

  const [fonte, setFonte] = useState<string>("Montserrat");
  const [seguroSelecionado, setSeguroSelecionado] = useState<RetornoConsultaSeguro | null>(null);
  const [tipoPlano, setTipoPlano] = useState<"SEM_JUROS" | "COM_JUROS">("COM_JUROS");
  const [tipoCartao, setTipoCartao] = useState<"CARTAO" | "AFINZ" | "AGORACRED">("CARTAO");
  const [comEntrada, setComEntrada] = useState(false);
  const [modoDePor, setModoDePor] = useState(false);
  const [precoDe, setPrecoDe] = useState<string>("");
  const [mostrarDesconto, setMostrarDesconto] = useState(true);
  const [modoPagamento, setModoPagamento] = useState<"A_VISTA" | "PARCELADO">("A_VISTA");
  const [numParcelas, setNumParcelas] = useState(12);
  const [layoutId, setLayoutId] = useState<string>("1x1");

  const handlePlanoChange = (plano: "SEM_JUROS" | "COM_JUROS") => {
    setTipoPlano(plano);
    if (plano === "SEM_JUROS") {
      const maxLimit = preco.CODSITPROD === "SE" ? 6 : 10;
      if (numParcelas > maxLimit) setNumParcelas(maxLimit);
    }
  };

  const handleTipoCartaoChange = (tipo: "CARTAO" | "AFINZ" | "AGORACRED") => {
    setTipoCartao(tipo);
    if (tipo === "AGORACRED") {
      if (![18, 24, 36].includes(numParcelas)) {
        setNumParcelas(18);
      }
    } else if (tipo !== "CARTAO" && numParcelas > 36) {
      setNumParcelas(36);
    }
  };

  useEffect(() => {
    let newModoPagamento = modoPagamento;
    let newTipoPlano = tipoPlano;
    let newTipoCartao = tipoCartao;
    let newNumParcelas = numParcelas;

    if (preco.CODSITPROD === "SD") {
      newModoPagamento = "A_VISTA";
    }

    if (preco.CODSITPROD === "NO") {
      if (newTipoPlano === "SEM_JUROS") {
        newTipoPlano = "COM_JUROS";
      }
      if (preco.PRECO > 3500) {
        newTipoCartao = "AFINZ";
      }
    }

    if (newTipoCartao === "CARTAO" && newTipoPlano === "SEM_JUROS") {
      const maxLimit = preco.CODSITPROD === "SE" ? 6 : 10;
      if (newNumParcelas > maxLimit) {
        newNumParcelas = maxLimit;
      }
    }

    if (newModoPagamento !== modoPagamento) setModoPagamento(newModoPagamento);
    if (newTipoPlano !== tipoPlano) setTipoPlano(newTipoPlano);
    if (newTipoCartao !== tipoCartao) setTipoCartao(newTipoCartao);
    if (newNumParcelas !== numParcelas) setNumParcelas(newNumParcelas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preco.CODSITPROD, preco.PRECO]);

  useEffect(() => {
    if (!onConfigChange) return;

    const percentualDesconto = modoDePor 
      ? Math.round(((Number(precoDe) - preco.PRECO) / Number(precoDe)) * 100) 
      : 0;

    const parcelasDoInput = modoPagamento === "A_VISTA" ? 1 : numParcelas;
    const planoFinal = modoPagamento === "A_VISTA" ? "SEM_JUROS" : tipoPlano;
    const comEntradaFinal = modoPagamento === "PARCELADO" && comEntrada;

    const numeroTotalDePagamentos = comEntradaFinal && parcelasDoInput > 0
      ? parcelasDoInput + 1
      : parcelasDoInput;

    const math = calcularParcelamento(
      preco.PRECO,
      numeroTotalDePagamentos,
      planoFinal,
      comEntradaFinal,
      tipoCartao
    );

    let mathSeguro = null;
    if (seguroSelecionado) {
      mathSeguro = calcularParcelamento(
        seguroSelecionado.PRECOSEGURO,
        numeroTotalDePagamentos,
        planoFinal,
        comEntradaFinal,
        tipoCartao
      );
    }

    let descPagamento: string;
    if (modoPagamento === "A_VISTA") {
      descPagamento = "À vista";
    } else {
      if (comEntradaFinal && parcelasDoInput > 0) {
        descPagamento = `1+${parcelasDoInput}x `;
      } else {
        descPagamento = `${parcelasDoInput}x `;
      }
      
      if (tipoCartao === "AFINZ" && parcelasDoInput < 25) {
        descPagamento += "Afinz (4,09% a.m.)";
      } else if (tipoCartao === "AFINZ" && parcelasDoInput >= 25) {
        descPagamento += "Afinz (4,19% a.m.)";
      } else if (tipoCartao === "AGORACRED") {
        descPagamento += "Agoracred (4,99% a.m.)";
      } else {
        descPagamento += planoFinal === "COM_JUROS" ? "com juros" : "sem juros";
      }
    }

    onConfigChange({
      produto,
      preco,
      seguroSelecionado,
      formaPagamentoSelecionada: descPagamento,
      valorParcela: math.parcela,
      valorTotal: math.total,
      numParcelas: numeroTotalDePagamentos,
      tipoPlano: planoFinal,
      comEntrada: comEntradaFinal,
      layoutId: showLayoutSelector ? layoutId : undefined,
      fonte: fonte,
      precoDe: modoDePor ? Number(precoDe) : undefined,
      percentualDesconto: modoDePor ? percentualDesconto : undefined,
      mostrarDesconto: modoDePor ? mostrarDesconto : false,
      tipoCartao: tipoCartao,
      valorParcelaSeguro: mathSeguro ? mathSeguro.parcela : undefined,
      valorTotalSeguro: mathSeguro ? mathSeguro.total : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    produto, preco, seguroSelecionado, modoPagamento, numParcelas, tipoPlano, tipoCartao,
    comEntrada, modoDePor, precoDe, mostrarDesconto, showLayoutSelector, layoutId, fonte
  ]);

  const handleAdicionarFila = () => {
    if (modoDePor) {
      if (!precoDe || Number(precoDe) <= preco.PRECO) {
        alert('O "Preço De" deve ser obrigatório e maior que o "Preço Por" (Preço atual).');
        return;
      }
    }

    const percentualDesconto = modoDePor 
      ? Math.round(((Number(precoDe) - preco.PRECO) / Number(precoDe)) * 100) 
      : 0;

    const parcelasDoInput = modoPagamento === "A_VISTA" ? 1 : numParcelas;
    const planoFinal = modoPagamento === "A_VISTA" ? "SEM_JUROS" : tipoPlano;
    const comEntradaFinal = modoPagamento === "PARCELADO" && comEntrada;

    const numeroTotalDePagamentos = comEntradaFinal && parcelasDoInput > 0
      ? parcelasDoInput + 1
      : parcelasDoInput;

    const math = calcularParcelamento(
      preco.PRECO,
      numeroTotalDePagamentos,
      planoFinal,
      comEntradaFinal,
      tipoCartao
    );

    let mathSeguro = null;
    if (seguroSelecionado) {
      mathSeguro = calcularParcelamento(
        seguroSelecionado.PRECOSEGURO,
        numeroTotalDePagamentos,
        planoFinal,
        comEntradaFinal,
        tipoCartao
      );
    }

    let descPagamento: string;
    if (modoPagamento === "A_VISTA") {
      descPagamento = "À vista";
    } else {
      if (comEntradaFinal && parcelasDoInput > 0) {
        descPagamento = `1+${parcelasDoInput}x `;
      } else {
        descPagamento = `${parcelasDoInput}x `;
      }
      
      if (tipoCartao === "AFINZ" && parcelasDoInput < 25) {
        descPagamento += "Afinz (4,09% a.m.)";
      } else if (tipoCartao === "AFINZ" && parcelasDoInput >= 25) {
        descPagamento += "Afinz (4,19% a.m.)";
      } else if (tipoCartao === "AGORACRED") {
        descPagamento += "Agoracred (4,99% a.m.)";
      } else {
        descPagamento += planoFinal === "COM_JUROS" ? "com juros" : "sem juros";
      }
    }

    adicionarPlaca({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      produto,
      preco,
      seguroSelecionado,
      formaPagamentoSelecionada: descPagamento,
      valorParcela: math.parcela,
      valorTotal: math.total,
      numParcelas: numeroTotalDePagamentos,
      tipoPlano: planoFinal,
      comEntrada: comEntradaFinal,
      layoutId: showLayoutSelector ? layoutId : undefined,
      fonte: fonte,
      precoDe: modoDePor ? Number(precoDe) : undefined,
      percentualDesconto: modoDePor ? percentualDesconto : undefined,
      mostrarDesconto: modoDePor ? mostrarDesconto : false,
      tipoCartao: tipoCartao,
      valorParcelaSeguro: mathSeguro ? mathSeguro.parcela : undefined,
      valorTotalSeguro: mathSeguro ? mathSeguro.total : undefined,
    });

    // Limpa a tela localmente
    setSeguroSelecionado(null);
    setModoPagamento("A_VISTA");
    setModoDePor(false);
    setPrecoDe("");
    setMostrarDesconto(true);
    if (onAddSuccess) onAddSuccess();
  };

  return (
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
            {precos.length ? (
              <select
                title="Selecione o preço/data"
                className="mb-1 border border-gray-300 rounded-md p-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white min-w-[140px]"
                value={Math.max(
                  0,
                  precos.findIndex((p) => p.DATA === preco.DATA && p.PRECO === preco.PRECO)
                )}
                onChange={(e) => onPrecoChange(precos[Number(e.target.value)])}
              >
                {precos.map((p, idx) => {
                  const dataFormatada = p.DATA
                    ? new Date(p.DATA).toLocaleDateString("pt-BR", { timeZone: "UTC" })
                    : "Atual";
                  return (
                    <option key={idx} value={idx}>
                      {dataFormatada} -{" "}
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.PRECO)} - {p.CODSITPROD}
                    </option>
                  );
                })}
              </select>
            ) : (
              <p className="text-sm text-gray-500 mb-1">Preço Base</p>
            )}
            <p className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(preco.PRECO)} - {preco.CODSITPROD}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-4">
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

        {showLayoutSelector && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Placa
            </label>
            <select
              value={layoutId}
              onChange={(e) => setLayoutId(e.target.value)}
              className="border border-gray-300 text-gray-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-gray-50 hover:bg-gray-100 transition-colors w-full"
            >
              <option value="8x1">8x1</option>
              <option value="2x1">2x1</option>
              <option value="1x1">1x1</option>
              <option value="1x2">1x2</option>
            </select>
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fonte da Placa
        </label>
        <select
          value={fonte}
          onChange={(e) => setFonte(e.target.value)}
          className="border border-gray-300 text-gray-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-gray-50 hover:bg-gray-100 transition-colors w-full"
          style={{ fontFamily: fonte }}
        >
          <option value="PlaypenSans" style={{ fontFamily: 'PlaypenSans' }}>Playpen Sans</option>
          <option value="Montserrat" style={{ fontFamily: 'Montserrat' }}>Montserrat</option>
          <option value="Grandstander" style={{ fontFamily: 'Grandstander' }}>Grandstander</option>
        </select>

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
              disabled={preco.CODSITPROD === "SD"}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border-2 transition-colors ${preco.CODSITPROD === "SD" ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400" : modoPagamento === "PARCELADO" ? "bg-blue-50 text-blue-700 border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}
            >
              PARCELADO
            </button>
          </div>
        </div>

        {modoPagamento === "PARCELADO" && (
          <div className="flex flex-col gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl animate-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Cartão
              </label>
              <div className="flex gap-2">
                {!(preco.CODSITPROD === "NO" && preco.PRECO > 3500) && (
                  <button
                    onClick={() => handleTipoCartaoChange("CARTAO")}
                    className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium border ${tipoCartao === "CARTAO" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
                  >
                    Cartão
                  </button>
                )}
                <button
                  onClick={() => handleTipoCartaoChange("AFINZ")}
                  className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium border ${tipoCartao === "AFINZ" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
                >
                  Afinz
                </button>
                {!(preco.CODSITPROD === "NO" && preco.PRECO > 3500) && (
                  <button
                    onClick={() => handleTipoCartaoChange("AGORACRED")}
                    className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium border ${tipoCartao === "AGORACRED" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
                  >
                    Agoracred
                  </button>
                )}
              </div>
            </div>

            {tipoCartao === "CARTAO" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Plano
                </label>
                <div className="flex gap-2">
                  {preco.CODSITPROD !== "NO" && (
                    <button
                      onClick={() => handlePlanoChange("SEM_JUROS")}
                      className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium border ${tipoPlano === "SEM_JUROS" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
                    >
                      Sem Juros
                    </button>
                  )}
                  <button
                    onClick={() => handlePlanoChange("COM_JUROS")}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium border ${tipoPlano === "COM_JUROS" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
                  >
                    Com Juros
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Parcelas ({numParcelas}x)
                </label>
                {tipoCartao === "AGORACRED" ? (
                  <select
                    value={numParcelas}
                    onChange={(e) => setNumParcelas(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value={18}>18x</option>
                    <option value={24}>24x</option>
                    <option value={36}>36x</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    min="2"
                    max={tipoCartao === "CARTAO" ? (tipoPlano === "SEM_JUROS" ? (preco.CODSITPROD === "SE" ? 6 : 10) : 48) : 36}
                    value={numParcelas}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      let maxLimit = tipoCartao === "CARTAO" ? 48 : 36;
                      if (tipoCartao === "CARTAO" && tipoPlano === "SEM_JUROS") {
                        maxLimit = preco.CODSITPROD === "SE" ? 6 : 10;
                      }
                      setNumParcelas(val > maxLimit ? maxLimit : val);
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  />
                )}
              </div>

              <div className="flex items-center justify-center">
                <label className="flex items-center gap-2 cursor-pointer select-none mt-6">
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
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adicionar Garantia Estendida?
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            value={seguroSelecionado ? seguroSelecionado.TEMPOGARANTIA.toString() : ""}
            onChange={(e) => {
              const seg = seguros.find((s) => s.TEMPOGARANTIA.toString() === e.target.value);
              setSeguroSelecionado(seg || null);
            }}
          >
            <option value="">Nenhuma (Sem garantia)</option>
            {seguros.map((seg) => (
              <option key={seg.TEMPOGARANTIA} value={seg.TEMPOGARANTIA}>
                +{seg.TEMPOGARANTIA} meses - {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(seg.PRECOSEGURO)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!hideAddButton && (
        <button
          onClick={handleAdicionarFila}
          className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Adicionar Placa à Fila
        </button>
      )}
    </div>
  );
}
