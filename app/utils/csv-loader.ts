import { promises as fs } from 'fs';
import path from 'path';
import { CoveredCall } from '../types/covered-call';
import { CashSecuredPut } from '../types/cash-secured-put';

export async function loadCoveredCallData(): Promise<CoveredCall[]> {
  const csvPath = path.join(process.cwd(), 'data', 'covered-calls.csv');
  return loadCSVData<CoveredCall>(csvPath);
}

export async function loadCashSecuredPutData(): Promise<CashSecuredPut[]> {
  const csvPath = path.join(process.cwd(), 'data', 'cash-secured-puts.csv');
  return loadCSVData<CashSecuredPut>(csvPath);
}

async function loadCSVData<T>(filePath: string): Promise<T[]> {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const rows = fileContent.trim().split('\n').slice(1); // Skip header row
  
  return rows.map(row => {
    const [
      symbol,
      expiration,
      stock_price,
      strike,
      ask_price,
      yield_percent,
      bid_price,
      volume,
      open_interest
    ] = row.split(',');

    return {
      symbol,
      expiration,
      stock_price: parseFloat(stock_price),
      strike: parseFloat(strike),
      ask_price: parseFloat(ask_price),
      yield_percent: parseFloat(yield_percent),
      bid_price: parseFloat(bid_price),
      volume: parseFloat(volume),
      open_interest: parseFloat(open_interest)
    } as T;
  });
}