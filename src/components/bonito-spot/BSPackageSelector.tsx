import { Check, Star, Package, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBonitoSpot } from "@/contexts/BonitoSpotContext";
import { REFERENCE_TOTALS, PACKAGE_INFO } from "@/data/bonitoSpotCatalog";
import type { BSPackage } from "@/types/bonitoSpot";

const PACKAGES: BSPackage[] = ["Essential", "Plus", "Premium"];

export function BSPackageSelector() {
  const { state, selectPackage, nextStep } = useBonitoSpot();
  const typology = state.typology!;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <Badge className="mb-3 bg-white/10 text-primary-foreground/60 border-white/15">
          Apto {state.apartment} • Tipo {typology}
        </Badge>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-2">
          Escolha o Pacote de Decoração
        </h2>
        <p className="text-primary-foreground/50 text-sm">
          Valores reais para a tipologia {typology} do Bonito Spot
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {PACKAGES.map((pkg) => {
          const isSelected = state.selectedPackage === pkg;
          const isRecommended = pkg === "Plus";
          const total = REFERENCE_TOTALS[pkg][typology];
          const info = PACKAGE_INFO[pkg];

          return (
            <button
              key={pkg}
              onClick={() => selectPackage(pkg)}
              className={`
                relative rounded-2xl p-6 text-left transition-all duration-300 border-2 cursor-pointer
                ${isSelected
                  ? "border-seazone-coral bg-seazone-coral/15 scale-[1.02]"
                  : "border-white/10 bg-white/5 hover:border-seazone-coral/40 hover:bg-white/10"
                }
              `}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="coral" className="shadow-coral text-xs">
                    <Star className="w-3 h-3 mr-1" /> Recomendado
                  </Badge>
                </div>
              )}

              <div className="text-center mb-4">
                <Package className="w-8 h-8 mx-auto mb-2 text-seazone-coral" />
                <h3 className="text-xl font-display font-bold text-primary-foreground">{pkg}</h3>
                <p className="text-xs text-primary-foreground/50 mt-1">{info.tagline}</p>
              </div>

              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary-foreground">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-primary-foreground/40 mt-1">
                  Valor total incluindo taxas
                </p>
              </div>

              {isSelected && (
                <div className="flex items-center justify-center gap-2 text-seazone-coral text-sm font-semibold">
                  <Check className="w-4 h-4" /> Selecionado
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Comparison highlights */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-primary-foreground/40">Marcenaria</p>
          <p className="text-primary-foreground font-semibold mt-1">Funcional</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-primary-foreground/40">Marcenaria</p>
          <p className="text-primary-foreground font-semibold mt-1">Planejada</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <p className="text-primary-foreground/40">Marcenaria</p>
          <p className="text-primary-foreground font-semibold mt-1">Armário Completo</p>
        </div>
      </div>

      {state.selectedPackage && (
        <div className="flex justify-center">
          <Button variant="coral" size="lg" onClick={nextStep}>
            Ver Detalhes do Pacote <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
