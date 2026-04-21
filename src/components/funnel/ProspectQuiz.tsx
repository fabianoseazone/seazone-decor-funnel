import { useState, useEffect } from "react";
import {
  ArrowLeft, ArrowRight, Check, MessageCircle, Sparkles,
  Target, Gem, Clock, Crown, Briefcase, ShieldCheck,
  Hammer, Zap, BedDouble, Heart, Users, TrendingUp, Building2,
  Minus, Plus as PlusIcon, Flame,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP_NUMBER = "5548999999999";

const PACKAGE_ABREV: Record<string, string> = {
  Essential: "ES",
  Plus: "PL",
  Premium: "PR",
};

const PACKAGES = {
  Essential: {
    label: "Essential",
    desc: "Funcional, completo e com ótimo custo-benefício",
    price: "R$ 58.000",
    headerClass: "from-slate-700 to-slate-800",
    features: ["Mobiliário completo", "Eletrodomésticos essenciais", "Kit enxoval básico"],
  },
  Plus: {
    label: "Plus",
    desc: "Conforto superior e acabamento diferenciado",
    price: "R$ 75.000",
    headerClass: "from-[hsl(14_88%_52%)] to-[hsl(22_90%_46%)]",
    features: ["Tudo do Essential", "Marcenaria customizada", "Decoração selecionada"],
  },
  Premium: {
    label: "Premium",
    desc: "Alto padrão para maximizar a rentabilidade",
    price: "R$ 90.000",
    headerClass: "from-[hsl(42_85%_46%)] to-[hsl(32_88%_40%)]",
    features: ["Tudo do Plus", "Design de interiores", "Acabamento premium exclusivo"],
  },
};

// ── Answer types ──────────────────────────────────────────────────────────────

interface QuizAnswers {
  posicionamento?: string;  // Q1
  retorno?: string;         // Q2
  durabilidade?: string;    // Q3
  isSpot?: boolean;         // Q4  (special: caps Premium → Plus)
  marcenaria?: string;      // Q5
  cozinha?: string;         // Q6
  infraestrutura?: string;  // Q7
  enxoval?: string;         // Q8
  qtdUnidades?: number;     // Q9  (informational)
  gestao?: boolean;         // Q10
}

function calculateScore(a: QuizAnswers): number {
  let s = 0;
  if (a.posicionamento === "exclusivo")   s++;
  if (a.retorno       === "valorizacao")  s++;
  if (a.durabilidade  === "resistente")   s++;
  if (a.marcenaria    === "premium")      s++;
  if (a.cozinha       === "gourmet")      s++;
  if (a.infraestrutura === "completa")    s++;
  if (a.enxoval       === "kit")          s++;
  if (a.gestao        === true)           s++;
  return s;
}

function getPackageRecommendation(a: QuizAnswers): keyof typeof PACKAGES {
  const score = calculateScore(a);
  let pkg: keyof typeof PACKAGES =
    score <= 2 ? "Essential" : score <= 5 ? "Plus" : "Premium";
  // Spot imóveis não chegam a Premium
  if (a.isSpot && pkg === "Premium") pkg = "Plus";
  return pkg;
}

// ── Question definitions ───────────────────────────────────────────────────────

type QType = "binary" | "toggle" | "number";

interface BinaryOption {
  value: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

interface QuestionDef {
  key: keyof QuizAnswers;
  text: string;
  type: QType;
  options?: [BinaryOption, BinaryOption];
  toggleIcon?: React.ReactNode;
  offLabel?: string;
  onLabel?: string;
  numberIcon?: React.ReactNode;
  min?: number;
}

const QUESTIONS: QuestionDef[] = [
  {
    key: "posicionamento",
    type: "binary",
    text: "Como você quer posicionar seu imóvel no mercado?",
    options: [
      {
        value: "competitivo",
        label: "Competitivo e Eficiente",
        sublabel: "Preço acessível, alta ocupação e retorno rápido.",
        icon: <Target className="w-7 h-7 text-seazone-coral" />,
      },
      {
        value: "exclusivo",
        label: "Exclusivo e Diferenciado",
        sublabel: "Ticket médio alto, avaliações 5 estrelas e destaque no mercado.",
        icon: <Gem className="w-7 h-7 text-seazone-coral" />,
      },
    ],
  },
  {
    key: "retorno",
    type: "binary",
    text: "Qual é a sua visão sobre o tempo de retorno?",
    options: [
      {
        value: "payback",
        label: "Payback Acelerado",
        sublabel: "Investimento enxuto com retorno no menor prazo possível.",
        icon: <Clock className="w-7 h-7 text-seazone-coral" />,
      },
      {
        value: "valorizacao",
        label: "Valorização Contínua",
        sublabel: "Construir um ativo premium que se valoriza ao longo do tempo.",
        icon: <Crown className="w-7 h-7 text-seazone-coral" />,
      },
    ],
  },
  {
    key: "durabilidade",
    type: "binary",
    text: "Qual a durabilidade esperada do seu projeto?",
    options: [
      {
        value: "pratico",
        label: "Prático e Renovável",
        sublabel: "Materiais funcionais, fáceis de repor e trocar.",
        icon: <Briefcase className="w-7 h-7 text-seazone-coral" />,
      },
      {
        value: "resistente",
        label: "Resistente e Atemporal",
        sublabel: "Materiais premium com acabamento durável e sofisticado.",
        icon: <ShieldCheck className="w-7 h-7 text-seazone-coral" />,
      },
    ],
  },
  {
    key: "isSpot",
    type: "toggle",
    text: "Sua unidade é em um empreendimento Spot?",
    toggleIcon: <Building2 className="w-6 h-6 text-seazone-coral" />,
    offLabel: "Não",
    onLabel: "Sim",
  },
  {
    key: "marcenaria",
    type: "binary",
    text: "Qual o padrão de marcenaria e acabamento?",
    options: [
      {
        value: "funcional",
        label: "Funcional",
        sublabel: "Armários práticos com acabamento padrão, sem revestimento em marcenaria.",
        icon: <Hammer className="w-7 h-7 text-seazone-coral" />,
      },
      {
        value: "premium",
        label: "Premium",
        sublabel: "Armários com fechamento suave, revestimento em marcenaria e acabamento refinado.",
        icon: <Sparkles className="w-7 h-7 text-seazone-coral" />,
      },
    ],
  },
  {
    key: "cozinha",
    type: "binary",
    text: "Qual o nível de equipamentos da cozinha?",
    options: [
      {
        value: "essenciais",
        label: "Essenciais",
        sublabel: "Eletrodomésticos básicos e utensílios funcionais para o dia a dia.",
        icon: <Flame className="w-7 h-7 text-seazone-coral" />,
      },
      {
        value: "gourmet",
        label: "Gourmet",
        sublabel: "Marcas renomadas, acabamento inox e utensílios de alta gastronomia.",
        icon: <Crown className="w-7 h-7 text-seazone-coral" />,
      },
    ],
  },
  {
    key: "infraestrutura",
    type: "binary",
    text: "Infraestrutura: ar-condicionado e bancadas em pedra?",
    options: [
      {
        value: "basica",
        label: "Básica",
        sublabel: "Apenas instalação de equipamentos, sem elétrica adicional ou pedras.",
        icon: <Zap className="w-7 h-7 text-seazone-coral" />,
      },
      {
        value: "completa",
        label: "Completa",
        sublabel: "Ar-condicionado, adequação elétrica e bancadas em pedra natural.",
        icon: <Sparkles className="w-7 h-7 text-seazone-coral" />,
      },
    ],
  },
  {
    key: "enxoval",
    type: "binary",
    text: "Enxoval e rouparia com padrão hoteleiro Seazone?",
    options: [
      {
        value: "proprio",
        label: "Próprio",
        sublabel: "Você fornece o enxoval e rouparia por conta própria.",
        icon: <BedDouble className="w-7 h-7 text-seazone-coral" />,
      },
      {
        value: "kit",
        label: "Kit Seazone",
        sublabel: "Enxoval completo padrão hoteleiro, curadoria profissional Seazone.",
        icon: <Heart className="w-7 h-7 text-seazone-coral" />,
      },
    ],
  },
  {
    key: "qtdUnidades",
    type: "number",
    text: "Quantas unidades você deseja decorar?",
    numberIcon: <Users className="w-6 h-6 text-seazone-coral" />,
    min: 1,
  },
  {
    key: "gestao",
    type: "toggle",
    text: "Pretende operar o imóvel com a gestão completa Seazone?",
    toggleIcon: <TrendingUp className="w-6 h-6 text-seazone-coral" />,
    offLabel: "Não",
    onLabel: "Sim",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

type QuizStep = "contact" | "questions" | "result";

interface ProspectQuizProps {
  onBack: () => void;
  onViewDetails?: (recommendedPkg: string) => void;
}

export function ProspectQuiz({ onBack, onViewDetails }: ProspectQuizProps) {
  const [step, setStep]         = useState<QuizStep>("contact");
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [email, setEmail]       = useState("");
  const [qIdx, setQIdx]         = useState(0);
  const [answers, setAnswers]   = useState<QuizAnswers>({});
  const [saving, setSaving]     = useState(false);
  const [recommended, setRecommended] = useState<keyof typeof PACKAGES>("Plus");

  // per-question UI state
  const [selectedBinary, setSelectedBinary] = useState<string | null>(null);
  const [toggleVal, setToggleVal]           = useState(false);
  const [numberVal, setNumberVal]           = useState(1);

  const TOTAL = QUESTIONS.length;
  const isLast = qIdx === TOTAL - 1;

  // Sync UI state when navigating between questions
  useEffect(() => {
    const q = QUESTIONS[qIdx];
    const existing = answers[q.key];
    if (q.type === "binary")  setSelectedBinary(existing != null ? (existing as string) : null);
    if (q.type === "toggle")  setToggleVal(existing != null ? (existing as boolean) : false);
    if (q.type === "number")  setNumberVal(existing != null ? (existing as number) : 1);
  }, [qIdx]);

  const canProceed = () => {
    const q = QUESTIONS[qIdx];
    if (q.type === "binary") return selectedBinary !== null;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    const q = QUESTIONS[qIdx];
    const newAnswers: QuizAnswers = { ...answers };

    if (q.type === "binary")  (newAnswers as any)[q.key] = selectedBinary;
    if (q.type === "toggle")  (newAnswers as any)[q.key] = toggleVal;
    if (q.type === "number")  (newAnswers as any)[q.key] = numberVal;

    setAnswers(newAnswers);

    if (!isLast) {
      setQIdx(i => i + 1);
    } else {
      const pkg = getPackageRecommendation(newAnswers);
      setRecommended(pkg);
      saveLead(pkg, newAnswers);
    }
  };

  const handleBack = () => {
    if (qIdx === 0) setStep("contact");
    else setQIdx(i => i - 1);
  };

  const saveLead = async (pkg: keyof typeof PACKAGES, a: QuizAnswers) => {
    setSaving(true);
    try {
      const score = calculateScore(a);
      await supabase.from("simulator_leads").insert({
        name,
        phone,
        email,
        recommended_package: pkg,
        investor_profile: `score:${score},spot:${a.isSpot},units:${a.qtdUnidades},gestao:${a.gestao}`,
      });
    } catch { /* silent */ }
    setSaving(false);
    setStep("result");
  };

  const pkg = PACKAGES[recommended];
  const whatsappMsg = encodeURIComponent(
    `Olá! Sou ${name} e fiz a simulação no site do Seazone Decor. O pacote recomendado foi o *${recommended}*. Gostaria de saber mais informações.`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;

  // ── Contact step ─────────────────────────────────────────────────────────────
  if (step === "contact") {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-seazone-coral/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-seazone-coral" />
            </div>
            <Badge variant="coral" className="mx-auto">Descubra seu pacote ideal</Badge>
            <h2 className="text-2xl font-display font-bold text-primary-foreground">
              Simulação Decor Lucrativo
            </h2>
            <p className="text-primary-foreground/60 text-sm">
              Responda 10 perguntas rápidas e descubra qual pacote se encaixa no seu perfil de investidor
            </p>
          </div>

          <Card variant="glass" className="border border-white/10">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qname" className="text-foreground">Nome completo *</Label>
                <Input
                  id="qname"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-white/10 border-white/20 text-foreground placeholder:text-foreground/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qphone" className="text-foreground">WhatsApp *</Label>
                <Input
                  id="qphone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(48) 9 0000-0000"
                  className="bg-white/10 border-white/20 text-foreground placeholder:text-foreground/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qemail" className="text-foreground">E-mail</Label>
                <Input
                  id="qemail"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="bg-white/10 border-white/20 text-foreground placeholder:text-foreground/40"
                />
              </div>
              <Button
                variant="coral"
                size="lg"
                className="w-full mt-2"
                disabled={!name.trim() || !phone.trim()}
                onClick={() => { setQIdx(0); setAnswers({}); setStep("questions"); }}
              >
                Iniciar simulação <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-primary-foreground/50 hover:text-primary-foreground"
                onClick={onBack}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Questions step ────────────────────────────────────────────────────────────
  if (step === "questions") {
    const q = QUESTIONS[qIdx];

    return (
      <div className="min-h-screen bg-hero flex flex-col">
        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl space-y-6">
            {/* Header */}
            <div>
              <p className="text-seazone-coral text-xs font-bold uppercase tracking-widest mb-3">
                Pergunta {qIdx + 1} de {TOTAL}
              </p>
              <h2 className="text-2xl font-display font-bold text-primary-foreground leading-snug">
                {q.text}
              </h2>
            </div>

            {/* Binary options */}
            {q.type === "binary" && q.options && (
              <div className="grid grid-cols-2 gap-4">
                {q.options.map(opt => {
                  const isSelected = selectedBinary === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedBinary(opt.value)}
                      className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 space-y-3 ${
                        isSelected
                          ? "border-seazone-coral bg-seazone-coral/10"
                          : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/8"
                      }`}
                    >
                      <div>{opt.icon}</div>
                      <div>
                        <p className={`font-bold text-base leading-tight mb-1 ${isSelected ? "text-white" : "text-primary-foreground"}`}>
                          {opt.label}
                        </p>
                        <p className="text-sm text-primary-foreground/55 leading-snug">
                          {opt.sublabel}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Toggle option */}
            {q.type === "toggle" && (
              <div className="flex items-center gap-4 py-2">
                {q.toggleIcon && <div className="flex-shrink-0">{q.toggleIcon}</div>}
                <span className={`text-sm font-medium transition-colors ${!toggleVal ? "text-primary-foreground" : "text-primary-foreground/40"}`}>
                  {q.offLabel}
                </span>
                <button
                  onClick={() => setToggleVal(v => !v)}
                  className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    toggleVal ? "bg-seazone-coral" : "bg-white/20"
                  }`}
                  aria-checked={toggleVal}
                  role="switch"
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      toggleVal ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium transition-colors ${toggleVal ? "text-primary-foreground" : "text-primary-foreground/40"}`}>
                  {q.onLabel}
                </span>
              </div>
            )}

            {/* Number option */}
            {q.type === "number" && (
              <div className="flex items-center gap-5 py-2">
                {q.numberIcon && <div className="flex-shrink-0">{q.numberIcon}</div>}
                <button
                  onClick={() => setNumberVal(v => Math.max(q.min ?? 1, v - 1))}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/15"
                >
                  <Minus className="w-4 h-4 text-primary-foreground" />
                </button>
                <span className="text-2xl font-bold text-primary-foreground w-8 text-center">
                  {numberVal}
                </span>
                <button
                  onClick={() => setNumberVal(v => v + 1)}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/15"
                >
                  <PlusIcon className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom nav bar */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-primary-foreground/60 hover:text-primary-foreground"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>

            <span className="text-primary-foreground/40 text-sm tabular-nums">
              {qIdx + 1} / {TOTAL}
            </span>

            <Button
              variant="coral"
              disabled={!canProceed() || saving}
              onClick={handleNext}
            >
              {isLast ? "Ver Resultado" : "Próxima"}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Result step ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-seazone-success/20 flex items-center justify-center mb-3 border border-seazone-success/30">
            <Check className="w-7 h-7 text-seazone-success" />
          </div>
          <p className="text-primary-foreground/60 text-sm uppercase tracking-wider font-semibold">
            Simulação concluída
          </p>
          <h2 className="text-2xl font-display font-bold text-primary-foreground">
            Olá, {name.split(" ")[0]}! Seu pacote ideal é:
          </h2>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-elevated border border-white/10">
          <div className={`bg-gradient-to-br ${pkg.headerClass} px-6 py-6 text-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative">
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">
                Pacote recomendado
              </p>
              <h3 className="text-4xl font-display font-bold text-white mb-1">
                {pkg.label}
              </h3>
              <p className="text-white/75 text-sm">{pkg.desc}</p>
            </div>
          </div>

          <div className="bg-card p-6 space-y-5">
            <div className="text-center py-4 rounded-xl bg-seazone-coral/5 border border-seazone-coral/15">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Investimento estimado</p>
              <p className="text-2xl font-bold text-seazone-coral">{pkg.price}</p>
              <p className="text-xs text-muted-foreground mt-1">Sujeito à tipologia e empreendimento</p>
            </div>

            <div className="space-y-2.5">
              {pkg.features.map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                  <div className="w-5 h-5 rounded-full bg-seazone-success/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-seazone-success" />
                  </div>
                  {f}
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              {onViewDetails && (
                <Button
                  variant="coral"
                  size="lg"
                  className="w-full"
                  onClick={() => onViewDetails(PACKAGE_ABREV[recommended])}
                >
                  Ver itens e imagens do pacote <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar com o comercial
                </Button>
              </a>

              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => { setQIdx(0); setAnswers({}); setStep("questions"); }}
              >
                Refazer simulação
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
