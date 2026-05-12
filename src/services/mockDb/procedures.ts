// src/services/mockDb/procedures.ts
import type { 
  RetornoConsultaProduto, 
  RetornoConsultaPreco, 
  RetornoConsultaSeguro 
} from '../../types';

// Função auxiliar para simular latência de rede (ex: 500ms)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Banco de dados em memória (Mock)
const mockProdutos: Record<number, RetornoConsultaProduto> = {
  1010: {
    CODSITPROD: 'ATIVO',
    DESCRICAOPROD: 'LAVADORA AUTOM. CWN13ABANA 13KG 110V BRANCO',
    codbarra: '7891129243567',
    FANTASIA: 'CONSUL',
    QTMAXPARCELA: 12
  },
  2020: {
    CODSITPROD: 'ATIVO',
    DESCRICAOPROD: 'REFRIGERADOR BRE57FKBNA 447L 220V INOX',
    codbarra: '7891129288888',
    FANTASIA: 'BRASTEMP',
    QTMAXPARCELA: 12
  }
};

const mockPrecos: Record<number, RetornoConsultaPreco> = {
  1010: {
    PRECO: 2199.00,
    DATA: new Date().toISOString(),
    CODSITPROD: 'ATIVO'
  },
  2020: {
    PRECO: 5499.00,
    DATA: new Date().toISOString(),
    CODSITPROD: 'ATIVO'
  }
};

const mockSeguros: Record<number, RetornoConsultaSeguro[]> = {
  1010: [
    { TEMPOGARANTIA: 12, DESCRICAOSEG: 'LEVE MAIS 1 ANO DE PROTEÇÃO', PRECOSEGURO: 350.00 },
    { TEMPOGARANTIA: 24, DESCRICAOSEG: 'LEVE MAIS 2 ANOS DE PROTEÇÃO', PRECOSEGURO: 619.65 }
  ],
  2020: [
    { TEMPOGARANTIA: 12, DESCRICAOSEG: 'LEVE MAIS 1 ANO DE PROTEÇÃO', PRECOSEGURO: 800.00 },
    { TEMPOGARANTIA: 24, DESCRICAOSEG: 'LEVE MAIS 2 ANOS DE PROTEÇÃO', PRECOSEGURO: 1337.03 }
  ]
};

// ==========================================
// FUNÇÕES QUE SIMULAM AS PROCEDURES
// ==========================================

export async function SP_SIP_PLACA_CONSULTA_PRODUTO(
  constante: number, 
  filial: number, 
  codigoProduto: number
): Promise<RetornoConsultaProduto> {
  await delay(600); // Simula rede
  const produto = mockProdutos[codigoProduto];
  if (!produto) throw new Error('Produto não encontrado');
  return produto;
}

export async function SP_SIP_PLACA_CONSULTA_PRECOS(
  filial: number, 
  codigoProduto: number
): Promise<RetornoConsultaPreco> {
  await delay(400); // Simula rede
  const preco = mockPrecos[codigoProduto];
  if (!preco) throw new Error('Preço não encontrado');
  return preco;
}

export async function SP_SIP_PLACA_CONSULTA_PRODUTO_COMSEGURO(
  constante: number, 
  filial: number, 
  codigoProduto: number, 
  preco: string | number
): Promise<RetornoConsultaSeguro[]> {
  await delay(500); // Simula rede
  // Retorna array de seguros disponíveis para o produto, ou array vazio se não tiver
  return mockSeguros[codigoProduto] || [];
}