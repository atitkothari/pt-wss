import { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useUserAccess } from "@/app/hooks/useUserAccess";
import { createCheckoutSession } from "@/app/lib/stripe";

interface Stock {
  symbol: string;
  contractCount: number;
  stockPrice: number;
  options: any[];
}

export function StockChips() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { status } = useUserAccess();

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch('/api/wheel-strategy');
        const data = await response.json();
        const topStocks = data.stocks.slice(0, 10);
        setStocks(topStocks);
        if (topStocks.length > 0) {
          setSelectedStock(topStocks[0]);
        }
      } catch (error) {
        console.error('Error fetching stocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);


  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {stocks.map((stock) => (
          <Badge
            key={stock.symbol}
            variant="outline"
            className={`px-3 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
              selectedStock?.symbol === stock.symbol
                ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300'
            }`}
            onClick={() => setSelectedStock(selectedStock?.symbol === stock.symbol ? null : stock)}
          >
            <span className="font-semibold">{stock.symbol}</span>
            <span className={`ml-1 ${selectedStock?.symbol === stock.symbol ? 'text-blue-100' : 'text-blue-600'}`}>
              ({stock.contractCount})
            </span>
          </Badge>
        ))}
      </div>

      {selectedStock && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              {selectedStock.symbol} Options Contracts
              <span className="text-sm font-normal text-gray-500 ml-2">
                Stock Price: ${selectedStock.stockPrice.toFixed(2)}
              </span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Strike</TableHead>
                  <TableHead>Premium</TableHead>
                  {/* <TableHead>Bid</TableHead>
                  <TableHead>Ask</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>OI</TableHead> */}
                  <TableHead>Delta</TableHead>
                  {/* <TableHead>IV</TableHead>
                  <TableHead>Ann. Return</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedStock.options.map((option, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(option.expiration).toLocaleDateString()}</TableCell>
                    <TableCell>${option.strike.toFixed(2)}</TableCell>
                    <TableCell className="uppercase">${(option.bidPrice*100).toFixed(2)}</TableCell>
                    {/* <TableCell>${option.bidPrice.toFixed(2)}</TableCell>
                    <TableCell>${option.askPrice.toFixed(2)}</TableCell>
                    <TableCell>{option.volume}</TableCell>
                    <TableCell>{option.openInterest}</TableCell> */}
                    <TableCell>{option.delta.toFixed(2)}</TableCell>
                    {/* <TableCell>{option.impliedVolatility.toFixed(1)}%</TableCell>
                    <TableCell>{option.annualizedReturn.toFixed(1)}%</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
            {/* Find More button */}
            {/* <div className="mt-3 text-center">
              <a 
                href={"/cash-secured-put-screener?"}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Find More
              </a>
            </div> */}
        </div>
      )}
    </div>
  );
} 