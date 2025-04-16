'use client';

import { useEffect, useState } from 'react';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get parameters from URL fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const mode = hashParams.get('mode');
        const oobCode = hashParams.get('oobCode');

        console.log('Verification params:', { mode, oobCode }); // Debug log

        if (!oobCode || mode !== 'verifyEmail') {
          console.log('Invalid params:', { mode, oobCode }); // Debug log
          setStatus('error');
          setError('Invalid verification link. Please request a new verification email.');
          return;
        }

        // Apply the verification code
        await applyActionCode(auth, oobCode);
        console.log('Email verified successfully'); // Debug log
        setStatus('success');
      } catch (error) {
        console.error('Verification error:', error); // Debug log
        setStatus('error');
        setError(error instanceof Error ? error.message : 'Failed to verify email. Please try again.');
      }
    };

    verifyEmail();
  }, []);

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
              Your email has been verified successfully! You will be redirected automatically...
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