// src/types/index.ts

// ==========================================
// TABELAS DO BANCO DE DADOS (Referência)
// ==========================================
export interface Usuario {
  CODIGO_USUARIO: number; // BigInt
  EMAIL: string;
  ATIVO: boolean;
}

export interface FormaPagamento {
  CODIGO_FORMA: number;
  DESCRICAO: string;
}

export interface DadosForma {
  CODIGO_DADOSFORMA: number;
  FORMA: number; // FK
  PARCELAS: number;
  TAXA: number;
  DATAINSERIDO: string;
  CODIGO_USUARIO: number;
}

// ==========================================
// RETORNOS DAS STORED PROCEDURES
// ==========================================

export interface RetornoConsultaProduto {
  CODPROD: string | number;
  DESCRICAOPROD: string;
  FANTASIA: string;
  codbarra: string;
  QTMAXPARCELA: number;
}

export interface RetornoConsultaPreco {
  PRECO: number;
  DATA: string;
  CODSITPROD: string;
}

export interface RetornoConsultaSeguro {
  TEMPOGARANTIA: number | string;
  DESCRICAOSEG: string;
  PRECOSEGURO: number;
}

// ==========================================
// TIPAGEM DA FILA DO GERADOR (Para o Zustand mais tarde)
// ==========================================
export interface ItemFilaPlaca {
  id: string;
  produto: RetornoConsultaProduto;
  preco: RetornoConsultaPreco;
  seguroSelecionado?: RetornoConsultaSeguro | null;
  formaPagamentoSelecionada: string;
  layoutId?: string;
  // Novos campos para a matemática financeira
  valorParcela: number;
  valorTotal: number;
  numParcelas: number;
  tipoPlano: 'SEM_JUROS' | 'COM_JUROS';
  comEntrada: boolean;
  valorParcelaSeguro?: number;
  valorTotalSeguro?: number;
  precoDe?: number;
  percentualDesconto?: number;
  mostrarDesconto?: boolean;
  fonte?: string;
  tipoCartao?: string;
}

// ==========================================
// ETIQUETAS E MOCK REPOSITORY
// ==========================================
export interface LabelProduct {
  CODIGO: string;
  DESC: string;
  PRECO: number;
  FISICO: number;
  MOSTRUARIO: number;
  SITUACAO: string;
}
