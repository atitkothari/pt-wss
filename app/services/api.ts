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

interface StrikeFilter {
  operation: string;
  field: string;
  value: string | number;
}

export async function fetchOptionsData(
  filters: any[], 
  pageNo: number = 1, 
  pageSize: number = 50,
  sortConfig?: SortConfig,
  strikeFilter?: StrikeFilter,
  optionType: 'call' | 'put' = 'call'
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

  if (strikeFilter) {
    if (strikeFilter === 'THREE_PERCENT') {
      body.filters.push({
        operation: "strikeFilter",
        field: optionType,
        value: 0.03
      });
    } else if (strikeFilter === 'ONE_OUT') {
      body.filters.push({
        operation: "strikeFilter",
        field: optionType
      });
    }
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