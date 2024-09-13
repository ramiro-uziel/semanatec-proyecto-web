import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  if (!title) {
    return NextResponse.json(
      { error: "Title parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.mangadex.org/manga?title=${encodeURIComponent(title)}`
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch manga data" },
      { status: 500 }
    );
  }
}
