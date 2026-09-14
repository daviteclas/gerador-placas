// Taxa fixa de 1,35% ao mês (0.0135)
const TAXA_MENSAL = 0.0135;

export const calcularParcela = (
  precoVista: number,
  parcelas: number,
  comJuros: boolean
) => {
  if (parcelas <= 1 && !comJuros) return { valorParcela: precoVista, total: precoVista };

  let total: number;
  let valorParcela: number;

  if (comJuros) {
    // Cálculo simplificado de montante para varejo (Preço * (1 + i)^n)
    // Nota: Em cenários reais, usa-se a fórmula de PMT (Price), 
    // mas seguindo a lógica de "1.35% inclusive em 1x":
    total = precoVista * Math.pow(1 + TAXA_MENSAL, parcelas);
    valorParcela = total / parcelas;
  } else {
    // Sem juros: apenas divisão simples
    total = precoVista;
    valorParcela = precoVista / parcelas;
  }

  return { 
    valorParcela: Number(valorParcela.toFixed(2)), 
    total: Number(total.toFixed(2)) 
  };
};