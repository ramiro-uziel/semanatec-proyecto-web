// app/api/amazonSearch/route.ts
import { NextResponse } from "next/server";
import { placeholderAmazonData } from "./placeholderAmazonData.js";

const USE_PLACEHOLDER = process.env.USE_PLACEHOLDER_DATA === "true";

export async function POST(request: Request) {
  const { searchTerm } = await request.json();

  if (!searchTerm) {
    return NextResponse.json(
      { message: "Search term is required" },
      { status: 400 }
    );
  }

  if (USE_PLACEHOLDER) {
    console.log("Using placeholder data");
    return NextResponse.json(placeholderAmazonData);
  }

  const API_KEY = process.env.CANOPY_API_KEY;

  if (!API_KEY) {
    return NextResponse.json(
      { message: "API key is not configured" },
      { status: 500 }
    );
  }

  const query = `
    query MyQuery {
      amazonProductSearchResults(input: {searchTerm: "${searchTerm}"}) {
        productResults(input: {}) {
          results {
            price {
              value
            }
            isPrime
            mainImageUrl
            rating
            url
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://graphql.canopyapi.co/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": API_KEY,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    const results = data.data.amazonProductSearchResults.productResults.results;
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching products" },
      { status: 500 }
    );
  }
}
