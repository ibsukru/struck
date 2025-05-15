import { NextResponse } from "next/server"

// List of possible words
const words = [
  "serendipity",
  "ephemeral",
  "luminous",
  "mellifluous",
  "quintessential",
  "ethereal",
  "resplendent",
  "eloquent",
  "synchronicity",
  "ineffable",
  "nebulous",
  "vivacious",
  "labyrinthine",
  "melancholy",
  "solitude",
  "tranquility",
  "whimsical",
  "zenith",
  "cascade",
  "vellichor",
]

export async function GET() {
  try {
    // Simulate network delay (500-1500ms)
    const delay = Math.floor(Math.random() * 1000) + 500
    await new Promise((resolve) => setTimeout(resolve, delay))

    // Simulate error (10-15% chance)
    const errorChance = Math.random()
    if (errorChance < 0.15) {
      return NextResponse.json(
        { error: "Failed to fetch word" },
        { status: 500 },
      )
    }

    // Return a random word
    const randomIndex = Math.floor(Math.random() * words.length)
    const randomWord = words[randomIndex]

    return NextResponse.json({ word: randomWord })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
