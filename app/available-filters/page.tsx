"use client";

import { useEffect, useState } from 'react';

interface Filter {
  displayName: string;
  key: string;
}

export default function AvailableFiltersPage() {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch('https://wss-py.194.195.92.250.sslip.io/wheelstrat/availableFilters');
        if (!response.ok) {
          throw new Error('Failed to fetch filters');
        }
        const data = await response.json();
        setFilters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load filters');
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  if (loading) {
    return <div className="p-4">Loading filters...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Available Filters</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filters.map((filter) => (
          <div 
            key={filter.key}
            className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">{filter.displayName}</h3>
            <p className="text-sm text-gray-600">Key: {filter.key}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 