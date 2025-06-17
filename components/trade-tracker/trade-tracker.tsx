"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/app/context/AuthContext"
import { db } from "@/app/lib/firebase"
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, Timestamp } from "firebase/firestore"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Trade {
  id: string
  userId: string
  symbol: string
  type: "CALL" | "PUT"
  strike: number
  expiration: string
  quantity: number
  entryPrice: number
  exitPrice?: number
  status: "OPEN" | "CLOSED"
  pnl?: number
  createdAt: Timestamp
  updatedAt: Timestamp
  stockPrice?: number
}

interface OptionContract {
  symbol: string;
  type: "CALL" | "PUT";
  strike: number;
  expiration: string;
  stockprice: number;
}

export function TradeTracker() {
  const { user } = useAuth()
  const [trades, setTrades] = useState<Trade[]>([])
  const [newTrade, setNewTrade] = useState<Partial<Trade>>({
    type: "CALL",
    status: "OPEN",
  })
  const [suggestedContracts, setSuggestedContracts] = useState<OptionContract[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [openCalendar, setOpenCalendar] = useState(false)

  // Debounce function for symbol input
  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const fetchContracts = async (symbol: string) => {
    if (symbol.length < 2) {
      setSuggestedContracts([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(`/api/options?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: OptionContract[] = await response.json();
      setSuggestedContracts(data);
    } catch (error) {
      console.error("Failed to fetch contracts:", error);
      toast.error("Failed to fetch contract suggestions.");
      setSuggestedContracts([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedFetchContracts = debounce(fetchContracts, 500);

  useEffect(() => {
    if (!user) return

    // Subscribe to trades collection
    const tradesRef = collection(db, "trades")
    const q = query(tradesRef, where("userId", "==", user.uid))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tradesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[]
      setTrades(tradesData)
    })

    return () => unsubscribe()
  }, [user])

  const handleAddTrade = async () => {
    if (!user) {
      toast.error("Please sign in to add trades")
      return
    }

    if (!newTrade.symbol || !newTrade.strike || !newTrade.expiration || !newTrade.quantity || !newTrade.entryPrice || !newTrade.stockPrice) {
      toast.error("Please fill in all required fields, including Stock Price which is auto-populated upon selecting a contract.")
      return
    }

    try {
      const tradeData = {
        userId: user.uid,
        symbol: newTrade.symbol,
        type: newTrade.type as "CALL" | "PUT",
        strike: Number(newTrade.strike),
        expiration: newTrade.expiration,
        quantity: Number(newTrade.quantity),
        entryPrice: Number(newTrade.entryPrice),
        status: "OPEN" as const,
        stockPrice: Number(newTrade.stockPrice),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      await addDoc(collection(db, "trades"), tradeData)
      
      setNewTrade({
        type: "CALL",
        status: "OPEN",
      })
      setSuggestedContracts([]);
      
      toast.success("Trade added successfully")
    } catch (error) {
      console.error("Error adding trade:", error)
      toast.error("Failed to add trade")
    }
  }

  const handleCloseTrade = async (id: string, exitPrice: number) => {
    if (!user) return

    try {
      const tradeRef = doc(db, "trades", id)
      const tradeToClose = trades.find(t => t.id === id);
      if (!tradeToClose) {
        toast.error("Trade not found.");
        return;
      }
      const pnl = (exitPrice - tradeToClose.entryPrice) * tradeToClose.quantity * 100;
      
      await updateDoc(tradeRef, {
        status: "CLOSED",
        exitPrice,
        pnl,
        updatedAt: Timestamp.now()
      })
      
      toast.success("Trade closed successfully")
    } catch (error) {
      console.error("Error closing trade:", error)
      toast.error("Failed to close trade")
    }
  }

  const totalPnl = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">Please sign in to track your trades</h2>
        <p className="text-gray-600">Sign in to start tracking your option trades and monitor your P&L</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Trade</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              value={newTrade.symbol || ""}
              onChange={(e) => {
                setNewTrade({ ...newTrade, symbol: e.target.value.toUpperCase() });
                debouncedFetchContracts(e.target.value.toUpperCase());
              }}
              placeholder="AAPL"
            />
            {isSearching && <p className="text-sm text-gray-500">Searching...</p>}
            {suggestedContracts.length > 0 && (
              <Card className="mt-2 p-2 max-h-[200px] overflow-y-auto">
                <h3 className="text-md font-semibold mb-2">Suggested Contracts:</h3>
                {suggestedContracts.map((contract, index) => (
                  <div
                    key={index}
                    className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                    onClick={() => {
                      setNewTrade(prev => ({
                        ...prev,
                        symbol: contract.symbol,
                        type: contract.type,
                        strike: contract.strike,
                        expiration: contract.expiration,
                        stockPrice: contract.stockprice,
                      }));
                      setSuggestedContracts([]);
                    }}
                  >
                    {contract.symbol} - {contract.type} - ${contract.strike} - {contract.expiration} (Stock: ${contract.stockprice})
                  </div>
                ))}
              </Card>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={newTrade.type}
              onValueChange={(value) => setNewTrade({ ...newTrade, type: value as "CALL" | "PUT" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CALL">Call</SelectItem>
                <SelectItem value="PUT">Put</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="strike">Strike Price</Label>
            <Input
              id="strike"
              type="number"
              value={newTrade.strike || ""}
              onChange={(e) => setNewTrade({ ...newTrade, strike: parseFloat(e.target.value) || 0 })}
              placeholder="150"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiration">Expiration</Label>
            <Input
              id="expiration"
              type="date"
              value={newTrade.expiration || ""}
              onChange={(e) => setNewTrade({ ...newTrade, expiration: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={newTrade.quantity || ""}
              onChange={(e) => setNewTrade({ ...newTrade, quantity: parseInt(e.target.value) || 0 })}
              placeholder="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="entryPrice">Entry Price</Label>
            <Input
              id="entryPrice"
              type="number"
              value={newTrade.entryPrice || ""}
              onChange={(e) => setNewTrade({ ...newTrade, entryPrice: parseFloat(e.target.value) || 0 })}
              placeholder="2.50"
              step="0.01"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stockPrice">Stock Price</Label>
            <Input
              id="stockPrice"
              type="number"
              value={newTrade.stockPrice || ""}
              readOnly
              placeholder="Auto-populated"
            />
          </div>
        </div>
        <Button onClick={handleAddTrade} className="mt-4">
          Add Trade
        </Button>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Trade History</h2>
          <div className="text-lg font-medium">
            Total P&L: <span className={totalPnl >= 0 ? "text-green-600" : "text-red-600"}>
              ${totalPnl.toFixed(2)}
            </span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Strike</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>Exit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>P&L</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell>{trade.symbol}</TableCell>
                <TableCell>{trade.type}</TableCell>
                <TableCell>${trade.strike}</TableCell>
                <TableCell>{trade.expiration}</TableCell>
                <TableCell>{trade.quantity}</TableCell>
                <TableCell>${trade.entryPrice}</TableCell>
                <TableCell>{trade.exitPrice ? `$${trade.exitPrice}` : "-"}</TableCell>
                <TableCell>{trade.status}</TableCell>
                <TableCell className={trade.pnl && trade.pnl >= 0 ? "text-green-600" : "text-red-600"}>
                  {trade.pnl ? `$${trade.pnl.toFixed(2)}` : "-"}
                </TableCell>
                <TableCell>
                  {trade.status === "OPEN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const exitPrice = prompt("Enter exit price:")
                        if (exitPrice) {
                          handleCloseTrade(trade.id, parseFloat(exitPrice))
                        }
                      }}
                    >
                      Close
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
} 