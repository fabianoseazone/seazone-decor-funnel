import { useMemo } from "react";
import { ArrowRight, ArrowLeft, Calendar, CreditCard, TrendingUp, Shield, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFunnel } from "@/contexts/FunnelContext";
import { packagesData } from "@/data/mockData";

export function StepTerms() {
  const { selectedUnit, selectedPackage, getTotalPrice, nextStep, prevStep } = useFunnel();

  const calculation = useMemo(() => {
    const totalAmount = getTotalPrice();
    const installments = 18;
    const rate = 0.109; // 10.9% for 18x
    const totalWithInterest = totalAmount * (1 + rate);
    const monthlyPayment = totalWithInterest / installments;

    // Calculate dates based on unit delivery date
    const deliveryDate = selectedUnit?.deliveryDate || new Date();
    const executionStart = new Date();
    const executionEnd = new Date(deliveryDate);
    executionEnd.setDate(executionEnd.getDate() + 60);
    const finalPaymentDate = new Date(executionEnd);
    finalPaymentDate.setDate(finalPaymentDate.getDate() + 30);

    return {
      totalAmount,
      totalWithInterest,
      monthlyPayment,
      installments,
      rate: rate * 100,
      executionStart,
      executionEnd,
      finalPaymentDate,
      deliveryDate,
    };
  }, [getTotalPrice, selectedUnit]);

  const selectedPkg = packagesData.find(p => p.id === selectedPackage);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Badge variant="success" className="mb-4">Condições Comerciais</Badge>
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          Resumo do Investimento
        </h2>
        <p className="text-muted-foreground">
          Condições de pagamento alinhadas à operação do seu imóvel
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Financial Summary */}
        <Card variant="elevated">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-coral-gradient flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold">Resumo Financeiro</h3>
                <p className="text-sm text-muted-foreground">Pacote {selectedPkg?.name}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Valor do Pacote</span>
                <span className="font-semibold">R$ {(selectedPkg?.price || 0).toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Personalizações</span>
                <span className="font-semibold text-seazone-coral">
                  +R$ {(calculation.totalAmount - (selectedPkg?.price || 0)).toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Total Base</span>
                <span className="font-bold text-lg">R$ {calculation.totalAmount.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Juros ({calculation.rate}%)</span>
                <span className="text-sm">
                  R$ {(calculation.totalWithInterest - calculation.totalAmount).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="bg-coral-gradient rounded-xl p-4 text-center">
              <p className="text-accent-foreground/80 text-sm">Parcela Mensal</p>
              <p className="text-3xl font-bold text-accent-foreground">
                {calculation.installments}x R$ {calculation.monthlyPayment.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline & ROI */}
        <Card variant="elevated">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-seazone-success/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-seazone-success" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold">Cronograma</h3>
                <p className="text-sm text-muted-foreground">Unidade {selectedUnit?.id || "—"}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-seazone-coral flex items-center justify-center">
                  <span className="text-xs font-bold text-accent-foreground">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Entrega do Imóvel</p>
                  <p className="text-sm text-muted-foreground">
                    {calculation.deliveryDate.toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-seazone-gold flex items-center justify-center">
                  <span className="text-xs font-bold text-seazone-navy">60d</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Execução Decor</p>
                  <p className="text-sm text-muted-foreground">
                    Conclusão: {calculation.executionEnd.toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-seazone-success/10 rounded-xl border border-seazone-success/30">
                <div className="w-8 h-8 rounded-full bg-seazone-success flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Última Parcela</p>
                  <p className="text-sm text-seazone-success font-medium">
                    {calculation.finalPaymentDate.toLocaleDateString("pt-BR")} — Imóvel Operando
                  </p>
                </div>
              </div>
            </div>

            {/* ROI Card */}
            <div className="bg-premium-gradient rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-seazone-navy" />
                <span className="font-bold text-seazone-navy">Potencial de Retorno</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-seazone-navy/70">Impacto na Diária</p>
                  <p className="text-xl font-bold text-seazone-navy">{selectedPkg?.dailyRateImpact}</p>
                </div>
                <div>
                  <p className="text-sm text-seazone-navy/70">Meta de Avaliações</p>
                  <p className="text-xl font-bold text-seazone-navy">{selectedPkg?.reviewImpact}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Zero Banner */}
      <Card variant="glass" className="border-seazone-success/30 bg-seazone-success/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-seazone-success/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-7 h-7 text-seazone-success" />
            </div>
            <div>
              <Badge variant="cashflow" className="mb-2">Risco Zero</Badge>
              <h4 className="text-lg font-bold text-foreground mb-1">
                Pague apenas enquanto seu imóvel já performa
              </h4>
              <p className="text-sm text-muted-foreground">
                A 18ª e última parcela vence 30 dias após a entrega — quando seu imóvel já estará 
                operando nas plataformas e gerando receita.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button variant="hero" size="xl" onClick={nextStep}>
          Finalizar Contrato
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
