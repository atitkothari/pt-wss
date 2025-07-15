'use client';

import { PageLayout } from "@/app/components/PageLayout";
import { useState, useEffect } from 'react';
import { useAuth } from "@/app/context/AuthContext";
import { Trade } from '@/app/types/trade';
import { TradesTable } from '@/app/components/table/TradesTable';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddTradeForm } from "@/app/components/forms/AddTradeForm";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthModal } from "../components/modals/AuthModal";

export default function TradeTrackerPage() {
  const { user,loading: authLoading } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTradeModalOpen, setIsAddTradeModalOpen] = useState(false);
  const [isCloseTradeModalOpen, setIsCloseTradeModalOpen] = useState(false);
  const [tradeToClose, setTradeToClose] = useState<Trade | null>(null);
  const [closingCost, setClosingCost] = useState('');
  const [isEditTradeModalOpen, setIsEditTradeModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [editPremium, setEditPremium] = useState('');
  const [editClosingCost, setEditClosingCost] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);
  const [editStatus, setEditStatus] = useState<'open' | 'closed'>('open');  
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchTrades = async () => {
    console.log("hi")
    if (!user){
      setLoading(false)
       return;
    }
    
    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/trades', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTrades(data);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {      
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [user]);

  const handleAddTrade = async (trade: Omit<Trade, 'id' | 'status' | 'openDate' | 'closeDate'>) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(trade),
      });
      if (response.ok) {
        fetchTrades();
        setIsAddTradeModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding trade:', error);
    }
  };

  const handleCloseTrade = async (id: string, closingCost: number) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/trades', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ id, status: 'closed', closeDate: new Date().toISOString(), closingCost }),
      });
      if (response.ok) {
        fetchTrades();
      }
    } catch (error) {
      console.error('Error closing trade:', error);
    }
  };

  const handleRequestCloseTrade = (trade: Trade) => {
    setTradeToClose(trade);
    setClosingCost('');
    setIsCloseTradeModalOpen(true);
  };

  const handleSubmitCloseTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeToClose) return;
    const cost = parseFloat(closingCost);
    if (isNaN(cost) || cost < 0) {
      alert('Please enter a valid non-negative number.');
      return;
    }
    await handleCloseTrade(tradeToClose.id, cost);
    setIsCloseTradeModalOpen(false);
    setTradeToClose(null);
  };

  const handleRequestEditTrade = (trade: Trade) => {
    setTradeToEdit(trade);
    setEditPremium(trade.premium.toString());
    setEditClosingCost(trade.closingCost !== undefined ? trade.closingCost.toString() : '');
    setEditStatus(trade.status);
    setIsEditTradeModalOpen(true);
  };

  const handleStatusChange = (value: string) => {
    setEditStatus(value as 'open' | 'closed');
    if (value === 'open') setEditClosingCost('');
  };

  const handleSubmitEditTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeToEdit) return;
    const premium = parseFloat(editPremium);
    const closingCost = editStatus === 'closed' && editClosingCost !== '' ? parseFloat(editClosingCost) : undefined;
    if (isNaN(premium) || premium < 0) {
      alert('Please enter a valid non-negative premium.');
      return;
    }
    if (editStatus === 'closed' && (editClosingCost === '' || isNaN(closingCost!) || closingCost! < 0)) {
      alert('Please enter a valid non-negative closing cost.');
      return;
    }
    if (!user) return;
    const idToken = await user.getIdToken();
    await fetch('/api/trades', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        id: tradeToEdit.id,
        premium,
        closingCost,
        status: editStatus,
        closeDate: editStatus === 'closed' ? (tradeToEdit.closeDate || new Date().toISOString()) : null,
      }),
    });
    setIsEditTradeModalOpen(false);
    setTradeToEdit(null);
    fetchTrades();
  };

  const handleRequestDeleteTrade = (trade: Trade) => {
    setTradeToDelete(trade);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteTrade = async () => {
    if (!tradeToDelete || !user) return;
    const idToken = await user.getIdToken();
    await fetch(`/api/trades?id=${tradeToDelete.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    setIsDeleteConfirmOpen(false);
    setTradeToDelete(null);
    fetchTrades();
  };

  const totalFinalPremiums = trades
    .reduce((sum, trade) => sum + (trade.premium - (typeof trade.closingCost === 'number' ? trade.closingCost : 0)), 0);

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trade Tracker</h1>
        <Dialog open={isAddTradeModalOpen} onOpenChange={setIsAddTradeModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Trade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Trade</DialogTitle>
            </DialogHeader>
            <AddTradeForm onSubmit={handleAddTrade} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Total Trades</h3>
            <p className="text-2xl font-semibold">{trades.length}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Open Trades</h3>
            <p className="text-2xl font-semibold">{trades.filter(t => t.status === 'open').length}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Total Final Premiums Collected</h3>
            <p className="text-2xl font-semibold">${totalFinalPremiums.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) :  !user ? (
          <div className="text-center py-10">
            <p className="text-lg">Please sign-in to add trades</p>
            {!user && (
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sign In
              </Button>
            )}
          </div>) : (
          <TradesTable
            trades={trades}
            onRequestCloseTrade={handleRequestCloseTrade}
            onRequestEditTrade={handleRequestEditTrade}
            onRequestDeleteTrade={handleRequestDeleteTrade}
          />
        )}
      </div>
      <Dialog open={isCloseTradeModalOpen} onOpenChange={setIsCloseTradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Trade</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitCloseTrade} className="space-y-4">
            <div>
              <Label htmlFor="closingCost">How much did you pay to close this trade (per contract)?</Label>
              <Input
                id="closingCost"
                type="number"
                min="0"
                step="0.01"
                value={closingCost}
                onChange={e => setClosingCost(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCloseTradeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Close Trade</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTradeModalOpen} onOpenChange={setIsEditTradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trade</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEditTrade} className="space-y-4">
            {tradeToEdit && (
              <div className="rounded-lg border bg-gray-50 p-4 mb-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div><span className="font-semibold">Symbol:</span> {tradeToEdit.symbol}</div>
                <div><span className="font-semibold">Type:</span> {tradeToEdit.type}</div>
                <div><span className="font-semibold">Strike:</span> ${tradeToEdit.strike.toFixed(2)}</div>
                <div><span className="font-semibold">Expiration:</span> {tradeToEdit.expiration}</div>
                <div><span className="font-semibold">Open Date:</span> {tradeToEdit.openDate ? new Date(tradeToEdit.openDate).toLocaleDateString() : '-'}</div>
                <div><span className="font-semibold">Close Date:</span> {tradeToEdit.closeDate ? new Date(tradeToEdit.closeDate).toLocaleDateString() : '-'}</div>
              </div>
            )}
            <div>
              <Label htmlFor="editStatus">Status</Label>
              <Select value={editStatus} onValueChange={handleStatusChange}>
                <SelectTrigger id="editStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editPremium">Premium</Label>
              <Input
                id="editPremium"
                type="number"
                min="0"
                step="0.01"
                value={editPremium}
                onChange={e => setEditPremium(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="editClosingCost">Closing Cost</Label>
              <Input
                id="editClosingCost"
                type="number"
                min="0"
                step="0.01"
                value={editClosingCost}
                onChange={e => setEditClosingCost(e.target.value)}
                disabled={editStatus === 'open'}
                placeholder={editStatus === 'open' ? 'Set status to Closed to enter' : ''}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditTradeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trade</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this trade?</div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteTrade}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </PageLayout>
  );
}
