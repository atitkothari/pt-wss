'use client';

import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";

interface LoginOverlayProps {
  hasSearched?: boolean;
}

export const LoginOverlay = ({ hasSearched = false }: LoginOverlayProps) => {
  const { signInWithGoogle } = useAuth();

  if (!hasSearched) return null;

  return (
    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-transparent pointer-events-none">
      <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4 p-8 text-center pointer-events-auto">
        <h2 className="text-2xl font-bold text-white">
          Sign in to see all results
        </h2>
        <p className="text-gray-200 max-w-md">
          Get full access to all options data and screening capabilities by signing in with your Google account.
        </p>
        <Button
          onClick={() => signInWithGoogle()}
          size="lg"
          className="bg-white hover:bg-gray-100 text-gray-900 border-0"
        >
          Sign in with Google to unlock full access for FREE
        </Button>
      </div>
    </div>
  );
} 