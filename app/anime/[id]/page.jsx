
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "../../../components/header.jsx";
import { mockAnimeList } from "../../../data/mockdata.js";
import Link from "next/link";

async function AnimeContent({ params }) {
  const { id } = await params;

  const anime = mockAnimeList.find(
    (anime) => anime.id === Number(id)
  );

  if (!anime) {
    notFound();
  }

  return (
    <>
      <div className="w-full flex gap-[17px] mt-[20px] px-[36px]">

        {/* LEFT SIDEBAR */}
        <aside className="w-[247px] shrink-0">

          {/* Anime cover */}
          <div className="w-full aspect-[247/350] bg-[#ddd] flex items-center justify-center">
            {anime.coverUrl ? (
              <img
                src={anime.coverUrl}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[#aaa] text-[16px]">
                placeholder
              </span>
            )}
          </div>

          {/* Information */}
          <div className="mt-[14px]">
            <h2 className="text-sm font-semibold border-b border-[#bbb] pb-[5px]">
              Information
            </h2>

            <div className="mt-[9px] text-xs text-[#444] space-y-[6px]">
              <p>
                <span className="font-semibold">Type:</span> {anime.type}
              </p>

              <p>
                <span className="font-semibold">Seasons:</span> {anime.seasonCount}
              </p>
  
              <p>
                <span className="font-semibold">Episodes:</span> {anime.totalEpisodes} in total
              </p>

              <p>
                <span className="font-semibold">Studios:</span> {anime.studio}
              </p>            

              <p>
                <span className="font-semibold">Genres:</span> {anime.genres.join(", ")}
              </p>

            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <div className="flex-1 min-w-0">

          {/* Back navigation */}
          <Link
            href="/search"
            className="text-[#1d439b] text-xs hover:underline"
          >
            {`<`} Back to search results
          </Link>

          {/* Synopsis */}
          <section className="mt-[12px]">
            <h2 className="text-sm font-semibold border-b border-[#bbb] pb-[5px]">
              Synopsis
            </h2>

            <p className="mt-[9px] text-[13px] leading-[20px] text-[#444]">
              {anime.synopsis}
            </p>
          </section>

          {/* SEASONS */}
          {anime.seasons.length > 0 && (
            <section className="mt-[36px]">

              <h2 className="text-sm font-semibold border-b border-[#bbb] pb-[5px]">
                Seasons
              </h2>

              <p className="mt-[14px] text-xs text-[#888]">
                Pick a season to see its details and add it to your list.
              </p>

              {/* Season grid */}
              <div className="mt-[10px] grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-[22px] gap-y-[24px]">

                {anime.seasons.map((season) => (
                  <div key={season.id} className="min-w-0">

                    {/* Season cover */}
                    <Link
                      href={`/anime/${anime.id}/season/${season.number}`}
                      className="block"
                    >
                      <div className="w-full aspect-[200/285] bg-[#ddd] flex items-center justify-center hover:opacity-80 transition-opacity">

                        {season.coverUrl ? (
                          <img
                            src={season.coverUrl}
                            alt={season.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#aaa] text-[16px]">
                            placeholder
                          </span>
                        )}

                      </div>
                    </Link>

                    {/* Season title */}
                    <Link
                      href={`/anime/${anime.id}/season/${season.number}`}
                      className="block mt-[8px] text-[13px] font-semibold text-[#1d439b] hover:underline"
                    >
                      Season {season.number}
                    </Link>

                    {/* Season metadata */}
                    <p className="mt-[4px] text-[11px] text-[#888]">
                      {season.type}, {season.year}, {season.episodes} eps
                    </p>

                    {/* Airing status */}
                    <p
                      className={`mt-[4px] text-[11px] ${
                        season.status === "Currently Airing"
                          ? "text-[#1d439b] font-semibold"
                          : "text-[#888]"
                      }`}
                    >
                      {season.status}
                    </p>

                  </div>
                ))}

              </div>
            </section>
          )}

        </div>
      </div>
    </>
  );
}

export default async function Anime({ params }) {
  const { id } = await params;

  const anime = mockAnimeList.find(
    (anime) => anime.id === Number(id)
  );

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-white text-black">
      <main className="flex flex-1 w-full flex-col items-center py-4 px-32">
        <Suspense fallback={null}>
          <Header title={<div className="text-sm"> {anime.title} <div className="text-[12px] mt-[2px] text-[#444]">{anime.romaji}</div></div>}/>
        </Suspense>

        <Suspense fallback={<p>Loading anime...</p>}>
          <AnimeContent params={params} />
        </Suspense>

      </main>
    </div>
  );
}
