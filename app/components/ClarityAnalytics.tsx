'use client';

import { useEffect } from 'react';
import clarity from '@microsoft/clarity';
import { useAuth } from '../context/AuthContext';

export function ClarityAnalytics() {
  const { user } = useAuth();

  useEffect(() => {
    clarity.init("rfhrc9jayi");
    
    // Set user ID if available
    if (user?.uid) {
      clarity.identify(user.uid);
    }
  }, [user]);

  return null;
} 