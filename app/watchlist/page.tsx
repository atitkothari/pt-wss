'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from "../components/PageLayout";
import { Star, Loader2, Trash } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase"; // Assuming db is exported from firebase.ts
import { collection, query, where, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { format, isPast } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AuthModal } from '../components/modals/AuthModal';

interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  type: 'call' | 'put';
  strike: number;
  expiration: string;
  addedPrice: number;
  addedDate: Timestamp;
}

interface OptionData {
  symbol: string;
  type: 'call' | 'put';
  strike: number;
  expiration: string;
  stockprice: number | null;
  premium: number | null;
  askprice: number | null;
}

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [fetchedOptionData, setFetchedOptionData] = useState<Map<string, OptionData>>(new Map());
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);
  const [loadingOptionData, setLoadingOptionData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    console.log("Auth loading:", authLoading, "User:", user);
    if (authLoading) return;

    if (!user) {
      setLoadingWatchlist(false);
      setError("Please sign in to view your watchlist.");
      setWatchlistItems([]);
      return;
    }

    const q = query(
      collection(db, "watchlists"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: WatchlistItem[] = snapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure addedPrice is a number, default to 0 if not
        const parsedAddedPrice = typeof data.addedPrice === 'number' && !isNaN(data.addedPrice) ? data.addedPrice : 0; 
        const parsedExpiration = typeof data.expiration === 'string' ? data.expiration : ''; 
        const parsedStrike = typeof data.strike === 'number' && !isNaN(data.strike) ? data.strike : 0; 
        const parsedType = typeof data.type === 'string' ? data.type : 'call'; 
        const parsedSymbol = typeof data.symbol === 'string' ? data.symbol : ''; 

        return {
          id: doc.id,
          userId: data.userId,
          symbol: parsedSymbol,
          type: parsedType as 'call' | 'put',
          strike: parsedStrike,
          expiration: parsedExpiration,
          addedPrice: parsedAddedPrice,
          addedDate: data.addedDate,
        };
      });
      console.log("Watchlist items from Firebase:", items);
      setWatchlistItems(items);
      setLoadingWatchlist(false);
      setError(null); 
    }, (e: any) => {
      console.error("Error fetching watchlist:", e);
      setError("Failed to load watchlist. Please try again.");
      setLoadingWatchlist(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  useEffect(() => {
    console.log("Fetching option data - watchlistItems length:", watchlistItems.length, "loadingWatchlist:", loadingWatchlist);
    const fetchLatestOptionData = async () => {
      setLoadingOptionData(true);
      const newFetchedData = new Map<string, OptionData>();
      const fetchPromises: Promise<void>[] = [];

      for (const item of watchlistItems) {
        const key = `${item.symbol}-${item.expiration}-${item.strike}-${item.type}`;
        if (fetchedOptionData.has(key)) {
          console.log(`Skipping fetch for ${key} (already fetched)`);
          continue;
        }

        console.log(`Attempting to fetch data for: ${key}`);
        const promise = fetch(`/api/watchlist-data?symbol=${item.symbol}&expiration=${item.expiration}&strike=${item.strike}&type=${item.type}`)
          .then(res => {
            console.log(`Response status for ${key}:`, res.status);
            if (!res.ok) {
              return res.json().then(err => { throw new Error(err.error || `HTTP error! status: ${res.status}`); });
            }
            return res.json();
          })
          .then(data => {
            console.log(`Raw fetched data for ${key}:`, data);
            // Explicitly validate premium and stockprice before setting
            const validatedPremium = typeof data.premium === 'number' && !isNaN(data.premium) ? data.premium : null;
            const validatedStockPrice = typeof data.stockprice === 'number' && !isNaN(data.stockprice) ? data.stockprice : null;
            const validatedAskPrice = typeof data.askprice === 'number' && !isNaN(data.askprice) ? data.askprice : null;

            newFetchedData.set(key, {
              symbol: data.symbol,
              type: data.type,
              strike: data.strike,
              expiration: data.expiration,
              stockprice: validatedStockPrice,
              premium: validatedPremium,
              askprice: validatedAskPrice,
            });
          })
          .catch((e: Error) => {
            console.error(`Failed to fetch data for ${item.symbol}:`, e.message);
            // On fetch failure, explicitly store null for premium to indicate no current data
            newFetchedData.set(key, {
              symbol: item.symbol,
              type: item.type,
              strike: item.strike,
              expiration: item.expiration,
              stockprice: null,
              premium: null,
              askprice: null,
            });
          });
        fetchPromises.push(promise);
      }

      await Promise.all(fetchPromises);
      console.log("All fetches completed. New fetched data:", newFetchedData);
      setFetchedOptionData(prev => new Map([...prev, ...newFetchedData]));
      setLoadingOptionData(false);
    };

    if (watchlistItems.length > 0) {
      fetchLatestOptionData();
    } else if (!loadingWatchlist) {
      console.log("Watchlist empty or loading complete, setting loadingOptionData to false");
      setLoadingOptionData(false);
    }
    console.log("Current fetchedOptionData map size:", fetchedOptionData.size);
  }, [watchlistItems, loadingWatchlist]);

  const handleRemove = async (id: string) => {
    try {
      await deleteDoc(doc(db, "watchlists", id));
      toast.success("Option removed from watchlist.");
    } catch (e: any) {
      console.error("Error removing document: ", e);
      toast.error("Failed to remove option. Please try again.");
    }
  };

  const calculatePerformance = (item: WatchlistItem) => {
    const key = `${item.symbol}-${item.expiration}-${item.strike}-${item.type}`;
    const currentData = fetchedOptionData.get(key);

    // Initial check for fetched data and its premium (now askprice)
    if (!currentData || typeof currentData.askprice !== 'number' || isNaN(currentData.askprice)) {
      return {
        currentPremium: null,
        profitLoss: null,
        percentageChange: null,
        loading: true,
      };
    }

    // Ensure item.addedPrice is a valid number
    const addedPrice = typeof item.addedPrice === 'number' && !isNaN(item.addedPrice) ? item.addedPrice : 0;
    
    const currentPremium = currentData.askprice; // Use askprice as current premium

    const profitLoss = currentPremium - addedPrice;
    
    let percentageChangeValue: number | null = null;
    if (addedPrice !== 0) {
      percentageChangeValue = (profitLoss / addedPrice) * 100;
    } else {
      percentageChangeValue = 0; 
    }
    
    console.log(`Debug for ${item.symbol}: addedPrice=${addedPrice}, currentPremium=${currentPremium}, profitLoss=${profitLoss}, percentageChangeValue=${percentageChangeValue}`);

    return {
      currentPremium,
      profitLoss: isNaN(profitLoss) ? null : profitLoss,
      percentageChange: isNaN(percentageChangeValue) ? null : percentageChangeValue,
      loading: false,
    };
  };

  const activeOptions = watchlistItems.filter(item => !isPast(new Date(item.expiration)));
  const expiredOptions = watchlistItems.filter(item => isPast(new Date(item.expiration)));

  const renderTable = (options: WatchlistItem[], title: string) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-12">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strike</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Ask Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/L ($)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/L (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {options.length > 0 ? (
              options.map((item) => {
                const { currentPremium, profitLoss, percentageChange, loading } = calculatePerformance(item);
                const isLoss = profitLoss !== null && profitLoss < 0;
                const profitLossColorClass = profitLoss === null ? '' : isLoss ? 'text-red-600' : 'text-green-600';

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.symbol}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.strike.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(item.expiration), 'yyyy-MM-dd')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.addedPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : currentPremium !== null ? `$${currentPremium.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${profitLossColorClass}`}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : typeof profitLoss === 'number' && !isNaN(profitLoss) ? `$${profitLoss.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${profitLossColorClass}`}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : typeof percentageChange === 'number' && !isNaN(percentageChange) ? `${percentageChange.toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(item.addedDate.toDate(), 'yyyy-MM-dd')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                  No {title.toLowerCase()} found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <Star className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Watchlist</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track and monitor your favorite stocks and options, see real-time performance, and manage your portfolio.
          </p>
        </div>

        {authLoading || loadingWatchlist ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="ml-3 text-lg text-gray-600">Loading watchlist...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-600 text-lg">{error}</p>
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
            {renderTable(activeOptions, "Active Options")}
            {renderTable(expiredOptions, "Expired Options")}
          </>
        )}
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </PageLayout>
  );
} 