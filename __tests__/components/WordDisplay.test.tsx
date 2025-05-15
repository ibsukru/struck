import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import WordDisplay from "../../app/components/WordDisplay"
import "@testing-library/jest-dom"

// Mock the fetch function
const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  // Reset mocks before each test
  mockFetch.mockReset()

  // Default success response
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ word: "test-word" }),
  } as Response)
})

// Create a wrapper component with React Query provider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchInterval: false,
      },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe("WordDisplay Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("displays loading state initially", async () => {
    render(<WordDisplay />, { wrapper: createWrapper() })

    expect(screen.getByText("Loading word...")).toBeInTheDocument()
  })

  it("displays the fetched word", async () => {
    render(<WordDisplay />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText("test-word")).toBeInTheDocument()
    })
  })

  it("handles error state with specific error message", async () => {
    // Mock an error response
    mockFetch.mockRejectedValue(new Error("Failed to fetch word"))

    // Create a custom query client with shorter retry delays for testing
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          retryDelay: 1, // Minimal delay for testing
          refetchInterval: false,
        },
      },
    })

    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    render(<WordDisplay />, { wrapper: customWrapper })

    // Wait longer for the error state to appear after retries
    await waitFor(
      () => {
        const errorElement = screen.getByText("Failed to fetch word")
        expect(errorElement).toBeInTheDocument()
      },
      { timeout: 3000 }, // Increase timeout to allow for retries
    )
  })

  it("handles server error responses", async () => {
    // Mock a non-OK response
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Server error" }),
    } as Response)

    // Create a custom query client with shorter retry delays for testing
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          retryDelay: 1, // Minimal delay for testing
          refetchInterval: false,
        },
      },
    })

    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    render(<WordDisplay />, { wrapper: customWrapper })

    // Wait longer for the error state to appear after retries
    await waitFor(
      () => {
        const errorElement = screen.getByText("Server error")
        expect(errorElement).toBeInTheDocument()
      },
      { timeout: 3000 }, // Increase timeout to allow for retries
    )
  })

  it("allows manual refresh", async () => {
    const user = userEvent.setup()

    render(<WordDisplay />, { wrapper: createWrapper() })

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("test-word")).toBeInTheDocument()
    })

    // Set up a new response for the next fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ word: "new-word" }),
    } as Response)

    // Click the refresh button
    const refreshButton = screen.getByText("New Word")
    await user.click(refreshButton)

    // Check if the new word is displayed
    await waitFor(() => {
      // Use queryByRole to specifically target the main word display
      const mainWord = screen.getByRole("heading", { level: 2 })
      expect(mainWord).toHaveTextContent("new-word")
    })
  })

  it("toggles auto-refresh", async () => {
    const user = userEvent.setup()

    render(<WordDisplay />, { wrapper: createWrapper() })

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("test-word")).toBeInTheDocument()
    })

    // Check initial auto-refresh status
    expect(
      screen.getByText("Auto-refresh: Every 10 seconds"),
    ).toBeInTheDocument()

    // Click the pause button
    const pauseButton = screen.getByText("Pause Auto-Refresh")
    await user.click(pauseButton)

    // Check if auto-refresh is paused
    expect(screen.getByText("Auto-refresh: Paused")).toBeInTheDocument()

    // Click the resume button
    const resumeButton = screen.getByText("Resume Auto-Refresh")
    await user.click(resumeButton)

    // Check if auto-refresh is resumed
    expect(
      screen.getByText("Auto-refresh: Every 10 seconds"),
    ).toBeInTheDocument()
  })

  it("maintains word history", async () => {
    const user = userEvent.setup()
    render(<WordDisplay />, { wrapper: createWrapper() })

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("test-word")).toBeInTheDocument()
    })

    // Check if the word is added to history
    await waitFor(() => {
      expect(screen.getByText("Recent Words")).toBeInTheDocument()
      expect(screen.getAllByText("test-word")).toHaveLength(2) // One in main display, one in history
    })

    // Set up a new response for the next fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ word: "second-word" }),
    } as Response)

    // Manually trigger a refetch
    const refreshButton = screen.getByText("New Word")
    await user.click(refreshButton)

    // Check if both words are in history
    await waitFor(() => {
      // Use getAllByText and check length since we expect multiple elements with these texts
      expect(screen.getAllByText("second-word")).toHaveLength(2) // One in main display, one in history
      expect(screen.getAllByText("test-word")).toHaveLength(1) // Only in history now
    })
  })
})
