export const SERVICOS = [
  { label: "1.1 Medição contrato",         value: 0       },
  { label: "1.2 Medição executivo",         value: 900     },
  { label: "1.3 Ligação de energia",        value: 600     },
  { label: "1.4 Compras",                   value: 6460    },
  { label: "1.5 Visita presencial",         value: 21000   },
  { label: "1.6 Frete logística",           value: 2200    },
  { label: "1.7 Custo fixo — time",         value: 9280    },
  { label: "1.8 Contabilidade",             value: 65.99   },
  { label: "1.9 Custos Holding Seazone",    value: 2700    },
  { label: "1.10 Comissão Comercial Decor", value: 1770    },
];

export const TOTAL_SERVICOS = SERVICOS.reduce((s, i) => s + i.value, 0);

export function calcTotalContrato(orcamento: number): number {
  const taxaAdm = orcamento * 0.06;
  return TOTAL_SERVICOS + orcamento + taxaAdm;
}
