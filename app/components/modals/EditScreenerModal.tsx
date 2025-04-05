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

interface EditScreenerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (screener: SavedScreener) => void;
  screener: SavedScreener;
}

export function EditScreenerModal({
  isOpen,
  onClose,
  onSave,
  screener
}: EditScreenerModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState(screener.name);
  const [emailNotifications, setEmailNotifications] = useState(!!screener.emailNotifications);
  const [frequency, setFrequency] = useState<EmailFrequency>(
    screener.emailNotifications?.frequency || 'daily'
  );

  // Reset state when modal opens with new screener
  useEffect(() => {
    if (isOpen) {
      setName(screener.name);
      setEmailNotifications(!!screener.emailNotifications);
      setFrequency(screener.emailNotifications?.frequency || 'daily');
    }
  }, [isOpen, screener]);

  const handleSave = () => {
    const updatedScreener: SavedScreener = {
      ...screener,
      name: name.trim(),
      updatedAt: new Date().toISOString(),
      emailNotifications: emailNotifications ? {
        enabled: true,
        email: user?.email || '',
        frequency
      } : undefined
    };

    onSave(updatedScreener);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Screener</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Screener Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for your screener"
            />
          </div>

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
              <Label>Notification Frequency</Label>
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

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 