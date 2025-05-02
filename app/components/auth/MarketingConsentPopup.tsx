'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useAuth } from '@/app/context/AuthContext';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function MarketingConsentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  // Check if we're on a page that needs the offset
  const needsOffset = pathname === '/options' || pathname === '/covered-call-screener' || pathname === '/cash-secured-put-screener';

  useEffect(() => {
    const checkConsent = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        // Show popup if:
        // 1. User document doesn't exist yet, or
        // 2. User document exists but doesn't have marketingConsent field
        if (!userDoc.exists() || userDoc.data().marketingConsent === undefined) {
          setIsOpen(true);
        }
      }
    };

    checkConsent();
  }, [user]);

  const handleConsent = async (consent: boolean) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        marketingConsent: consent,
        consentDate: new Date().toISOString(),
        email: user.email        
      }, { merge: true });
      setConsentGiven(true);
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed ${needsOffset ? 'bottom-20 md:bottom-0' : 'bottom-0'} left-0 right-0 bg-white border-t border-gray-200 shadow-[0_8px_24px_rgba(0,0,0,0.15)] p-4 z-40`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              Yes, I’d like to get early access to new features, product updates, wheel strategy tips and exclusive offers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleConsent(false)}
              >
                No, thanks
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleConsent(true)}
              >
                I'm interested
              </Button>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 text-gray-400 hover:text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 