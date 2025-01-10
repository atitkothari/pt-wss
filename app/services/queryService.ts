interface SaveQueryRequest {
  email: string;
  frequency: string;
  filter_data: Array<{
    operation: string;
    field: string;
    value: string | number;
  }>;
}

export const saveQuery = async (queryData: SaveQueryRequest) => {
  const response = await fetch('https://api.wheelstrategyoptions.com/wheelstrat/saveQuery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(queryData),
  });

  if (!response.ok) {
    throw new Error('Failed to save query');
  }

  return response;
}; 