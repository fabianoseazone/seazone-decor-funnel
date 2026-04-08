import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import type { Typology, BSPackage, BonitoSpotState } from "@/types/bonitoSpot";
import {
  getTypologyForApartment,
  REFERENCE_TOTALS,
  getDecorFee,
  ADM_PERCENTUAL,
  TYPOLOGIES,
  DEPENDENCY_RULES,
} from "@/data/bonitoSpotCatalog";

interface BonitoSpotContextType {
  state: BonitoSpotState;
  selectApartment: (apt: string) => void;
  selectPackage: (pkg: BSPackage) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  getReferenceTotal: () => number;
  getDecorFeeAmount: () => number;
  getAdmFee: () => number;
  getGrandTotal: () => number;
  getGuestCount: () => number;
  reset: () => void;
}

const BonitoSpotContext = createContext<BonitoSpotContextType | undefined>(undefined);

const initialState: BonitoSpotState = {
  apartment: null,
  typology: null,
  selectedPackage: null,
  items: [],
  step: 0,
};

export function BonitoSpotProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BonitoSpotState>(initialState);

  const selectApartment = useCallback((apt: string) => {
    const typology = getTypologyForApartment(apt);
    setState(prev => ({ ...prev, apartment: apt, typology }));
  }, []);

  const selectPackage = useCallback((pkg: BSPackage) => {
    setState(prev => ({ ...prev, selectedPackage: pkg }));
  }, []);

  const setStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.min(prev.step + 1, 3) }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.max(prev.step - 1, 0) }));
  }, []);

  const getReferenceTotal = useCallback(() => {
    if (!state.selectedPackage || !state.typology) return 0;
    return REFERENCE_TOTALS[state.selectedPackage][state.typology];
  }, [state.selectedPackage, state.typology]);

  const getDecorFeeAmount = useCallback(() => {
    if (!state.selectedPackage || !state.typology) return 0;
    return getDecorFee(state.selectedPackage, state.typology);
  }, [state.selectedPackage, state.typology]);

  const getAdmFee = useCallback(() => {
    const total = getReferenceTotal();
    const decor = getDecorFeeAmount();
    // ADM is 13% of (products total - excluding decor)
    // total = products + decor + adm, so products = total / (1 + 0.13) - decor
    // Actually from the catalog: total = valor_produtos + taxa_decor + taxa_adm
    // taxa_adm = valor_produtos * 0.13
    // So total = valor_produtos * 1.13 + taxa_decor
    // Therefore valor_produtos = (total - taxa_decor) / 1.13
    // And taxa_adm = valor_produtos * 0.13
    const valorProdutos = (total - decor) / 1.13;
    return valorProdutos * 0.13;
  }, [getReferenceTotal, getDecorFeeAmount]);

  const getGrandTotal = useCallback(() => {
    return getReferenceTotal();
  }, [getReferenceTotal]);

  const getGuestCount = useCallback(() => {
    if (!state.typology) return 0;
    return TYPOLOGIES[state.typology].hospedes;
  }, [state.typology]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <BonitoSpotContext.Provider
      value={{
        state,
        selectApartment,
        selectPackage,
        setStep,
        nextStep,
        prevStep,
        getReferenceTotal,
        getDecorFeeAmount,
        getAdmFee,
        getGrandTotal,
        getGuestCount,
        reset,
      }}
    >
      {children}
    </BonitoSpotContext.Provider>
  );
}

export function useBonitoSpot() {
  const context = useContext(BonitoSpotContext);
  if (!context) {
    throw new Error("useBonitoSpot must be used within a BonitoSpotProvider");
  }
  return context;
}
