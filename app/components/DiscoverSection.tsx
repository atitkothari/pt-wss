"use client";

import { useState, useEffect } from "react";
import {
  fetchTickersWithHighestYield,
  fetchTickersWithHighestImpliedVolatility,
  fetchTickersWithNextEarnings,
} from "../services/api";
import { Option } from "../types/option";
import {
  format,
  parseISO,
  addDays,
  isAfter,
  isBefore,
  addWeeks,
} from "date-fns";
import { DiscoverSectionSkeleton } from "./DiscoverSectionSkeleton";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  yieldFilterConfig,
  volumeFilterConfig,
  marketCapFilterConfig,
  impliedVolatilityFilterConfig,
  setDefaultFilterValues,
  dteFilterConfig,
} from "../config/filterConfig";
import { sendAnalyticsEvent, AnalyticsEvents } from "../utils/analytics";

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
  expiration?: string;
}

// Add tab type definition
type TabType = "highIV" | "highYield" | "earnings";

// Add tab configuration
const tabConfig: Record<TabType, { label: string; icon: string }> = {
  highIV: { label: "High IV", icon: "📈" },
  highYield: { label: "High Yield", icon: "💰" },
  earnings: { label: "Earnings This Week", icon: "📅" },
};

export function DiscoverSection() {
  // Covered Call stocks
  const [highIVStocks, setHighIVStocks] = useState<StockData[]>([]);
  const [earningsStocks, setEarningsStocks] = useState<StockData[]>([]);
  const [highYieldStocks, setHighYieldStocks] = useState<StockData[]>([]);

  // Cash Secured Put stocks
  const [highIVPutStocks, setHighIVPutStocks] = useState<StockData[]>([]);
  const [earningsPutStocks, setEarningsPutStocks] = useState<StockData[]>([]);
  const [highYieldPutStocks, setHighYieldPutStocks] = useState<StockData[]>([]);

  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading, signInWithGoogle } = useAuth();

  // State for tabs
  const [activeCallTab, setActiveCallTab] = useState<
    "highIV" | "highYield" | "earnings"
  >("highIV");
  const [activePutTab, setActivePutTab] = useState<
    "highIV" | "highYield" | "earnings"
  >("highIV");

  const [expandedStock, setExpandedStock] = useState<{
    symbol: string;
    type: "call" | "put";
  } | null>(null);

  // Track tab changes
  const handleCallTabChange = (tab: "highIV" | "highYield" | "earnings") => {
    setActiveCallTab(tab);
    sendAnalyticsEvent({
      event_name: AnalyticsEvents.DISCOVER_TAB_CHANGE,
      event_category: "Discover",
      event_label: "Covered Call",
      tab_name: tab,
    });
  };

  const handlePutTabChange = (tab: "highIV" | "highYield" | "earnings") => {
    setActivePutTab(tab);
    sendAnalyticsEvent({
      event_name: AnalyticsEvents.DISCOVER_TAB_CHANGE,
      event_category: "Discover",
      event_label: "Cash Secured Put",
      tab_name: tab,
    });
  };

  // Track stock expansion
  const handleStockExpand = (symbol: string, type: "call" | "put") => {
    // If clicking on the same stock, collapse it
    if (expandedStock?.symbol === symbol && expandedStock?.type === type) {
      setExpandedStock(null);
      return;
    }

    // Otherwise expand the new stock
    setExpandedStock({ symbol, type });
    sendAnalyticsEvent({
      event_name: AnalyticsEvents.STOCK_DETAIL_VIEW,
      event_category: "Discover",
      event_label: type === "call" ? "Covered Call" : "Cash Secured Put",
      symbol: symbol,
    });
  };

  // Set up localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        setDefaultFilterValues("call");
        setDefaultFilterValues("put");
        localStorage.setItem("call_minDte", "0");
        localStorage.setItem("call_maxDte", "7");
        localStorage.setItem("put_minDte", "0");
        localStorage.setItem("put_maxDte", "7");
      } catch (error) {
        console.warn("Failed to set localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchTrendingData = async () => {
      setLoading(true);
      try {
        // Fetch stocks with highest implied volatility for covered calls
        const highIVResponse = await fetchTickersWithHighestImpliedVolatility();

        // Fetch stocks with earnings this week using the new endpoint
        const earningsResponse = await fetchTickersWithNextEarnings();

        // Fetch highest yielding stocks for both calls and puts using the new endpoint
        const highYieldResponse = await fetchTickersWithHighestYield();

        // Process and group by stock symbol for high IV and earnings stocks
        const processStockData = (options: Option[]): StockData[] => {
          const stockMap = new Map<string, StockData>();

          options.forEach((option) => {
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
        const processHighYieldData = (tickers: any[]): StockData[] => {
          return tickers.map((ticker) => ({
            symbol: ticker.symbol,
            impliedVolatility: ticker.impliedVolatility || 0,
            earningsDate: ticker.earningsDate || "",
            yieldPercent: ticker.yieldPercent,
            askPrice: ticker.askprice,
            bidPrice: ticker.bidprice,
            delta: ticker.delta,
            strike: ticker.strike,
            volume: ticker.volume,
            openInterest: ticker.openinterest,
            expiration: ticker.expiration,
            stockPrice: ticker.stockPrice.toFixed(2),
          }));
        };

        // Process high IV stocks from the new endpoint
        const processHighIVData = (tickers: any[]): StockData[] => {
          return tickers.map((ticker) => ({
            symbol: ticker.symbol,
            impliedVolatility: ticker.impliedVolatility,
            earningsDate: ticker.earningsDate || "",
            yieldPercent: ticker.yieldPercent || 0,
            askPrice: ticker.askprice,
            bidPrice: ticker.bidprice,
            delta: ticker.delta,
            strike: ticker.strike,
            volume: ticker.volume,
            openInterest: ticker.openinterest,
            expiration: ticker.expiration,
            stockPrice: ticker.stockPrice.toFixed(2),
          }));
        };

        // Process earnings data from the new endpoint
        const processEarningsData = (tickers: any[]): StockData[] => {
          return tickers.map((ticker) => ({
            symbol: ticker.symbol,
            impliedVolatility: ticker.impliedVolatility || 0,
            earningsDate: ticker.expiration,
            yieldPercent: ticker.yieldPercent || 0,
            askPrice: ticker.askprice,
            bidPrice: ticker.bidprice,
            delta: ticker.delta,
            strike: ticker.strike,
            volume: ticker.volume,
            openInterest: ticker.openinterest,
            expiration: ticker.expiration,
            stockPrice: ticker.stockPrice.toFixed(2),
          }));
        };

        // Get high IV data for covered calls from the new endpoint
        const highIVData = processHighIVData(
          highIVResponse.calls.tickers
        ).slice(0, 5);

        // Get earnings data from the new endpoint
        const earningsData = processEarningsData(earningsResponse.calls.tickers)
          .sort((a, b) => {
            const dateA = a.earningsDate
              ? new Date(a.earningsDate)
              : new Date();
            const dateB = b.earningsDate
              ? new Date(b.earningsDate)
              : new Date();
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5);

        // Get high yield data from the new endpoint
        const highYieldData = processHighYieldData(
          highYieldResponse.calls.tickers
        ).slice(0, 5);

        // Get high IV data for cash secured puts from the new endpoint
        const highIVPutData = processHighIVData(
          highIVResponse.puts.tickers
        ).slice(0, 5);

        // Get earnings put data from the new endpoint
        const earningsPutData = processEarningsData(
          earningsResponse.puts.tickers
        )
          .sort((a, b) => {
            const dateA = a.earningsDate
              ? new Date(a.earningsDate)
              : new Date();
            const dateB = b.earningsDate
              ? new Date(b.earningsDate)
              : new Date();
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5);

        // Get high yield put data from the new endpoint
        const highYieldPutData = processHighYieldData(
          highYieldResponse.puts.tickers
        ).slice(0, 5);

        // Set state for covered calls
        setHighIVStocks(highIVData);
        setEarningsStocks(earningsData);
        setHighYieldStocks(highYieldData);

        // Set state for cash secured puts
        setHighIVPutStocks(highIVPutData);
        setEarningsPutStocks(earningsPutData);
        setHighYieldPutStocks(highYieldPutData);
      } catch (error) {
        console.error("Error fetching trending data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      // Handle the specific format "Fri, 04 Apr 2025 00:00:00 GMT"
      const date = new Date(dateString);
      return format(date, "MMM d, EEEE");
    } catch {
      return dateString;
    }
  };

  const renderStockList = (
    stocks: StockData[],
    valueKey: keyof StockData,
    label: string,
    optionType: "call" | "put"
  ) => {
    // Generate the appropriate URL parameters based on the list type
    const generateOptionsUrl = () => {
      let baseUrl =
        optionType === "call"
          ? "/covered-call-screener?"
          : "/cash-secured-put-screener?";

      const paramPrefix = optionType === "call" ? "call_" : "put_";

      try {
        const today = new Date();
        const nextWeek = addWeeks(today, 1);
        const formattedToday = format(today, "yyyy-MM-dd");
        const formattedNextWeek = format(nextWeek, "yyyy-MM-dd");

        baseUrl += `${paramPrefix}min_expiration=${formattedToday}&${paramPrefix}max_expiration=${formattedNextWeek}&`;
        baseUrl += `${paramPrefix}min_vol=100&${paramPrefix}max_vol=1000&`;

        if (valueKey === "impliedVolatility") {
          baseUrl += "sortBy=impliedVolatility&sortDir=desc";
        } else if (valueKey === "earningsDate") {
          baseUrl += "sortBy=expiration&sortDir=desc";
        } else if (valueKey === "yieldPercent") {
          baseUrl += "sortBy=yieldPercent&sortDir=desc";
        }

        return baseUrl;
      } catch (error) {
        console.warn("Error generating URL:", error);
        return baseUrl;
      }
    };

    const optionsUrl = generateOptionsUrl();
    const paramPrefix = optionType === "call" ? "call_" : "put_";

    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center p-1.5 sm:p-2 font-medium text-sm border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">#</span>
            <span>Stock</span>
          </div>
          <div className="flex items-center space-x-4">
            {valueKey === "impliedVolatility" && (
              <div className="w-20 text-right">IV</div>
            )}
            {valueKey === "earningsDate" && (
              <div className="w-32 text-right">Earnings Date</div>
            )}
            {valueKey === "yieldPercent" && (
              <div className="w-20 text-right">Yield</div>
            )}
            <div className="w-8"></div>
          </div>
        </div>
        {stocks.length > 0 ? (
          <div className="space-y-1.5">
            {stocks.map((stock, index) => {
              let value = stock[valueKey];
              let formattedValue = value;

              if (
                valueKey === "impliedVolatility" ||
                valueKey === "yieldPercent"
              ) {
                formattedValue = `${Number(value).toFixed(2)}%`;
              } else if (valueKey === "earningsDate") {
                formattedValue = formatDate(value as string);
              }

              const isExpanded =
                expandedStock?.symbol === stock.symbol &&
                expandedStock?.type === optionType;

              return (
                <div
                  key={stock.symbol}
                  className="border-b border-gray-50 last:border-0"
                >
                  <div
                    className="flex justify-between items-center p-1.5 sm:p-2 hover:bg-gray-50 rounded text-sm cursor-pointer transition-colors duration-150 relative group"
                    onClick={() => handleStockExpand(stock.symbol, optionType)}
                  >
                    <div className="flex items-center">
                      <span className="text-gray-500 w-6">{index + 1}.</span>
                      <span className="font-medium">{stock.symbol}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      {valueKey === "impliedVolatility" && (
                        <div className="w-20 text-right font-medium">
                          {formattedValue}
                        </div>
                      )}
                      {valueKey === "earningsDate" && (
                        <div className="w-32 text-right font-medium">
                          {formattedValue}
                        </div>
                      )}
                      {valueKey === "yieldPercent" && (
                        <div className="w-20 text-right font-medium">
                          {formattedValue}
                        </div>
                      )}
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white">
                        {isExpanded ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
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
                            <p className="font-semibold text-blue-800 mb-2 text-center border-b border-blue-100 pb-1.5 text-xs sm:text-sm">
                              Option Details
                            </p>
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">
                                  Current Price:
                                </span>
                                <span className="font-medium text-xs sm:text-sm">
                                  ${stock.stockPrice || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">
                                  Strike Price:
                                </span>
                                <span className="font-medium text-xs sm:text-sm">
                                  ${stock.strike || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">
                                  Bid:
                                </span>
                                <span className="font-medium text-xs sm:text-sm">
                                  ${stock.bidPrice || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">
                                  Ask:
                                </span>
                                <span className="font-medium text-xs sm:text-sm">
                                  ${stock.askPrice || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                            <p className="font-semibold text-green-800 mb-2 text-center border-b border-green-100 pb-1.5 text-xs sm:text-sm">
                              Additional Info
                            </p>
                            <div className="space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">
                                  Volume:
                                </span>
                                <span className="font-medium text-xs sm:text-sm">
                                  {stock.volume || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">
                                  Open Interest:
                                </span>
                                <span className="font-medium text-xs sm:text-sm">
                                  {stock.openInterest || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">
                                  Implied Volatility:
                                </span>
                                <span className="font-medium text-xs sm:text-sm">
                                  {(stock.impliedVolatility || 0).toFixed(2)}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs sm:text-sm">
                                  Delta:
                                </span>
                                <span className="font-medium text-xs sm:text-sm">
                                  {(stock.delta || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <Link
                            href={
                              optionsUrl +
                              `&${paramPrefix}search=${stock.symbol}`
                            }
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs sm:text-sm py-1.5"
                          >
                            Try our Options Screener
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 sm:h-4 sm:w-4 ml-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Find More button */}
            <div className="mt-3 text-center">
              <Link
                href={optionsUrl}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Find More
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No data available</p>
        )}
      </div>
    );
  };

  const renderTabs = (
    activeTab: TabType,
    setActiveTab: (tab: TabType) => void,
    section: "call" | "put"
  ) => {
    return (
      <div className="relative">
        <div className="flex space-x-1 border-b border-gray-200">
          {(Object.keys(tabConfig) as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                relative px-4 py-2 text-sm font-medium transition-all duration-200
                ${
                  activeTab === tab
                    ? "text-primary"
                    : "text-gray-500 hover:text-gray-700"
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
      return <DiscoverSectionSkeleton />;
    }

    return (
      <div className="space-y-8 sm:space-y-12">
        <div className="space-y-3 sm:space-y-4">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Covered Call Section */}
            <div className="space-y-4 bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Covered Call
                </h2>
                <span className="text-sm text-gray-500">
                  Weekly Opportunities
                </span>
              </div>

              {/* Category Tabs for Covered Call */}
              <div className="mb-6">
                {renderTabs(activeCallTab, handleCallTabChange, "call")}
              </div>

              {/* Content based on active tab for Covered Call */}
              <div className="w-full relative">
                {activeCallTab === "highIV" &&
                  renderStockList(
                    highIVStocks,
                    "impliedVolatility",
                    "Top Stocks with High IV",
                    "call"
                  )}
                {activeCallTab === "highYield" && (
                  <>
                    {user ? (
                      renderStockList(
                        highYieldStocks,
                        "yieldPercent",
                        "Top Stocks with High Premium Yield",
                        "call"
                      )
                    ) : (
                      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm min-h-[300px] relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-transparent flex flex-col items-center justify-center p-6 text-center">
                          <h2 className="text-xl font-bold text-white mb-2">
                            Sign in to view High Yield data
                          </h2>
                          <p className="text-gray-200 max-w-md mb-4">
                            Get full access to premium yield data by signing in
                            with your Google account.
                          </p>
                          <Button
                            onClick={() => signInWithGoogle()}
                            size="lg"
                            className="bg-white hover:bg-gray-100 text-gray-900 border-0"
                          >
                            Sign in with Google for FREE
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {activeCallTab === "earnings" && (
                  <>
                    {user ? (
                      renderStockList(
                        earningsStocks,
                        "earningsDate",
                        "Top Stocks with Earnings This Week",
                        "call"
                      )
                    ) : (
                      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm min-h-[300px] relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-transparent flex flex-col items-center justify-center p-6 text-center">
                          <h2 className="text-xl font-bold text-white mb-2">
                            Sign in to view Earnings data
                          </h2>
                          <p className="text-gray-200 max-w-md mb-4">
                            Get full access to earnings data by signing in with
                            your Google account.
                          </p>
                          <Button
                            onClick={() => signInWithGoogle()}
                            size="lg"
                            className="bg-white hover:bg-gray-100 text-gray-900 border-0"
                          >
                            Sign in with Google for FREE
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Cash Secured Put Section */}
            <div className="space-y-4 bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Cash Secured Put
                </h2>
                <span className="text-sm text-gray-500">
                  Weekly Opportunities
                </span>
              </div>

              {/* Category Tabs for Cash Secured Put */}
              <div className="mb-6">
                {renderTabs(activePutTab, handlePutTabChange, "put")}
              </div>

              {/* Content based on active tab for Cash Secured Put */}
              <div className="w-full relative">
                {activePutTab === "highIV" &&
                  renderStockList(
                    highIVPutStocks,
                    "impliedVolatility",
                    "Top Stocks with High IV",
                    "put"
                  )}
                {activePutTab === "highYield" && (
                  <>
                    {user ? (
                      renderStockList(
                        highYieldPutStocks,
                        "yieldPercent",
                        "Top Stocks with High Premium Yield",
                        "put"
                      )
                    ) : (
                      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm min-h-[300px] relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-transparent flex flex-col items-center justify-center p-6 text-center">
                          <h2 className="text-xl font-bold text-white mb-2">
                            Sign in to view High Yield data
                          </h2>
                          <p className="text-gray-200 max-w-md mb-4">
                            Get full access to premium yield data by signing in
                            with your Google account.
                          </p>
                          <Button
                            onClick={() => signInWithGoogle()}
                            size="lg"
                            className="bg-white hover:bg-gray-100 text-gray-900 border-0"
                          >
                            Sign in with Google for FREE
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {activePutTab === "earnings" && (
                  <>
                    {user ? (
                      renderStockList(
                        earningsPutStocks,
                        "earningsDate",
                        "Top Stocks with Earnings This Week",
                        "put"
                      )
                    ) : (
                      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm min-h-[300px] relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-transparent flex flex-col items-center justify-center p-6 text-center">
                          <h2 className="text-xl font-bold text-white mb-2">
                            Sign in to view Earnings data
                          </h2>
                          <p className="text-gray-200 max-w-md mb-4">
                            Get full access to earnings data by signing in with
                            your Google account.
                          </p>
                          <Button
                            onClick={() => signInWithGoogle()}
                            size="lg"
                            className="bg-white hover:bg-gray-100 text-gray-900 border-0"
                          >
                            Sign in with Google for FREE
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return renderContent();
}
