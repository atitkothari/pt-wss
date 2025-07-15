import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Option } from '@/app/types/option';
import { useState, useEffect } from 'react';

interface AddTradeModalProps {
  open: boolean;
  onClose: () => void;
  trade: Option | null;
  onConfirm: (premium: number, contracts: number) => void;
}

export function AddTradeModal({ open, onClose, trade, onConfirm }: AddTradeModalProps) {
  const [premium, setPremium] = useState('');
  const [contracts, setContracts] = useState('1');

  useEffect(() => {
    if (trade) {
      setPremium((trade.premium ?? trade.bidPrice ?? 0).toString());
    }
    setContracts('1');
  }, [trade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trade) return;
    const numContracts = parseInt(contracts, 10);
    if (isNaN(numContracts) || numContracts < 1) return;
    onConfirm(Number(premium), numContracts);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Trade</DialogTitle>
        </DialogHeader>
        {trade && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="font-semibold">Symbol:</span> {trade.symbol}</div>
              <div><span className="font-semibold">Type:</span> {trade.type}</div>
              <div><span className="font-semibold">Expiration:</span> {trade.expiration}</div>
              <div><span className="font-semibold">Strike:</span> ${trade.strike}</div>
            </div>
            <div>
              <Label htmlFor="addPremium">Premium</Label>
              <Input
                id="addPremium"
                type="number"
                min="0"
                step="0.01"
                value={premium}
                onChange={e => setPremium(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="contracts">Number of Contracts</Label>
              <Input
                id="contracts"
                type="number"
                min="1"
                step="1"
                value={contracts}
                onChange={e => setContracts(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Add Trade</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 