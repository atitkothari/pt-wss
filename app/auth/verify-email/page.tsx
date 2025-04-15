'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/app/config/firebase';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    const redirect = searchParams.get('redirect') || '/covered-call-screener';
    
    if (!oobCode) {
      setStatus('error');
      setError('Invalid verification link. Please request a new verification email.');
      return;
    }

    const verifyEmail = async () => {
      try {
        await applyActionCode(auth, oobCode);
        setStatus('success');
        // Automatically redirect after successful verification
        setTimeout(() => {
          router.push(redirect);
        }, 2000); // Short delay to show success message
      } catch (error) {
        setStatus('error');
        setError(error instanceof Error ? error.message : 'Failed to verify email. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        {status === 'loading' && (
          <Alert className="bg-blue-50 text-blue-700 border-blue-200">
            <AlertDescription>Verifying your email address...</AlertDescription>
          </Alert>
        )}

        {status === 'success' && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <AlertDescription>
              Your email has been verified successfully! Redirecting you to the home page...
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
} 