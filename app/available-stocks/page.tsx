"use client";

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSymbols } from '@/app/hooks/useSymbols';
import { PageLayout } from '../components/PageLayout';

export default function AvailableStocksPage() {
  const { symbols, loading } = useSymbols();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTickers, setFilteredTickers] = useState<string[]>([]);

  // Update filtered tickers when search term or symbols change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTickers(symbols);
    } else {
      const filtered = symbols.filter(
        ticker => ticker.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTickers(filtered);
    }
  }, [searchTerm, symbols]);

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading tickers...</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Available Stocks</CardTitle>
                <CardDescription>
                  Browse and search through all available stocks on our platform
                </CardDescription>
              </div>
              <div className="text-sm text-gray-500">
                Total Stocks and ETFs: {symbols.length}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Search by ticker symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticker Symbol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickers.length > 0 ? (
                    filteredTickers.map((ticker) => (
                      <TableRow key={ticker}>
                        <TableCell className="font-medium">{ticker}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="text-center py-4">No tickers found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
} 