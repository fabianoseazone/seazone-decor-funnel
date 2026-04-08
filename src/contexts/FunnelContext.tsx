import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { 
  FunnelState, 
  Unit, 
  PackageType, 
  CustomizationItem, 
  SignatoryData,
  FUNNEL_STEPS 
} from "@/types/funnel";
import { customizationItems as defaultCustomizations } from "@/data/mockData";

interface FunnelContextType extends FunnelState {
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  selectUnit: (unit: Unit) => void;
  selectPackage: (pkg: PackageType) => void;
  toggleCustomization: (id: string) => void;
  updateSignatory: (data: Partial<SignatoryData>) => void;
  setTermsAccepted: (accepted: boolean) => void;
  signContract: () => void;
  resetFunnel: () => void;
  getTotalPrice: () => number;
  getCustomizationsTotal: () => number;
  canProceed: () => boolean;
}

const defaultSignatory: SignatoryData = {
  name: "",
  company: "",
  taxId: "",
  address: "",
  email: "",
  phone: "",
};

const FunnelContext = createContext<FunnelContextType | undefined>(undefined);

export function FunnelProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [customizations, setCustomizations] = useState<CustomizationItem[]>(
    defaultCustomizations.map(item => ({ ...item, selected: false }))
  );
  const [signatoryData, setSignatoryData] = useState<SignatoryData>(defaultSignatory);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, FUNNEL_STEPS.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const selectUnit = useCallback((unit: Unit) => {
    setSelectedUnit(unit);
  }, []);

  const selectPackage = useCallback((pkg: PackageType) => {
    setSelectedPackage(pkg);
  }, []);

  const toggleCustomization = useCallback((id: string) => {
    setCustomizations(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  }, []);

  const updateSignatory = useCallback((data: Partial<SignatoryData>) => {
    setSignatoryData(prev => ({ ...prev, ...data }));
  }, []);

  const signContract = useCallback(() => {
    setContractSigned(true);
  }, []);

  const resetFunnel = useCallback(() => {
    setCurrentStep(0);
    setSelectedUnit(null);
    setSelectedPackage(null);
    setCustomizations(defaultCustomizations.map(item => ({ ...item, selected: false })));
    setSignatoryData(defaultSignatory);
    setTermsAccepted(false);
    setContractSigned(false);
  }, []);

  const getCustomizationsTotal = useCallback(() => {
    return customizations
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.price, 0);
  }, [customizations]);

  const getTotalPrice = useCallback(() => {
    const packagePrices: Record<PackageType, number> = {
      essential: 18500,
      plus: 32000,
      premium: 52000,
    };
    const basePrice = selectedPackage ? packagePrices[selectedPackage] : 0;
    return basePrice + getCustomizationsTotal();
  }, [selectedPackage, getCustomizationsTotal]);

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 0: return selectedPackage !== null;
      case 1: return true; // Customization is optional
      case 2: return true; // Gallery is informational
      case 3: return true; // Specs is informational
      case 4: return true; // Terms review
      case 5: return termsAccepted && !!signatoryData.name && !!signatoryData.taxId;
      default: return false;
    }
  }, [currentStep, selectedPackage, termsAccepted, signatoryData]);

  return (
    <FunnelContext.Provider
      value={{
        currentStep,
        selectedUnit,
        selectedPackage,
        customizations,
        signatoryData,
        termsAccepted,
        contractSigned,
        setCurrentStep,
        nextStep,
        prevStep,
        selectUnit,
        selectPackage,
        toggleCustomization,
        updateSignatory,
        setTermsAccepted,
        signContract,
        resetFunnel,
        getTotalPrice,
        getCustomizationsTotal,
        canProceed,
      }}
    >
      {children}
    </FunnelContext.Provider>
  );
}

export function useFunnel() {
  const context = useContext(FunnelContext);
  if (!context) {
    throw new Error("useFunnel must be used within a FunnelProvider");
  }
  return context;
}
