"use client";

import { useState } from "react";
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

interface SaveQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuery: any;
}

export function SaveQueryModal({ isOpen, onClose, currentQuery }: SaveQueryModalProps) {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatFilterData = (query: any) => {
    const filterData = [];

    // Add type filter using the option type directly
    filterData.push({
      operation: "eq",
      field: "type",
      value: `"${query.option}"`
    });

    // Always add symbol filter
    filterData.push({
      operation: "eq",
      field: "symbol",
      value: query.searchTerm ? `"${query.searchTerm.toUpperCase()}"` : '""'
    });

    // Always add strike price filter
    filterData.push({
      operation: "lt",
      field: "strike",
      value: query.maxPrice ? parseFloat(query.maxPrice) : 100000
    });

    // Always add min yield filter
    filterData.push({
      operation: "gte",
      field: "yield",
      value: query.minYield ? parseFloat(query.minYield) : 0
    });

    // Always add min volume filter
    filterData.push({
      operation: "gte",
      field: "volume",
      value: query.minVol ? parseInt(query.minVol) : 0
    });

    // Always add expiration filter
    filterData.push({
      operation: "eq",
      field: "expiration",
      value: query.selectedExpiration ? `"${query.selectedExpiration}"` : '""'
    });

    // Always add delta filters
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

    // Always add strike filter using the option type
    filterData.push({
      operation: "strikeFilter",
      field: query.option,
      value: query.strikeFilter === 'ITM' ? 1 : query.strikeFilter === 'OTM' ? -1 : 0
    });

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

      await saveQuery(requestBody);
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
    return displayItems;
  };

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
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="frequency" className="text-sm font-medium">
              Alert Frequency
            </label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Query"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 