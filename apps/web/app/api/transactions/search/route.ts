import { NextRequest, NextResponse } from "next/server";
import type { TransactionSearchResponse } from "@pucktree/domain";

const PROVIDER_SERVICE_URL =
  process.env.PROVIDER_SERVICE_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const playerName = searchParams.get("player_name");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  if (!playerName) {
    return NextResponse.json(
      { error: "player_name query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Build query string for Python service
    const params = new URLSearchParams({ player_name: playerName });
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    // Proxy request to Python provider service
    const response = await fetch(
      `${PROVIDER_SERVICE_URL}/internal/transactions/search?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Timeout after 35 seconds (slightly longer than provider timeout)
        signal: AbortSignal.timeout(35000),
      }
    );

    if (!response.ok) {
      console.error(
        `Provider service error: ${response.status} ${response.statusText}`
      );
      return NextResponse.json(
        {
          error: "Provider service error",
          details: `HTTP ${response.status}`,
        },
        { status: 502 }
      );
    }

    const data: TransactionSearchResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Transaction search error:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError" || error.name === "TimeoutError") {
        return NextResponse.json(
          {
            error: "Provider request timed out",
            details: "The transaction lookup took too long to complete",
          },
          { status: 504 }
        );
      }

      if (error.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          {
            error: "Provider service unavailable",
            details:
              "Cannot connect to transaction provider service. Is it running?",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
