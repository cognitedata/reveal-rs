import React from 'react';
import { MemoryRouter } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function TestWrapper({ children }: { children: any }) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 60000,
        cacheTime: 60000,
      },
    },
  });

  return (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}
