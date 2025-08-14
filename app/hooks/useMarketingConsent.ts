import { useState, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { checkUserMarketingConsent, hasUserGivenMarketingConsent } from '@/app/lib/marketingConsent';

export const useMarketingConsent = () => {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  const openModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const checkConsent = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    return await checkUserMarketingConsent(user.uid);
  }, [user]);

  const hasGivenConsent = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    return await hasUserGivenMarketingConsent(user.uid);
  }, [user]);

  return {
    showModal,
    openModal,
    closeModal,
    checkConsent,
    hasGivenConsent,
  };
};
