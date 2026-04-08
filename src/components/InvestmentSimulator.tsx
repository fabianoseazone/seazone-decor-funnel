import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  MessageCircle, Minus, Plus, Building2, Zap,
  Sparkles, Users, TrendingUp, ArrowRight, ArrowLeft, RotateCcw,
  Target, Gem, Clock, Crown, Briefcase, Heart,
  Hammer, CookingPot, BedDouble, Shield, Phone, Send, User,
} from "lucide-react";
import { type PackageType } from "./PackageSelector";

// Real Bonito Spot reference values (average across typologies)
const BASE_PRICES: Record<PackageType, number> = {
  essential: 55000,
  plus: 70000,
  premium: 87000,
};

function calcPrice(
  pkg: PackageType,
  isSpot: boolean,
  units: number,
  infra: "completa" | "basica",
  woodwork: "premium" | "functional",
  appliances: "gourmet" | "essentials",
  hospitality: "seazone" | "self",
): number {
  let price = BASE_PRICES[pkg];
  if (!isSpot) price += 30000;
  if (infra === "basica") price -= 15000;
  if (woodwork === "functional") price -= 8000;
  if (appliances === "essentials") price -= 5000;
  if (hospitality === "self") price -= 10000;
  if (units >= 6) price -= 14000;
  else if (units >= 5) price -= 8000;
  return Math.max(0, price * units);
}

function scoreToPackage(score: number): PackageType {
  if (score >= 5) return "premium";
  if (score >= 3) return "plus";
  return "essential";
}

const TOTAL_STEPS = 10;

type QuizOption = "a" | "b" | null;

