'use client';

import { OptionsTableComponent } from "../components/shared/OptionsTableComponent";
import { Footer } from "../components/Footer";
import { NavBar } from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OptionsRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const hasPutParams = Array.from(params.entries()).some(([key]) => key.startsWith('put_'));
    const hasCallParams = Array.from(params.entries()).some(([key]) => key.startsWith('call_'));
    
    // Determine which screener to redirect to
    let redirectPath = '/covered-call-screener'; // default
    if (hasPutParams && !hasCallParams) {
      redirectPath = '/cash-secured-put-screener';
    }

    // Handle old URL format with 'type' parameter
    if (params.has('type')) {
      const type = params.get('type');
      params.delete('type');
      // Convert old parameters to new format
      Array.from(params.entries()).forEach(([key, value]) => {
        if (!key.startsWith('put_') && !key.startsWith('call_')) {
          params.delete(key);
          params.append(`${type}_${key}`, value);
        }
      });
    }

    // Redirect to the appropriate screener with parameters
    router.replace(`${redirectPath}?${params.toString()}`);
  }, [router, searchParams]);

  // Return null or loading state since this will redirect immediately
  return null;
} 