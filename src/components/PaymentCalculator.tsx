import { useState, useMemo } from "react";
import { CreditCard, Shield, Calendar, CheckCircle2, Zap, Clock } from "lucide-react";
import investorHappy from "@/assets/investor-happy.jpg";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { packages, type PackageType } from "./PackageSelector";

interface PaymentCalculatorProps {
  selectedPackage: PackageType;
  energyConnected: boolean;
  onEnergyToggle: () => void;
}

export function PaymentCalculator({ selectedPackage, energyConnected, onEnergyToggle }: PaymentCalculatorProps) {
  const [installments, setInstallments] = useState(18);
  
  const selectedPkg = packages.find((p) => p.id === selectedPackage)!;
  
  const calculation = useMemo(() => {
    const baseAmount = selectedPkg.price;
    const rates: Record<number, number> = {
      3: 0,
      6: 0.029,
      9: 0.049,
      12: 0.069,
      15: 0.089,
      18: 0.109,
    };
    
    const rate = rates[installments] || 0.109;
    const totalWithInterest = baseAmount * (1 + rate);
    const monthlyPayment = totalWithInterest / installments;
    
    return {
      baseAmount,
      totalWithInterest,
      monthlyPayment,
      interestRate: rate * 100,
    };
  }, [selectedPkg, installments]);

  const executionStart = energyConnected ? new Date() : null;
  const deliveryDate = executionStart 
    ? new Date(executionStart.getTime() + 60 * 24 * 60 * 60 * 1000) 
    : null;
  const lastPaymentMonth = deliveryDate 
    ? new Date(deliveryDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;

  return (
    <section className="py-20 px-4 bg-hero" id="payment">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="success" className="mb-4">Pagamento Sem Sustos</Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            Você só termina de pagar quando o imóvel já estiver operando
          </h2>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
            Parcelamento Alinhado à Operação
          </p>

          {/* Investor Image */}
          <div className="mt-10 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 rotate-2">
              <img
                src={investorHappy}
                alt="Investidor Seazone satisfeito escolhendo seu pacote Decor"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm font-medium drop-shadow-lg">
                  Invista com tranquilidade 🚀
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Card */}
          <Card variant="glass" className="overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-coral-gradient flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-foreground">Simulador de Parcelas</h3>
                  <p className="text-sm text-muted-foreground">Integração Itaú/Rede</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8 pt-6">
              {/* Package Summary */}
              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Plano Selecionado</span>
                  <span className="font-bold text-foreground">{selectedPkg.name}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-muted-foreground">Valor Base</span>
                  <span className="text-2xl font-bold text-foreground">
                    R$ {calculation.baseAmount.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>

              {/* Installment Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">Parcelas</span>
                  <Badge variant="coral">{installments}x</Badge>
                </div>
                <Slider
                  value={[installments]}
                  onValueChange={(value) => setInstallments(value[0])}
                  min={3}
                  max={18}
                  step={3}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>3x (0%)</span>
                  <span>18x (10,9%)</span>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Parcela Mensal</span>
                  <span className="text-3xl font-bold text-gradient-coral">
                    R$ {calculation.monthlyPayment.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total com Juros</span>
                  <span className="text-foreground">R$ {calculation.totalWithInterest.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <Button variant="coral" size="lg" className="w-full">
                <CreditCard className="w-5 h-5" />
                Simular no Itaú/Rede
              </Button>
              
              {/* Trust Badges */}
              <div className="flex flex-col gap-2 pt-4 border-t border-border mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-seazone-success" />
                  <span>Pagamento Seguro via Itaú/Rede</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-seazone-success" />
                  <span>Integrado ao Sienge ERP</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow Safety Card */}
          <div className="space-y-6">
            {/* Cash Flow Badge */}
            <Card variant="default" className="border-seazone-success/30 bg-seazone-success/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-seazone-success/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-seazone-success" />
                  </div>
                  <div>
                    <Badge variant="cashflow" className="mb-2">Risco Zero</Badge>
                    <h4 className="text-lg font-bold text-foreground mb-1">
                      Risco Zero: Pague apenas enquanto seu imóvel já performa
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      A 18ª e última parcela vence 30 dias após a entrega — quando seu imóvel já estará 
                      operando nas plataformas e gerando receita. Você só termina de pagar quando o retorno já começou.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Energy Connection Milestone */}
            <Card variant={energyConnected ? "selected" : "elevated"}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <button
                    onClick={onEnergyToggle}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      energyConnected 
                        ? "bg-seazone-success text-primary-foreground" 
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <Zap className="w-7 h-7" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-foreground">Ligação de Energia</h4>
                      {energyConnected && <CheckCircle2 className="w-5 h-5 text-seazone-success" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {energyConnected 
                        ? "Verificado! Contagem regressiva de 60 dias iniciada."
                        : "Clique para simular a verificação de energia e iniciar a contagem."
                      }
                    </p>
                    
                    {energyConnected && (
                      <div className="bg-secondary rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-seazone-coral" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Execução em 60 Dias</p>
                            <p className="text-xs text-muted-foreground">
                              Entrega: {deliveryDate?.toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-seazone-success" />
                          <div>
                            <p className="text-sm font-medium text-foreground">18ª Parcela (Risco Zero)</p>
                            <p className="text-xs text-muted-foreground">
                              Vencimento: {lastPaymentMonth?.toLocaleDateString("pt-BR")} (30 dias após entrega)
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Visual */}
            <Card variant="navy">
              <CardContent className="p-6">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/60 mb-4">
                  Cronograma de Pagamento
                </h4>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/20" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-seazone-coral flex items-center justify-center z-10">
                        <span className="text-xs font-bold text-accent-foreground">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-foreground">1ª Parcela</p>
                        <p className="text-xs text-primary-foreground/60">Na assinatura do contrato</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center z-10">
                        <span className="text-xs font-bold text-primary-foreground">...</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-foreground">Parcelas 2-17</p>
                        <p className="text-xs text-primary-foreground/60">Durante execução e ramp-up</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-seazone-success flex items-center justify-center z-10">
                        <span className="text-xs font-bold text-primary-foreground">18</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-foreground">Pagamento Final</p>
                        <p className="text-xs text-seazone-success">Mês +1 após entrega ✓</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
