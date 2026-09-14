// src/services/ProdutoService.ts
import type {
  RetornoConsultaProduto,
  RetornoConsultaPreco,
  RetornoConsultaSeguro,
} from "../types";

import {
  SP_SIP_PLACA_CONSULTA_PRODUTO,
  SP_SIP_PLACA_CONSULTA_PRECOS,
  SP_SIP_PLACA_CONSULTA_PRODUTO_COMSEGURO
} from "./mockDb/procedures";

const apiUrl = window._env_?.VITE_API_URL || import.meta.env.VITE_API_URL;

export interface DetalhesProduto {
  produto: RetornoConsultaProduto;
  preco: RetornoConsultaPreco;
  precos: RetornoConsultaPreco[];
  seguros: RetornoConsultaSeguro[];
}

export class ProdutoService {
  static async buscarDetalhesCompletos(
    filial: string | number,
    codigo: string,
  ): Promise<DetalhesProduto> {
    const numCodigo = Number(codigo);

    // 1. Fallback para os produtos mockados para permitir testes locais/github pages sem API
    if (numCodigo === 1010 || numCodigo === 2020) {
      const produto = await SP_SIP_PLACA_CONSULTA_PRODUTO(1, Number(filial), numCodigo);
      const preco = await SP_SIP_PLACA_CONSULTA_PRECOS(Number(filial), numCodigo);
      const seguros = await SP_SIP_PLACA_CONSULTA_PRODUTO_COMSEGURO(1, Number(filial), numCodigo, preco.PRECO);

      const descricaoLimpa = [
        ...new Set(produto.DESCRICAOPROD.split(" ")),
      ].join(" ");
      produto.DESCRICAOPROD = descricaoLimpa;

      return {
        produto,
        preco,
        precos: [preco],
        seguros
      };
    }

    // 1. Busca o Produto e os Preços via API
    const response = await fetch(`${apiUrl}/api/produto/${filial}/${codigo}`);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Erro na API." }));
      throw new Error(errorData.message || "Produto não encontrado.");
    }

    const data = await response.json();

    // 2. Aplica a Regra de Negócio (Limpeza da Descrição)
    const descricaoLimpa = [
      ...new Set(data.produto.DESCRICAOPROD.split(" ")),
    ].join(" ");
    data.produto.DESCRICAOPROD = descricaoLimpa;

    const precos = data.precos || (data.preco ? [data.preco] : []);
    let seguros: RetornoConsultaSeguro[] = [];

    // 3. Encadeia a busca de seguros, se houver preço
    if (data.preco && data.preco.PRECO > 0) {
      try {
        const segRes = await fetch(
          `${apiUrl}/api/seguros/${filial}/${codigo}/${data.preco.PRECO}`,
        );
        if (segRes.ok) {
          seguros = await segRes.json();
        }
      } catch (e) {
        console.error("Falha ao buscar seguros", e);
      }
    }

    return {
      produto: data.produto,
      preco: data.preco,
      precos: precos,
      seguros: seguros,
    };
  }
}
