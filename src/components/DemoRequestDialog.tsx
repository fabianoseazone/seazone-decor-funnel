import { useState, useMemo } from "react";
import { X, Search, Check, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CIDADES = [
  "Imbituba", "Anápolis", "Angra dos Reis", "Armação dos Búzios", "Balneário Camboriú",
  "Balneário Piçarras", "Bertioga", "Blumenau", "Bombinhas", "Brasília", "Cabo Frio",
  "Camaçari", "Campos do Jordão", "Caucaia", "Curitiba", "Florianópolis", "Garopaba",
  "Goiânia", "Governador Valadares", "Gramado", "Guarapari", "Ilhéus", "Itajaí",
  "Itapema", "Jaguaruna", "João Pessoa", "Joinville", "Maceió", "Maraú", "Penha",
  "Petrópolis", "Poços de Caldas", "Porto Alegre", "Porto Belo", "Porto de Pedras",
  "Porto Seguro", "Recife", "Salvador", "São Miguel dos Milagres", "São Paulo",
  "Ubatuba", "Urubici", "Outro",
];

interface DemoRequestDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DemoRequestDialog({ open, onClose }: DemoRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [cidadeSearch, setCidadeSearch] = useState("");
  const [cidadeOpen, setCidadeOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    empreendimento: "",
    cidade: "",
    assunto: "",
    comoConheceu: "",
  });

  const errors = {
    nome: !form.nome.trim(),
    email: !form.email.trim(),
    telefone: !form.telefone.trim(),
    comoConheceu: !form.comoConheceu,
  };

  const filteredCidades = useMemo(() => {
    if (!cidadeSearch) return CIDADES;
    return CIDADES.filter((c) => c.toLowerCase().includes(cidadeSearch.toLowerCase()));
  }, [cidadeSearch]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (errors.nome || errors.email || errors.telefone || errors.comoConheceu) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Solicitação enviada!", {
        description: "Entraremos em contato em breve.",
      });
      setIsSubmitting(false);
      onClose();
      setForm({ nome: "", email: "", telefone: "", empreendimento: "", cidade: "", assunto: "", comoConheceu: "" });
    }, 1000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-elevated">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full p-1.5 bg-muted hover:bg-muted/80 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>

        <div className="p-6 pb-2 text-center">
          <h3 className="text-2xl font-display font-bold text-foreground">
            Solicite uma Demonstração
          </h3>
          <p className="text-muted-foreground mt-2 text-sm">
            Preencha o formulário e entraremos em contato em breve!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="demo-nome">Nome *</Label>
            <Input id="demo-nome" placeholder="Seu nome e último sobrenome" value={form.nome} onChange={(e) => handleChange("nome", e.target.value)} className={showErrors && errors.nome ? "border-destructive" : ""} />
            {showErrors && errors.nome && <p className="text-xs text-destructive">Campo obrigatório</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="demo-email">E-mail *</Label>
            <Input id="demo-email" type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className={showErrors && errors.email ? "border-destructive" : ""} />
            {showErrors && errors.email && <p className="text-xs text-destructive">Campo obrigatório</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="demo-telefone">Telefone *</Label>
            <Input id="demo-telefone" type="tel" placeholder="+55 (00) 00000-0000" value={form.telefone} onChange={(e) => handleChange("telefone", e.target.value)} className={showErrors && errors.telefone ? "border-destructive" : ""} />
            {showErrors && errors.telefone && <p className="text-xs text-destructive">Campo obrigatório</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="demo-empreendimento">Empreendimento</Label>
            <Input id="demo-empreendimento" placeholder="Nome do empreendimento" value={form.empreendimento} onChange={(e) => handleChange("empreendimento", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Cidade</Label>
            <Popover open={cidadeOpen} onOpenChange={setCidadeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={cidadeOpen}
                  className="w-full justify-between font-normal"
                >
                  {form.cidade || "Selecione a cidade"}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[60]" align="start">
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <input
                    className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Buscar cidade..."
                    value={cidadeSearch}
                    onChange={(e) => setCidadeSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1">
                  {filteredCidades.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma cidade encontrada.</p>
                  ) : (
                    filteredCidades.map((cidade) => (
                      <button
                        key={cidade}
                        type="button"
                        className={cn(
                          "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                          form.cidade === cidade && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => {
                          handleChange("cidade", cidade);
                          setCidadeOpen(false);
                          setCidadeSearch("");
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", form.cidade === cidade ? "opacity-100" : "opacity-0")} />
                        {cidade}
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="demo-assunto">Assunto</Label>
            <Textarea id="demo-assunto" placeholder="Descreva brevemente seu interesse..." value={form.assunto} onChange={(e) => handleChange("assunto", e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label className={showErrors && errors.comoConheceu ? "text-destructive" : ""}>Como conheceu a Seazone Decor? *</Label>
            <RadioGroup value={form.comoConheceu} onValueChange={(v) => handleChange("comoConheceu", v)} className="space-y-1.5">
              {[
                "Sou investidor Spot",
                "Indicação da incorporadora",
                "Indicação de outro cliente",
                "Avisos no empreendimento",
                "Redes Sociais",
                "Pesquisa no Google",
              ].map((opt) => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`como-${opt}`} />
                  <Label htmlFor={`como-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
            {showErrors && errors.comoConheceu && <p className="text-xs text-destructive">Campo obrigatório</p>}
          </div>

          <p className="text-xs text-muted-foreground">
            Os dados coletados são necessários para que possamos entrar em contato e enviar materiais de acordo com seus interesses.
          </p>

          <Button type="submit" variant="coral" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Quero conhecer a Seazone Decor"}
          </Button>
        </form>
      </div>
    </div>
  );
}
