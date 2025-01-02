import { Option } from "../types/option";

interface Filter {
  operation: string;
  field: string;
  value: string | number;
}

export async function fetchOptionsData(filters: any[], pageNo: number = 1, pageSize: number = 50) {
  const response = await fetch(`https://wss-api.194.195.92.250.sslip.io/wheelstrat/filter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filters,
      paging: true,
      pageNo,
      pageSize
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }

  return response.json();
}