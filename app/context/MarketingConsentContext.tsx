'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MarketingConsentContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const MarketingConsentContext = createContext<MarketingConsentContextType>({
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

export const useMarketingConsentContext = () => useContext(MarketingConsentContext);

export function MarketingConsentProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <MarketingConsentContext.Provider value={{
      isModalOpen,
      openModal,
      closeModal,
    }}>
      {children}
    </MarketingConsentContext.Provider>
  );
}
