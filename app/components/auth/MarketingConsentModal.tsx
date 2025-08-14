'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useAuth } from '@/app/context/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
import { hasUserGivenMarketingConsent } from '@/app/lib/marketingConsent';
import { useMarketingConsentContext } from '@/app/context/MarketingConsentContext';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface MarketingConsentModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  autoShow?: boolean;
}

export function MarketingConsentModal({ isOpen: controlledIsOpen, onClose, autoShow = true }: MarketingConsentModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { isModalOpen, closeModal } = useMarketingConsentContext();
  
  // Always compute isOpen the same way
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : (isModalOpen || internalIsOpen);

  useEffect(() => {
    if (!autoShow) return;
    
    const checkConsent = async () => {
      if (user) {
        // Show modal if user hasn't given marketing consent yet
        const hasGivenConsent = await hasUserGivenMarketingConsent(user.uid);
        if (!hasGivenConsent) {
          setInternalIsOpen(true);
        }
      }
    };

    checkConsent();
  }, [user, autoShow]);

  // Reset consent given state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setConsentGiven(false);
    }
  }, [isOpen]);

  // Consistent close function
  const handleClose = useCallback(() => {
    if (controlledIsOpen !== undefined) {
      onClose?.();
    } else if (isModalOpen) {
      closeModal();
    } else {
      setInternalIsOpen(false);
    }
  }, [controlledIsOpen, onClose, isModalOpen, closeModal]);

  // Consistent escape key handler
  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      handleClose();
    }
  }, [handleClose, isLoading]);

  // Consistent backdrop click handler
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  }, [handleClose, isLoading]);

  const handleSavePreferences = async () => {
    if (user) {
      setIsLoading(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          marketingConsent: marketingConsent,
          consentDate: new Date().toISOString(),
          email: user.email        
        }, { merge: true });
        
        toast.success('Marketing email preferences updated successfully!');
        
        setConsentGiven(true);
        handleClose();
      } catch (error) {
        console.error('Error saving preferences:', error);
        toast.error('Failed to save preferences. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSkip = async () => {
    if (user) {
      setIsLoading(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          marketingConsent: false,
          consentDate: new Date().toISOString(),
          email: user.email        
        }, { merge: true });
        
        toast.success('Marketing email preferences updated successfully!');
        
        setConsentGiven(true);
        handleClose();
      } catch (error) {
        console.error('Error saving preferences:', error);
        toast.error('Failed to save preferences. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen || consentGiven) return null;


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    //   onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center relative">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
            One quick thing...
        </h1>
        
        <p className="text-gray-600 mb-6">
            Join the inner circle!
        </p>
        
        <div className="flex items-start space-x-3 mb-6 justify-center">
          <Checkbox
            id="marketingConsent"
            checked={marketingConsent}
            onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
            className="mt-1"
            disabled={isLoading}
          />
          <label 
            htmlFor="marketingConsent" 
            className="text-sm text-gray-700 text-left leading-relaxed"
          >
            I'm in! Send me pro "wheeling" strategies and special offers. (No fluff, no spam).
          </label>
        </div>
        
        <Button
          onClick={handleSavePreferences}
          className="w-full bg-black hover:bg-gray-800 text-white mb-4"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
        
        <button
          onClick={handleSkip}
          className="text-gray-600 hover:text-gray-800 text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : "No, I don't want discounts and tips."}
        </button>
      </div>
    </div>
  );
}
