import { ArrowRight, Sparkles, Check, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import renderPreview from "@/assets/3d-render-preview.jpg";

const marketComparison = [
  { item: "Projeto Arquitetônico", seazone: 0, market: 8500 },
  { item: "Renderização 3D", seazone: 0, market: 3200 },
  { item: "Desenhos Técnicos", seazone: 0, market: 4800 },
  { item: "Especificação de Materiais", seazone: 0, market: 2500 },
];

export function ArchitectureSection() {
  const totalMarket = marketComparison.reduce((acc, item) => acc + item.market, 0);

  return (
    <section className="py-20 px-4" id="architecture">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div>
              <Badge variant="free" className="mb-4">
                <Sparkles className="w-3 h-3 mr-1" /> Economia Imediata
              </Badge>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                Custo de Projeto Zero
              </h2>
              <h3 className="text-2xl font-display font-semibold text-seazone-coral mb-4">
                Arquiteto Profissional à sua disposição
              </h3>
              <p className="text-lg text-muted-foreground">
                Economize desde o início! Arquitetura e design profissional inclusos sem custo adicional — 
                uma exclusividade Seazone que acelera sua entrada no mercado e maximiza seu retorno.
              </p>
            </div>

            {/* Savings Comparison */}
            <Card variant="elevated" className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-coral-gradient px-6 py-5 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-accent-foreground/80">Sua Economia na Entrada</span>
                      <p className="text-xs text-accent-foreground/60">Valor que você deixa de gastar</p>
                    </div>
                    <span className="text-3xl font-bold text-accent-foreground">
                      R$ {totalMarket.toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {marketComparison.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-seazone-success" />
                        <span className="text-foreground">{item.item}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground line-through">
                          R$ {item.market.toLocaleString("pt-BR")}
                        </span>
                        <Badge variant="free">R$ 0</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl">
                <Building2 className="w-5 h-5" />
                Iniciar Projeto
                <Badge variant="free" className="ml-2 text-[10px] py-0.5">GRÁTIS</Badge>
              </Button>
              <Button variant="outline" size="xl">
                Ver Portfólio
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Right: 3D Preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-coral-gradient opacity-20 blur-3xl rounded-3xl" />
            <Card variant="elevated" className="relative overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={renderPreview}
                  alt="Prévia da Renderização 3D"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <Badge variant="premium" className="mb-2">
                    <Sparkles className="w-3 h-3 mr-1" /> Visualização 3D
                  </Badge>
                  <h4 className="text-xl font-display font-bold text-primary-foreground">
                    Renderização Profissional
                  </h4>
                  <p className="text-sm text-primary-foreground/80">
                    Visualize seu imóvel antes da execução
                  </p>
                </div>
              </div>
            </Card>

            {/* Floating Stats */}
            <div className="absolute -right-4 top-1/4 animate-float">
              <Card variant="glass" className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-seazone-success">48h</div>
                  <p className="text-xs text-muted-foreground">Entrega do Render</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
