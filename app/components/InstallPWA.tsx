'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Extend the Window interface to include deferredPrompt
declare global {
  interface Window {
    deferredPrompt?: any;
  }
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    console.log('Is app already installed (standalone mode)?', isStandalone);
    
    // Check if browser supports PWA installation
    const isPWAInstallable = 'beforeinstallprompt' in window;
    console.log('Does browser support PWA installation?', isPWAInstallable);
    
    if (isStandalone) {
      return;
    }

    const handler = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    console.log('Added beforeinstallprompt event listener');

    // Check if the prompt was already fired
    if (window.deferredPrompt) {
      console.log('Found existing deferredPrompt');
      setDeferredPrompt(window.deferredPrompt);
      setShowInstallPrompt(true);
    }

    // Log if we're in a secure context (required for PWA)
    console.log('Is secure context?', window.isSecureContext);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      // Clear the deferredPrompt variable
      setDeferredPrompt(null);
      // Hide the install prompt
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-lg p-3 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Install Wheel Strategy Options App</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Install our app for a better experience
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleInstallClick}>
            Install
          </Button>
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
} 