import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { baseUrl, apiKey } = await request.json()

    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch models")
    }

    const data = await response.json()
    const models = data.data
      .filter((model: any) => model.id.includes("gpt") || model.id.includes("claude") || model.id.includes("gemini"))
      .map((model: any) => model.id)
      .sort()

    return NextResponse.json({ models })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}
