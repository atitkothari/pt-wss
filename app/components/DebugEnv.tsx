'use client';

import { useEffect, useState } from 'react';

export default function DebugEnv() {
  const [env, setEnv] = useState<any>({});

  useEffect(() => {
    setEnv({
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      // Add other env vars you want to check
    });
  }, []);

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', margin: '20px' }}>
      <h2>Environment Variables Debug</h2>
      <pre>{JSON.stringify(env, null, 2)}</pre>
    </div>
  );
} 