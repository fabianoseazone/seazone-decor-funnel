// Bonito Spot - Processed catalog data & utilities
import type { Typology, BSPackage, CatalogItem, DependencyRule, TypologyInfo } from "@/types/bonitoSpot";

// Typology mapping
export const TYPOLOGIES: Record<Typology, TypologyInfo> = {
  A: { hospedes: 2, apartamentos: ["101","102","103","107","108","109","110","111","112","113"] },
  B: { hospedes: 4, apartamentos: ["104","105"] },
  C: { hospedes: 4, apartamentos: ["106"] },
  D: { hospedes: 2, apartamentos: ["201","202","205","206","207","208","209","210","211","214","215","216","301","302","305","306","307","308","309","310","311","314","315","316","401","402","405","406","407","408","409"] },
  E: { hospedes: 2, apartamentos: ["203","204","303","304","403","404"] },
  F: { hospedes: 2, apartamentos: ["212","213","312","313"] },
};

export const ALL_APARTMENTS = Object.entries(TYPOLOGIES).flatMap(
  ([typ, info]) => info.apartamentos.map(apt => ({ apartment: apt, typology: typ as Typology }))
).sort((a, b) => a.apartment.localeCompare(b.apartment, undefined, { numeric: true }));

export function getTypologyForApartment(apt: string): Typology | null {
  for (const [typ, info] of Object.entries(TYPOLOGIES)) {
    if (info.apartamentos.includes(apt)) return typ as Typology;
  }
  return null;
}

// Reference totals (from catalog)
export const REFERENCE_TOTALS: Record<BSPackage, Record<Typology, number>> = {
  Essential: { A: 51698.53, B: 57825.79, C: 60165.11, D: 52428.35, E: 53627.71, F: 54373.96 },
  Plus: { A: 67397.82, B: 74923.45, C: 77588.22, D: 64957.13, E: 66723.17, F: 67570.91 },
  Premium: { A: 85287.57, B: 93214.00, C: 96042.61, D: 83589.90, E: 81217.49, F: 84079.73 },
};

// Fees
export const ADM_PERCENTUAL = 13.0;

export const DECOR_FEES: Record<BSPackage, Record<string, number>> = {
  Essential: { todas: 2500.00 },
  Plus: { todas: 3000.00 },
  Premium: { A: 2500.00, B: 4000.00, C: 4000.00, D: 4000.00, E: 3000.00, F: 4000.00 },
};

export function getDecorFee(pkg: BSPackage, typ: Typology): number {
  const fees = DECOR_FEES[pkg];
  return fees[typ] ?? fees["todas"] ?? 0;
}

// Dependency rules
export const DEPENDENCY_RULES: DependencyRule[] = [
  {
    se_excluir: "categoria:Louças E Metais",
    exclui_automaticamente: ["categoria:Instalações Hidráulicas"],
    alerta: "Ao remover Louças e Metais, a instalação hidráulica (R$ 550,00) foi removida automaticamente.",
  },
  {
    se_excluir: "categoria:Marmoraria",
    exclui_automaticamente: [
      "Cooktop | 2 Bocas",
      "Cuba inox cozinha | Lavinia | Tramontina",
      "Misturador Cozinha | Cromado",
    ],
    alerta: "Ao remover as bancadas de granito, o cooktop, a cuba e a torneira da cozinha foram removidos automaticamente.",
  },
];

// Category display order
export const CATEGORY_ORDER = [
  "Marcenaria",
  "Marmoraria", 
  "Louças E Metais",
  "Vidraçaria",
  "Iluminação",
  "Mobiliário",
  "Decoração",
  "Eletrodomésticos E Eletroportáteis",
  "Operacionais",
  "Pintura",
  "Detalhamento Do Projeto",
  "Feltro",
  "Instalações Elétricas",
  "Instalações Hidráulicas",
  "Instalações Ar-Condicionado",
  "Instalações Gerais",
  "Limpeza",
  "Impermeabilização",
  "RRT",
];

// Category icons mapping
export const CATEGORY_ICONS: Record<string, string> = {
  "Marcenaria": "🪵",
  "Marmoraria": "🪨",
  "Louças E Metais": "🚿",
  "Vidraçaria": "🪟",
  "Iluminação": "💡",
  "Mobiliário": "🛋️",
  "Decoração": "🎨",
  "Eletrodomésticos E Eletroportáteis": "🔌",
  "Operacionais": "🏨",
  "Pintura": "🎨",
  "Detalhamento Do Projeto": "📐",
  "Feltro": "🧵",
  "Instalações Elétricas": "⚡",
  "Instalações Hidráulicas": "🔧",
  "Instalações Ar-Condicionado": "❄️",
  "Instalações Gerais": "🔩",
  "Limpeza": "🧹",
  "Impermeabilização": "🛡️",
  "RRT": "📋",
};

// Package display info
export const PACKAGE_INFO: Record<BSPackage, { tagline: string; color: string }> = {
  Essential: { tagline: "Funcionalidade para locação", color: "secondary" },
  Plus: { tagline: "Equilíbrio e durabilidade", color: "coral" },
  Premium: { tagline: "Qualidade de moradia", color: "premium" },
};
