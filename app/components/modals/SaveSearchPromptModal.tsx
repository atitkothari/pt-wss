'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SaveSearchPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveClick: () => void;
}

export function SaveSearchPromptModal({
  isOpen,
  onClose,
  onSaveClick,
}: SaveSearchPromptModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Your Search</DialogTitle>
          <DialogDescription>
            It looks like you&apos;ve searched multiple times. Would you like to save this search for quick access later?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button onClick={onSaveClick} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 