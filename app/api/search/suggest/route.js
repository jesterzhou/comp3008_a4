import { NextResponse } from "next/server";
import { animeList } from "../../../../data/animes";

//suggest in english even if user types in japanese

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("suggest")?.trim().toLowerCase();

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const results = animeList
      .filter((anime) => {
        const english = anime.title.toLowerCase();
        const romaji = anime.romaji.toLowerCase();

        return (
          english.startsWith(query) ||
          romaji.startsWith(query)
        );
      })
      .slice(0, 10)
      .map((anime) => anime.title);

    return NextResponse.json(results);

  } catch (error) {
    console.error("Suggest API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}