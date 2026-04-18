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
import type { Tipologia, ProdutoTipologia } from '@/types/catalog';

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
  tipologiaSelecionada: Tipologia | null;
  setTipologiaSelecionada: (t: Tipologia | null) => void;
  getCustomizationsTotal: () => number;
  canProceed: () => boolean;
  removidos: Set<number>;
  toggleRemovido: (produtoCodigo: number) => void;
  adicionados: Set<number>;
  toggleAdicionado: (produtoCodigo: number) => void;
  swaps: Map<number, ProdutoTipologia>;
  setSwap: (originalCodigo: number, newItem: ProdutoTipologia) => void;
  clearSwap: (originalCodigo: number) => void;
  subtotalProdutos: number;
  setSubtotalProdutos: (n: number) => void;
  ownerName: string;
  ownerCpf: string;
  setOwnerInfo: (name: string, cpf: string) => void;
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
  const [tipologiaSelecionada, setTipologiaSelecionada] = useState<Tipologia | null>(null);
  const [removidos, setRemovidos] = useState<Set<number>>(new Set());
  const [adicionados, setAdicionados] = useState<Set<number>>(new Set());
  const [swaps, setSwapsState] = useState<Map<number, ProdutoTipologia>>(new Map());
  const [subtotalProdutos, setSubtotalProdutos] = useState(0);
  const [ownerName, setOwnerNameState] = useState("");
  const [ownerCpf, setOwnerCpfState] = useState("");

  const setSwap = useCallback((originalCodigo: number, newItem: ProdutoTipologia) => {
    setSwapsState(prev => new Map(prev).set(originalCodigo, newItem));
  }, []);

  const clearSwap = useCallback((originalCodigo: number) => {
    setSwapsState(prev => { const n = new Map(prev); n.delete(originalCodigo); return n; });
  }, []);

  const toggleRemovido = useCallback((produtoCodigo: number) => {
    setRemovidos(prev => {
      const next = new Set(prev);
      next.has(produtoCodigo) ? next.delete(produtoCodigo) : next.add(produtoCodigo);
      return next;
    });
  }, []);

  const toggleAdicionado = useCallback((produtoCodigo: number) => {
    setAdicionados(prev => {
      const next = new Set(prev);
      next.has(produtoCodigo) ? next.delete(produtoCodigo) : next.add(produtoCodigo);
      return next;
    });
  }, []);

  const setOwnerInfo = useCallback((name: string, cpf: string) => {
    setOwnerNameState(name);
    setOwnerCpfState(cpf);
  }, []);

  const setTipologiaSelecionadaAndReset = useCallback((t: Tipologia | null) => {
    setTipologiaSelecionada(t);
    setRemovidos(new Set());
    setAdicionados(new Set());
    setSwapsState(new Map());
    setSubtotalProdutos(0);
  }, []);

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
    setTipologiaSelecionada(null);
    setRemovidos(new Set());
    setAdicionados(new Set());
    setSwapsState(new Map());
    setSubtotalProdutos(0);
    setOwnerNameState("");
    setOwnerCpfState("");
  }, []);

  const getCustomizationsTotal = useCallback(() => {
    return customizations
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.price, 0);
  }, [customizations]);

  const getTotalPrice = useCallback(() => {
    const decorValor = tipologiaSelecionada?.decor_valor ?? 0;
    const admPercent = (tipologiaSelecionada?.adm_percent ?? 0) / 100;
    return subtotalProdutos + decorValor + admPercent * subtotalProdutos;
  }, [subtotalProdutos, tipologiaSelecionada]);

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 0: return selectedPackage !== null;
      case 1: return true; // Customization is optional
      case 2: return true; // Specs is informational
      case 3: return true; // Terms review
      case 4: return termsAccepted && !!signatoryData.name && !!signatoryData.taxId;
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
        tipologiaSelecionada,
        setTipologiaSelecionada: setTipologiaSelecionadaAndReset,
        removidos,
        toggleRemovido,
        adicionados,
        toggleAdicionado,
        swaps,
        setSwap,
        clearSwap,
        subtotalProdutos,
        setSubtotalProdutos,
        ownerName,
        ownerCpf,
        setOwnerInfo,
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
