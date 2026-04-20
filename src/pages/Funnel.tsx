import { useState } from "react";
import { FunnelProvider, useFunnel } from "@/contexts/FunnelContext";
import { FunnelStepper } from "@/components/funnel/FunnelStepper";
import { UnitSelector } from "@/components/funnel/UnitSelector";
import { StepPackageSelection } from "@/components/funnel/steps/StepPackageSelection";
import { StepCustomization } from "@/components/funnel/steps/StepCustomization";
import { StepSpecs } from "@/components/funnel/steps/StepSpecs";
import { StepTerms } from "@/components/funnel/steps/StepTerms";
import { StepContract } from "@/components/funnel/steps/StepContract";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Calendar, ArrowLeft } from "lucide-react";

function FunnelContent() {
  const { currentStep, selectedUnit, getTotalPrice, selectedPackage } = useFunnel();
  const [unitSelected, setUnitSelected] = useState(false);

  if (!unitSelected) {
    return <UnitSelector onComplete={() => setUnitSelected(true)} />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StepPackageSelection />;
      case 1: return <StepCustomization />;
      case 2: return <StepSpecs />;
      case 3: return <StepTerms />;
      case 4: return <StepContract />;
      default: return <StepPackageSelection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-hero py-4 px-4 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="flex items-center gap-1.5 text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao site
              </a>
              <span className="text-primary-foreground/30">|</span>
              <h1 className="text-xl font-display font-bold text-primary-foreground">
                Seazone Decor
              </h1>
              {selectedUnit && (
                <div className="flex items-center gap-3 text-sm text-primary-foreground/70">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedUnit.spot}</span>
                  </div>
                  <span className="text-primary-foreground/30">|</span>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    <span>{selectedUnit.id}</span>
                  </div>
                  <span className="text-primary-foreground/30">|</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedUnit.deliveryDate.toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              )}
            </div>
            
            {selectedPackage && (
              <Card variant="glass" className="py-2 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-primary-foreground/70">Total:</span>
                  <span className="text-lg font-bold text-seazone-coral">
                    R$ {getTotalPrice().toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </Card>
            )}
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto max-w-7xl">
          <FunnelStepper />
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto max-w-7xl py-8 px-4">
        {renderStep()}
      </main>

      {/* Footer */}
      <footer className="bg-secondary/50 py-6 px-4 mt-auto">
        <div className="container mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          © 2024 Seazone Decor. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

export default function Funnel() {
  return (
    <FunnelProvider>
      <FunnelContent />
    </FunnelProvider>
  );
}
