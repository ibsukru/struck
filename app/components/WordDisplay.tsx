"use client"

import { useQuery } from "@tanstack/react-query"
import { useState, useEffect, useCallback } from "react"
import { Spinner } from "./Spinner"

// Types for our API response
type WordResponse = {
  word: string
}

type ErrorResponse = {
  error: string
}

// Custom hook for word history
const useWordHistory = (currentWord: string | undefined) => {
  const [wordHistory, setWordHistory] = useState<string[]>([])

  useEffect(() => {
    if (currentWord && !wordHistory.includes(currentWord)) {
      setWordHistory((prev) => {
        const newHistory = [currentWord, ...prev]
        // Keep only the last 5 unique words
        return newHistory.slice(0, 5)
      })
    }
  }, [currentWord, wordHistory])

  return wordHistory
}

// Fetch function for the random word
const fetchRandomWord = async (): Promise<WordResponse> => {
  const response = await fetch("/api/random-word")

  if (!response.ok) {
    const errorData: ErrorResponse = await response.json()
    throw new Error(errorData.error || "Failed to fetch word")
  }

  return response.json()
}

export default function WordDisplay() {
  const [isRefetchingEnabled, setIsRefetchingEnabled] = useState(true)

  // Use React Query to fetch and manage the random word data
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["randomWord"],
    queryFn: fetchRandomWord,
    refetchInterval: isRefetchingEnabled ? 10000 : false, // 10 seconds
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider data stale immediately
    retry: 3,
  })

  // Track word history
  const wordHistory = useWordHistory(data?.word)

  // Handle manual refetch
  const handleManualRefetch = useCallback(() => {
    refetch()
  }, [refetch])

  // Toggle auto-refetch
  const toggleRefetching = useCallback(() => {
    setIsRefetchingEnabled((prev) => !prev)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">Ephemeral Word Display</h1>

      {/* Main word card */}
      <div className="w-full p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 relative">
        {/* Loading indicator for initial load */}
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Loading word...
            </p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-24">
            <p className="text-lg font-medium text-red-500">
              {error instanceof Error
                ? error.message
                : "Could not fetch a new word. Retrying..."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-24 relative">
            {/* Background refetch indicator */}
            {isFetching && !isLoading && (
              <div className="absolute top-0 right-0">
                <Spinner size="small" />
              </div>
            )}
            <h2
              className={`text-4xl font-bold text-center transition-opacity ${
                isFetching && !isLoading ? "opacity-70" : "opacity-100"
              }`}
            >
              {data?.word}
            </h2>
          </div>
        )}
      </div>

      {/* Control buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handleManualRefetch}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isFetching && !isLoading ? (
            <>
              <Spinner size="small" className="mr-2" />
              Refreshing...
            </>
          ) : (
            "New Word"
          )}
        </button>

        <button
          onClick={toggleRefetching}
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
            isRefetchingEnabled
              ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
          }`}
        >
          {isRefetchingEnabled ? "Pause Auto-Refresh" : "Resume Auto-Refresh"}
        </button>
      </div>

      {/* Word history */}
      {wordHistory.length > 0 && (
        <div className="w-full">
          <h3 className="text-xl font-semibold mb-2">Recent Words</h3>
          <ul className="bg-gray-100 dark:bg-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-600">
            {wordHistory.map((word, index) => (
              <li key={`${word}-${index}`} className="px-4 py-2 text-lg">
                {word}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Auto-refresh status */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Auto-refresh: {isRefetchingEnabled ? "Every 10 seconds" : "Paused"}
      </div>
    </div>
  )
}
