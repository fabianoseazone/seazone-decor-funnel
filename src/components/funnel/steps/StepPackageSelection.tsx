import { Check, Star, Sparkles, Package, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { packagesData } from "@/data/mockData";
import { useFunnel } from "@/contexts/FunnelContext";
import { PackageType } from "@/types/funnel";

export function StepPackageSelection() {
  const { selectedPackage, selectPackage, nextStep } = useFunnel();

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
        {packagesData.map((pkg) => {
          const isSelected = selectedPackage === pkg.id;
          const isPremium = pkg.id === "plus";

          return (
            <Card
              key={pkg.id}
              variant={isSelected ? "selected" : isPremium ? "premium" : "elevated"}
              className={`relative cursor-pointer transition-all duration-300 ${
                isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"
              }`}
              onClick={() => selectPackage(pkg.id)}
            >
              {isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="coral" className="shadow-coral">
                    <Star className="w-3 h-3 mr-1" /> Recomendado
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    pkg.id === "premium" ? "bg-premium-gradient" : 
                    pkg.id === "plus" ? "bg-coral-gradient" : "bg-secondary"
                  }`}>
                    <Package className={`w-7 h-7 ${
                      pkg.id === "essential" ? "text-foreground" : "text-primary-foreground"
                    }`} />
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground">{pkg.tagline}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    R$ {pkg.price.toLocaleString("pt-BR")}
                  </div>
                  <Badge variant="free" className="mt-2">
                    <Sparkles className="w-3 h-3 mr-1" /> Arquitetura Grátis
                  </Badge>
                </div>

                {/* Features Preview */}
                <ul className="space-y-2">
                  {pkg.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-foreground">
                      <Check className="w-4 h-4 text-seazone-success mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Details Drawer */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full" onClick={(e) => e.stopPropagation()}>
                      Ver Detalhes
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle className="font-display">{pkg.name}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <p className="text-muted-foreground">{pkg.tagline}</p>
                      <div className="text-2xl font-bold">
                        R$ {pkg.price.toLocaleString("pt-BR")}
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold">Incluso no plano:</h4>
                        <ul className="space-y-2">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm">
                              <Check className="w-4 h-4 text-seazone-success mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="bg-seazone-success/10 rounded-xl p-3 text-center">
                          <div className="text-lg font-bold text-seazone-success">{pkg.dailyRateImpact}</div>
                          <p className="text-xs text-muted-foreground">Potencial Diária</p>
                        </div>
                        <div className="bg-seazone-gold/10 rounded-xl p-3 text-center">
                          <div className="text-lg font-bold text-seazone-gold">{pkg.reviewImpact}</div>
                          <p className="text-xs text-muted-foreground">Meta Avaliações</p>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <Button
                  variant={isSelected ? "coral" : "outline"}
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectPackage(pkg.id);
                  }}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" /> Selecionado
                    </>
                  ) : (
                    "Selecionar"
                  )}
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
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
