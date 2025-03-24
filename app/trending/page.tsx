'use client';

import { useState, useEffect } from 'react';
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import { fetchOptionsData } from "../services/api";
import { Option, OptionType } from "../types/option";
import { format } from 'date-fns';
import { BarChart2, Calendar, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StockGroup {
  symbol: string;
  stockPrice: number;
  impliedVolatility: number;
  earningsDate: string;
  yieldPercent: number;
  marketCap?: number;
  sector?: string;
}

export default function TrendingPage() {
  const [loading, setLoading] = useState(true);
  const [highIVStocks, setHighIVStocks] = useState<StockGroup[]>([]);
  const [earningsStocks, setEarningsStocks] = useState<StockGroup[]>([]);
  const [highYieldStocks, setHighYieldStocks] = useState<StockGroup[]>([]);
  const [selectedTab, setSelectedTab] = useState<OptionType>('call');

  useEffect(() => {
    const fetchTrendingData = async () => {
      setLoading(true);
      try {
        // Fetch high IV stocks
        const highIVFilters = [
          { operation: 'gt', field: 'impliedVolatility', value: 50 },
          { operation: 'sort', field: 'impliedVolatility', value: 'desc' }
        ];
        const highIVResult = await fetchOptionsData(highIVFilters, 1, 100, undefined, undefined, selectedTab);
        
        // Fetch stocks with earnings this week
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const earningsFilters = [
          { 
            operation: 'gte', 
            field: 'earningsDate', 
            value: `"${format(today, 'yyyy-MM-dd')}"` 
          },
          { 
            operation: 'lte', 
            field: 'earningsDate', 
            value: `"${format(nextWeek, 'yyyy-MM-dd')}"` 
          }
        ];
        const earningsResult = await fetchOptionsData(earningsFilters, 1, 100, undefined, undefined, selectedTab);
        
        // Fetch high premium yield large cap stocks
        const highYieldFilters = [
          { operation: 'gt', field: 'yieldPercent', value: 5 },
          { operation: 'gte', field: 'marketCap', value: 10000000000 }, // 10B market cap
          { operation: 'sort', field: 'yieldPercent', value: 'desc' }
        ];
        const highYieldResult = await fetchOptionsData(highYieldFilters, 1, 100, undefined, undefined, selectedTab);

        // Process and group by stock symbol
        setHighIVStocks(processStockData(highYieldResult.options));
        setEarningsStocks(processStockData(earningsResult.options));
        setHighYieldStocks(processStockData(highIVResult.options));
      } catch (error) {
        console.error('Error fetching trending data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, [selectedTab]);

  // Function to process options data and group by stock
  const processStockData = (options: Option[]): StockGroup[] => {
    const stockMap = new Map<string, StockGroup>();
    
    options.forEach(option => {
      if (!stockMap.has(option.symbol)) {
        stockMap.set(option.symbol, {
          symbol: option.symbol,
          stockPrice: option.stockPrice,
          impliedVolatility: option.impliedVolatility,
          earningsDate: option.earningsDate,
          yieldPercent: option.yieldPercent,
          marketCap: option.marketCap,
          sector: option.sector
        });
      }
    });
    
    return Array.from(stockMap.values()).slice(0, 10);
  };

  const renderStockCard = (stock: StockGroup) => (
    <div key={stock.symbol} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{stock.symbol}</h3>
        <span className="text-gray-600">${stock.stockPrice.toFixed(2)}</span>
      </div>
      <div className="text-sm text-gray-600">
        <div className="flex justify-between">
          <span>IV:</span>
          <span>{stock.impliedVolatility.toFixed(2)}%</span>
        </div>
        {stock.earningsDate && (
          <div className="flex justify-between">
            <span>Earnings:</span>
            <span>{stock.earningsDate}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Yield:</span>
          <span>{stock.yieldPercent.toFixed(2)}%</span>
        </div>
        {stock.sector && (
          <div className="flex justify-between">
            <span>Sector:</span>
            <span>{stock.sector}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderSection = (title: string, icon: React.ReactNode, stocks: StockGroup[]) => (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-xl font-bold ml-2">{title}</h2>
      </div>
      {stocks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stocks.map(renderStockCard)}
        </div>
      ) : (
        <p className="text-gray-500">No data available</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-screen-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Trending Stocks</h1>
        
        <Tabs 
          defaultValue="covered-call" 
          className="w-full mb-6"
          onValueChange={(value) => setSelectedTab(value === 'covered-call' ? 'call' : 'put')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              id="btn_covered_call_tab"
              value="covered-call"
            >
              Covered Call
            </TabsTrigger>
            <TabsTrigger 
              id="btn_cash_secured_put_tab"
              value="cash-secured-put"
            >
              Cash Secured Put
            </TabsTrigger>
          </TabsList>
          <TabsContent value="covered-call">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                {renderSection(
                  "Top Covered Call Stocks with High Implied Volatility", 
                  <BarChart2 className="h-5 w-5 text-blue-600" />, 
                  highIVStocks
                )}
                
                {renderSection(
                  "Covered Call Stocks with Earnings This Week", 
                  <Calendar className="h-5 w-5 text-green-600" />, 
                  earningsStocks
                )}
                
                {renderSection(
                  "Large Cap Covered Call Stocks with High Premium Yield", 
                  <DollarSign className="h-5 w-5 text-amber-600" />, 
                  highYieldStocks
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="cash-secured-put">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                {renderSection(
                  "Top Cash Secured Put Stocks with High Implied Volatility", 
                  <BarChart2 className="h-5 w-5 text-blue-600" />, 
                  highIVStocks
                )}
                
                {renderSection(
                  "Cash Secured Put Stocks with Earnings This Week", 
                  <Calendar className="h-5 w-5 text-green-600" />, 
                  earningsStocks
                )}
                
                {renderSection(
                  "Large Cap Cash Secured Put Stocks with High Premium Yield", 
                  <DollarSign className="h-5 w-5 text-amber-600" />, 
                  highYieldStocks
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Footer />
      </div>
    </div>
  );
}