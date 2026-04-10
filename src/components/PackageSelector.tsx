import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Star, TrendingUp, Ruler, ClipboardList, Wrench, Sparkles, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DesignComparison } from "@/components/DesignComparison";
import spotLogo from "@/assets/spot-logo.png";
import packageEssential from "@/assets/package-essential.jpg";
import packagePlus from "@/assets/package-plus.jpg";
import packagePremium from "@/assets/package-premium.jpg";
import seazoneHouseIcon from "@/assets/seazone-house-icon.png";

export type PackageType = "essential" | "plus" | "premium";

interface PackageData {
  id: PackageType;
  name: string;
  tagline: string;
  price: number;
  image: string;
  inventory: {
    mobiliario: string[];
    eletrodomesticos: string[];
    enxoval: string[];
    decoracao: string[];
  };
  details: string[];
  popular?: boolean;
}

const packages: PackageData[] = [
  {
    id: "essential",
    name: "Essential",
    tagline: "Funcionalidade para locação",
    price: 54000,
    image: packageEssential,
    popular: true,
    details: [
      "Projeto de arquitetura em 10 dias",
      "Móveis planejados em todos os ambientes",
      "Armários fechados (portas em mdf ou vidro)",
      "Cabeceira estofada",
      "Painel de TV em marcenaria",
      "Linha completa de eletrodomésticos",
      "Depurador de ar embutido",
      "Enxoval padrão hoteleiro completo",
      "Mobiliário funcional e prático ideal para rotatividade de hóspedes",
      "Mobiliário premium focado em sofisticação e conforto",
      "Itens decorativos básicos (quadros e plantas)",
      "Decoração premium (tapete, adornos e luminárias)",
      "Imóvel limpo e pronto para reserva",
      "Manual de garantias",
    ],
    inventory: {
      mobiliario: ["Cama Queen", "Sofá 2 lugares", "Mesa de Jantar (4p)", "Escrivaninha"],
      eletrodomesticos: ["Smart TV 43\"", "Micro-ondas", "Cafeteira", "Ferro de Passar"],
      enxoval: ["Jogo de Cama (x2)", "Jogo de Toalhas (x4)", "Panos de Cozinha"],
      decoracao: ["Quadros (x2)", "Plantas (x3)", "Iluminação Básica"],
    },
  },
  {
    id: "plus",
    name: "Plus",
    tagline: "Estilo e praticidade",
    price: 60000,
    image: packagePlus,
    details: [
      "Projeto de arquitetura em 10 dias",
      "Móveis planejados em todos os ambientes",
      "Armários fechados (portas em mdf ou vidro)",
      "Cabeceira estofada",
      "Painel de TV em marcenaria",
      "Linha completa de eletrodomésticos",
      "Depurador de ar embutido",
      "Enxoval padrão hoteleiro completo",
      "Mobiliário funcional e prático ideal para rotatividade de hóspedes",
      "Mobiliário premium focado em sofisticação e conforto",
      "Itens decorativos básicos (quadros e plantas)",
      "Decoração premium (tapete, adornos e luminárias)",
      "Imóvel limpo e pronto para reserva",
      "Manual de garantias",
    ],
    inventory: {
      mobiliario: ["Cama King", "Sofá 3 lugares", "Mesa de Jantar (6p)", "Escrivaninha", "Poltrona", "Mesas Laterais (x2)"],
      eletrodomesticos: ["Smart TV 55\"", "Micro-ondas", "Cafeteira Nespresso", "Ferro + Vaporizador", "Caixa de Som Bluetooth"],
      enxoval: ["Jogo de Cama Premium (x2)", "Toalhas de Luxo (x6)", "Roupão (x2)", "Panos de Cozinha"],
      decoracao: ["Quadros Curados (x4)", "Plantas Designer (x5)", "Iluminação de Destaque", "Almofadas Decorativas"],
    },
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Qualidade de moradia",
    price: 80000,
    image: packagePremium,
    details: [
      "Projeto de arquitetura em 10 dias",
      "Móveis planejados em todos os ambientes",
      "Armários fechados (portas em mdf ou vidro)",
      "Cabeceira estofada",
      "Painel de TV em marcenaria",
      "Linha completa de eletrodomésticos",
      "Depurador de ar embutido",
      "Enxoval padrão hoteleiro completo",
      "Mobiliário funcional e prático ideal para rotatividade de hóspedes",
      "Mobiliário premium focado em sofisticação e conforto",
      "Itens decorativos básicos (quadros e plantas)",
      "Decoração premium (tapete, adornos e luminárias)",
      "Imóvel limpo e pronto para reserva",
      "Manual de garantias",
    ],
    inventory: {
      mobiliario: ["Cama King (Premium)", "Sofá Designer", "Conjunto de Jantar (8p)", "Mesa Executiva", "Poltronas (x2)", "Armazenamento Sob Medida"],
      eletrodomesticos: ["Smart TV 65\" OLED", "Kit Cozinha Completo", "Adega Climatizada", "Sistema de Café Premium", "Sistema de Som"],
      enxoval: ["Algodão Egípcio (x3)", "Coleção Spa de Toalhas", "Roupões de Seda (x2)", "Cozinha Premium"],
      decoracao: ["Arte Original (x6)", "Iluminação Designer", "Jardim Interno", "Acessórios de Luxo", "Peças Sob Medida"],
    },
  },
];

