
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

function AnimeRow({ anime }) {
    console.log("Anime data:", anime);
  return (
    <div className="flex items-start border-b border-[#c5cde0] px-[12px] py-[12px] text-xs text-black">

      {/* Title / Cover / Description */}
      <div className="flex flex-1 min-w-0 gap-[12px]">

        {/* Cover image */}
      <div className="w-[80px] h-[110px] bg-[#ddd] shrink-0 flex items-center justify-center">
        {anime.coverUrl ? (
          <img
            src={anime.coverUrl}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[#aaa] text-[11px]">
            placeholder
          </span>
        )}
      </div>

        {/* Anime information */}
        <div className="min-w-0">
          <Link
            href={`/anime/${anime.id}`}
            className="text-black font-semibold text-sm hover:underline"
          >
            {anime.title} ↗
          </Link>

          <p className="text-[#444] mt-[3px] text-[12px]">
            Japanese: {anime.romaji}
          </p>

          {/* Seasons */}
        <div className="mt-[8px] flex flex-wrap gap-[8px]">
            {anime.type === "Movie" ? (
              <p className="text-blackw line-clamp-3">
                {anime.synopsis}
              </p>
            ) : (
              <div className="flex flex-wrap gap-[8px]">

                {(anime.seasons ?? []).map((season) => (
                  <Link
                    key={season.id} 
                    href={`/anime/${anime.id}/season/${season.number}`}
                    className="text-[#3154a1] hover:underline mr-[8pt]"
                  >
                    Season {season.number}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Type */}  
      <div className="w-[90px] shrink-0 text-center">
        {anime.type}
      </div>

      {/* Number of seasons */}
      <div className="w-[90px] shrink-0 text-center">
        {anime.seasonCount}
      </div>

      {/* Score */}
      <div className="w-[70px] shrink-0 text-center">
        {anime.score}
      </div>

    </div>
  );
}

export default function Results() {
  const path = usePathname();
  const searched = useSearchParams().get("query");

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [didYouMean, setDidYouMean] = useState(null);
  const [fetchedQuery, setFetchedQuery] = useState(null);

  // Fetch fuzzy search results when the URL query changes
  useEffect(() => {
    if (path !== "/search" || !searched?.trim()) {
      setSearchResults([]);
      setDidYouMean(null);
      setFetchedQuery(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const res = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/search/query?query=${encodeURIComponent(searched)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();
console.log("Did you mean:", data.didYouMean);
        if (controller.signal.aborted) return;

        // API returns { results: [], didYouMean: null }
        setSearchResults(data.results ?? []);
        setDidYouMean(data.didYouMean ?? null);
        setFetchedQuery(searched);

      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Search error:", error);

          setSearchResults([]);
          setDidYouMean(null);
          setFetchedQuery(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    res();

    return () => controller.abort();
  }, [path, searched]);

  // Only display results belonging to the current query
  const isReady =
    !loading &&
    path === "/search" &&
    fetchedQuery === searched;

  // Restore search text when no results are found
  useEffect(() => {
    if (!isReady || !searched?.trim()) return;

    window.dispatchEvent(
      new CustomEvent("restore", {
        detail: searchResults.length === 0 ? searched : "",
      })
    );
  }, [isReady, searchResults, searched]);

  if (!searched?.trim()) return null;

  return (
    <div className="w-full">
    {!loading && searchResults.length === 0 && (
      <div className="mt-[10pt] border-1 rounded-xs border-[#c5cde0] w-[800px] h-[120px] mx-auto text-xs text-black bg-[#e1e7f3]">
        <div className="p-[20px]">
         
          <p className="font-semibold pb-[4px]"> {searchResults.length} results for: "{searched}"</p>
          <p>Check the spelling, or try the English or Japanese title. Your search is still in the box above.</p>
                {didYouMean && (
        <p className="mt-[12px]">
          Did you mean:{" "}
          <Link
            href={`/search?query=${encodeURIComponent(didYouMean)}`}
            className="text-blue-600 font-semibold hover:underline"
          >
            {didYouMean}
          </Link>
        </p>
      )}

        </div>
      </div>
    )}

{!loading && searchResults.length > 0 && (
      <>
        <div className="mx-[18px] mt-[21px] text-xs text-black">
          {searchResults.length} series found for: "
          <span className="font-semibold">{searched}</span>".
          Each series is listed once with all of its seasons.
        </div>

        {/* Results table */}
        <div className="mx-[18px] mt-[10px]">

          {/* Header */}
          <div className="flex bg-[#e1e7f3] px-[12px] py-[7px] text-xs font-semibold text-black">

            <div className="flex-1">
              Title
            </div>

            <div className="w-[90px] text-center">
              Type
            </div>

            <div className="w-[90px] text-center">
              Seasons
            </div>

            <div className="w-[70px] text-center">
              Score
            </div>

          </div>

          {/* Rows */}
          <div className=" border-[#c5cde0]">
            {searchResults.map((anime, index) => (
              <AnimeRow
                key={anime.id ?? `${anime.title}-${index}`}
                anime={anime}
              />
            ))}
          </div>

        </div>
      </>
    )}

  </div>
);}