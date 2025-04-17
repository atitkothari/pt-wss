'use client';

import * as React from 'react';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { EmailAuthForm } from '../auth/EmailAuthForm';
import { LoginButton } from '../auth/LoginButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import { useUserAccess } from "@/app/hooks/useUserAccess";

// Custom DialogContent without the automatic close button
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'reset';
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = React.useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = React.useState(false);
  const { sendVerificationEmail } = useAuth();
  const { status, loading } = useUserAccess();
  
  // State to track number of retry attempts
  const [retryCount, setRetryCount] = React.useState(0);
  const maxRetries = 15; // Maximum number of retries (15 × 200ms = 3 seconds max wait)

  // Reset all state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setMode(initialMode);
      setSuccessMessage(null);
      setError(null);
      setNeedsVerification(false);
      setRetryCount(0);
    }
  }, [isOpen, initialMode]);

  const handleSuccess = () => {
    if (mode === 'reset') {
      setSuccessMessage('Password reset email sent! Please check your inbox.');
      setError(null);
      setTimeout(() => {
        onClose();
      }, 3000);
    } else if (mode === 'signup') {
      setSuccessMessage('Account created! Please check your email to verify your account.');
      setError(null);
      setNeedsVerification(true);
    } else {
      // On successful sign in
      setSuccessMessage('Successfully signed in! Redirecting...');
      setError(null);
      
      // For new sign-ins, we want to send them to pricing if they don't have a subscription
      const checkStatusAndRedirect = () => {
        console.log(`Checking status (attempt ${retryCount + 1}): Current status = ${status}, Loading = ${loading}`);
        
        // If we're no longer loading, we can proceed
        if (!loading) {
          console.log('Final status check:', status);
          onClose();
          
          // For a new user or a user that needs subscription, go to pricing
          if (status === 'needs_subscription') {
            window.location.href = '/pricing';
            return;
          }
          
          // For users with active pro or trial subscriptions
          window.location.href = '/covered-call-screener';
          return;
        }
        
        // If we've exceeded max retries, assume they need to go to pricing
        if (retryCount >= maxRetries) {
          console.log('Max retries reached. Redirecting to pricing.');
          onClose();
          window.location.href = '/pricing';
          return;
        }
        
        // Increment retry count and try again with backoff
        setRetryCount(prev => prev + 1);
        const delay = Math.min(200 * Math.pow(1.1, retryCount), 500); // Capped at 500ms
        setTimeout(checkStatusAndRedirect, delay);
      };
      
      // Start checking after a short delay
      setTimeout(checkStatusAndRedirect, 500);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccessMessage(null);
    
    if (errorMessage.includes('No account found')) {
      setMode('signup');
    } else if (errorMessage.includes('Incorrect password')) {
      setMode('reset');
    } else if (errorMessage.includes('verify your email')) {
      setNeedsVerification(true);
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
      setSuccessMessage('Verification email sent! Please check your inbox.');
      setError(null);
    } catch (error) {
      setError('Failed to send verification email. Please try again.');
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin':
        return 'Welcome Back';
      case 'signup':
        return 'Create Your Account';
      case 'reset':
        return 'Reset Your Password';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin':
        return 'Sign in to access your account and saved screeners.';
      case 'signup':
        return 'Create a new account to save your screeners and set up alerts.';
      case 'reset':
        return 'Enter your email address to receive a password reset link.';
    }
  };

  const handleModeChange = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode);
    setSuccessMessage(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <DialogTitle className="text-2xl font-semibold">{getTitle()}</DialogTitle>
            <DialogDescription className="mt-1.5">{getDescription()}</DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {successMessage && (
            <Alert className="text-sm bg-green-50 text-green-700 border-green-200">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {needsVerification ? (
            <div className="space-y-4">
              <Alert className="text-sm bg-blue-50 text-blue-700 border-blue-200">
                <AlertDescription>
                  Please verify your email address to continue. Check your inbox for the verification link.
                </AlertDescription>
              </Alert>
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={handleResendVerification}
                  className="text-sm"
                >
                  Resend verification email
                </Button>
              </div>
            </div>
          ) : (
            <>
              {mode === 'signin' && (
                <div className="space-y-4">
                  <LoginButton onClose={onClose} />
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <EmailAuthForm 
                mode={mode} 
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </>
          )}

          <div className="text-center text-sm space-y-2">
            {!needsVerification && (
              <>
                {mode === 'signin' && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Don't have an account? </span>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-semibold"
                        onClick={() => handleModeChange('signup')}
                      >
                        Sign up
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-gray-500 hover:text-gray-700"
                        onClick={() => handleModeChange('reset')}
                      >
                        Forgot password?
                      </Button>
                    </div>
                  </>
                )}
                {mode === 'signup' && (
                  <div>
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold"
                      onClick={() => handleModeChange('signin')}
                    >
                      Sign in
                    </Button>
                  </div>
                )}
                {mode === 'reset' && (
                  <div>
                    <span className="text-muted-foreground">Remember your password? </span>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold"
                      onClick={() => handleModeChange('signin')}
                    >
                      Sign in
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 