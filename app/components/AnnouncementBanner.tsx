'use client'
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { sendAnalyticsEvent } from '../utils/analytics';

interface AnnouncementBannerProps {
  id: string; // Unique identifier for this announcement
  message: React.ReactNode;
  link?: {
    text: string;
    href: string;
  };
  dismissDuration?: number; // Duration in days before showing again
  className?: string;
  analyticsEventName?: string;
}

export function AnnouncementBanner({ 
  id,
  message,
  link,
  dismissDuration = 7,
  className = "bg-blue-600",
  analyticsEventName
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const storageKey = `announcement-${id}-dismissed`;

  useEffect(() => {
    // Check if banner was previously dismissed
    const lastDismissed = localStorage.getItem(storageKey);
    if (lastDismissed) {
      const dismissedDate = new Date(lastDismissed);
      const currentDate = new Date();
      const daysDifference = Math.floor((currentDate.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Show banner if it hasn't been dismissed in the specified duration
      if (daysDifference >= dismissDuration) {
        setIsVisible(true);
      }
    } else {
      setIsVisible(true);
    }
  }, [dismissDuration, storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, new Date().toISOString());
  };

  const handleLinkClick = () => {
    if (analyticsEventName) {
      // Send Plausible analytics event
      if (window.plausible) {
        window.plausible(analyticsEventName);
      }
      // Send Google Analytics event
      sendAnalyticsEvent({
        event_name: analyticsEventName,
        event_category: 'Conversion',
        event_label: 'API Announcement Banner'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`hidden md:block text-white px-4 py-3 relative ${className}`}>
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <span>
            {message}{' '}
            {link && (
              <a 
                href={link.href} 
                className="underline font-semibold hover:text-blue-100 transition-colors"
                onClick={handleLinkClick}
              >
                {link.text} →
              </a>
            )}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white hover:text-blue-100 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
} 