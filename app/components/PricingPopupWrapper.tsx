'use client';

import { usePricingPopupContext } from '../context/PricingPopupContext';
import { PricingPopup } from './modals/PricingPopup';

export const PricingPopupWrapper = () => {
  const { isOpen, triggerSource, closePopup, canShowPopup } = usePricingPopupContext();

  // Only render the popup if the user can see it
  if (!canShowPopup) {
    return null;
  }

  return (
    <PricingPopup
      isOpen={isOpen}
      onClose={closePopup}
      triggerSource={triggerSource}
    />
  );
};
