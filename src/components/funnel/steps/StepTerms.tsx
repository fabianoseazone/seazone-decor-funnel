import { useMemo } from "react";
import { ArrowRight, ArrowLeft, Calendar, CreditCard, Info, Hammer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFunnel } from "@/contexts/FunnelContext";
import { useEmpreendimento } from "@/hooks/useEmpreendimento";

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function monthsBetween(from: Date, to: Date): number {
  return Math.max(
    1,
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  );
}

function formatMes(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export function StepTerms() {
  const { tipologiaSelecionada, getTotalPrice, nextStep, prevStep } = useFunnel();

  const empCodigo = tipologiaSelecionada?.empreendimento_codigo ?? null;
  const { data: empreendimento } = useEmpreendimento(empCodigo);

  const calc = useMemo(() => {
    const total = getTotalPrice();
    const hoje = new Date();
    hoje.setDate(1);

    const dataEntrega: Date = empreendimento?.data_entrega
      ? new Date(empreendimento.data_entrega + "T12:00:00")
      : addMonths(hoje, 18);
    dataEntrega.setDate(1);

    // 80% paid in equal monthly installments until 30 days before delivery
    const ultimaParcela = addMonths(dataEntrega, -1);
    const numParcelas = Math.max(1, monthsBetween(hoje, ultimaParcela));
    const valor80 = total * 0.8;
    const parcelaObra = valor80 / numParcelas;

    // 20% in 2 installments after delivery
    const valor20 = total * 0.2;
    const parcelaPosEntrega = valor20 / 2;
    const parcela1PosEntrega = addMonths(dataEntrega, 1);
    const parcela2PosEntrega = addMonths(dataEntrega, 2);

    // Decoration starts the month after delivery
    const decorInicio = addMonths(dataEntrega, 1);

    return {
      total,
      valor80,
      valor20,
      numParcelas,
      parcelaObra,
      parcelaPosEntrega,
      dataEntrega,
      ultimaParcela,
      decorInicio,
      parcela1PosEntrega,
      parcela2PosEntrega,
    };
  }, [getTotalPrice, empreendimento]);

  const nomeEmp = empreendimento?.descricao ?? tipologiaSelecionada?.descricao ?? "Empreendimento";

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="text-center">
        <Badge variant="success" className="mb-3">Condições Comerciais</Badge>
        <h2 className="text-3xl font-display font-bold text-foreground mb-1">
          Condições de Pagamento
        </h2>
        <p className="text-muted-foreground text-sm">
          {nomeEmp} · Previsão de entrega: {formatMes(calc.dataEntrega)}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Financial breakdown */}
        <Card variant="elevated">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-coral-gradient flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base">Resumo Financeiro</h3>
                <p className="text-xs text-muted-foreground">Valores sujeitos à correção pelo IPCA</p>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Valor total do contrato</span>
              <span className="font-bold text-lg">
                R$ {calc.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* 80% block */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 bg-seazone-navy">
                <p className="text-xs font-bold text-primary-foreground/80 uppercase tracking-wider">
                  80% — até 30 dias antes da entrega
                </p>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor (80%)</span>
                  <span className="font-semibold">
                    R$ {calc.valor80.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Número de parcelas</span>
                  <span className="font-semibold">{calc.numParcelas}x</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border">
                  <span className="text-sm font-semibold text-foreground">Parcela mensal*</span>
                  <span className="text-seazone-coral font-bold text-lg">
                    R$ {calc.parcelaObra.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground flex gap-1 items-start">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  *Valor base sem correção. Parcelas sujeitas à correção mensal pelo IPCA.
                </p>
              </div>
            </div>

            {/* 20% block */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 bg-secondary">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  20% — após a entrega (2 parcelas)
                </p>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor (20%)</span>
                  <span className="font-semibold">
                    R$ {calc.valor20.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">1ª parcela — {formatMes(calc.parcela1PosEntrega)}</span>
                  <span className="font-semibold">
                    R$ {calc.parcelaPosEntrega.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">2ª parcela — {formatMes(calc.parcela2PosEntrega)}</span>
                  <span className="font-semibold">
                    R$ {calc.parcelaPosEntrega.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card variant="elevated">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-seazone-success/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-seazone-success" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base">Cronograma</h3>
                <p className="text-xs text-muted-foreground">{calc.numParcelas} parcelas até {formatMes(calc.ultimaParcela)}</p>
              </div>
            </div>

            {/* Timeline steps */}
            <div className="space-y-0">
              {[
                {
                  dot: "bg-seazone-coral",
                  label: "Assinatura do contrato",
                  sub: "Início das parcelas mensais",
                  detail: `${calc.numParcelas}x R$ ${calc.parcelaObra.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} + IPCA`,
                },
                {
                  dot: "bg-seazone-gold",
                  label: "30 dias antes da entrega",
                  sub: formatMes(calc.ultimaParcela),
                  detail: "Última parcela do 80%",
                },
                {
                  dot: "bg-seazone-gold",
                  label: "Entrega da obra",
                  sub: formatMes(calc.dataEntrega),
                  detail: "80% do contrato quitado",
                },
                {
                  dot: "bg-blue-500",
                  label: "Início da decoração",
                  sub: formatMes(calc.decorInicio),
                  detail: "Execução pelo time Seazone",
                  icon: <Hammer className="w-3 h-3" />,
                },
                {
                  dot: "bg-seazone-success",
                  label: "2 parcelas finais (20%)",
                  sub: `${formatMes(calc.parcela1PosEntrega)} e ${formatMes(calc.parcela2PosEntrega)}`,
                  detail: `R$ ${calc.parcelaPosEntrega.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} cada`,
                },
              ].map((step, i, arr) => (
                <div key={i} className="flex gap-4">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${step.dot}`} />
                    {i < arr.length - 1 && (
                      <div className="w-0.5 bg-border flex-1 my-1 min-h-[32px]" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-5">
                    <p className="font-semibold text-sm text-foreground leading-tight">{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.sub}</p>
                    <p className="text-xs text-seazone-coral font-medium mt-0.5">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IPCA note */}
      <Card variant="elevated" className="border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/10">
        <CardContent className="p-4">
          <div className="flex gap-3 items-start">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-foreground mb-1">Correção monetária pelo IPCA</p>
              <p className="text-muted-foreground">
                As parcelas são corrigidas mensalmente pelo IPCA (Índice Nacional de Preços ao Consumidor Amplo).
                Os valores apresentados são a base de cálculo sem a correção acumulada.
                Não há juros — apenas a atualização pelo índice oficial.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <Button variant="hero" size="xl" onClick={nextStep}>
          Finalizar Contrato <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
