
import { NextResponse } from "next/server";
import Fuse from "fuse.js";
import { mockAnimeList } from "../../../../data/mockdata.js";

// Normalize text
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
}

// generate mock data to query
const searchIndex = mockAnimeList.map((anime) => ({
  ...anime,
  normalizedTitle: normalize(anime.title),
  normalizedRomaji: normalize(anime.romaji)
}));

const fuse = new Fuse(searchIndex, {
  keys: ["normalizedTitle", "normalizedRomaji"],
  threshold: 0.32,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 3,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json({
      results: [],
      didYouMean: null
    });
  }

  try {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return NextResponse.json({
        results: [],
        didYouMean: null
      });
    }

    // check original english and japanese titles
    const originalMatches = searchIndex.filter((anime) =>
      anime.title.toLowerCase().startsWith(query.toLowerCase()) ||
      anime.romaji.toLowerCase().startsWith(query.toLowerCase())
    );

    // check normalized english and japanese titles
    const normalizedMatches = originalMatches.length === 0
      ? searchIndex.filter((anime) =>
          anime.normalizedTitle.startsWith(normalizedQuery) ||
          anime.normalizedRomaji.startsWith(normalizedQuery)
        )
      : [];

    // return prefix matches if found
    const prefixMatches =
      originalMatches.length > 0
        ? originalMatches
        : normalizedMatches;

    if (prefixMatches.length > 0) {
const results = prefixMatches.slice(0, 10);
      console.log("Results:", results);
      console.log("Did you mean:", null);

      return NextResponse.json({
        results,
        didYouMean: null
      });
    }

    // fall back to fuzzy search
    const matches = fuse.search(normalizedQuery, {
      limit: 10
    });


    // srong fuzzy matches become results
    const results = matches
      .filter((match) => match.score <= 0.2)
      .slice(0, 10)
      .map((match) => match.item);

    // suggest correction if there are no strong matches
    const didYouMean =
      results.length === 0 &&
      matches.length > 0 &&
      matches[0].score <= 0.33
        ? matches[0].item.title
        : null;

    console.log("Fuzzy matches:", matches);
    console.log("Results:", results);
    console.log("Did you mean:", didYouMean);

    return NextResponse.json({
      results,
      didYouMean
    });

  } catch (error) {
    console.error("Search API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
