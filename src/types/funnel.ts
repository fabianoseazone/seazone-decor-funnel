// Funnel Types for Seazone Decor Investor Journey

export type PackageType = "essential" | "plus" | "premium";

export interface Unit {
  id: string;
  spot: string;
  deliveryDate: Date;
  tipologiaCodigo: number | null;       // NEW
  empreendimentoCodigo: number | null;  // NEW
}

export interface CustomizationItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;  // NEW
  category: "infraestrutura" | "mobiliario" | "tecnologia" | "acabamento";
  selected: boolean;
}

export interface MemorialItem {
  id: string;
  item: string;
  category: string;
  specification: string;
  quantity: number;
  photoUrl: string;
  packageLink: PackageType[];
}

export interface PackageData {
  id: PackageType;
  name: string;
  tagline: string;
  price: number;
  dailyRateImpact: string;
  reviewImpact: string;
  features: string[];
}

export interface SignatoryData {
  name: string;
  company: string;
  taxId: string;
  address: string;
  email: string;
  phone: string;
}

export interface FunnelState {
  currentStep: number;
  selectedUnit: Unit | null;
  selectedPackage: PackageType | null;
  customizations: CustomizationItem[];
  signatoryData: SignatoryData;
  termsAccepted: boolean;
  contractSigned: boolean;
}

export type FunnelStep = 
  | "package"
  | "customization"
  | "gallery"
  | "specs"
  | "terms"
  | "contract";

export const FUNNEL_STEPS: { id: FunnelStep; label: string; shortLabel: string }[] = [
  { id: "package", label: "Escolha do Pacote", shortLabel: "Pacote" },
  { id: "customization", label: "Personalização", shortLabel: "Itens" },
  { id: "gallery", label: "Galeria de Renders", shortLabel: "Renders" },
  { id: "specs", label: "Memorial Descritivo", shortLabel: "Specs" },
  { id: "terms", label: "Condições Comerciais", shortLabel: "Termos" },
  { id: "contract", label: "Assinatura do Contrato", shortLabel: "Contrato" },
];
