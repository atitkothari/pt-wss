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

export default function TradeTrackerPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTradeModalOpen, setIsAddTradeModalOpen] = useState(false);

  const fetchTrades = async () => {
    if (!user) return;
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

  const handleCloseTrade = async (id: string) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/trades', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ id, status: 'closed', closeDate: new Date().toISOString() }),
      });
      if (response.ok) {
        fetchTrades();
      }
    } catch (error) {
      console.error('Error closing trade:', error);
    }
  };

  const totalPremiums = trades
    .reduce((sum, trade) => sum + trade.premium, 0);

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
            <h3 className="text-sm font-medium text-gray-500">Total Premiums Received</h3>
            <p className="text-2xl font-semibold">${totalPremiums.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <TradesTable trades={trades} onCloseTrade={handleCloseTrade} />
        )}
      </div>
    </PageLayout>
  );
}
