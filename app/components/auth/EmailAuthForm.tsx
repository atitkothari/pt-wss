'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Eye, EyeOff } from 'lucide-react';
import { UserCredential } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { usePlausibleTracking } from '@/app/hooks/usePlausibleTracking';

interface EmailAuthFormProps {
  mode: 'signin' | 'signup' | 'reset';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
};

export const EmailAuthForm = ({ mode, onSuccess, onError }: EmailAuthFormProps) => {
  const { signInWithEmail, signUpWithEmail, resetPassword, loading: authLoading } = useAuth();
  const { trackAuthEvent } = usePlausibleTracking();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    // Prevent mailslurp.biz domain
    if (email.toLowerCase().endsWith('@mailslurp.biz') || email.toLowerCase().endsWith('@nesopf.com')) {
      return false;
    }
    return true;
  };

  const validatePassword = (password: string) => {
    return {
      minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
      hasUpperCase: PASSWORD_REQUIREMENTS.hasUpperCase.test(password),
      hasLowerCase: PASSWORD_REQUIREMENTS.hasLowerCase.test(password),
      hasNumber: PASSWORD_REQUIREMENTS.hasNumber.test(password),
      hasSpecialChar: PASSWORD_REQUIREMENTS.hasSpecialChar.test(password)
    };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordValidation(validatePassword(newPassword));
    
    // Hide password requirements if all requirements are met
    const newValidation = validatePassword(newPassword);
    if (Object.values(newValidation).every(Boolean)) {
      setShowPasswordRequirements(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!validateEmail(email)) {
        if (email.toLowerCase().endsWith('@mailslurp.biz')) {
          throw new Error('This email domain is not allowed for registration');
        }
        throw new Error('Please enter a valid email address');
      }

      if (mode === 'reset') {
        await resetPassword(email);
        trackAuthEvent('reset_password', 'email');
        onSuccess?.();
        return;
      }

      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const isPasswordValid = Object.values(passwordValidation).every(Boolean);
        if (!isPasswordValid) {
          setShowPasswordRequirements(true);
          throw new Error('Password does not meet all requirements');
        }
      }

      let authResult: UserCredential | undefined;
      
      if (mode === 'signin') {
        authResult = await signInWithEmail(email, password);
        trackAuthEvent('sign_in', 'email');
      } else if (mode === 'signup') {
        authResult = await signUpWithEmail(email, password);
        trackAuthEvent('sign_up', 'email');
        
        // Store marketing consent in Firestore
        if (authResult?.user) {
          const userRef = doc(db, 'users', authResult.user.uid);
          await setDoc(userRef, {
            marketingConsent: marketingConsent,
            consentDate: new Date().toISOString(),            
          }, { merge: true });
        }
      }

      // Only call onSuccess if we have a valid user
      if (authResult?.user) {
        setShowPasswordRequirements(false);
        onSuccess?.();
      } else {
        throw new Error(`${mode === 'signin' ? 'Sign in' : 'Sign up'} failed. Please try again.`);
      }

    } catch (err) {
      const error = err as Error;
      let errorMessage = error.message;
      
      // Enhanced Firebase error handling with mode-specific messages
      if (mode === 'reset') {
        if (errorMessage.includes('auth/user-not-found')) {
          errorMessage = 'No account found with this email address.';
        } else if (errorMessage.includes('auth/invalid-email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (errorMessage.includes('auth/network-request-failed')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = 'Failed to send reset email. Please try again.';
        }
      } else {
        if (errorMessage.includes('auth/invalid-credential')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('auth/user-not-found')) {
          errorMessage = 'No account found with this email. Please sign up or check your email.';
        } else if (errorMessage.includes('auth/wrong-password')) {
          errorMessage = 'Incorrect password. Please try again or reset your password.';
        } else if (errorMessage.includes('auth/email-already-in-use')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (errorMessage.includes('auth/too-many-requests')) {
          errorMessage = 'Too many attempts. Please try again later or reset your password.';
        } else if (errorMessage.includes('auth/user-disabled')) {
          errorMessage = 'This account has been disabled. Please contact support.';
        } else if (errorMessage.includes('auth/network-request-failed')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (errorMessage.includes('auth/operation-not-allowed')) {
          errorMessage = 'Email/password sign-in is not enabled. Please contact support.';
        } else if (errorMessage.includes('auth/weak-password')) {
          errorMessage = 'Password is too weak. Please use a stronger password.';
        } else if (errorMessage.includes('auth/invalid-email')) {
          errorMessage = 'Please enter a valid email address.';
        }
      }
      
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine loading states
  const isLoading = isSubmitting || authLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="text-sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={isLoading}
          className={`${!email || validateEmail(email) ? '' : 'border-red-500'} transition-colors`}
          autoComplete={mode === 'signin' ? 'username' : 'email'}
          required
        />
      </div>

      {mode !== 'reset' && (
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              placeholder={mode === 'signin' ? 'Enter your password' : 'Create a password'}
              disabled={isLoading}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {mode === 'signup' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={isLoading}
              className={`${confirmPassword && password !== confirmPassword ? 'border-red-500' : ''} transition-colors`}
              autoComplete="new-password"
              required
            />
          </div>

          {showPasswordRequirements && (
            <div className="rounded-lg border p-4 space-y-2 bg-gray-50">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Info className="h-4 w-4" />
                Password Requirements
              </div>
              <ul className="text-sm space-y-1.5">
                <li className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                  • At least 8 characters
                </li>
                <li className={`flex items-center gap-2 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                  • One uppercase letter
                </li>
                <li className={`flex items-center gap-2 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                  • One lowercase letter
                </li>
                <li className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                  • One number
                </li>
                <li className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                  • One special character
                </li>
              </ul>
            </div>
          )}

          <div className="flex items-start space-x-2 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="marketingConsent"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="ml-2">
              <label htmlFor="marketingConsent" className="text-sm text-gray-700">
              Yes, I'd like to get wheel strategy tips and coupon codes.
              </label>
            </div>
          </div>
        </>
      )}      

      <Button
        type="submit"
        className="w-full font-semibold"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          mode === 'signin' ? 'Sign In' :
          mode === 'signup' ? 'Sign Up' :
          'Send Reset Link'
        )}
      </Button>
    </form>
  );
}; 