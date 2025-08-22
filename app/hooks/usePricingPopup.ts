import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserAccess } from '../hooks/useUserAccess';

const POPUP_COOLDOWN_HOURS = 12;
const POPUP_COOLDOWN_MS = POPUP_COOLDOWN_HOURS * 60 * 60 * 1000;

export const usePricingPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerSource, setTriggerSource] = useState<'pricing-page' | 'blurred-table'>('pricing-page');
  const { user } = useAuth();
  const { status } = useUserAccess();

  // Only show popup for signed-in users who are not premium
  const canShowPopup = user && status !== 'active' && status !== 'paused';

  // Check if enough time has passed since last popup
  const canShowPopupNow = useCallback(() => {
    if (!canShowPopup) return false;
    
    const lastPopupTime = localStorage.getItem('pricingPopupLastShown');
    if (!lastPopupTime) return true;
    
    const timeSinceLastPopup = Date.now() - parseInt(lastPopupTime, 10);
    return timeSinceLastPopup >= POPUP_COOLDOWN_MS;
  }, [canShowPopup]);

  const openPopup = useCallback((source: 'pricing-page' | 'blurred-table' = 'pricing-page') => {
    if (canShowPopupNow()) {
      setTriggerSource(source);
      setIsOpen(true);
      // Store the timestamp when popup was shown
      localStorage.setItem('pricingPopupLastShown', Date.now().toString());
    }
  }, [canShowPopupNow]);

  const closePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    triggerSource,
    openPopup,
    closePopup,
    canShowPopup,
    canShowPopupNow,
  };
};
