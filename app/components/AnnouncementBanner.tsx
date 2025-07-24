'use client'
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { sendAnalyticsEvent } from '../utils/analytics';
import { CountdownTimer } from './CountdownTimer';
import { useAuth } from '../context/AuthContext';
import { useUserAccess } from '../hooks/useUserAccess';
import { addDays } from 'date-fns';

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
  countdownDate?: Date; // Optional override for countdown date
}

export function AnnouncementBanner({ 
  id,
  message,
  link,
  dismissDuration = 7,
  className = "bg-blue-600",
  analyticsEventName,
  countdownDate
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const storageKey = `announcement-${id}-dismissed`;
  const { user } = useAuth();
  const { status, getRemainingTrialDays } = useUserAccess();

  // Calculate the actual countdown date based on trial status
  const getCountdownDate = () => {
    // if (status === 'trialing' && user?.metadata?.creationTime) {
    //   // Trial end date is 5 days from creation, so countdown to 4 days from creation
    //   const creationDate = new Date(user.metadata.creationTime);
    //   return addDays(creationDate, 4); // Trial end - 1 day
    // }
    return countdownDate; // Fall back to prop if not in trial
  };

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

  const actualCountdownDate = getCountdownDate();
  if (!actualCountdownDate) return null;

  return (
    <div className={`hidden md:block text-white px-4 py-3 relative ${className}`}>
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center flex-wrap gap-3">
          <span className="font-medium" dangerouslySetInnerHTML={{ __html: message as string }} />
          <div className="flex items-center gap-2">
            <div className="h-4 w-px bg-white/30" />
            <span className="font-medium">Offer ends in:</span>
            <CountdownTimer 
              targetDate={new Date(actualCountdownDate)}
              onComplete={handleDismiss}
            />
          </div>
          {link && (
            <>
              <div className="h-4 w-px bg-white/30" />
              <a 
                href={link.href} 
                className="font-semibold hover:text-blue-100 transition-colors"
                onClick={handleLinkClick}
              >
                {link.text} →
              </a>
            </>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-white hover:text-blue-100 transition-colors ml-4"
          aria-label="Dismiss announcement"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
} 