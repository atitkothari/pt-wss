'use client';

import { useState, useEffect } from 'react';
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import { fetchOptionsData, fetchTickersWithHighestYield } from "../services/api";
import { Option } from "../types/option";
import { format, parseISO, addDays, isAfter, isBefore, addWeeks } from 'date-fns';
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";

interface StockData {
  symbol: string;
//   stockPrice: number;
  impliedVolatility: number;
  earningsDate: string;
  yieldPercent: number;
//   marketCap?: number;
//   sector?: string;
}

export default function TrendingPage() {
  // Covered Call stocks
  const [highIVStocks, setHighIVStocks] = useState<StockData[]>([]);
  const [earningsStocks, setEarningsStocks] = useState<StockData[]>([]);
  const [highYieldStocks, setHighYieldStocks] = useState<StockData[]>([]);
  
  // Cash Secured Put stocks
  const [highIVPutStocks, setHighIVPutStocks] = useState<StockData[]>([]);
  const [earningsPutStocks, setEarningsPutStocks] = useState<StockData[]>([]);
  const [highYieldPutStocks, setHighYieldPutStocks] = useState<StockData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchTrendingData = async () => {
      setLoading(true);
      try {
        // Fetch high IV stocks for covered calls
        const highIVResult = await fetchOptionsData(
          [
            {operation: "sort", field: "impliedVolatility", value: "desc"},
            {operation: "gte", field: "volume", value: 100},
            { operation: 'eq', field: 'type', value: '"call"' },
            { operation: 'gt', field: 'impliedVolatility', value: 80 }
          ],
          1,
          100
        );

        // Fetch stocks with earnings this week for covered calls
        const today = new Date();
        const nextWeek = addWeeks(today, 1);
        const formattedToday = format(today, 'yyyy-MM-dd');
        const formattedNextWeek = format(nextWeek, 'yyyy-MM-dd');

        const earningsResult = await fetchOptionsData(
          [
            { operation: 'eq', field: 'type', value: '"call"' },
            { operation: 'gte', field: 'earningsDate', value: `"${formattedToday}"` },
            { operation: 'lte', field: 'earningsDate', value: `"${formattedNextWeek}"` }
          ],
          1,
          10
        );

        // Fetch high IV stocks for cash secured puts
        const highIVPutResult = await fetchOptionsData(
          [
            { operation: 'eq', field: 'type', value: '"put"' },
            { operation: 'gt', field: 'impliedVolatility', value: 80 }
          ],
          1,
          100
        );

        // Fetch stocks with earnings this week for cash secured puts
        const earningsPutResult = await fetchOptionsData(
          [
            { operation: 'eq', field: 'type', value: '"put"' },
            { operation: 'gte', field: 'earningsDate', value: `"${formattedToday}"` },
            { operation: 'lte', field: 'earningsDate', value: `"${formattedNextWeek}"` }
          ],
          1,
          100
        );
        
        // Fetch highest yielding stocks for both calls and puts using the new endpoint
        const highYieldResponse = await fetchTickersWithHighestYield();

        // Process and group by stock symbol for high IV and earnings stocks
        const processStockData = (options: Option[]): StockData[] => {
          const stockMap = new Map<string, StockData>();
          
          options.forEach(option => {
            if (!stockMap.has(option.symbol)) {
              stockMap.set(option.symbol, {
                symbol: option.symbol,
                // stockPrice: option.stockPrice,
                impliedVolatility: option.impliedVolatility,
                earningsDate: option.earningsDate,
                yieldPercent: option.yieldPercent,
                // marketCap: option.marketCap,
                // sector: option.sector
              });
            }
          });
          
          return Array.from(stockMap.values());
        };

        // Process high yield stocks from the new endpoint
        const processHighYieldData = (tickers: { symbol: string; yieldPercent: number }[]): StockData[] => {
          return tickers.map(ticker => ({
            symbol: ticker.symbol,
            stockPrice: 0, // We don't have this data from the endpoint
            impliedVolatility: 0, // We don't have this data from the endpoint
            earningsDate: '', // We don't have this data from the endpoint
            yieldPercent: ticker.yieldPercent,
            marketCap: undefined,
            sector: undefined
          }));
        };

        // Sort and limit to top 10 for covered calls
        const highIVData = processStockData(highIVResult.options)
          .sort((a, b) => b.impliedVolatility - a.impliedVolatility)
          .slice(0, 10);

        const earningsData = processStockData(earningsResult.options)
          .sort((a, b) => {
            const dateA = a.earningsDate ? new Date(a.earningsDate) : new Date();
            const dateB = b.earningsDate ? new Date(b.earningsDate) : new Date();
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 10);

        // Get high yield data from the new endpoint
        const highYieldData = processHighYieldData(highYieldResponse.calls.tickers);
          
        // Sort and limit to top 10 for cash secured puts
        const highIVPutData = processStockData(highIVPutResult.options)
          .sort((a, b) => b.impliedVolatility - a.impliedVolatility)
          .slice(0, 10);

        const earningsPutData = processStockData(earningsPutResult.options)
          .sort((a, b) => {
            const dateA = a.earningsDate ? new Date(a.earningsDate) : new Date();
            const dateB = b.earningsDate ? new Date(b.earningsDate) : new Date();
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 10);

        // Get high yield put data from the new endpoint
        const highYieldPutData = processHighYieldData(highYieldResponse.puts.tickers);

        // Set state for covered calls
        setHighIVStocks(highIVData);
        setEarningsStocks(earningsData);
        setHighYieldStocks(highYieldData);
        
        // Set state for cash secured puts
        setHighIVPutStocks(highIVPutData);
        setEarningsPutStocks(earningsPutData);
        setHighYieldPutStocks(highYieldPutData);
      } catch (error) {
        console.error('Error fetching trending data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const renderStockList = (stocks: StockData[], valueKey: keyof StockData, label: string) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">{label}</h2>
        
        <div className="flex justify-between items-center p-2 font-medium">
          <div>Stock</div>
          {valueKey === 'impliedVolatility' && <div>IV</div>}
          {valueKey === 'earningsDate' && <div>Earnings Date</div>}
          {valueKey === 'yieldPercent' && <div>Yield</div>}          
        </div>
        {stocks.length > 0 ? (
          <div className="space-y-2">
            {stocks.map((stock, index) => {
              let value = stock[valueKey];
              let formattedValue = value;
              
              if (valueKey === 'impliedVolatility' || valueKey === 'yieldPercent') {
                formattedValue = `${Number(value).toFixed(2)}%`;
              } else if (valueKey === 'earningsDate') {
                formattedValue = formatDate(value as string);
              }
              
              return (
                <div key={stock.symbol} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">{index + 1}.</span>
                    <a 
                      href={`https://screenwich.com/stock-details/${stock.symbol}`}
                      target="_blank"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {stock.symbol}
                    </a>                    
                  </div>
                  <div className="font-medium">{formattedValue}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (authLoading || loading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <div className="space-y-10">
        <div className="space-y-6">                    
          <div className="flex item-center gap-2 mb-4">
            <h1 className="text-2xl font-bold">Trending Stocks</h1>
            <span className="text-gray-500 text-sm">
              These are based on weekly trends.
            </span>
          </div>
         
          <h2 className="text-xl font-bold">Covered Call</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderStockList(highIVStocks, 'impliedVolatility', 'Top 10 Stocks with High IV')}
            {renderStockList(earningsStocks, 'earningsDate', 'Top 10 Stocks with Earnings This Week')}
            {renderStockList(highYieldStocks, 'yieldPercent', 'Top 10 Stocks with High Premium Yield (Large Cap)')}
          </div>
          
          <h2 className="text-xl font-bold mt-8">Cash Secured Put</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderStockList(highIVPutStocks, 'impliedVolatility', 'Top 10 Stocks with High IV')}
            {renderStockList(earningsPutStocks, 'earningsDate', 'Top 10 Stocks with Earnings This Week')}
            {renderStockList(highYieldPutStocks, 'yieldPercent', 'Top 10 Stocks with High Premium Yield (Large Cap)')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-screen-2xl mx-auto p-4">
        {renderContent()}
        <Footer />
      </div>
    </div>
  );
}