'use client';

import { useState } from 'react';
import CookieConsent from 'react-cookie-consent';
import { Button } from '@/components/ui/button';

// Add custom CSS for mobile responsiveness
const mobileStyles = `
  .CookieConsent {
    height: auto !important;
  }

  @media (max-width: 768px) {
    .CookieConsent {
      padding: 0.375rem 0.75rem !important;
      gap: 0.5rem !important;
      font-size: 0.75rem !important;
      min-height: auto !important;
    }
    .CookieConsent button {
      padding: 0.25rem 0.75rem !important;
      font-size: 0.75rem !important;
      min-width: 50px !important;
      height: auto !important;
    }
    .CookieConsent .cookie-text {
      font-size: 0.75rem !important;
      line-height: 1.2 !important;
    }
    .CookieConsent .cookie-details {
      font-size: 0.6875rem !important;
      line-height: 1.2 !important;
    }
  }
  @media (max-width: 480px) {
    .CookieConsent {
      padding: 0.25rem 0.5rem !important;
      gap: 0.375rem !important;
      font-size: 0.6875rem !important;
      min-height: auto !important;
      height: auto !important;
    }
    .CookieConsent button {
      padding: 0.125rem 0.5rem !important;
      font-size: 0.6875rem !important;
      min-width: 70px !important;
      height: auto !important;
    }
    .CookieConsent .cookie-text {
      font-size: 0.6875rem !important;
      line-height: 1.1 !important;
    }
    .CookieConsent .cookie-details {
      font-size: 0.625rem !important;
      line-height: 1.1 !important;
    }
  }
`;

export function CookieConsentBanner() {
  const [showDetails, setShowDetails] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showCustomizePopup, setShowCustomizePopup] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  // Show banner for all users
  if (!showBanner) return null;

  return (
    <>
      <style>{mobileStyles}</style>
      <CookieConsent
      location="bottom"
      buttonText="Accept All"
      cookieName="cookie-consent"
      style={{
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(8px)',
        padding: '0.25rem 0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        flexWrap: 'wrap',
        minHeight: 'auto',
        fontSize: '0.875rem',
      }}
      buttonStyle={{
        background: 'hsl(var(--primary))',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        border: '2px solid hsl(var(--primary))',
        cursor: 'pointer',
        fontSize: '0.875rem',
        minWidth: '100px',
      }}
      expires={150}
      enableDeclineButton
      declineButtonText="Customize"
      declineButtonStyle={{
        background: 'transparent',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.875rem',
        minWidth: '100px',
      }}
      onAccept={() => {
        // Accept all cookies
        localStorage.setItem('cookie-preferences', JSON.stringify({
          necessary: true,
          analytics: true,
          timestamp: new Date().toISOString()
        }));
        setShowBanner(false);
      }}
      onDecline={() => {
        // Show customize popup
        setShowCustomizePopup(true);
      }}
    >
      <div className="flex flex-col gap-1 w-full md:w-auto">
        <span className="cookie-text text-white text-sm md:text-sm text-xs">
          We use cookies to enhance your experience. 
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ml-2 underline bg-none border-none cursor-pointer p-0 text-sm md:text-sm text-xs cookie-text"
            style={{
              color: 'white',
              marginLeft: '0.375rem',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>
        </span>
        
        {showDetails && (
          <div className="cookie-details text-xs text-gray-300 mt-1 md:text-xs text-[10px]">
            <p className="mb-1">We use the following types of cookies:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Necessary cookies (required for site functionality)</li>
              <li>Analytics cookies (Google Analytics, Plausible, Microsoft Clarity)</li>              
            </ul>
            <a
              href="/privacy-policy"
              className="cookie-details text-primary underline mt-2 inline-block text-xs md:text-xs text-[10px]"
              style={{
                color: 'hsl(var(--primary))',
                marginTop: '0.375rem',
                display: 'inline-block',
                textDecoration: 'underline',
              }}
            >
              View our privacy policy
            </a>
          </div>
        )}
      </div>
    </CookieConsent>

    {/* Customize Cookie Preferences Popup */}
    {showCustomizePopup && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cookie Preferences</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Necessary Cookies</h3>
                <p className="text-sm text-gray-600">Required for the website to function properly</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Analytics Cookies</h3>
                <p className="text-sm text-gray-600">Help us understand how visitors use our website</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Accept all cookies
                localStorage.setItem('cookie-preferences', JSON.stringify({
                  necessary: true,
                  analytics: true,
                  timestamp: new Date().toISOString()
                }));
                setShowCustomizePopup(false);
                setShowBanner(false);
              }}
              className="flex-1 bg-blue-600 border-2 text-white py-2 px-4 rounded-md font-medium"
            >
              Accept All
            </button>
            
            <button
              onClick={() => {
                // Save custom preferences
                localStorage.setItem('cookie-preferences', JSON.stringify({
                  necessary: true,
                  analytics: analyticsEnabled,
                  timestamp: new Date().toISOString()
                }));
                setShowCustomizePopup(false);
                setShowBanner(false);
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}