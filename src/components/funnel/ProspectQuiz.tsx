import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, MessageCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const WHATSAPP_NUMBER = "5548999999999"; // substituir pelo número real do comercial

const PACKAGES = {
  Essential: {
    label: "Essential",
    desc: "Funcional, completo e econômico",
    price: "a partir de R$ 45.000",
    color: "bg-secondary",
    features: ["Mobiliário completo", "Eletrodomésticos essenciais", "Kit enxoval básico"],
  },
  Plus: {
    label: "Plus",
    desc: "Ótimo custo-benefício com mais conforto",
    price: "a partir de R$ 70.000",
    color: "bg-coral-gradient",
    features: ["Tudo do Essential", "Marcenaria customizada", "Itens de decoração selecionados"],
  },
  Premium: {
    label: "Premium",
    desc: "Alto padrão para maximizar a rentabilidade",
    price: "a partir de R$ 95.000",
    color: "bg-premium-gradient",
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
}

export function ProspectQuiz({ onBack }: ProspectQuizProps) {
  const [step, setStep] = useState<QuizStep>("contact");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [recommended, setRecommended] = useState<keyof typeof PACKAGES>("Plus");

  const totalScore = Object.values(answers).reduce((s, v) => s + v, 0);

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
      saveLeadAndFinish(pkg, finalScore);
    }
  };

  const saveLeadAndFinish = async (pkg: keyof typeof PACKAGES, score: number) => {
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
      // silently ignore - UX shouldn't block on save failure
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
        <Card variant="glass" className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <Button variant="ghost" size="sm" className="absolute top-4 left-4 text-primary-foreground/70" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
            <Badge variant="coral" className="mx-auto mb-3">Simulação de Pacote</Badge>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Antes de começar
            </h2>
            <p className="text-muted-foreground text-sm">
              Informe seus dados para receber o resultado da simulação
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qname">Nome completo *</Label>
              <Input
                id="qname"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qphone">WhatsApp *</Label>
              <Input
                id="qphone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(48) 9 0000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qemail">E-mail</Label>
              <Input
                id="qemail"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <Button
              variant="coral"
              size="lg"
              className="w-full"
              disabled={!name.trim() || !phone.trim()}
              onClick={() => setStep("questions")}
            >
              Iniciar simulação <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Questions step ────────────────────────────────────────────────────────
  if (step === "questions") {
    const q = QUESTIONS[questionIdx];
    const progress = ((questionIdx) / QUESTIONS.length) * 100;

    return (
      <div className="min-h-screen bg-hero flex items-center justify-center p-4">
        <Card variant="glass" className="w-full max-w-lg">
          <CardContent className="p-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-primary-foreground/60 mb-2">
                <span>Pergunta {questionIdx + 1} de {QUESTIONS.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-seazone-coral rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <h3 className="text-xl font-display font-bold text-foreground mb-6">
              {q.text}
            </h3>

            <div className="space-y-3">
              {q.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.score)}
                  className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-seazone-coral/50 hover:bg-seazone-coral/5 transition-all group flex items-center justify-between"
                >
                  <span className="font-medium text-foreground">{opt.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-seazone-coral transition-colors" />
                </button>
              ))}
            </div>

            {questionIdx > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 text-muted-foreground"
                onClick={() => setQuestionIdx(i => i - 1)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Pergunta anterior
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Result step ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-seazone-success/20 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-seazone-success" />
          </div>
          <Badge variant="success" className="mx-auto">Simulação concluída</Badge>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Olá, {name.split(" ")[0]}!
          </h2>
          <p className="text-muted-foreground text-sm">
            Com base nas suas respostas, o pacote ideal para você é:
          </p>
        </div>

        <Card variant="elevated" className="overflow-hidden">
          <div className={`${pkg.color} px-6 py-5 text-center`}>
            <p className="text-xs font-bold text-primary-foreground/70 uppercase tracking-wider mb-1">
              Pacote recomendado
            </p>
            <h3 className="text-3xl font-display font-bold text-primary-foreground">
              {pkg.label}
            </h3>
            <p className="text-primary-foreground/80 text-sm mt-1">{pkg.desc}</p>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="text-center py-3 rounded-xl bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">Investimento estimado</p>
              <p className="text-2xl font-bold text-seazone-coral">{pkg.price}</p>
              <p className="text-xs text-muted-foreground mt-1">Valor sujeito à tipologia e empreendimento</p>
            </div>

            <div className="space-y-2">
              {pkg.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-seazone-success flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="coral" size="lg" className="w-full">
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar com o comercial no WhatsApp
              </Button>
            </a>

            <Button variant="outline" className="w-full" onClick={onBack}>
              Refazer simulação
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
