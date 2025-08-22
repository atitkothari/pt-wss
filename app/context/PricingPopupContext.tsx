'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePricingPopup } from '../hooks/usePricingPopup';

interface PricingPopupContextType {
  isOpen: boolean;
  triggerSource: 'pricing-page' | 'blurred-table';
  openPopup: (source?: 'pricing-page' | 'blurred-table') => void;
  closePopup: () => void;
  canShowPopup: boolean;
  canShowPopupNow: () => boolean;
}

const PricingPopupContext = createContext<PricingPopupContextType | undefined>(undefined);

export const usePricingPopupContext = () => {
  const context = useContext(PricingPopupContext);
  if (context === undefined) {
    throw new Error('usePricingPopupContext must be used within a PricingPopupProvider');
  }
  return context;
};

interface PricingPopupProviderProps {
  children: ReactNode;
}

export const PricingPopupProvider: React.FC<PricingPopupProviderProps> = ({ children }) => {
  const pricingPopup = usePricingPopup();

  return (
    <PricingPopupContext.Provider value={pricingPopup}>
      {children}
    </PricingPopupContext.Provider>
  );
};
