"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
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

interface SaveQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuery: any;
}

export function SaveQueryModal({ isOpen, onClose, currentQuery }: SaveQueryModalProps) {
  const { user, loading, error, signInWithGoogle } = useAuth();
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

    filterData.push({
      operation: "eq",
      field: "type",
      value: `"${query.option}"`
    });

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

    // Replace strikeFilter with moneynessRange
    if (query.moneynessRange) {
      filterData.push({
        operation: "strikeFilter",
        field: query.option,
        //value: [query.moneynessRange[0] / 100, query.moneynessRange[1] / 100]
        value: query.moneynessRange[0]/100
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
      `Max Strike: ${query.maxPrice ? `$${query.maxPrice}` : 'No limit'}`,
      `Min Yield: ${query.minYield ? `${query.minYield}%` : '0%'}`,
      `Min Volume: ${query.minVol || '0'}`,
      `Expiration: ${query.selectedExpiration || 'Any'}`,
      `Strike Filter: ${query.strikeFilter || 'ALL'}`,
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
              <DialogDescription>
                Please sign in with your Google account to save queries and set up alerts.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Sign in to access these features:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  <li>Save your search queries</li>
                  <li>Receive email alerts for new matches</li>
                  <li>See all option contracts</li>
                </ul>
              </div>
              
              <Button
                onClick={signInWithGoogle}
                size="lg"
                className="bg-white hover:bg-gray-100 text-gray-900 border shadow-sm flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                {loading ? 'Signing in...' : 'Sign in with Google'}
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