interface PackageSelectorProps {
  onViewDetails?: (pkg: PackageType) => void;
}

export function PackageSelector({ onViewDetails }: PackageSelectorProps) {
  const [activePackage, setActivePackage] = useState<PackageType>("essential");
  const navigate = useNavigate();

  const packageOrder: PackageType[] = ["essential", "plus", "premium"];
  const activeIndex = packageOrder.indexOf(activePackage);

  const goNext = useCallback(() => {
    setActivePackage(packageOrder[Math.min(activeIndex + 1, packageOrder.length - 1)]);
  }, [activeIndex]);

  const goPrev = useCallback(() => {
    setActivePackage(packageOrder[Math.max(activeIndex - 1, 0)]);
  }, [activeIndex]);

  // Swipe support
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const activePkg = packages.find((p) => p.id === activePackage)!;

  return (
    <section className="py-20 px-4" id="packages">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="coral" className="mb-4">Design Para Alta Performance</Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Design compacto, instagramável e funcional. Otimizado para plataformas de aluguel por temporada
          </h2>

          {/* Design Comparison */}
          <DesignComparison />
        </div>

        {/* Package Selection Box */}
        <div className="bg-card border border-border rounded-2xl max-w-6xl mx-auto overflow-hidden shadow-elevated">
          {/* Tabs row */}
          <div className="p-6 md:p-8 pb-0">
            {/* Instruction label */}
            <p className="text-center text-xs font-semibold text-seazone-coral uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              Clique para comparar os planos
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </p>

            {/* Tab buttons as cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto mb-6">
              {packages.map((pkg) => {
                const isActive = activePackage === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setActivePackage(pkg.id)}
                    className={`relative group rounded-xl p-4 md:p-5 text-center transition-all duration-300 cursor-pointer border-2 ${
                      isActive
                        ? "bg-seazone-navy text-white border-seazone-navy shadow-lg scale-[1.03]"
                        : "bg-muted/40 text-foreground border-border hover:border-seazone-navy/40 hover:bg-seazone-navy/5 hover:shadow-md"
                    }`}
                  >
                    {pkg.popular && (
                      <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm ${
                        isActive ? "bg-seazone-coral text-white" : "bg-seazone-coral/80 text-white"
                      }`}>
                        Mais Popular
                      </span>
                    )}
                    <span className="block text-lg md:text-xl font-bold mb-1">{pkg.name}</span>
                    <span className={`block text-[11px] md:text-xs font-medium leading-tight ${
                      isActive ? "text-white/70" : "text-muted-foreground"
                    }`}>
                      {pkg.tagline}
                    </span>
                    {/* Active indicator arrow */}
                    {isActive && (
                      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-seazone-navy rotate-45 rounded-sm" />
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Active Package Display */}
          <div className="relative overflow-hidden rounded-b-2xl" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {/* Navigation Arrows */}
            <button
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 dark:bg-seazone-navy/80 shadow-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
              aria-label="Plano anterior"
            >
              <ChevronLeft className="w-5 h-5 text-seazone-navy dark:text-white" />
            </button>
            <button
              onClick={goNext}
              disabled={activeIndex === packageOrder.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 dark:bg-seazone-navy/80 shadow-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
              aria-label="Próximo plano"
            >
              <ChevronRight className="w-5 h-5 text-seazone-navy dark:text-white" />
            </button>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-seazone-coral/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-seazone-navy/8 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-2 gap-0">
              {/* Image side */}
              <div className="relative h-72 lg:h-auto lg:min-h-[520px] overflow-hidden">
                {packages.map((pkg) => (
                  <img
                    key={pkg.id}
                    src={pkg.image}
                    alt={`Ambiente ${pkg.name}`}
                    style={{ objectPosition: pkg.id === "essential" ? "right 45% top 25%" : "center 25%" }}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                      activePackage === pkg.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card/80 hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent lg:hidden" />
                <img src={spotLogo} alt="" className="absolute bottom-4 left-4 w-20 opacity-30 pointer-events-none" />
                <svg className="absolute top-0 right-0 w-32 h-32 text-card hidden lg:block" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M100,0 L100,100 Q60,95 40,70 Q15,40 0,0 Z" fill="currentColor" />
                </svg>
              </div>

              {/* Content side */}
              <div className="relative p-8 lg:p-12 flex flex-col justify-center">
                <div className="absolute top-6 right-8 opacity-[0.04] pointer-events-none">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    {Array.from({ length: 36 }, (_, i) => (
                      <circle key={i} cx={(i % 6) * 22 + 11} cy={Math.floor(i / 6) * 22 + 11} r="2" fill="currentColor" />
                    ))}
                  </svg>
                </div>

                <div className="relative z-[1]">
                  <div className="mb-8">
                    <p className="text-xs font-semibold text-seazone-coral uppercase tracking-widest mb-1">Plano</p>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-4xl lg:text-5xl font-display font-bold text-foreground">
                        {activePkg.name}
                      </h3>
                      {activePkg.popular && (
                        <Badge variant="coral" className="shadow-coral">
                          <Star className="w-3 h-3 mr-1" /> Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg text-muted-foreground font-medium">{activePkg.tagline}</p>
                  </div>

                  <div className="mb-8 pb-8 border-b border-border">
                    <p className="text-sm text-muted-foreground mb-1">A partir de</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
                        R$ {activePkg.price.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-xs text-seazone-success font-semibold mt-2">Parcelamento estendido: termine de pagar no mês seguinte a entrega</p>
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 bg-seazone-navy/10 text-seazone-navy text-xs font-bold px-3 py-1.5 rounded-full">
                        🏗️ Execução em 60 dias
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">O que está incluso:</p>
                    <ul className="space-y-2 pr-2">
                      {activePkg.details.map((detail, idx) => {
                        const essentialExcluded = [
                          "Armários fechados (portas em mdf ou vidro)",
                          "Cabeceira estofada",
                          "Painel de TV em marcenaria",
                          "Depurador de ar embutido",
                          "Mobiliário premium focado em sofisticação e conforto",
                          "Decoração premium (tapete, adornos e luminárias)",
                        ];
                        const plusExcluded = [
                          "Armários fechados (portas em mdf ou vidro)",
                          "Cabeceira estofada",
                          "Mobiliário premium focado em sofisticação e conforto",
                          "Decoração premium (tapete, adornos e luminárias)",
                        ];
                        const isExcluded = (activePkg.id === "essential" && essentialExcluded.includes(detail)) ||
                          (activePkg.id === "plus" && plusExcluded.includes(detail));
                        return (
                          <li key={idx} className={`flex items-start gap-2 text-xs ${isExcluded ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                            {isExcluded ? (
                              <X className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-seazone-success mt-0.5 flex-shrink-0" />
                            )}
                            <span className={isExcluded ? "line-through" : ""}>{detail}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Pillars inside card */}
          <div className="px-6 md:px-8 pb-8 pt-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-border" />
              <p className="text-xs md:text-sm text-muted-foreground font-medium tracking-wide text-center">
                ✦ Seu estilo, nossa entrega. Todos os planos incluem <strong className="text-foreground">entrega completa, sem surpresas</strong> ✦
              </p>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-muted/30 rounded-xl p-4 text-left">
                <Ruler className="w-5 h-5 text-seazone-coral mb-2" />
                <h4 className="font-semibold text-foreground text-sm mb-1">Design de Interiores</h4>
                <p className="text-xs text-muted-foreground">Criação do projeto de decoração para rentabilidade e experiência do hóspede.</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-left">
                <ClipboardList className="w-5 h-5 text-seazone-coral mb-2" />
                <h4 className="font-semibold text-foreground text-sm mb-1">Gestão da Execução</h4>
                <p className="text-xs text-muted-foreground">Gerenciamento da obra, com foco no prazo e sem custo extra nos itens contratados.</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-left">
                <Wrench className="w-5 h-5 text-seazone-coral mb-2" />
                <h4 className="font-semibold text-foreground text-sm mb-1">Infraestrutura Completa</h4>
                <p className="text-xs text-muted-foreground">Desde ar-condicionado e instalações elétricas até bancadas em pedra.</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-left">
                <Sparkles className="w-5 h-5 text-seazone-coral mb-2" />
                <h4 className="font-semibold text-foreground text-sm mb-1">Experiência do Hóspede</h4>
                <p className="text-xs text-muted-foreground">Enxoval com padrão hoteleiro, eletrodomésticos e utensílios de cozinha.</p>
              </div>
              <div className="relative bg-gradient-to-br from-seazone-success/10 via-muted/30 to-seazone-success/5 rounded-xl p-4 border border-seazone-success/30 text-left ring-1 ring-seazone-success/10">
                <div className="absolute -top-2.5 right-3">
                  <Badge className="bg-seazone-success text-white text-[10px] px-2 py-0.5 shadow-sm">Resultado</Badge>
                </div>
                <TrendingUp className="w-5 h-5 text-seazone-success mb-2" />
                <h4 className="font-semibold text-foreground text-sm mb-1">Pronto para Rentabilizar</h4>
                <p className="text-xs text-muted-foreground">Imóvel entregue limpo, organizado e disponível para ocupação imediata.</p>
              </div>
            </div>

            {/* CTA Simular Investimento - Spot visual identity */}
            <div className="mt-10 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-seazone-navy via-seazone-navy/95 to-seazone-navy rounded-2xl" />
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-seazone-coral/15 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-seazone-gold/10 rounded-full blur-2xl" />
                {/* Spot power icon watermark */}
                <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-24 h-24 text-white/[0.04]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                  <line x1="12" y1="2" x2="12" y2="12" />
                </svg>
              </div>
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-8 md:px-12 md:py-10">
              <div className="flex items-center gap-5">
                  <img src={seazoneHouseIcon} alt="Seazone" className="w-14 h-14 brightness-0 invert opacity-80" />
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Próximo passo</p>
                    <h4 className="text-white text-xl md:text-2xl font-display font-bold leading-tight mb-2">
                      Descubra os valores da Decor para o seu imóvel.
                    </h4>
                    <p className="text-white/70 text-sm font-medium">Em 6 perguntas rápidas, montamos uma estimativa personalizada para você.</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/funnel")}
                  className="group relative inline-flex items-center gap-3 bg-seazone-coral hover:bg-seazone-coral/90 text-white font-bold text-base md:text-lg px-8 py-4 md:px-10 md:py-5 rounded-xl shadow-coral hover:shadow-lg transition-all duration-300 hover:scale-[1.03] whitespace-nowrap"
                >
                  <TrendingUp className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                  Simular Investimento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { packages };