export function InvestmentSimulator() {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<PackageType>("plus");
  const [isSpot, setIsSpot] = useState(true);
  const [units, setUnits] = useState(1);
  const [infra, setInfra] = useState<"completa" | "basica">("completa");
  const [operaSeazone, setOperaSeazone] = useState(false);

  // New granular choices
  const [woodwork, setWoodwork] = useState<"premium" | "functional">("premium");
  const [appliances, setAppliances] = useState<"gourmet" | "essentials">("gourmet");
  const [hospitality, setHospitality] = useState<"seazone" | "self">("seazone");

  // Lead capture
  const [leadName, setLeadName] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);

  // Strategic quiz (steps 1-3)
  const [q1, setQ1] = useState<QuizOption>(null);
  const [q2, setQ2] = useState<QuizOption>(null);
  const [q3, setQ3] = useState<QuizOption>(null);

  const quizScore = useMemo(() => {
    let score = 0;
    if (q1 === "b") score += 2;
    if (q2 === "b") score += 2;
    if (q3 === "b") score += 2;
    // Technical choices also nudge towards premium
    if (woodwork === "premium") score += 1;
    if (appliances === "gourmet") score += 1;
    if (hospitality === "seazone") score += 1;
    return score;
  }, [q1, q2, q3, woodwork, appliances, hospitality]);

  const isHighEnd = quizScore >= 6;

  useEffect(() => {
    setSelectedPackage(scoreToPackage(quizScore));
  }, [quizScore]);

  const totalPrice = useMemo(
    () => calcPrice(selectedPackage, isSpot, units, infra, woodwork, appliances, hospitality),
    [selectedPackage, isSpot, units, infra, woodwork, appliances, hospitality],
  );
  const unitPrice = units > 0 ? Math.round(totalPrice / units) : 0;

  const isResult = step === TOTAL_STEPS + 1;

  const handleWhatsApp = () => {
    const pkgLabel = selectedPackage === "premium" ? "Premium" : selectedPackage === "plus" ? "Plus" : "Essential";
    const message = encodeURIComponent(
      `🏠 Seazone Decor - Simulação de Investimento\n\n` +
      `📦 Padrão Recomendado: ${pkgLabel}\n` +
      `🏢 Empreendimento Spot: ${isSpot ? "Sim" : "Não"}\n` +
      `🔢 Unidades: ${units}\n` +
      `🪵 Marcenaria: ${woodwork === "premium" ? "Premium" : "Funcional"}\n` +
      `🍳 Eletrodomésticos: ${appliances === "gourmet" ? "Gourmet" : "Essenciais"}\n` +
      `⚡ Infraestrutura: ${infra === "completa" ? "Completa" : "Básica"}\n` +
      `🛏️ Hotelaria: ${hospitality === "seazone" ? "Kit Seazone" : "Próprio"}\n` +
      `🤝 Gestão Seazone: ${operaSeazone ? "Sim" : "Não"}\n\n` +
      `💰 Investimento Estimado: A partir de R$ ${totalPrice.toLocaleString("pt-BR")}\n\n` +
      `Gostaria de receber o orçamento detalhado!`,
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
  const prev = () => setStep((s) => Math.max(s - 1, 1));
  const restart = () => {
    setStep(1);
    setQ1(null);
    setQ2(null);
    setQ3(null);
    setWoodwork("premium");
    setAppliances("gourmet");
    setHospitality("seazone");
    setInfra("completa");
    setIsSpot(true);
    setUnits(1);
    setOperaSeazone(false);
    setLeadName("");
    setLeadContact("");
    setLeadSaved(false);
  };

  const progress = isResult ? 100 : Math.round((step / TOTAL_STEPS) * 100);

  const quizCardClass = (isSelected: boolean) =>
    `relative rounded-xl p-6 md:p-8 text-left transition-all duration-200 border-2 cursor-pointer group ${
      isSelected
        ? "border-seazone-coral bg-seazone-coral/10"
        : "border-white/15 bg-white/5 hover:border-seazone-coral/40 hover:bg-white/10"
    }`;

  return (
    <section className="relative overflow-hidden" id="simulator">
      <div className="relative z-10">
        <div className="relative rounded-3xl p-[2px] overflow-hidden simulator-glow">
          <div className="absolute inset-0 rounded-3xl animate-gradient-rotate" style={{
            background: 'conic-gradient(from 0deg, hsl(8 100% 68%), hsl(45 90% 55%), hsl(220 80% 60%), hsl(8 100% 68%))',
          }} />
          <div className="absolute inset-[2px] rounded-[22px] bg-hero" />

          <div className="relative bg-hero rounded-[22px] overflow-hidden">
            {step > 0 && (
              <div className="h-1.5 bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-seazone-coral to-seazone-coral/70 transition-all duration-500 ease-out rounded-r-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <div className="p-8 md:p-12 min-h-[340px] flex flex-col justify-center">

              {/* ── STEP 1: Market Positioning ── */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <span className="text-xs font-bold text-seazone-coral tracking-wider uppercase">Pergunta 1 de {TOTAL_STEPS}</span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-primary-foreground">
                    Como você quer posicionar seu imóvel no mercado?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => { setQ1("a"); next(); }} className={quizCardClass(q1 === "a")}>
                      <Target className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Competitivo e Eficiente</p>
                      <p className="text-sm text-primary-foreground/50">Preço acessível, alta ocupação e retorno rápido.</p>
                    </button>
                    <button onClick={() => { setQ1("b"); next(); }} className={quizCardClass(q1 === "b")}>
                      <Gem className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Exclusivo e Diferenciado</p>
                      <p className="text-sm text-primary-foreground/50">Ticket médio alto, avaliações 5 estrelas e destaque no mercado.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Time Value ── */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <span className="text-xs font-bold text-seazone-coral tracking-wider uppercase">Pergunta 2 de {TOTAL_STEPS}</span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-primary-foreground">
                    Qual é a sua visão sobre o tempo de retorno?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => { setQ2("a"); next(); }} className={quizCardClass(q2 === "a")}>
                      <Clock className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Payback Acelerado</p>
                      <p className="text-sm text-primary-foreground/50">Investimento enxuto com retorno no menor prazo possível.</p>
                    </button>
                    <button onClick={() => { setQ2("b"); next(); }} className={quizCardClass(q2 === "b")}>
                      <Crown className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Valorização Contínua</p>
                      <p className="text-sm text-primary-foreground/50">Construir um ativo premium que se valoriza ao longo do tempo.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Asset Durability ── */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <span className="text-xs font-bold text-seazone-coral tracking-wider uppercase">Pergunta 3 de {TOTAL_STEPS}</span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-primary-foreground">
                    Qual a durabilidade esperada do seu projeto?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => { setQ3("a"); next(); }} className={quizCardClass(q3 === "a")}>
                      <Briefcase className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Prático e Renovável</p>
                      <p className="text-sm text-primary-foreground/50">Materiais funcionais, fáceis de repor e trocar.</p>
                    </button>
                    <button onClick={() => { setQ3("b"); next(); }} className={quizCardClass(q3 === "b")}>
                      <Shield className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Resistente e Atemporal</p>
                      <p className="text-sm text-primary-foreground/50">Materiais premium com acabamento durável e sofisticado.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Spot Building ── */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <span className="text-xs font-bold text-seazone-coral tracking-wider uppercase">Pergunta 4 de {TOTAL_STEPS}</span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-primary-foreground">
                    Sua unidade é em um empreendimento Spot?
                  </h3>
                  <div className="flex items-center gap-5">
                    <Building2 className="w-6 h-6 text-primary-foreground/40" />
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${!isSpot ? "text-primary-foreground" : "text-primary-foreground/40"}`}>Não</span>
                      <Switch checked={isSpot} onCheckedChange={setIsSpot} />
                      <span className={`text-sm font-semibold ${isSpot ? "text-primary-foreground" : "text-primary-foreground/40"}`}>Sim</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 5: Woodwork ── */}
              {step === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <span className="text-xs font-bold text-seazone-coral tracking-wider uppercase">Pergunta 5 de {TOTAL_STEPS}</span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-primary-foreground">
                    Qual o padrão de marcenaria e acabamento?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => { setWoodwork("functional"); next(); }} className={quizCardClass(woodwork === "functional")}>
                      <Hammer className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Funcional</p>
                      <p className="text-sm text-primary-foreground/50">Armários práticos com acabamento padrão, sem revestimento em marcenaria.</p>
                    </button>
                    <button onClick={() => { setWoodwork("premium"); next(); }} className={quizCardClass(woodwork === "premium")}>
                      <Sparkles className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Premium</p>
                      <p className="text-sm text-primary-foreground/50">Armários com fechamento suave, revestimento em marcenaria e acabamento refinado.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 6: Appliances ── */}
              {step === 6 && (
                <div className="space-y-6 animate-fade-in">
                  <span className="text-xs font-bold text-seazone-coral tracking-wider uppercase">Pergunta 6 de {TOTAL_STEPS}</span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-primary-foreground">
                    Qual o nível de equipamentos da cozinha?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => { setAppliances("essentials"); next(); }} className={quizCardClass(appliances === "essentials")}>
                      <CookingPot className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Essenciais</p>
                      <p className="text-sm text-primary-foreground/50">Eletrodomésticos básicos e utensílios funcionais para o dia a dia.</p>
                    </button>
                    <button onClick={() => { setAppliances("gourmet"); next(); }} className={quizCardClass(appliances === "gourmet")}>
                      <Crown className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Gourmet</p>
                      <p className="text-sm text-primary-foreground/50">Marcas renomadas, acabamento inox e utensílios de alta gastronomia.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 7: Infrastructure ── */}
              {step === 7 && (
                <div className="space-y-6 animate-fade-in">
                  <span className="text-xs font-bold text-seazone-coral tracking-wider uppercase">Pergunta 7 de {TOTAL_STEPS}</span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-primary-foreground">
                    Infraestrutura: ar-condicionado e bancadas em pedra?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => { setInfra("basica"); next(); }} className={quizCardClass(infra === "basica")}>
                      <Zap className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Básica</p>
                      <p className="text-sm text-primary-foreground/50">Apenas instalação de equipamentos, sem elétrica adicional ou pedras.</p>
                    </button>
                    <button onClick={() => { setInfra("completa"); next(); }} className={quizCardClass(infra === "completa")}>
                      <Sparkles className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Completa</p>
                      <p className="text-sm text-primary-foreground/50">Ar-condicionado, adequação elétrica e bancadas em pedra natural.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 8: Hospitality ── */}
              {step === 8 && (
                <div className="space-y-6 animate-fade-in">
                  <span className="text-xs font-bold text-seazone-coral tracking-wider uppercase">Pergunta 8 de {TOTAL_STEPS}</span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-primary-foreground">
                    Enxoval e rouparia com padrão hoteleiro Seazone?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => { setHospitality("self"); next(); }} className={quizCardClass(hospitality === "self")}>
                      <BedDouble className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Próprio</p>
                      <p className="text-sm text-primary-foreground/50">Você fornece o enxoval e rouparia por conta própria.</p>
                    </button>
                    <button onClick={() => { setHospitality("seazone"); next(); }} className={quizCardClass(hospitality === "seazone")}>
                      <Heart className="w-8 h-8 text-seazone-coral mb-3" />
                      <p className="font-bold text-base text-primary-foreground mb-1">Kit Seazone</p>
                      <p className="text-sm text-primary-foreground/50">Enxoval completo padrão hoteleiro, curadoria profissional Seazone.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 9: Scale ── */}
              {step === 9 && (
                <div className="space-y-6 animate-fade-in">
                  <span className="text-xs font-bold text-seazone-coral tracking-wider uppercase">Pergunta 9 de {TOTAL_STEPS}</span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-primary-foreground">
                    Quantas unidades você deseja decorar?
                  </h3>
                  <div className="flex items-center gap-5">
                    <Users className="w-6 h-6 text-primary-foreground/40" />
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-1.5">
                      <button
                        onClick={() => setUnits(Math.max(1, units - 1))}
                        className="w-11 h-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 transition-colors text-primary-foreground"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-14 text-center text-2xl font-bold text-primary-foreground">{units}</span>
                      <button
                        onClick={() => setUnits(units + 1)}
                        className="w-11 h-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 transition-colors text-primary-foreground"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 10: Full Management ── */}
              {step === 10 && (
                <div className="space-y-6 animate-fade-in">
                  <span className="text-xs font-bold text-seazone-coral tracking-wider uppercase">Pergunta 10 de {TOTAL_STEPS}</span>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-primary-foreground">
                    Pretende operar o imóvel com a gestão completa Seazone?
                  </h3>
                  <div className="flex items-center gap-5">
                    <TrendingUp className="w-6 h-6 text-primary-foreground/40" />
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${!operaSeazone ? "text-primary-foreground" : "text-primary-foreground/40"}`}>Não</span>
                      <Switch checked={operaSeazone} onCheckedChange={setOperaSeazone} />
                      <span className={`text-sm font-semibold ${operaSeazone ? "text-primary-foreground" : "text-primary-foreground/40"}`}>Sim</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── RESULT ── */}
              {isResult && (() => {
                const pkgLabel = selectedPackage === "premium" ? "Premium" : selectedPackage === "plus" ? "Plus" : "Essential";
                const profileDescription = isHighEnd
                  ? "Você demonstra visão de longo prazo e busca diferenciação no mercado. Seu perfil combina com um ativo de alto padrão que maximiza ticket médio e valorização patrimonial."
                  : selectedPackage === "plus"
                  ? "Você equilibra eficiência com qualidade, buscando um ativo competitivo sem abrir mão de conforto. Seu perfil indica foco em ocupação consistente com boa experiência do hóspede."
                  : "Você prioriza retorno rápido e margem operacional. Seu perfil indica foco em eficiência, com investimento enxuto e payback acelerado.";

                const saveLead = async () => {
                  if (!leadName.trim()) {
                    toast.error("Por favor, informe seu nome.");
                    return;
                  }
                  const contact = leadContact.trim();
                  if (!contact) {
                    toast.error("Por favor, informe seu e-mail ou telefone.");
                    return;
                  }
                  const isEmail = contact.includes("@");
                  setLeadSaving(true);
                  const { error } = await supabase.from("simulator_leads").insert({
                    name: leadName.trim(),
                    email: isEmail ? contact : null,
                    phone: !isEmail ? contact : null,
                    investor_profile: isHighEnd ? "high-end" : "estrategico",
                    recommended_package: pkgLabel,
                    unit_price: unitPrice,
                    total_price: totalPrice,
                    units,
                    is_spot: isSpot,
                  });
                  setLeadSaving(false);
                  if (error) {
                    toast.error("Erro ao salvar. Tente novamente.");
                    return;
                  }
                  setLeadSaved(true);
                  toast.success("Dados salvos! Enviaremos seu resultado em breve.");
                };

                const handleWhatsAppWithLead = async () => {
                  if (leadName.trim() && leadContact.trim()) {
                    await saveLead();
                  }
                  handleWhatsApp();
                };

                const consultantWhatsApp = () => {
                  const message = encodeURIComponent(
                    `Olá! Fiz a simulação Seazone Decor e gostaria de falar com um consultor.\n\n` +
                    `📦 Padrão: ${pkgLabel}\n` +
                    `💰 Investimento: R$ ${unitPrice.toLocaleString("pt-BR")}/unidade\n` +
                    `🔢 Unidades: ${units}`
                  );
                  window.open(`https://wa.me/?text=${message}`, "_blank");
                };

                return (
                <div className="text-center space-y-6 animate-fade-in">
                  <Badge className={`font-bold text-sm px-4 py-1.5 ${
                    isHighEnd
                      ? "bg-gradient-to-r from-seazone-gold/20 to-seazone-coral/20 text-seazone-gold border-seazone-gold/30"
                      : "bg-seazone-coral/15 text-seazone-coral border-seazone-coral/30"
                  }`}>
                    {isHighEnd ? "✦ Perfil: Investidor High-End Seazone" : "✦ Perfil: Investidor Estratégico Seazone"}
                  </Badge>

                  <p className="text-sm text-primary-foreground/60 max-w-md mx-auto leading-relaxed">
                    {profileDescription}
                  </p>

                  <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2">
                    <span className="text-xs text-primary-foreground/40 uppercase tracking-wider font-semibold">Padrão de partida</span>
                    <span className="text-sm font-bold text-seazone-coral">{pkgLabel}</span>
                  </div>

                  <div>
                    <p className="text-sm text-primary-foreground/50 mb-2">Investimento por unidade</p>
                    <p className="text-4xl md:text-5xl font-display font-bold text-seazone-coral">
                      R$ {unitPrice.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  {units > 1 && (
                    <p className="text-sm text-primary-foreground/50">
                      Total para {units} unidades: R$ {totalPrice.toLocaleString("pt-BR")}
                    </p>
                  )}

                  {/* Lead capture + CTAs */}
                  <div className="max-w-md mx-auto pt-4 space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                      <p className="text-sm font-semibold text-primary-foreground">
                        📲 Receba seu resultado via WhatsApp
                      </p>
                      <div className="space-y-3">
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
                          <Input
                            placeholder="Seu nome"
                            value={leadName}
                            onChange={(e) => setLeadName(e.target.value)}
                            className="pl-10 bg-white/10 border-white/15 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-seazone-coral"
                          />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
                          <Input
                            placeholder="E-mail ou telefone"
                            value={leadContact}
                            onChange={(e) => setLeadContact(e.target.value)}
                            className="pl-10 bg-white/10 border-white/15 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-seazone-coral"
                          />
                        </div>
                      </div>
                      <Button
                        variant="coral"
                        size="lg"
                        className="w-full"
                        onClick={handleWhatsAppWithLead}
                        disabled={leadSaving || leadSaved}
                      >
                        {leadSaved ? (
                          <>✓ Enviado!</>
                        ) : leadSaving ? (
                          <>Salvando...</>
                        ) : (
                          <><Send className="w-4 h-4" /> Receber Resultado via WhatsApp</>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-xs text-primary-foreground/30 uppercase tracking-wider">ou</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <Button
                      variant="glass"
                      size="lg"
                      className="w-full"
                      onClick={consultantWhatsApp}
                    >
                      <MessageCircle className="w-5 h-5" />
                      Falar com um Consultor
                    </Button>

                    <Button variant="glass" size="default" onClick={restart} className="mx-auto">
                      <RotateCcw className="w-4 h-4" />
                      Refazer Simulação
                    </Button>
                  </div>
                </div>
                );
              })()}
            </div>

            {/* Navigation footer */}
            {step >= 1 && !isResult && (
              <div className="px-8 md:px-12 pb-8 flex items-center justify-between">
                <Button variant="glass" size="default" onClick={prev} disabled={step <= 1}>
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </Button>
                <span className="text-xs text-primary-foreground/40 font-medium">{step} / {TOTAL_STEPS}</span>
                <Button variant="coral" size="default" onClick={next}>
                  {step === TOTAL_STEPS ? "Ver Resultado" : "Próxima"} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
