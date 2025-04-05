'use client';

import { useState } from 'react';
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

  const handleSave = () => {
    if (!name.trim()) return;

    const newScreener: SavedScreener = {
      id: uuidv4(),
      name: name.trim(),
      optionType,
      filters,
      createdAt: new Date().toISOString(),
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
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 