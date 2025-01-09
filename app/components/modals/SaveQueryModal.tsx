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

interface SaveQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuery: any;
}

export function SaveQueryModal({ isOpen, onClose, currentQuery }: SaveQueryModalProps) {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://api.wheelstrategyoptions.com/wheelstrat/saveQuery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          frequency,
          query: currentQuery
        }),
      });

      if (!response.ok) throw new Error('Failed to save query');

      toast.success("Query saved successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to save query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatQueryDisplay = (query: any) => {
    const displayItems = [];
    if (query.searchTerm) displayItems.push(`Symbol: ${query.searchTerm}`);
    if (query.minYield) displayItems.push(`Min Yield: ${query.minYield}%`);
    if (query.maxPrice) displayItems.push(`Max Strike: $${query.maxPrice}`);
    if (query.minVol) displayItems.push(`Min Volume: ${query.minVol}`);
    if (query.selectedExpiration) displayItems.push(`Expiration: ${query.selectedExpiration}`);
    if (query.strikeFilter !== 'ALL') displayItems.push(`Strike Filter: ${query.strikeFilter}`);
    if (query.deltaFilter) displayItems.push(`Delta Range: ${query.deltaFilter[0]} to ${query.deltaFilter[1]}`);
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