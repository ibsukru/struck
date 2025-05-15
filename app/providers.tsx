"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  // Create a client for each browser session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Set default staleTime to 0 for this application since we want fresh data
            staleTime: 0,
            // Keep data in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry 3 times on failure
            retry: 3,
            // Refetch when window regains focus
            refetchOnWindowFocus: true,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
