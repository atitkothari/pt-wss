'use client';

import { useEffect, useState } from 'react';
import clarity from '@microsoft/clarity';
import { useAuth } from '../context/AuthContext';
import { hasAcceptedAnalytics } from '@/lib/cookiePreferences';

export function ClarityAnalytics() {
  const { user } = useAuth();
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const analyticsConsent = hasAcceptedAnalytics();
    setHasConsent(analyticsConsent);

    if (analyticsConsent) {
      clarity.init("rfhrc9jayi");
      
      // Set user ID if available
      if (user?.uid) {
        clarity.identify(user.uid);
      }
    }
  }, [user]);

  return null;
} 