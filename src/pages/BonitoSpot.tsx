import { BonitoSpotProvider, useBonitoSpot } from "@/contexts/BonitoSpotContext";
import { BSApartmentSelector } from "@/components/bonito-spot/BSApartmentSelector";
import { BSPackageSelector } from "@/components/bonito-spot/BSPackageSelector";
import { BSCategoryOverview } from "@/components/bonito-spot/BSCategoryOverview";
import { BSFinancialSummary } from "@/components/bonito-spot/BSFinancialSummary";
import seazoneIcon from "@/assets/seazone-icon.png";

function BonitoSpotContent() {
  const { state } = useBonitoSpot();

  const progress = state.step === 0 ? 0 : Math.round(((state.step) / 3) * 100);

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src={seazoneIcon} alt="Seazone" className="w-8 h-8" />
          <h1 className="text-lg font-display font-bold text-primary-foreground">
            Bonito Spot — Decoração Personalizada
          </h1>
        </div>

        {/* Progress */}
        <div className="relative rounded-3xl p-[2px] overflow-hidden simulator-glow">
          <div className="absolute inset-0 rounded-3xl animate-gradient-rotate" style={{
            background: 'conic-gradient(from 0deg, hsl(8 100% 68%), hsl(45 90% 55%), hsl(220 80% 60%), hsl(8 100% 68%))',
          }} />
          <div className="absolute inset-[2px] rounded-[22px] bg-hero" />

          <div className="relative bg-hero rounded-[22px] overflow-hidden">
            {/* Progress bar */}
            <div className="h-1.5 bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-seazone-coral to-seazone-coral/70 transition-all duration-500 ease-out rounded-r-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Steps indicator */}
            <div className="flex justify-center gap-8 pt-6 pb-2">
              {["Apartamento", "Pacote", "Detalhes", "Resumo"].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    state.step === i
                      ? "bg-seazone-coral text-white"
                      : state.step > i
                      ? "bg-seazone-coral/30 text-seazone-coral"
                      : "bg-white/10 text-primary-foreground/30"
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs hidden sm:block ${
                    state.step >= i ? "text-primary-foreground" : "text-primary-foreground/30"
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-6 md:p-10 min-h-[500px] flex flex-col justify-center">
              {state.step === 0 && <BSApartmentSelector />}
              {state.step === 1 && <BSPackageSelector />}
              {state.step === 2 && <BSCategoryOverview />}
              {state.step === 3 && <BSFinancialSummary />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BonitoSpot() {
  return (
    <BonitoSpotProvider>
      <BonitoSpotContent />
    </BonitoSpotProvider>
  );
}
