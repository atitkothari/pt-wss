'use client';

import { useState } from 'react';
import CookieConsent from 'react-cookie-consent';
import { Button } from '@/components/ui/button';



export function CookieConsentBanner() {
  const [showDetails, setShowDetails] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  // Show banner for all users
  if (!showBanner) return null;

  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept All"
      cookieName="cookie-consent"
      style={{
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(8px)',
        padding: '0.5rem 0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        flexWrap: 'wrap',
        minHeight: 'auto',
        fontSize: '0.8125rem',
      }}
      buttonStyle={{
        background: 'hsl(var(--primary))',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.375rem',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.8125rem',
        minWidth: '90px',
      }}
      expires={150}
      enableDeclineButton
      declineButtonText="Necessary Only"
      declineButtonStyle={{
        background: 'transparent',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.375rem',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        cursor: 'pointer',
        fontSize: '0.8125rem',
        minWidth: '90px',
      }}
      onAccept={() => {
        // Accept all cookies
        localStorage.setItem('cookie-preferences', JSON.stringify({
          necessary: true,
          analytics: true,
          timestamp: new Date().toISOString()
        }));
      }}
      onDecline={() => {
        // Accept only necessary cookies
        localStorage.setItem('cookie-preferences', JSON.stringify({
          necessary: true,
          analytics: false,
          timestamp: new Date().toISOString()
        }));
      }}
    >
      <div className="flex flex-col gap-1 w-full md:w-auto">
        <span style={{ color: 'white', fontSize: '0.8125rem' }}>
          We use cookies to enhance your experience. 
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              color: 'white',
              marginLeft: '0.375rem',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontSize: '0.8125rem',
            }}
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>
        </span>
        
        {showDetails && (
          <div className="text-xs text-gray-300 mt-1">
            <p className="mb-1">We use the following types of cookies:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Necessary cookies (required for site functionality)</li>
              <li>Analytics cookies (Google Analytics, Plausible, Microsoft Clarity)</li>              
            </ul>
            <a
              href="/privacy-policy"
              style={{
                color: 'hsl(var(--primary))',
                marginTop: '0.375rem',
                display: 'inline-block',
                textDecoration: 'underline',
                fontSize: '0.8125rem',
              }}
            >
              View our privacy policy
            </a>
          </div>
        )}
      </div>
    </CookieConsent>
  );
} 