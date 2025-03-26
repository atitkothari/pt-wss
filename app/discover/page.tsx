'use client';

import { useState, useEffect } from 'react';
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import { fetchOptionsData, fetchTickersWithHighestYield, fetchTickersWithHighestImpliedVolatility } from "../services/api";
import { Option } from "../types/option";
import { format, parseISO, addDays, isAfter, isBefore, addWeeks } from 'date-fns';
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { 
  yieldFilterConfig, 
  volumeFilterConfig, 
  marketCapFilterConfig, 
  impliedVolatilityFilterConfig, 
  setDefaultFilterValues,
  dteFilterConfig
} from "../config/filterConfig";

interface StockData {
  symbol: string;
  impliedVolatility: number;
  earningsDate: string;
  yieldPercent: number;
  stockPrice?: number;
  strike?: number;
  bidPrice?: number;
  askPrice?: number;
  volume?: number;
  openInterest?: number;
  delta?: number;
}

// Add tab type definition
type TabType = 'highIV' | 'highYield' | 'earnings';

// Add tab configuration
const tabConfig: Record<TabType, { label: string; icon: string }> = {
  highIV: { label: 'High IV', icon: '📈' },
  highYield: { label: 'High Yield', icon: '💰' },
  earnings: { label: 'Earnings This Week', icon: '📅' }
};

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

  // State for tabs
  const [activeCallTab, setActiveCallTab] = useState<'highIV' | 'highYield' | 'earnings'>('highIV');
  const [activePutTab, setActivePutTab] = useState<'highIV' | 'highYield' | 'earnings'>('highIV');

  const [expandedStock, setExpandedStock] = useState<{ symbol: string; type: 'call' | 'put' } | null>(null);

  useEffect(() => {
    const fetchTrendingData = async () => {
      setLoading(true);
      try {
        // Fetch stocks with highest implied volatility for covered calls
        const highIVResponse = await fetchTickersWithHighestImpliedVolatility();
        
        // Fetch stocks with earnings this week for covered calls
        const today = new Date();
        const nextWeek = addWeeks(today, 1);
        const formattedToday = format(today, 'yyyy-MM-dd');
        const formattedNextWeek = format(nextWeek, 'yyyy-MM-dd');

        const earningsResult = await fetchOptionsData(
          [
            { operation: 'sort', field: 'marketCap', value: 'desc' },
            { operation: 'gte', field: 'marketCap', value: '100000000' },
            { operation: 'gte', field: 'volume', value: '1000' },
            { operation: 'eq', field: 'type', value: '"call"' },
            { operation: 'gte', field: 'earningsDate', value: `"${formattedToday}"` },
            { operation: 'lte', field: 'earningsDate', value: `"${formattedNextWeek}"` }
          ],
          1,
          1000
        );

        // High IV stocks for cash secured puts are already fetched with highIVResponse

        // Fetch stocks with earnings this week for cash secured puts
        const earningsPutResult = await fetchOptionsData(
          [
            { operation: 'sort', field: 'marketCap', value: 'desc' },
            { operation: 'gte', field: 'marketCap', value: '100000000' },
            { operation: 'gte', field: 'volume', value: '1000' },
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
                impliedVolatility: option.impliedVolatility,
                earningsDate: option.earningsDate,
                yieldPercent: option.yieldPercent,                
              });
            }
          });
          
          return Array.from(stockMap.values());
        };

        // Process high yield stocks from the new endpoint
        const processHighYieldData = (tickers: { symbol: string; yieldPercent: number }[]): StockData[] => {
          return tickers.map(ticker => ({
            symbol: ticker.symbol,
            impliedVolatility: 0, // We don't have this data from the endpoint
            earningsDate: '', // We don't have this data from the endpoint
            yieldPercent: ticker.yieldPercent
          }));
        };
        
        // Process high IV stocks from the new endpoint
        const processHighIVData = (tickers: { symbol: string; impliedVolatility: number }[]): StockData[] => {
          return tickers.map(ticker => ({
            symbol: ticker.symbol,
            impliedVolatility: ticker.impliedVolatility,
            earningsDate: '', // We don't have this data from the endpoint
            yieldPercent: 0 // We don't have this data from the endpoint
          }));
        };

        // Get high IV data for covered calls from the new endpoint
        const highIVData = processHighIVData(highIVResponse.calls.tickers).slice(0, 5);

        const earningsData = processStockData(earningsResult.options)
          .sort((a, b) => {
            const dateA = a.earningsDate ? new Date(a.earningsDate) : new Date();
            const dateB = b.earningsDate ? new Date(b.earningsDate) : new Date();
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5);

        // Get high yield data from the new endpoint
        const highYieldData = processHighYieldData(highYieldResponse.calls.tickers).slice(0,5);
          
        // Get high IV data for cash secured puts from the new endpoint
        const highIVPutData = processHighIVData(highIVResponse.puts.tickers).slice(0, 5);

        const earningsPutData = processStockData(earningsPutResult.options)
          .sort((a, b) => {
            const dateA = a.earningsDate ? new Date(a.earningsDate) : new Date();
            const dateB = b.earningsDate ? new Date(b.earningsDate) : new Date();
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5);

        // Get high yield put data from the new endpoint
        const highYieldPutData = processHighYieldData(highYieldResponse.puts.tickers).slice(0,5);

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

  const renderStockList = (stocks: StockData[], valueKey: keyof StockData, label: string, optionType:'call'|'put') => {
        
    // Generate the appropriate URL parameters based on the list type
    let optionsUrl = optionType === 'call' ? '/covered-call-screener?' : '/cash-secured-put-screener?';    
    setDefaultFilterValues(optionType)

    const paramPrefix = optionType === 'call' ? 'call_' : 'put_';
    
    const today = new Date();
    const nextWeek = addWeeks(today, 1);
    const formattedToday = format(today, 'yyyy-MM-dd');
    const formattedNextWeek = format(nextWeek, 'yyyy-MM-dd');

    localStorage.setItem(`${optionType}_minDte`, "0");
    localStorage.setItem(`${optionType}_maxDte`, "7");

    optionsUrl += `${paramPrefix}min_expiration=${formattedToday}&${paramPrefix}max_expiration=${formattedNextWeek}&`;      
    // Common filters for all lists using default values from filterConfig    
    optionsUrl += `${paramPrefix}min_vol=100&${paramPrefix}max_vol=1000&`;
    
    if (valueKey === 'impliedVolatility') {
      // For high IV lists, set implied volatility filter using default values
      optionsUrl += 'sortBy=impliedVolatility&sortDir=desc';
    } else if (valueKey === 'earningsDate') {
      // For earnings lists, set date filter to next week        
      optionsUrl += 'sortBy=expiration&sortDir=desc';
    } else if (valueKey === 'yieldPercent') {
      // For yield lists, set minimum yield using default values      
      optionsUrl += 'sortBy=yieldPercent&sortDir=desc';
    }
    
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center p-1.5 sm:p-2 font-medium text-sm border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">#</span>
            <span>Stock</span>
          </div>
          <div className="flex items-center space-x-4">
            {valueKey === 'impliedVolatility' && <div className="w-20 text-right">IV</div>}
            {valueKey === 'earningsDate' && <div className="w-32 text-right">Earnings Date</div>}
            {valueKey === 'yieldPercent' && <div className="w-20 text-right">Yield</div>}
            <div className="w-8"></div>
          </div>
        </div>
        {stocks.length > 0 ? (
          <div className="space-y-1.5">
            {stocks.map((stock, index) => {
              let value = stock[valueKey];
              let formattedValue = value;
              
              if (valueKey === 'impliedVolatility' || valueKey === 'yieldPercent') {
                formattedValue = `${Number(value).toFixed(2)}%`;
              } else if (valueKey === 'earningsDate') {
                formattedValue = formatDate(value as string);
              }
              
              const isExpanded = expandedStock?.symbol === stock.symbol && expandedStock?.type === optionType;
              
              return (
                <div key={stock.symbol} className="border-b border-gray-50 last:border-0">
                  <div 
                    className="flex justify-between items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded text-sm cursor-pointer transition-colors duration-150 relative group"
                    onClick={() => setExpandedStock(isExpanded ? null : { symbol: stock.symbol, type: optionType })}
                  >
                    <div className="flex items-center">
                      <span className="text-gray-500 w-6">{index + 1}.</span>
                      <span className="font-medium">{stock.symbol}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      {valueKey === 'impliedVolatility' && (
                        <div className="w-20 text-right font-medium">{formattedValue}</div>
                      )}
                      {valueKey === 'earningsDate' && (
                        <div className="w-32 text-right font-medium">{formattedValue}</div>
                      )}
                      {valueKey === 'yieldPercent' && (
                        <div className="w-20 text-right font-medium">{formattedValue}</div>
                      )}
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white">
                        {isExpanded ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="bg-gray-50 p-2 sm:p-3">
                      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                          <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                            <p className="font-semibold text-blue-800 mb-2 text-center border-b border-blue-100 pb-1.5 text-xs sm:text-sm">Option Details</p>
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">Current Price:</span>
                                <span className="font-medium text-xs sm:text-sm">${stock.stockPrice || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">Strike Price:</span>
                                <span className="font-medium text-xs sm:text-sm">${stock.strike || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">Bid:</span>
                                <span className="font-medium text-xs sm:text-sm">${stock.bidPrice || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">Ask:</span>
                                <span className="font-medium text-xs sm:text-sm">${stock.askPrice || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                            <p className="font-semibold text-green-800 mb-2 text-center border-b border-green-100 pb-1.5 text-xs sm:text-sm">Additional Info</p>
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">Volume:</span>
                                <span className="font-medium text-xs sm:text-sm">{stock.volume || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">Open Interest:</span>
                                <span className="font-medium text-xs sm:text-sm">{stock.openInterest || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">Implied Volatility:</span>
                                <span className="font-medium text-xs sm:text-sm">{(stock.impliedVolatility || 0).toFixed(2)}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">Delta:</span>
                                <span className="font-medium text-xs sm:text-sm">{(stock.delta || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <a 
                            href={optionsUrl}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs sm:text-sm py-1.5"
                          >
                            Try our Options Screener
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
                        
            {/* Find More button */}
            <div className="mt-3 text-center">
              <a 
                href={optionsUrl}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Find More
              </a>
            </div>

          </div>
        ) : (
          <p className="text-gray-500 text-sm">No data available</p>
        )}
      </div>
    );
  };

  const renderTabs = (activeTab: TabType, setActiveTab: (tab: TabType) => void, section: 'call' | 'put') => {
    return (
      <div className="relative">
        <div className="flex space-x-1 border-b border-gray-200">
          {(Object.keys(tabConfig) as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                relative px-4 py-2 text-sm font-medium transition-all duration-200
                ${activeTab === tab
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <div className="flex items-center space-x-2">
                <span>{tabConfig[tab].icon}</span>
                <span>{tabConfig[tab].label}</span>
              </div>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform transition-transform duration-200" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (authLoading || loading) {
      return (
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <div className="space-y-8 sm:space-y-12">
        <div className="space-y-3 sm:space-y-4">                    
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
            <h1 className="text-xl sm:text-2xl font-bold">Discover new ideas! 💡</h1>
            <span className="text-gray-500 text-xs sm:text-sm">
              These are based on weekly trends. Updated daily.
            </span>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Covered Call Section */}
            <div className="space-y-4 bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Covered Call</h2>
                <span className="text-sm text-gray-500">Weekly Opportunities</span>
              </div>
              
              {/* Category Tabs for Covered Call */}
              <div className="mb-6">
                {renderTabs(activeCallTab, setActiveCallTab, 'call')}
              </div>

              {/* Content based on active tab for Covered Call */}
              <div className="w-full">
                {activeCallTab === 'highIV' && (
                  renderStockList(highIVStocks, 'impliedVolatility', 'Top Stocks with High IV', 'call')
                )}
                {activeCallTab === 'highYield' && (
                  renderStockList(highYieldStocks, 'yieldPercent', 'Top Stocks with High Premium Yield', 'call')
                )}
                {activeCallTab === 'earnings' && (
                  renderStockList(earningsStocks, 'earningsDate', 'Top Stocks with Earnings This Week', 'call')
                )}
              </div>
            </div>

            {/* Cash Secured Put Section */}
            <div className="space-y-4 bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Cash Secured Put</h2>
                <span className="text-sm text-gray-500">Weekly Opportunities</span>
              </div>
              
              {/* Category Tabs for Cash Secured Put */}
              <div className="mb-6">
                {renderTabs(activePutTab, setActivePutTab, 'put')}
              </div>

              {/* Content based on active tab for Cash Secured Put */}
              <div className="w-full">
                {activePutTab === 'highIV' && (
                  renderStockList(highIVPutStocks, 'impliedVolatility', 'Top Stocks with High IV', 'put')
                )}
                {activePutTab === 'highYield' && (
                  renderStockList(highYieldPutStocks, 'yieldPercent', 'Top Stocks with High Premium Yield', 'put')
                )}
                {activePutTab === 'earnings' && (
                  renderStockList(earningsPutStocks, 'earningsDate', 'Top Stocks with Earnings This Week', 'put')
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {renderContent()}
        <Footer />
      </div>
    </div>
  );
}