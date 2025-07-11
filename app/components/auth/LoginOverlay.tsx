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
        <p className="text-gray-200 max-w-md">
          Try the wheel strategy screener with all features. After your trial, continue for just $16.50/month (billed annually).
        </p>
        <Button
          onClick={() => signInWithGoogle()}
          size="lg"
          className="bg-white hover:bg-gray-100 text-gray-900 border-0"
        >
          Start your free trial now
        </Button>
      </div>
    </div>
  );
} 