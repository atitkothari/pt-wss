'use client';

import { PageLayout } from "@/app/components/PageLayout";
import { useState, useEffect } from 'react';
import { useAuth } from "@/app/context/AuthContext";
import { Trade } from '@/app/types/trade';
import { TradesTable } from '@/app/components/table/TradesTable';
import { Button } from "@/components/ui/button";
import { PlusCircle, Group, List, RefreshCw } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { fetchOptionPrice, calculateUnrealizedPL } from "@/app/hooks/useOptionsData";

interface TradeWithUnrealizedPL extends Trade {
  unrealizedPL?: number;
  currentPrice?: number;
  unrealizedPLPercent?: number;
  currentStockPrice?:number;
}

export default function TradeTrackerPage() {
  const { user,loading: authLoading } = useAuth();
  const [trades, setTrades] = useState<TradeWithUnrealizedPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPrices, setLoadingPrices] = useState(false);
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
  const [editStatus, setEditStatus] = useState<'open' | 'closed' | 'assigned' | 'expired'>('open');
  const [closeType, setCloseType] = useState<'buy-to-close' | 'expired' | 'assigned'>('buy-to-close');  
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('open');
  const [groupBySymbol, setGroupBySymbol] = useState(false);

  const fetchTrades = async () => {
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

  // Fetch current prices for open trades to calculate unrealized P/L
  const fetchCurrentPrices = async () => {
    if (!user) return;
    
    setLoadingPrices(true);
    try {
      const openTradesWithOptionKey = trades.filter(trade => 
        trade.status === 'open' && trade.optionKey
      );

      const updatedTrades = await Promise.all(
        trades.map(async (trade) => {
          if (trade.status === 'open' && trade.optionKey) {
            const priceData = await fetchOptionPrice(trade.optionKey);
            if (priceData) {
          
              const currentPrice = priceData.askPrice; // Use ask price for unrealized P/L
              const currentStockPrice = priceData.stockprice;
              const unrealizedPL = calculateUnrealizedPL(
                trade.premium,
                currentPrice,
                trade.contracts || 1,
                trade.type
              );
      
              const unrealizedPLPercent = (unrealizedPL / trade.premium) * 100;
              
              return {
                ...trade,
                currentPrice,
                unrealizedPL,
                unrealizedPLPercent,
                currentStockPrice
              };
            }
          }
          return trade;
        })
      );

      setTrades(updatedTrades);
    } catch (error) {
      console.error('Error fetching current prices:', error);
    } finally {
      setLoadingPrices(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [user]);

  // Fetch prices when trades change
  useEffect(() => {
    if (trades.length > 0) {
      fetchCurrentPrices();
    }
  }, [trades.length]);

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

  const handleCloseTrade = async (id: string, closingCost: number, closeType: 'buy-to-close' | 'expired' | 'assigned') => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      
      // Map close type to status
      let status = 'closed';
      if (closeType === 'assigned') {
        status = 'assigned';
      } else if (closeType === 'expired') {
        status = 'expired';
      }
      
      const response = await fetch('/api/trades', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ 
          id, 
          status, 
          closeDate: new Date().toISOString(), 
          closingCost,
          closeType 
        }),
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
    setCloseType('buy-to-close');
    setIsCloseTradeModalOpen(true);
  };

  const handleSubmitCloseTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeToClose) return;
    
    let cost = 0;
    if (closeType === 'buy-to-close') {
      const parsedCost = parseFloat(closingCost);
      if (isNaN(parsedCost) || parsedCost < 0) {
        alert('Please enter a valid non-negative number for closing cost.');
        return;
      }
      cost = parsedCost;
    }
    
    await handleCloseTrade(tradeToClose.id, cost, closeType);
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
    setEditStatus(value as 'open' | 'closed' | 'assigned' | 'expired');
    if (value === 'open') setEditClosingCost('');
  };

  const handleSubmitEditTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeToEdit) return;
    const premium = parseFloat(editPremium);
    const closingCost = editStatus === 'closed' && editClosingCost !== '' ? parseFloat(editClosingCost) : 0;
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
        closeDate: tradeToEdit.closeDate || new Date().toISOString()
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
    .reduce((sum, trade) => sum + (trade.premium*(trade.contracts??1) - (typeof trade.closingCost === 'number' ? trade.closingCost*(trade.contracts??1) : 0)), 0);

  const openTrades = trades.filter(trade => trade.status === 'open');
  const closedTrades = trades.filter(trade => trade.status === 'closed' || trade.status === 'assigned' || trade.status === 'expired');
  const closedOnlyTrades = trades.filter(trade => trade.status === 'closed');
  const assignedTrades = trades.filter(trade => trade.status === 'assigned');
  const expiredTrades = trades.filter(trade => trade.status === 'expired');
  
  const openTradesTotalPremium = openTrades.reduce((sum, trade) => sum + trade.premium*(trade.contracts??1), 0);
  const closedTradesTotalFinalPremium = closedTrades.reduce((sum, trade) => 
    sum + (trade.premium*(trade.contracts??1) - (typeof trade.closingCost === 'number' ? trade.closingCost*(trade.contracts??1) : 0)), 0);

  // Calculate unrealized P/L for open trades
  const totalUnrealizedPL = openTrades.reduce((sum, trade) => sum + (trade.unrealizedPL || 0), 0);
  const totalUnrealizedPLPercent = openTradesTotalPremium > 0 ? (totalUnrealizedPL / openTradesTotalPremium) * 100 : 0;

  // Closed trades statistics
  const profitableTrades = closedTrades.filter(trade => 
    (trade.premium*(trade.contracts??1) - (typeof trade.closingCost === 'number' ? trade.closingCost*(trade.contracts??1) : 0)) > 0
  );
  const winRate = closedTrades.length > 0 ? (profitableTrades.length / closedTrades.length) * 100 : 0;
  const averageProfitPerTrade = closedTrades.length > 0 ? closedTradesTotalFinalPremium / closedTrades.length : 0;

  // Group trades by symbol
  const groupTradesBySymbol = (trades: Trade[]) => {
    const grouped = trades.reduce((acc, trade) => {
      if (!acc[trade.symbol]) {
        acc[trade.symbol] = [];
      }
      acc[trade.symbol].push(trade);
      return acc;
    }, {} as Record<string, Trade[]>);

    // Sort symbols alphabetically
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([symbol, symbolTrades]) => ({
        symbol,
        trades: symbolTrades.sort((a, b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime())
      }));
  };

  const openTradesGrouped = groupTradesBySymbol(openTrades);
  const closedTradesGrouped = groupTradesBySymbol(closedTrades);

  // Calculate symbol statistics
  const getSymbolStats = (trades: TradeWithUnrealizedPL[]) => {
    const totalPremium = trades.reduce((sum, trade) => sum + trade.premium*(trade.contracts??1), 0);
    const totalFinalPremium = trades.reduce((sum, trade) => 
      sum + (trade.premium*(trade.contracts??1) - (typeof trade.closingCost === 'number' ? trade.closingCost*(trade.contracts??1) : 0)), 0);
    const openCount = trades.filter(t => t.status === 'open').length;
    const closedCount = trades.filter(t => t.status === 'closed' || t.status === 'assigned' || t.status === 'expired').length;
    const profitableTrades = trades.filter(trade => 
      (trade.status === 'closed' || trade.status === 'assigned' || trade.status === 'expired') && (trade.premium - (typeof trade.closingCost === 'number' ? trade.closingCost : 0)) > 0
    );
    const winRate = closedCount > 0 ? (profitableTrades.length / closedCount) * 100 : 0;
    
    // Calculate unrealized P/L for open trades
    const openTrades = trades.filter(t => t.status === 'open');
    const totalUnrealizedPL = openTrades.reduce((sum, trade) => sum + (trade.unrealizedPL || 0), 0);
    
    return {
      totalPremium,
      totalFinalPremium,
      openCount,
      closedCount,
      totalCount: trades.length,
      winRate,
      isProfitable: totalFinalPremium > 0,
      totalUnrealizedPL
    };
  };

  // Get all unique symbols for summary
  const allSymbols = [...new Set(trades.map(trade => trade.symbol))].sort();
  const symbolSummary = allSymbols.map(symbol => {
    const symbolTrades = trades.filter(trade => trade.symbol === symbol);
    return {
      symbol,
      ...getSymbolStats(symbolTrades)
    };
  });

  return (
    <PageLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Trade Tracker</h1>
        <div className="flex flex-col items-center">
          <Dialog open={isAddTradeModalOpen} onOpenChange={setIsAddTradeModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto" disabled={!user}>
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
          {!user && (
            <div className="text-sm text-red-600 text-center mt-2">
              Please sign in to add trades
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <h3 className="text-xs font-medium text-gray-500">Total Trades</h3>
            <p className="text-xl font-semibold">{trades.length}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <h3 className="text-xs font-medium text-green-600">Open Trades</h3>
            <p className="text-xl font-semibold text-green-700">{openTrades.length}</p>
            
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <h3 className="text-xs font-medium text-blue-600">Closed Trades</h3>
            <p className="text-xl font-semibold text-blue-700">{closedOnlyTrades.length}</p>            
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <h3 className="text-xs font-medium text-purple-600">Assigned Trades</h3>
            <p className="text-xl font-semibold text-purple-700">{assignedTrades.length}</p>            
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <h3 className="text-xs font-medium text-orange-600">Expired Trades</h3>
            <p className="text-xl font-semibold text-orange-700">{expiredTrades.length}</p>            
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <h3 className="text-xs font-medium text-yellow-600">Unrealized P/L</h3>
            <p className={`text-xl font-semibold ${totalUnrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalUnrealizedPL.toFixed(2)}
            </p>           
          </div>
          <div className="p-3 bg-gray-50 rounded-lg col-span-2 md:col-span-1">
            <h3 className="text-xs font-medium text-gray-500">Total Premiums Collected</h3>
            <p className="text-xl font-semibold">${totalFinalPremiums.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : !user ? (
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
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Group className="h-4 w-4" />
                <span className="text-sm font-medium">Group by Symbol</span>
                <Switch
                  checked={groupBySymbol}
                  onCheckedChange={setGroupBySymbol}
                />
              </div>
            </div>
            
            {groupBySymbol && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Symbol Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {symbolSummary.map(({ symbol, totalCount, openCount, closedCount, totalFinalPremium, totalUnrealizedPL, winRate, isProfitable }) => (
                    <div key={symbol} className="p-3 bg-white rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{symbol}</h4>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                            ${totalFinalPremium.toFixed(2)}
                          </div>
                          {totalUnrealizedPL !== undefined && totalUnrealizedPL !== 0 && (
                            <div className={`text-xs ${totalUnrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${totalUnrealizedPL.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span>{totalCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Open:</span>
                          <span className="text-green-600">{openCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Closed:</span>
                          <span className="text-blue-600">{closedCount}</span>
                        </div>
                        {closedCount > 0 && (
                          <div className="flex justify-between">
                            <span>Win Rate:</span>
                            <span className={winRate >= 50 ? 'text-green-600' : 'text-red-600'}>
                              {winRate.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="open" className="flex items-center gap-2">
                  Open Trades ({openTrades.length})
                </TabsTrigger>
                <TabsTrigger value="closed" className="flex items-center gap-2">
                  Closed Trades ({closedTrades.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="open" className="mt-4">
                {openTrades.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No open trades yet. Add your first trade to get started!</p>
                  </div>
                ) : groupBySymbol ? (
                  <div className="space-y-4">
                    {openTradesGrouped.map(({ symbol, trades }) => {
                      const stats = getSymbolStats(trades);
                      return (
                        <div key={symbol} className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <h3 className="text-base font-semibold text-gray-900">{symbol}</h3>
                              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                                <span className="text-gray-600">Trades: {stats.totalCount}</span>
                                <span className="text-green-600">${stats.totalPremium.toFixed(2)}</span>
                                {stats.totalUnrealizedPL !== undefined && stats.totalUnrealizedPL !== 0 && (
                                  <span className={`font-medium ${stats.totalUnrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${stats.totalUnrealizedPL.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <TradesTable
                            trades={trades}
                            onRequestCloseTrade={handleRequestCloseTrade}
                            onRequestEditTrade={handleRequestEditTrade}
                            onRequestDeleteTrade={handleRequestDeleteTrade}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <TradesTable
                    trades={openTrades}
                    onRequestCloseTrade={handleRequestCloseTrade}
                    onRequestEditTrade={handleRequestEditTrade}
                    onRequestDeleteTrade={handleRequestDeleteTrade}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="closed" className="mt-4">
                {closedTrades.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No closed trades yet. Close some trades to see them here!</p>
                  </div>
                ) : groupBySymbol ? (
                  <div className="space-y-4">
                    {closedTradesGrouped.map(({ symbol, trades }) => {
                      const stats = getSymbolStats(trades);
                      const isProfitable = stats.totalFinalPremium > 0;
                      return (
                        <div key={symbol} className="border rounded-lg overflow-hidden">
                          <div className="bg-blue-50 px-3 py-2 border-b">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <h3 className="text-base font-semibold text-blue-900">{symbol}</h3>
                              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                                <span className="text-blue-600">Trades: {stats.totalCount}</span>
                                <span className={`font-medium ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                                  ${stats.totalFinalPremium.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <TradesTable
                            trades={trades}
                            onRequestCloseTrade={handleRequestCloseTrade}
                            onRequestEditTrade={handleRequestEditTrade}
                            onRequestDeleteTrade={handleRequestDeleteTrade}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <TradesTable
                    trades={closedTrades}
                    onRequestCloseTrade={handleRequestCloseTrade}
                    onRequestEditTrade={handleRequestEditTrade}
                    onRequestDeleteTrade={handleRequestDeleteTrade}
                  />
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      <Dialog open={isCloseTradeModalOpen} onOpenChange={setIsCloseTradeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Trade</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitCloseTrade} className="space-y-4">
            <div>
              <Label htmlFor="closeType">How did you close this trade?</Label>
              <Select value={closeType} onValueChange={(value: 'buy-to-close' | 'expired' | 'assigned') => setCloseType(value)}>
                <SelectTrigger id="closeType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy-to-close">Buy to Close</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {closeType === 'buy-to-close' && (
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
            )}
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
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
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

