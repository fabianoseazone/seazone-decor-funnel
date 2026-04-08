import { Check, Star, Package, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useFunnel } from "@/contexts/FunnelContext";
import { useTipologiasDisponiveis } from "@/hooks/useTipologiasDisponiveis";

const PACOTE_LABEL: Record<string, string> = {
  ES: "Essential", PL: "Plus", PR: "Premium", HD1: "HD1", AM: "Ampliada",
};

export function StepPackageSelection() {
  const { selectedUnit, selectPackage, setTipologiaSelecionada, selectedPackage, nextStep } = useFunnel();

  const tipologiaCodigo = selectedUnit?.tipologiaCodigo ?? null;
  const { data: tipologias, isLoading } = useTipologiasDisponiveis(tipologiaCodigo);

  const handleSelect = (tip: any) => {
    const abrev: string = tip.pacote?.abreviacao ?? "";
    selectPackage((PACOTE_LABEL[abrev]?.toLowerCase() ?? "essential") as any);
    setTipologiaSelecionada(tip);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-seazone-coral" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          Escolha seu Plano
        </h2>
        <p className="text-muted-foreground">
          Selecione o plano que melhor atende às necessidades do seu imóvel
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {(tipologias ?? []).map((tip: any) => {
          const abrev: string = tip.pacote?.abreviacao ?? "";
          const nome = PACOTE_LABEL[abrev] ?? tip.descricao;
          const isSelected = selectedPackage === nome.toLowerCase();
          const isRecommended = abrev === "PL";

          return (
            <Card
              key={tip.id}
              variant={isSelected ? "selected" : isRecommended ? "premium" : "elevated"}
              className={`relative cursor-pointer transition-all duration-300 ${
                isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"
              }`}
              onClick={() => handleSelect(tip)}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="coral" className="shadow-coral">
                    <Star className="w-3 h-3 mr-1" /> Recomendado
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    abrev === "PR" ? "bg-premium-gradient" :
                    abrev === "PL" ? "bg-coral-gradient" : "bg-secondary"
                  }`}>
                    <Package className={`w-7 h-7 ${
                      abrev === "ES" ? "text-foreground" : "text-primary-foreground"
                    }`} />
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold">{nome}</h3>
                <p className="text-sm text-muted-foreground">{abrev}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Taxa Decor:{" "}
                    <span className="font-bold text-foreground">
                      {tip.decor_tipo === "absoluto"
                        ? `R$ ${(tip.decor_valor ?? 0).toLocaleString("pt-BR")}`
                        : `${tip.decor_percent ?? 0}%`}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Taxa Adm:{" "}
                    <span className="font-bold text-foreground">
                      {tip.adm_percent ?? 0}%
                    </span>
                  </div>
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full" onClick={(e) => e.stopPropagation()}>
                      Ver Detalhes
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle className="font-display">{nome}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                      <p><strong>Tipologia:</strong> {tip.descricao}</p>
                      <p><strong>Tipo:</strong> {tip.tipo_letra}</p>
                      <p><strong>Hóspedes:</strong> {tip.num_hospedes}</p>
                      <p><strong>Decor:</strong> {tip.decor_tipo === "absoluto"
                        ? `R$ ${(tip.decor_valor ?? 0).toLocaleString("pt-BR")}`
                        : `${tip.decor_percent ?? 0}%`}</p>
                      <p><strong>Adm:</strong> {tip.adm_percent ?? 0}%</p>
                    </div>
                  </SheetContent>
                </Sheet>

                <Button
                  variant={isSelected ? "coral" : "outline"}
                  className="w-full"
                  onClick={(e) => { e.stopPropagation(); handleSelect(tip); }}
                >
                  {isSelected ? <><Check className="w-4 h-4 mr-1" />Selecionado</> : "Selecionar"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPackage && (
        <div className="flex justify-center">
          <Button variant="hero" size="xl" onClick={nextStep}>
            Continuar para Personalização
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
