import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, MessageCircle, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP_NUMBER = "5548999999999"; // substituir pelo número real do comercial

const PACKAGE_ABREV: Record<string, string> = {
  Essential: "ES",
  Plus: "PL",
  Premium: "PR",
};

const PACKAGES = {
  Essential: {
    label: "Essential",
    desc: "Funcional, completo e com ótimo custo-benefício",
    price: "a partir de R$ 45.000",
    headerClass: "from-slate-700 to-slate-800",
    badgeClass: "bg-slate-600",
    features: ["Mobiliário completo", "Eletrodomésticos essenciais", "Kit enxoval básico"],
  },
  Plus: {
    label: "Plus",
    desc: "Conforto superior e acabamento diferenciado",
    price: "a partir de R$ 70.000",
    headerClass: "from-[hsl(14_88%_52%)] to-[hsl(22_90%_46%)]",
    badgeClass: "bg-seazone-coral/80",
    features: ["Tudo do Essential", "Marcenaria customizada", "Decoração selecionada"],
  },
  Premium: {
    label: "Premium",
    desc: "Alto padrão para maximizar a rentabilidade",
    price: "a partir de R$ 95.000",
    headerClass: "from-[hsl(42_85%_46%)] to-[hsl(32_88%_40%)]",
    badgeClass: "bg-seazone-gold/80",
    features: ["Tudo do Plus", "Design de interiores", "Acabamento premium exclusivo"],
  },
};

const QUESTIONS = [
  {
    id: "imovel",
    text: "Qual é a situação do seu imóvel?",
    options: [
      { label: "Spot Seazone (já adquirido)", value: "spot", score: 1 },
      { label: "Expansão Seazone", value: "expansao", score: 0 },
      { label: "Ainda estou avaliando", value: "avaliando", score: 0 },
    ],
  },
  {
    id: "hospedes",
    text: "Quantos hóspedes seu apartamento comporta?",
    options: [
      { label: "Até 2 hóspedes", value: "2", score: 0 },
      { label: "3 a 4 hóspedes", value: "4", score: 1 },
      { label: "5 hóspedes ou mais", value: "5+", score: 2 },
    ],
  },
  {
    id: "padrao",
    text: "Qual nível de acabamento você prefere?",
    options: [
      { label: "Funcional e econômico", value: "funcional", score: 0 },
      { label: "Confortável com bom custo-benefício", value: "confortavel", score: 1 },
      { label: "Alto padrão, o melhor acabamento", value: "premium", score: 2 },
    ],
  },
  {
    id: "marcenaria",
    text: "Tem interesse em marcenaria customizada?",
    options: [
      { label: "Não é prioridade", value: "nao", score: 0 },
      { label: "Talvez, depende do custo", value: "talvez", score: 1 },
      { label: "Sim, é importante para mim", value: "sim", score: 2 },
    ],
  },
];

type QuizStep = "contact" | "questions" | "result";

interface ProspectQuizProps {
  onBack: () => void;
  onViewDetails?: (recommendedPkg: string) => void;
}

export function ProspectQuiz({ onBack, onViewDetails }: ProspectQuizProps) {
  const [step, setStep] = useState<QuizStep>("contact");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [recommended, setRecommended] = useState<keyof typeof PACKAGES>("Plus");

  const getPackage = (score: number): keyof typeof PACKAGES => {
    if (score <= 2) return "Essential";
    if (score <= 5) return "Plus";
    return "Premium";
  };

  const handleAnswer = (score: number) => {
    const q = QUESTIONS[questionIdx];
    const newAnswers = { ...answers, [q.id]: score };
    setAnswers(newAnswers);

    if (questionIdx < QUESTIONS.length - 1) {
      setQuestionIdx(i => i + 1);
    } else {
      const finalScore = Object.values(newAnswers).reduce((s, v) => s + v, 0);
      const pkg = getPackage(finalScore);
      setRecommended(pkg);
      saveLead(pkg, finalScore);
    }
  };

  const saveLead = async (pkg: keyof typeof PACKAGES, score: number) => {
    setSaving(true);
    try {
      await supabase.from("simulator_leads").insert({
        name,
        phone,
        email,
        recommended_package: pkg,
        investor_profile: `score:${score}`,
      });
    } catch {
      // silently ignore
    }
    setSaving(false);
    setStep("result");
  };

  const whatsappMsg = encodeURIComponent(
    `Olá! Sou ${name} e fiz a simulação no site do Seazone Decor. O pacote recomendado foi o *${recommended}*. Gostaria de saber mais informações.`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`;
  const pkg = PACKAGES[recommended];

  // ── Contact step ──────────────────────────────────────────────────────────
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
              Responda 4 perguntas rápidas e descubra qual pacote se encaixa no seu perfil de investidor
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
                onClick={() => setStep("questions")}
              >
                Iniciar simulação <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-primary-foreground/50 hover:text-primary-foreground" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Questions step ────────────────────────────────────────────────────────
  if (step === "questions") {
    const q = QUESTIONS[questionIdx];
    const progress = ((questionIdx) / QUESTIONS.length) * 100;

    return (
      <div className="min-h-screen bg-hero flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-4">
          {/* Progress header */}
          <div className="text-center space-y-1 mb-2">
            <p className="text-primary-foreground/50 text-xs uppercase tracking-widest font-semibold">
              Pergunta {questionIdx + 1} de {QUESTIONS.length}
            </p>
            <div className="flex gap-1.5 justify-center">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i <= questionIdx ? "bg-seazone-coral w-8" : "bg-white/15 w-4"
                  }`}
                />
              ))}
            </div>
          </div>

          <Card variant="glass" className="border border-white/10">
            <CardContent className="p-8">
              <h3 className="text-xl font-display font-bold text-foreground mb-6 leading-snug">
                {q.text}
              </h3>

              <div className="space-y-3">
                {q.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.score)}
                    className="w-full text-left p-4 rounded-xl border border-white/15 bg-white/5 hover:border-seazone-coral/60 hover:bg-seazone-coral/8 transition-all duration-200 group flex items-center justify-between"
                  >
                    <span className="font-medium text-foreground">{opt.label}</span>
                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-seazone-coral transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>

              {questionIdx > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-5 text-primary-foreground/40 hover:text-primary-foreground/70"
                  onClick={() => setQuestionIdx(i => i - 1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Pergunta anterior
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Result step ───────────────────────────────────────────────────────────
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
          {/* Package header */}
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

          {/* Package body */}
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

              <Button variant="ghost" className="w-full text-muted-foreground" onClick={onBack}>
                Refazer simulação
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
