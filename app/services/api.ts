import { Option } from "../types/option";

interface Filter {
  operation: string;
  field: string;
  value: string | number;
}

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc' | null;
}

export async function fetchOptionsData(
  filters: any[], 
  pageNo: number = 1, 
  pageSize: number = 50,
  sortConfig?: SortConfig
) {
  const body: any = {
    filters,
    paging: true,
    pageNo,
    pageSize
  };

  if (sortConfig && sortConfig.direction) {
    body.filters.push({
      operation: "sort",
      field: sortConfig.field,
      value: `${sortConfig.direction}`
    });
  }

  const response = await fetch(`https://wss-api.194.195.92.250.sslip.io/wheelstrat/filter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
}