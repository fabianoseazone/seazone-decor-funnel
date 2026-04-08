import { useState } from "react";
import { Check, Plus, Minus, ArrowRight, ArrowLeft, Wrench, Sofa, Cpu, Paintbrush } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useFunnel } from "@/contexts/FunnelContext";
import { CustomizationItem } from "@/types/funnel";

const categoryIcons = {
  infraestrutura: Wrench,
  mobiliario: Sofa,
  tecnologia: Cpu,
  acabamento: Paintbrush,
};

const categoryLabels = {
  infraestrutura: "Infraestrutura",
  mobiliario: "Mobiliário",
  tecnologia: "Tecnologia",
  acabamento: "Acabamento",
};

export function StepCustomization() {
  const { 
    customizations, 
    toggleCustomization, 
    getCustomizationsTotal, 
    getTotalPrice,
    nextStep,
    prevStep 
  } = useFunnel();
  
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = ["all", "infraestrutura", "mobiliario", "tecnologia", "acabamento"];
  
  const filteredItems = activeCategory === "all" 
    ? customizations 
    : customizations.filter(item => item.category === activeCategory);

  const selectedCount = customizations.filter(item => item.selected).length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          Personalize seu Projeto
        </h2>
        <p className="text-muted-foreground">
          Adicione itens opcionais para potencializar seu investimento
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "coral" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
          >
            {cat === "all" ? "Todos" : categoryLabels[cat as keyof typeof categoryLabels]}
          </Button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const Icon = categoryIcons[item.category];
          
          return (
            <Card
              key={item.id}
              variant={item.selected ? "selected" : "elevated"}
              className="cursor-pointer transition-all duration-200"
              onClick={() => toggleCustomization(item.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.selected ? "bg-seazone-success/20" : "bg-secondary"
                  }`}>
                    <Icon className={`w-6 h-6 ${item.selected ? "text-seazone-success" : "text-muted-foreground"}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
                      <Switch 
                        checked={item.selected} 
                        onCheckedChange={() => toggleCustomization(item.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="secondary">
                        {categoryLabels[item.category]}
                      </Badge>
                      <span className={`font-bold ${item.selected ? "text-seazone-coral" : "text-foreground"}`}>
                        +R$ {item.price.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card variant="navy" className="sticky bottom-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-primary-foreground/70 text-sm">
                {selectedCount} {selectedCount === 1 ? "item selecionado" : "itens selecionados"}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-primary-foreground/50">Adicionais:</span>
                <span className="text-xl font-bold text-seazone-coral">
                  +R$ {getCustomizationsTotal().toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-primary-foreground/50">Total:</span>
                <span className="text-2xl font-bold text-primary-foreground">
                  R$ {getTotalPrice().toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="glass" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button variant="coral" onClick={nextStep}>
                Continuar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
