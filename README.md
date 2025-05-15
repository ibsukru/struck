# Ephemeral Word Display

A Next.js application that displays random words fetched from an API, with automatic refreshing and error handling.

## Main Functionality

- **Random Word API**: Fetches random words from a predefined list with a simulated network delay
- **Auto-Refresh**: Words automatically refresh every 10 seconds
- **Manual Refresh**: Users can manually refresh words with a button click
- **Error Handling**: Gracefully handles API errors with user-friendly messages
- **Word History**: Tracks and displays the last 3-5 unique words that were fetched

## How It Works

1. The application uses React Query to fetch data from the `/api/random-word` endpoint
2. The API has a built-in delay (500-1500ms) to simulate network latency
3. There's a small chance (10-15%) that the API will return an error response
4. The frontend component handles loading states, error states, and displays the fetched word
5. Users can toggle auto-refresh on/off or manually refresh the word

## Getting Started

### Installation

```bash
npm install
```

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Running Tests

To run tests:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

## Code Quality

This project uses Husky pre-commit hooks to ensure code quality. Before each commit, Husky will automatically:

1. Format code using Prettier
2. Lint code using ESLint
3. Run tests to ensure everything is working

This ensures that only high-quality code is committed to the repository.

## Technologies Used

- **Next.js**: React framework for building the application
- **React Query**: For data fetching, caching, and state management
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling the application
- **Jest**: For testing
- **React Testing Library**: For testing React components

## Deploy on Vercel

The easiest way to deploy this Next.js app is to use the [struck.vercel.app](https://struck.vercel.app/).

