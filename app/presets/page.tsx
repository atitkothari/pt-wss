'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Preset, predefinedPresets } from '@/app/config/filterConfig';
import { Save, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  yieldFilterConfig,
  priceFilterConfig,
  volumeFilterConfig,
  deltaFilterConfig,
  peRatioFilterConfig,
  marketCapFilterConfig,
  movingAverageCrossoverOptions,
  sectorOptions,
  impliedVolatilityFilterConfig,
  moneynessFilterConfig,
  dteFilterConfig
} from '@/app/config/filterConfig';

export default function PresetsPage() {
  const router = useRouter();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    // Load saved presets from localStorage for both call and put
    const callPresets = localStorage.getItem('call_presets');
    const putPresets = localStorage.getItem('put_presets');
    
    const allPresets = [
      ...(callPresets ? JSON.parse(callPresets).map((p: Preset) => ({ ...p, optionType: 'call' })) : []),
      ...(putPresets ? JSON.parse(putPresets).map((p: Preset) => ({ ...p, optionType: 'put' })) : [])
    ];
    
    setPresets(allPresets);
  }, []);

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      emailEnabled,
      optionType: 'call',
      filters: {
        yieldRange: [yieldFilterConfig.min, yieldFilterConfig.max],
        priceRange: [priceFilterConfig.defaultMin, priceFilterConfig.defaultMax],
        volumeRange: [volumeFilterConfig.min, volumeFilterConfig.max],
        deltaFilter: [deltaFilterConfig.defaultMin, deltaFilterConfig.defaultMax],
        peRatio: [peRatioFilterConfig.defaultMin, peRatioFilterConfig.defaultMax],
        marketCap: [marketCapFilterConfig.defaultMin, marketCapFilterConfig.defaultMax],
        movingAverageCrossover: movingAverageCrossoverOptions[0],
        sector: sectorOptions[0],
        impliedVolatility: [impliedVolatilityFilterConfig.defaultMin, impliedVolatilityFilterConfig.defaultMax],
        moneynessRange: [moneynessFilterConfig.defaultMin, moneynessFilterConfig.defaultMax],
        minDte: dteFilterConfig.defaultMin,
        maxDte: dteFilterConfig.defaultMax,
        strikeFilter: 'ALL'
      }
    };
    
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('presets', JSON.stringify(updatedPresets));
    setShowSaveModal(false);
    setNewPresetName('');
  };

  const handleDeletePreset = (presetId: string) => {
    const updatedPresets = presets.filter(p => p.id !== presetId);
    setPresets(updatedPresets);
    
    // Update localStorage
    const callPresets = updatedPresets.filter(p => p.optionType === 'call');
    const putPresets = updatedPresets.filter(p => p.optionType === 'put');
    localStorage.setItem('call_presets', JSON.stringify(callPresets));
    localStorage.setItem('put_presets', JSON.stringify(putPresets));
    
    toast.success('Preset deleted successfully!');
  };

  const handleEditPreset = (preset: Preset) => {
    setEditingPreset(preset);
    setNewPresetName(preset.name);
    setEmailEnabled(preset.emailEnabled);
    setShowSaveModal(true);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Manage Presets</h1>
      </div>

      <div className="grid gap-6">
        {/* Predefined Presets */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Predefined Presets</h2>
          <div className="grid gap-4">
            {predefinedPresets.map(preset => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{preset.name}</h3>
                  <p className="text-sm text-gray-500">System preset</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Presets */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Custom Presets</h2>
          <div className="grid gap-4">
            {presets.map(preset => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-4 bg-white border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{preset.name}</h3>
                  <p className="text-sm text-gray-500">
                    {preset.optionType === 'call' ? 'Covered Call' : 'Cash Secured Put'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPreset(preset)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePreset(preset.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save/Edit Modal */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPreset ? 'Edit Preset' : 'Save Preset'}</DialogTitle>
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
            <Button variant="outline" onClick={() => {
              setShowSaveModal(false);
              setEditingPreset(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset}>
              {editingPreset ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 