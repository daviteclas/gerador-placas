export const calcularParcelamento = (
  precoVista: number,
  parcelas: number,
  plano: string,
  entrada: boolean,
  tipoCartao: "CARTAO" | "AFINZ" | "AGORACRED" = "CARTAO"
) => {
  if (parcelas === 1 && plano === "SEM_JUROS") {
    return { parcela: precoVista, total: precoVista };
  }

  const taxaExata = 0.0135;
  let coeficiente: number;

  if (plano === "SEM_JUROS") {
    coeficiente = 1 / parcelas;
  } else if (tipoCartao === "AFINZ" && parcelas >= 2 && parcelas <= 36) {
    const fatoresAfinz: Record<number, number> = {
      2: 0.53550918, 3: 0.36499982, 4: 0.27984027, 5: 0.22882099, 6: 0.19487211,
      7: 0.17067797, 8: 0.15258071, 9: 0.13854819, 10: 0.12736112, 11: 0.11824355,
      12: 0.11063430, 13: 0.10401795, 14: 0.09836641, 15: 0.09348665, 16: 0.08923387,
      17: 0.08549736, 18: 0.08219098, 19: 0.07924675, 20: 0.07661026, 21: 0.07423748,
      22: 0.07209236, 23: 0.07014513, 24: 0.06837098, 25: 0.06745305, 26: 0.06597115,
      27: 0.06460883, 28: 0.06335318, 29: 0.06219309, 30: 0.06111891, 31: 0.06012227,
      32: 0.05919580, 33: 0.05833305, 34: 0.05752832, 35: 0.05677657, 36: 0.05607329,
    };
    coeficiente = fatoresAfinz[parcelas];
  } else if (tipoCartao === "AGORACRED" && [18, 24, 36].includes(parcelas)) {
    const fatoresAgoracred: Record<number, number> = {
      18: 0.09193,
      24: 0.07799,
      36: 0.06511,
    };
    coeficiente = fatoresAgoracred[parcelas];
  } else {
    coeficiente =
      (taxaExata * Math.pow(1 + taxaExata, parcelas)) /
      (Math.pow(1 + taxaExata, parcelas) - 1);
  }

  if (entrada && parcelas > 1 && plano !== "SEM_JUROS") {
    coeficiente = coeficiente / (1 + taxaExata);
  }

  const valorParcela = precoVista * coeficiente;
  const valorTotal = valorParcela * parcelas;

  return {
    parcela: Number(valorParcela.toFixed(2)),
    total: Number(valorTotal.toFixed(2)),
  };
};
