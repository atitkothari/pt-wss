'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { SavedScreener } from '@/app/types/screener';
import { defaultScreeners } from '@/app/config/defaultScreeners';

interface LoadScreenerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (screener: SavedScreener) => void;
  optionType: 'call' | 'put';
}

export function LoadScreenerModal({
  isOpen,
  onClose,
  onLoad,
  optionType
}: LoadScreenerModalProps) {
  const [screeners, setScreeners] = useState<SavedScreener[]>(defaultScreeners);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedScreeners = localStorage.getItem('savedScreeners');
    if (savedScreeners) {
      try {
        const parsedScreeners = JSON.parse(savedScreeners);
        setScreeners([...defaultScreeners, ...parsedScreeners]);
      } catch (e) {
        console.error('Error parsing saved screeners:', e);
      }
    }
  }, []);

  const filteredScreeners = screeners.filter(screener => screener.optionType === optionType);

  const handleLoad = (screener: SavedScreener) => {
    onLoad(screener);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Load Screener</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {filteredScreeners.map((screener) => (
            <div
              key={screener.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => handleLoad(screener)}
            >
              <div className="flex items-center gap-2">
                {screener.isDefault && <Star className="h-4 w-4 text-yellow-500" />}
                <span className="font-medium">{screener.name}</span>
              </div>
              <div className="text-sm text-gray-500">
                {screener.isDefault ? 'Default' : 'Custom'}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 