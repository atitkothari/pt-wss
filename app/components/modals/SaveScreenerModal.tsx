'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SavedScreener, EmailFrequency } from '@/app/types/screener';
import { useAuth } from '@/app/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface SaveScreenerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (screener: SavedScreener) => void;
  optionType: 'call' | 'put';
  filters: any; // TODO: Type this properly
}

export function SaveScreenerModal({
  isOpen,
  onClose,
  onSave,
  optionType,
  filters
}: SaveScreenerModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [frequency, setFrequency] = useState<EmailFrequency>('daily');
  const [existingScreeners, setExistingScreeners] = useState<SavedScreener[]>([]);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [selectedScreenerToOverwrite, setSelectedScreenerToOverwrite] = useState<SavedScreener | null>(null);
  const [isOverwriting, setIsOverwriting] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setEmailNotifications(false);
      setFrequency('daily');
      setSelectedScreenerToOverwrite(null);
      setIsOverwriting(false);
      setShowOverwriteWarning(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedScreeners = localStorage.getItem('savedScreeners');
    if (savedScreeners) {
      try {
        const parsedScreeners = JSON.parse(savedScreeners);
        setExistingScreeners(parsedScreeners.filter((s: SavedScreener) => s.filters.optionType === optionType));
      } catch (e) {
        console.error('Error parsing saved screeners:', e);
      }
    }
  }, [optionType]);

  const handleSave = () => {
    if (isOverwriting && selectedScreenerToOverwrite) {
      saveScreener();
      return;
    }

    if (!name.trim()) return;

    const existingScreener = existingScreeners.find(s => s.name === name.trim());
    if (existingScreener) {
      setSelectedScreenerToOverwrite(existingScreener);
      setShowOverwriteWarning(true);
      return;
    }

    saveScreener();
  };

  const saveScreener = () => {
    const newScreener: SavedScreener = {
      id: selectedScreenerToOverwrite?.id || uuidv4(),
      name: selectedScreenerToOverwrite?.name || name.trim(),
      filters: {
        ...filters,
        optionType
      },
      createdAt: selectedScreenerToOverwrite?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(emailNotifications && {
        emailNotifications: {
          enabled: true,
          email: user?.email || '',
          frequency
        }
      })
    };

    onSave(newScreener);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Screener</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Name Input - Only show when not overwriting */}
          {!isOverwriting && (
            <div className="space-y-2">
              <Label htmlFor="name">Screener Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for your screener"
              />
            </div>
          )}

          {/* Existing Screeners Dropdown */}
          {existingScreeners.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overwriteExisting"
                  checked={isOverwriting}
                  onCheckedChange={(checked) => {
                    setIsOverwriting(checked as boolean);
                    if (!checked) {
                      setName('');
                      setSelectedScreenerToOverwrite(null);
                    }
                  }}
                />
                <Label htmlFor="overwriteExisting">Overwrite Existing Screener</Label>
              </div>
              {isOverwriting && (
                <Select
                  value={selectedScreenerToOverwrite?.id || ""}
                  onValueChange={(value) => {
                    const screener = existingScreeners.find(s => s.id === value);
                    if (screener) {
                      setSelectedScreenerToOverwrite(screener);
                      setName(screener.name);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a screener to overwrite" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingScreeners.map((screener) => (
                      <SelectItem key={screener.id} value={screener.id}>
                        {screener.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="emailNotifications"
              checked={emailNotifications}
              onCheckedChange={(checked) => setEmailNotifications(checked as boolean)}
            />
            <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
          </div>
          {emailNotifications && (
            <div className="space-y-2">
              <Label htmlFor="frequency">Notification Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(value: EmailFrequency) => setFrequency(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={(!isOverwriting && !name.trim()) || (isOverwriting && !selectedScreenerToOverwrite)}
          >
            {isOverwriting ? 'Overwrite' : 'Save'}
          </Button>
        </div>

        {/* Overwrite Warning Dialog - Only show when not explicitly overwriting */}
        {!isOverwriting && (
          <Dialog open={showOverwriteWarning} onOpenChange={setShowOverwriteWarning}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Overwrite Existing Screener?</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-gray-600">
                  A screener with the name "{selectedScreenerToOverwrite?.name}" already exists. Do you want to overwrite it?
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowOverwriteWarning(false)}>
                  Cancel
                </Button>
                <Button onClick={saveScreener}>
                  Overwrite
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
} 