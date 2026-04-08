import { ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBonitoSpot } from "@/contexts/BonitoSpotContext";
import { CATEGORY_ORDER, CATEGORY_ICONS, REFERENCE_TOTALS } from "@/data/bonitoSpotCatalog";

// Simplified category highlights per package
const PACKAGE_HIGHLIGHTS: Record<string, Record<string, string[]>> = {
  Essential: {
    "Marcenaria": ["Arara simples", "Cabeceira", "Gabinete inferior e superior", "Mesa/bancada", "Móvel de apoio", "Móvel do banheiro"],
    "Marmoraria": ["Bancada de banheiro", "Bancada de cozinha"],
    "Louças E Metais": ["Cuba Celite", "Kit de Metais Cromado", "Chuveiro a gás", "Filtro de Água", "Misturadores"],
    "Mobiliário": ["Cadeira Thonix", "Cama box Queen", "Cortina Gaze e Blackout", "Espelhos"],
    "Decoração": ["Almofada Seazone", "Capacho Seazone", "Luminária Seazone", "Quadros 30x40"],
    "Eletrodomésticos E Eletroportáteis": ["TV Smart 43\"", "AC Frio 12k BTUs", "Frigobar 67L", "Cooktop 2 Bocas", "Microondas"],
    "Operacionais": ["Enxoval completo (lençóis, toalhas, travesseiros)", "Kit cozinha (panelas, utensílios, talheres)"],
  },
  Plus: {
    "Marcenaria": ["Arara planejada", "Cabeceira melhorada", "Gabinete Superior premium", "Vassoureiro", "Prateleira"],
    "Marmoraria": ["Bancada de banheiro", "Bancada de cozinha premium"],
    "Louças E Metais": ["Cuba Roca (upgrade)", "Toalheiro térmico", "Papeleira", "Porta sabonete/shampoo"],
    "Mobiliário": ["Cadeira Déco Premium", "Espelho Scand Tauari", "Mesa e cadeira jardim (A/B/C)", "Puff Heath Lis"],
    "Decoração": ["Quadros 50x70 (upgrade)", "Almofada Seazone", "Luminária Seazone"],
    "Eletrodomésticos E Eletroportáteis": ["TV Smart 43\"", "AC Quente/Frio 12k BTUs", "Frigobar 76L", "Depurador"],
    "Pintura": ["Pintura lisa + Pintura efeito"],
  },
  Premium: {
    "Marcenaria": ["Armário planejado (substitui arara)", "Cabeceira premium", "2 Móveis de banheiro", "Gabinetes premium"],
    "Mobiliário": ["Cadeira Perlan R$ 1.399", "Espelhos premium", "Mobília completa"],
    "Eletrodomésticos E Eletroportáteis": ["TV Smart 50\"", "Airfryer", "Máquina de café", "Chaleira premium", "Liquidificador 3,2L"],
    "Operacionais": ["Enxoval expandido (qtd 4 para 2 hósp.)", "Kit completo hoteleiro"],
    "Louças E Metais": ["Misturadores premium", "Toalheiro térmico", "Acabamento top"],
  },
};

export function BSCategoryOverview() {
  const { state, nextStep, prevStep } = useBonitoSpot();
  const pkg = state.selectedPackage!;
  const typ = state.typology!;
  const highlights = PACKAGE_HIGHLIGHTS[pkg] || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <Badge className="mb-3 bg-white/10 text-primary-foreground/60 border-white/15">
          Apto {state.apartment} • Tipo {typ} • {pkg}
        </Badge>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-2">
          O que está incluso no {pkg}
        </h2>
        <p className="text-primary-foreground/50 text-sm">
          Principais itens e categorias do seu pacote
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1">
        {Object.entries(highlights).map(([category, items]) => (
          <div
            key={category}
            className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{CATEGORY_ICONS[category] || "📦"}</span>
              <h3 className="font-semibold text-primary-foreground text-sm">{category}</h3>
            </div>
            <ul className="space-y-1">
              {items.map((item, i) => (
                <li key={i} className="text-xs text-primary-foreground/60 flex items-start gap-1.5">
                  <span className="text-seazone-coral mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Price reminder */}
      <div className="text-center">
        <p className="text-primary-foreground/40 text-xs">Valor total para Tipo {typ}</p>
        <p className="text-2xl font-bold text-seazone-coral">
          R$ {REFERENCE_TOTALS[pkg][typ].toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="glass" size="default" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button variant="coral" size="lg" onClick={nextStep}>
          Ver Resumo Financeiro <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
