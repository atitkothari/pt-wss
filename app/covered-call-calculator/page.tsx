"use client";

import { useState, useEffect } from 'react';
import { FilterInput } from "../components/filters/FilterInput";
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import { useSymbols } from "../hooks/useSymbols";
import { fetchOptionsData } from "../services/api";
import { format, parseISO, addDays, addMonths, isLastDayOfMonth } from 'date-fns';
import Link from 'next/link';
interface CalculatorResult {
  expiration: string;
  income: number;
  annualizedReturn: number;
  option?: any;
}

export default function CoveredCallCalculatorPage() {
  // Input state (what user types)
  const [inputSymbol, setInputSymbol] = useState<string>('');
  const [inputShares, setInputShares] = useState<number>(100);
  
  // Calculation state (used for results and display)
  const [calculationSymbol, setCalculationSymbol] = useState<string>('');
  const [calculationShares, setCalculationShares] = useState<number>(100);
  
  const [results, setResults] = useState<CalculatorResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
  const { symbols, loading: symbolsLoading } = useSymbols();

  const calculateIncome = async () => {
    if (!inputSymbol) {
      setError("Please enter a stock symbol");
      return;
    }

    if (!inputShares || inputShares < 100) {
      setError("Please enter at least 100 shares");
      return;
    }

    // Update calculation state with current input values
    setCalculationSymbol(inputSymbol);
    setCalculationShares(inputShares);
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch call options for the selected symbol with date range filtering
      const today = new Date();
      const threeMonthsLater = addMonths(today, 3);
      const minVol = 10;
      const filters = [
        { operation: 'eq', field: 'symbol', value: `"${inputSymbol}"` },
        { operation: 'eq', field: 'type', value: '"call"' },
        { operation: 'gte', field: 'expiration', value: `"${format(today, 'yyyy-MM-dd')}"` },
        { operation: 'lte', field: 'expiration', value: `"${format(threeMonthsLater, 'yyyy-MM-dd')}"` },
        { operation: 'gt', field: 'volume', value: minVol },        
      ];

      const result = await fetchOptionsData(filters, 1, 1000, undefined, 'ONE_OUT', 'call');
      
      if (!result.options || result.options.length === 0) {
        setError("No options data found for this symbol");
        setLoading(false);
        return;
      }

      // Group options by expiration date
      const optionsByExpiration = result.options.reduce((acc: any, option: any) => {
        const expirationDate = option.expiration;
        if (!acc[expirationDate]) {
          acc[expirationDate] = [];
        }
        acc[expirationDate].push(option);
        return acc;
      }, {});      

      // Define target timeframes for contracts
      const target14Days = 13; // 2 weeks out
      const target30Days = 30; // 1 month out
      const target60Days = 60; // 2 months out
      
      // First, calculate days to expiry for each contract
      const validContracts = Object.keys(optionsByExpiration)
        .map((expiration, index) => {
          
          const options = optionsByExpiration[expiration];
          if (!options || options.length === 0) return null;
          
          // Sort options by strike price
          options.sort((a: { strikePrice: number; }, b: { strikePrice: number; }) => b.strikePrice - a.strikePrice);
          
          const expiryDate = parseISO(expiration);
          
          // Calculate days to expiry
          const todayTime = today.getTime();
          const expiryTime = expiryDate.getTime();
          const daysToExpiry = Math.ceil((expiryTime - todayTime) / (1000 * 60 * 60 * 24));
          
          // Only include contracts in the future
          if (daysToExpiry <= 0) return null;
          
          return {            
            expiration,
            options,
            daysToExpiry
          };
        })
        .filter(Boolean);
        
      // Sort contracts by days to expiry for better selection
        validContracts.sort((a, b) => a!.daysToExpiry - b!.daysToExpiry);
      
      // Find contracts closest to our target timeframes: 2 weeks, 1 month, and 2 months out
      const findClosestContract = (targetDays: number) => {
        return validContracts.reduce((closest, current) => {
          if (!closest) return current;
          return Math.abs(current!.daysToExpiry - targetDays) < Math.abs(closest.daysToExpiry - targetDays) 
            ? current 
            : closest;
        }, null);
      };
      
      // Get contracts closest to our target timeframes
      const twoWeeksContract = findClosestContract(target14Days);
      const oneMonthContract = findClosestContract(target30Days);
      const twoMonthsContract = findClosestContract(target60Days);

      // Combine the selected contracts, filtering out duplicates
      const selectedContractsMap = new Map();
      
      [twoWeeksContract, oneMonthContract, twoMonthsContract].forEach(contract => {
        if (contract) {
          selectedContractsMap.set(contract.expiration, contract);
        }
      });
      
      // Convert the map to an array
      const selectedContracts = Array.from(selectedContractsMap.values());
      
      // Sort by days to expiry
      selectedContracts.sort((a, b) => a.daysToExpiry - b.daysToExpiry);
      
      // Calculate income for the selected contracts
      const calculatedResults = selectedContracts.map(contract => {
        const options = contract.options;
        const expiryDate = parseISO(contract.expiration);
        const daysToExpiry = contract.daysToExpiry;
          
          // Use the first option for this expiration date
          const option = options.sort((a: { strike: number; },b: { strike: number; })=>a.strike - b.strike)[0];
          const askPrice = isNaN(option.askPrice) ? 0 : option.askPrice || 0;
          const bidPrice = isNaN(option.bidPrice) ? 0 : option.bidPrice || 0;
          const premium = ((askPrice + bidPrice) / 2) * 100;
          
          // Calculate income based on number of contracts (shares / 100)
          const contracts = Math.floor(inputShares / 100);
          const income = premium * contracts;
          
          // Calculate annualized return
          const annualizedReturn = option.annualizedReturn || 0;
          
          // Format expiration date
          const expirationDate = parseISO(contract.expiration);
          const formattedExpiration = format(expirationDate, 'MMM d');
          
          return {
            expiration: formattedExpiration,
            income: income,
            annualizedReturn: annualizedReturn,
            option: option
          };
        })
        .filter(Boolean) as CalculatorResult[];
        console.log(calculatedResults);
      // Sort by expiration date
      calculatedResults.sort((a, b) => {
        return new Date(a.expiration).getTime() - new Date(b.expiration).getTime();
      });
 
      setResults(calculatedResults);
    } catch (err) {
      console.error('Error calculating income:', err);
      setError("Failed to calculate income. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSymbolSelect = (value: string) => {
    setInputSymbol(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-screen-2xl mx-auto p-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-6">Covered Call Calculator</h1>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              Generate income by selling options on stocks you already own.
              Enter a stock symbol and the number of shares you own to see potential income from selling monthly call options within the next 3 months.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <FilterInput
                label="Symbol"
                value={inputSymbol}
                onChange={setInputSymbol}
                placeholder="Enter stock symbol (e.g. AAPL)"
                suggestions={symbols}
                showSuggestions={true}
                onSelect={handleSymbolSelect}
              />
              
              <FilterInput
                label="Number of Shares"
                value={inputShares}
                onChange={setInputShares}
                type="number"
                min="100"
                step="100"
                placeholder="Enter number of shares (100 or more)"
              />
            </div>
            
            <button
              onClick={calculateIncome}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              {loading ? 'Calculating...' : 'Calculate Income'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>
          
          {results.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">{inputSymbol}</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left font-medium">Option Expiration Date</th>
                      <th className="p-3 text-left font-medium">Your Income</th>
                      <th className="p-3 text-left font-medium">Annualized Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <>
                        <tr 
                          key={index} 
                          className="border-b hover:bg-gray-50 cursor-pointer" 
                          onClick={() => setExpandedRowIndex(expandedRowIndex === index ? null : index)}
                        >
                          <td className="p-3">{result.expiration}</td>
                          <td className="p-3">${result.income.toFixed(2)}</td>
                          <td className="p-3">{result.annualizedReturn.toFixed(2)}%</td>
                        </tr>
                        {expandedRowIndex === index && (
                          <tr key={`${index}-expanded`} className="bg-gray-50">
                            <td colSpan={3} className="p-4 border-b">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="font-medium mb-2">Option Details</p>
                                  <p>Strike Price: ${result.option.strike}</p>
                                  <p>Stock Price: ${result.option.stockPrice}</p>
                                  <p>Bid: ${result.option.bidPrice}</p>
                                  <p>Ask: ${result.option.askPrice}</p>
                                </div>
                                <div>
                                  <p className="font-medium mb-2">Additional Info</p>
                                  <p>Volume: {result.option.volume}</p>
                                  <p>Open Interest: {result.option.openInterest}</p>
                                  <p>Implied Volatility: {(result.option.impliedVolatility).toFixed(2)}%</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p>
                With your {calculationShares} shares of {calculationSymbol}, you could pocket an extra ${results[0].income.toFixed(2)} by {results.length > 0 ? results[0].expiration : 'the next few months'} by selling covered calls.
                </p>
                <p className="mt-2">
                  The best part? You can repeat this strategy month after month, creating a consistent income stream from stocks you already own.
                </p>
                <p className="mt-2">
                  Ready to maximize your portfolio's earning potential? <Link href="/options" className="underline font-medium">Try our Options Screener</Link> to find the perfect covered call opportunities and start generating passive income today!
                </p>
              </div>
            </div>
          )}


        </div>
        <Footer />
      </div>
    </div>
  );
}