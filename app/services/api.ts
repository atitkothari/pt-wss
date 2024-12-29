import { Option } from "../types/option";

interface Filter {
  operation: string;
  field: string;
  value: string | number;
}

export async function fetchOptionsData(filters: Filter[] = []) {
  const response = await fetch('https://screener-x7jr.onrender.com/wheelstrat/filter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filters }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
}