"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  const { signInWithGoogle } = useAuth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign in Required</DialogTitle>
          {/* <DialogDescription>
            Sign up for a 5-day free trial to access all premium features.
          </DialogDescription> */}
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Try the wheel strategy screener with all features. After your trial, continue for just $16.5/month (billed annually).
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Save your screeners</li>
              <li>Receive email alerts for new matches</li>
              <li>See all option contracts</li>
            </ul>
          </div>
          
          <Button
            onClick={() => signInWithGoogle(onClose)}
            className="w-full"
          >
            Start your free trial now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 