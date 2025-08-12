"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { PlausibleEvents, usePlausibleTracker } from '@/app/utils/plausible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { saveQuery } from "@/app/services/queryService";
import { format } from "date-fns";
import { addDays } from "date-fns";

interface SaveQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuery: any;
}

export function SaveQueryModal({ isOpen, onClose, currentQuery }: SaveQueryModalProps) {
  const { user, loading, error, signInWithGoogle } = useAuth();
  const { trackEvent } = usePlausibleTracker();
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const formatFilterData = (query: any) => {
    const filterData = [];

    // Add option type filter
    if (query.option) {
      filterData.push({
        operation: "eq",
        field: "type",
        value: `"${query.option}"`
      });
    }

    filterData.push({
      operation: "eq",
      field: "symbol",
      value: query.searchTerm ? `"${query.searchTerm.toUpperCase()}"` : '""'
    });

    filterData.push({
      operation: "lt",
      field: "strike",
      value: query.maxPrice ? parseFloat(query.maxPrice) : 100000
    });

    filterData.push({
      operation: "gte",
      field: "yieldPercent",
      value: query.minYield ? parseFloat(query.minYield) : 0
    });

    filterData.push({
      operation: "gte",
      field: "volume",
      value: query.minVol ? parseInt(query.minVol) : 0
    });

    if(query.selectedExpiration) {    
      filterData.push({
        operation: "gte",
        field: "expiration",
        value: `"${format(new Date(), 'yyyy-MM-dd')}"`
      });
      filterData.push({
        operation: "lte",
        field: "expiration",
        value: query.selectedExpiration ? `"${query.selectedExpiration}"` : '""'
      });    
    }

    filterData.push(
      {
        operation: "gte",
        field: "delta",
        value: query.deltaFilter ? query.deltaFilter[0] : -1
      },
      {
        operation: "lte",
        field: "delta",
        value: query.deltaFilter ? query.deltaFilter[1] : 1
      }
    );

    // Add moneynessRange filter
    if (query.moneynessRange) {
      filterData.push({
        operation: "strikeFilter",
        field: query.option,
        value: query.moneynessRange[0]/100
      });
      filterData.push({
        operation: "strikeFilter",
        field: query.option,
        value: query.moneynessRange[1]/100
      });
    }
    
    // Add strikePrice filter
    if (query.strikePrice) {
      filterData.push({
        operation: "gte",
        field: "strike",
        value: query.strikePrice[0]
      });
      filterData.push({
        operation: "lte",
        field: "strike",
        value: query.strikePrice[1]
      });
    }
    
    // Add PE Ratio filters
    if (query.peRatio) {
      if (query.peRatio[0] > 0) {
        filterData.push({
          operation: "gte",
          field: "peRatio",
          value: query.peRatio[0]
        });
      }
      if (query.peRatio[1] < 100) {
        filterData.push({
          operation: "lte",
          field: "peRatio",
          value: query.peRatio[1]
        });
      }
    }
    
    // Add Market Cap filters
    if (query.marketCap) {
      if (query.marketCap[0] > 0) {
        filterData.push({
          operation: "gte",
          field: "marketCap",
          value: query.marketCap[0]
        });
      }
      if (query.marketCap[1] < 1000) {
        filterData.push({
          operation: "lte",
          field: "marketCap",
          value: query.marketCap[1]
        });
      }
    }
    
    // Add Moving Average Crossover filter
    if (query.movingAverageCrossover && query.movingAverageCrossover !== 'Any') {
      filterData.push({ 
        operation: "eq", 
        field: "movingAverageCrossover", 
        value: `"${query.movingAverageCrossover}"` 
      });
    }
    
    // Add Sector filter
    if (query.sector && query.sector !== 'All Sectors') {
      filterData.push({ 
        operation: "eq", 
        field: "sector", 
        value: `"${query.sector}"` 
      });
    }
    
    // Add Implied Volatility filter
    if (query.impliedVolatility) {
      if (query.impliedVolatility[0] > 0) {
        filterData.push({
          operation: "gte",
          field: "impliedVolatility",
          value: query.impliedVolatility[0]
        });
      }
      if (query.impliedVolatility[1] < 200) {
        filterData.push({
          operation: "lte",
          field: "impliedVolatility",
          value: query.impliedVolatility[1]
        });
      }
    }

    // Add Days to Expiration filter
    if (query.minDte !== undefined || query.maxDte !== undefined) {
      if (query.minDte !== undefined && query.minDte > 0) {
        // Convert DTE to actual date
        const minDate = addDays(new Date(), query.minDte);
        const minFormattedDate = format(minDate, 'yyyy-MM-dd');
        filterData.push({
          operation: "gte",
          field: "expiration",
          value: `"${minFormattedDate}"`
        });
      }
      if (query.maxDte !== undefined && query.maxDte < 365) {
        // Convert DTE to actual date
        const maxDate = addDays(new Date(), query.maxDte);
        const maxFormattedDate = format(maxDate, 'yyyy-MM-dd');
        filterData.push({
          operation: "lte",
          field: "expiration",
          value: `"${maxFormattedDate}"`
        });
      }
    }

    // Add Yield Range filter
    if (query.yieldRange) {
      if (query.yieldRange[0] > 0) {
        filterData.push({
          operation: "gte",
          field: "yieldPercent",
          value: query.yieldRange[0]
        });
      }
      if (query.yieldRange[1] < 10) {
        filterData.push({
          operation: "lte",
          field: "yieldPercent",
          value: query.yieldRange[1]
        });
      }
    }

    // Add Volume Range filter
    if (query.volumeRange) {
      if (query.volumeRange[0] > 0) {
        filterData.push({
          operation: "gte",
          field: "volume",
          value: query.volumeRange[0]
        });
      }
      if (query.volumeRange[1] < 1000) {
        filterData.push({
          operation: "lte",
          field: "volume",
          value: query.volumeRange[1]
        });
      }
    }

    // Add Probability Range filter
    if (query.probabilityRange) {
      if (query.probabilityRange[0] > 0) {
        filterData.push({
          operation: "gte",
          field: "probability",
          value: query.probabilityRange[0]
        });
      }
      if (query.probabilityRange[1] < 100) {
        filterData.push({
          operation: "lte",
          field: "probability",
          value: query.probabilityRange[1]
        });
      }
    }

    // Add Annualized Return filter
    if (query.annualizedReturn) {
      if (query.annualizedReturn[0] > 0) {
        filterData.push({
          operation: "gte",
          field: "annualizedReturn",
          value: query.annualizedReturn[0]
        });
      }
      if (query.annualizedReturn[1] < 1000) {
        filterData.push({
          operation: "lte",
          field: "annualizedReturn",
          value: query.annualizedReturn[1]
        });
      }
    }

    // Add Excluded Stocks filter
    if (query.excludedStocks && query.excludedStocks.length > 0) {
      filterData.push({
        operation: "exclude",
        field: "symbol",
        value: query.excludedStocks.join(',')
      });
    }

    return filterData;
  };

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const requestBody = {
        email,
        frequency,
        filter_data: formatFilterData(currentQuery)
      };

      // Convert array values to string/number before saving
      const sanitizedRequestBody = {
        ...requestBody,
        filter_data: requestBody.filter_data.map(filter => ({
          operation: filter.operation,
          field: filter.field,
          value: Array.isArray(filter.value) 
            ? JSON.stringify(filter.value) 
            : filter.value
        }))
      };
      await saveQuery(sanitizedRequestBody);
      trackEvent(PlausibleEvents.SaveQuery, {
        frequency,
        filterCount: sanitizedRequestBody.filter_data.length,
      });
      toast.success("Query saved successfully!");
      onClose();
    } catch (error) {
      console.error('Save query error:', error);
      toast.error("Failed to save query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatQueryDisplay = (query: any) => {
    const displayItems = [
      `Option Type: ${query.option === 'put' ? 'Put' : 'Call'}`,
      `Symbol: ${query.searchTerm || 'Any'}`,
      `Strike Price: ${query.strikePrice ? `$${query.strikePrice[0]} to $${query.strikePrice[1]}` : 'Any'}`,
      `Min Yield: ${query.minYield ? `${query.minYield}%` : '0%'}`,
      `Min Volume: ${query.volumeRange ? query.volumeRange[0] : '0'}`,
      `Expiration: ${query.selectedExpiration || 'Any'}`,
      `Strike Filter %: ${query.moneynessRange ? `${query.moneynessRange[0]}% to ${query.moneynessRange[1]}%` : 'Any'}`,
      `Delta Range: ${query.deltaFilter ? `${query.deltaFilter[0]} to ${query.deltaFilter[1]}` : '-1 to 1'}`
    ];
    
    // Add advanced filter display items
    if (query.peRatio) {
      displayItems.push(`P/E Ratio: ${query.peRatio[0]} to ${query.peRatio[1]}`);
    }
    
    if (query.marketCap) {
      displayItems.push(`Market Cap: ${query.marketCap[0]}B to ${query.marketCap[1]}B`);
    }
    
    if (query.sector && query.sector !== 'All Sectors') {
      displayItems.push(`Sector: ${query.sector}`);
    }
    
    if (query.movingAverageCrossover && query.movingAverageCrossover !== 'Any') {
      displayItems.push(`Moving Average: ${query.movingAverageCrossover}`);
    }

    // Add Days to Expiration filter display
    if (query.minDte !== undefined || query.maxDte !== undefined) {
      const dteText = [];
      if (query.minDte !== undefined && query.minDte > 0) {
        dteText.push(`Min: ${query.minDte} days`);
      }
      if (query.maxDte !== undefined && query.maxDte < 365) {
        dteText.push(`Max: ${query.maxDte} days`);
      }
      if (dteText.length > 0) {
        displayItems.push(`Days to Expiration: ${dteText.join(', ')}`);
      }
    }

    // Add Yield Range filter display
    if (query.yieldRange && (query.yieldRange[0] > 0 || query.yieldRange[1] < 10)) {
      const yieldText = [];
      if (query.yieldRange[0] > 0) {
        yieldText.push(`Min: ${query.yieldRange[0]}%`);
      }
      if (query.yieldRange[1] < 10) {
        yieldText.push(`Max: ${query.yieldRange[1]}%`);
      }
      if (yieldText.length > 0) {
        displayItems.push(`Yield Range: ${yieldText.join(', ')}`);
      }
    }

    // Add Volume Range filter display
    if (query.volumeRange && (query.volumeRange[0] > 0 || query.volumeRange[1] < 1000)) {
      const volumeText = [];
      if (query.volumeRange[0] > 0) {
        volumeText.push(`Min: ${query.volumeRange[0]}`);
      }
      if (query.volumeRange[1] < 1000) {
        volumeText.push(`Max: ${query.volumeRange[1]}`);
      }
      if (volumeText.length > 0) {
        displayItems.push(`Volume Range: ${volumeText.join(', ')}`);
      }
    }

    // Add Probability Range filter display
    if (query.probabilityRange && (query.probabilityRange[0] > 0 || query.probabilityRange[1] < 100)) {
      const probText = [];
      if (query.probabilityRange[0] > 0) {
        probText.push(`Min: ${query.probabilityRange[0]}%`);
      }
      if (query.probabilityRange[1] < 100) {
        probText.push(`Max: ${query.probabilityRange[1]}%`);
      }
      if (probText.length > 0) {
        displayItems.push(`Probability: ${probText.join(', ')}`);
      }
    }

    // Add Annualized Return filter display
    if (query.annualizedReturn && (query.annualizedReturn[0] > 0 || query.annualizedReturn[1] < 1000)) {
      const annualizedText = [];
      if (query.annualizedReturn[0] > 0) {
        annualizedText.push(`Min: ${query.annualizedReturn[0]}%`);
      }
      if (query.annualizedReturn[1] < 1000) {
        annualizedText.push(`Max: ${query.annualizedReturn[1]}%`);
      }
      if (annualizedText.length > 0) {
        displayItems.push(`Annualized Return: ${annualizedText.join(', ')}`);
      }
    }

    // Add Excluded Stocks filter display
    if (query.excludedStocks && query.excludedStocks.length > 0) {
      displayItems.push(`Excluded Stocks: ${query.excludedStocks.join(', ')}`);
    }
    
    return displayItems;
  };

  const renderContent = () => {
    if (!isOpen) return null;

    if (!user) {
      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Sign in Required</DialogTitle>              
            </DialogHeader>
            
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Try the wheel strategy screener with all features. After your trial, continue for just $16.50/month (billed annually).
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  <li>Save your search queries</li>
                  <li>Receive email alerts for new matches</li>
                  <li>See all option contracts</li>
                </ul>
              </div>
              <Button
                onClick={() => signInWithGoogle()}
                className="w-full"
              >
                Start your free trial now
              </Button>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Query</DialogTitle>
            <DialogDescription>
              Save this search and receive email alerts when new matches are found.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <div className="font-medium mb-2">Query Details:</div>
            <ul className="space-y-1 text-gray-600">
              {formatQueryDisplay(currentQuery).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={!!user?.email}
                className={user?.email ? "bg-gray-100" : ""}
              />
              {user?.email && (
                <p className="text-xs text-gray-500">
                  Email is automatically set to your Google account email
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <label htmlFor="frequency" className="text-sm font-medium">
                Alert Frequency
              </label>            
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" id="frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily" id="daily">Daily</SelectItem>
                  <SelectItem value="weekly" id="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly" id="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} id="btn_save_query">
              {isSubmitting ? "Saving..." : "Save Query"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return renderContent();
}