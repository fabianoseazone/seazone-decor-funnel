// Bonito Spot Catalog Types
export type Typology = "A" | "B" | "C" | "D" | "E" | "F";
export type BSPackage = "Essential" | "Plus" | "Premium";

export interface TypologyInfo {
  hospedes: number;
  apartamentos: string[];
}

export interface CatalogItem {
  id: string; // generated: category-name-typology
  nome: string;
  qtd: number;
  preco_unit: number;
  categoria: string;
  pacote: BSPackage;
  tipologia: Typology;
  depende_de?: string;
  opcao_climatizador?: boolean;
  apenas_tipologias?: Typology[];
  included: boolean; // whether currently included
}

export interface DependencyRule {
  se_excluir: string;
  exclui_automaticamente: string[];
  alerta: string;
}

export interface DecorFees {
  Essential: Record<string, number>;
  Plus: Record<string, number>;
  Premium: Record<string, number>;
}

export interface ReferenceTotals {
  Essential: Record<Typology, number>;
  Plus: Record<Typology, number>;
  Premium: Record<Typology, number>;
}

export interface BonitoSpotState {
  apartment: string | null;
  typology: Typology | null;
  selectedPackage: BSPackage | null;
  items: CatalogItem[];
  step: number; // 0=apt, 1=package, 2=customize, 3=summary
}
