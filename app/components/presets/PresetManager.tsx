'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Preset, predefinedPresets } from '@/app/config/filterConfig';
import { Save, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface PresetManagerProps {
  optionType: 'call' | 'put';
  currentFilters: any;
  onPresetSelect: (preset: Preset) => void;
}

export function PresetManager({ optionType, currentFilters, onPresetSelect }: PresetManagerProps) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(true);

  useEffect(() => {
    // Load saved presets from localStorage
    const savedPresets = localStorage.getItem(`${optionType}_presets`);
    if (savedPresets) {
      setPresets(JSON.parse(savedPresets));
    }
  }, [optionType]);

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast.error('Please enter a name for your preset');
      return;
    }

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      emailEnabled,
      filters: currentFilters
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem(`${optionType}_presets`, JSON.stringify(updatedPresets));
    setShowSaveModal(false);
    setNewPresetName('');
    toast.success('Preset saved successfully!');
  };

  const handleDeletePreset = (presetId: string) => {
    const updatedPresets = presets.filter(p => p.id !== presetId);
    setPresets(updatedPresets);
    localStorage.setItem(`${optionType}_presets`, JSON.stringify(updatedPresets));
    toast.success('Preset deleted successfully!');
  };

  const handleEditPreset = (preset: Preset) => {
    setNewPresetName(preset.name);
    setEmailEnabled(preset.emailEnabled);
    setShowSaveModal(true);
    handleDeletePreset(preset.id);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Select onValueChange={(value) => {
          const selectedPreset = [...presets, ...predefinedPresets].find(p => p.id === value);
          if (selectedPreset) {
            onPresetSelect(selectedPreset);
          }
        }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a preset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="predefined-header" disabled>Predefined Presets</SelectItem>
            {predefinedPresets.map(preset => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
              </SelectItem>
            ))}
            {presets.length > 0 && (
              <>
                <SelectItem value="custom-header" disabled>Custom Presets</SelectItem>
                {presets.map(preset => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSaveModal(true)}
          className="bg-orange-600 text-white hover:text-black"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Preset
        </Button>
      </div>

      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map(preset => (
            <div
              key={preset.id}
              className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md"
            >
              <span className="text-sm">{preset.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditPreset(preset)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeletePreset(preset.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="presetName">Preset Name</Label>
              <Input
                id="presetName"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Enter preset name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailEnabled"
                checked={emailEnabled}
                onCheckedChange={(checked) => setEmailEnabled(checked as boolean)}
              />
              <Label htmlFor="emailEnabled">Enable email alerts</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 