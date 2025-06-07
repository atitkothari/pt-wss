import { NextResponse } from 'next/server';

interface Option {
  symbol: string;
  type: string;
  strike: number;
  expiration: string;
  bidPrice: number;
  askPrice: number;
  volume: number;
  openInterest: number;
  delta: number;
  impliedVolatility: number;
  probability: number;
  annualizedReturn: number;
  stockPrice: number;
  marketCap: number;
  sector: string;
  industry: string;
  rating: string;
  overallScore: string;
  yieldPercent: number;
}

interface StockSummary {
  symbol: string;
  contractCount: number;
  options: Option[];
  stockPrice: number;
  marketCap: number;
  sector: string;
  industry: string;
  rating: string;
  overallScore: string;
}

export async function GET() {
  try {
    const requestBody = {
      filters: [
        {
          operation: "eq",
          field: "type",
          value: "\"put\""
        },
        {
          operation: "eq",
          field: "symbol",
          value: "\"\""
        },
        {
          operation: "gt",
          field: "volume",
          value: 100
        },
        {
          operation: "gte",
          field: "expiration",
          value: "\"2025-06-06\""
        },
        {
          operation: "lte",
          field: "expiration",
          value: "\"2025-06-13\""
        },
        {
          operation: "gte",
          field: "delta",
          value: -0.3
        },
        {
          operation: "lte",
          field: "delta",
          value: 0.3
        },
        {
          operation: "gte",
          field: "marketCap",
          value: 2000000000
        },
        {
          operation: "sort",
          field: "bidPrice",
          value: "desc"
        },
        {
          operation: "gte",
          field: "bidPrice",
          value: "2"
        }
      ],
      paging: true,
      pageNo: 1,
      pageSize: 5000,
      pageName: "covered_call_screener",
      userId: "h1Mob0LGGnXOYziKQYNENMJqOb73"
    };
    
    const response = await fetch('https://api.wheelstrategyoptions.com/wheelstrat/filter', {
      method: 'POST',
      headers: {
        'X-token': 'abc',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Group options by stock symbol
    const stockMap = new Map<string, StockSummary>();
    
    data.options.forEach((option: Option) => {
      if (!stockMap.has(option.symbol)) {
        stockMap.set(option.symbol, {
          symbol: option.symbol,
          contractCount: 1,
          options: [option],
          stockPrice: option.stockPrice,
          marketCap: option.marketCap,
          sector: option.sector,
          industry: option.industry,
          rating: option.rating,
          overallScore: option.overallScore
        });
      } else {
        const stock = stockMap.get(option.symbol)!;
        stock.contractCount++;
        stock.options.push(option);
      }
    });

    // Convert map to array and sort by contract count
    const stockSummaries = Array.from(stockMap.values())
      .sort((a, b) => b.contractCount - a.contractCount);

    return NextResponse.json({
      totalStocks: stockSummaries.length,
      totalOptions: data.count,
      stocks: stockSummaries
    });
  } catch (error) {
    console.error('Error in wheel strategy API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wheel strategy data' },
      { status: 500 }
    );
  }
} 