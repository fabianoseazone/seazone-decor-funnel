import { TrendingUp, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import comparisonBefore from "@/assets/comparison-before.jpg";
import comparisonAfter from "@/assets/comparison-after.jpg";

const comparisonData = {
  before: {
    label: "Decoração Básica",
    image: comparisonBefore,
    stats: [
    { label: "Faturamento anual", value: "R$ 31 mil" },
    { label: "Taxa de ocupação na alta temporada", value: "68%" },
    { label: "Preço médio da diária", value: "R$ 276" }]
  },
  after: {
    label: "Decoração Profissional",
    image: comparisonAfter,
    stats: [
    { label: "Faturamento anual", value: "R$ 48 mil" },
    { label: "Taxa de ocupação na alta temporada", value: "88%" },
    { label: "Preço médio da diária", value: "R$ 325" }]
  }
};

export function DesignComparison() {
  return (
    <div className="max-w-5xl mx-auto mt-12 mb-8">
      {/* Title + subtitle */}
      <div className="text-center mb-10">
        <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-snug">
          Decoração estratégica faz o imóvel faturar{" "}
          <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-seazone-coral to-seazone-navy bg-clip-text text-transparent">
            54% a mais
          </span>
        </h3>
        <p className="mt-4 text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          A Seazone gerencia dois imóveis de plantas similares no mesmo prédio e comprovou que decoração bem trabalhada aumenta o faturamento.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 text-seazone-success text-xs font-semibold uppercase tracking-widest">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Comprovado na prática
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {/* Before */}
        <div className="group relative">
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-border">
            <div className="aspect-[16/9] relative">
              <img
                src={comparisonData.before.image}
                alt="Imóvel com decoração básica"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-muted/90 backdrop-blur-sm text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                  {comparisonData.before.label}
                </span>
              </div>
            </div>
            <div className="bg-card p-5 space-y-2">
              {comparisonData.before.stats.map((stat) => (
                <div key={stat.label} className="flex justify-between items-baseline text-sm">
                  <span className="text-muted-foreground">{stat.label}:</span>
                  <span className="font-bold text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* After */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-br from-seazone-coral/20 via-seazone-coral/10 to-transparent rounded-[1.1rem] blur-sm" />
          <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-seazone-coral/30 ring-2 ring-seazone-coral/10">
            <div className="aspect-[16/9] relative">
              <img
                src={comparisonData.after.image}
                alt="Imóvel com decoração profissional Seazone"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-seazone-coral text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {comparisonData.after.label}
                </span>
              </div>
            </div>
            <div className="bg-card p-5 space-y-2">
              {comparisonData.after.stats.map((stat) => (
                <div key={stat.label} className="flex justify-between items-baseline text-sm">
                  <span className="text-muted-foreground">{stat.label}:</span>
                  <span className="font-bold text-seazone-coral">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
