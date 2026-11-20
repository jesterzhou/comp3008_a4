
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "../../../../../components/header.jsx";
import { mockAnimeList } from "../../../../../data/mockdata.js";
import AddOrEdit from "../../../../../components/addoredit.jsx";
import Link from "next/link";

async function SeasonContent({ params }) {
  const { id, number } = await params;

  const anime = mockAnimeList.find(
    (anime) => anime.id === Number(id)
  );

  if (!anime) notFound();

  const season = anime.seasons.find(
    (season) => season.number === Number(number)
  );

  if (!season) notFound();

  return (
    <>
      <Header
        title={
          <div className="text-sm">
            {season.title}
            <div className="mt-[2px] text-[12px] text-[#444]">
              {season.romaji}
            </div>
          </div>
        }
      />

      <div div className="w-full flex gap-[17px] mt-[20px] px-[36px]">

        {/* LEFT SIDEBAR */}
        <aside className="w-[247px] shrink-0">

          {/* Season cover */}
          <div className="flex w-full aspect-[247/350] items-center justify-center bg-[#ddd]">
            {season.coverUrl ? (
              <img
                src={season.coverUrl}
                alt={season.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[16px] text-[#aaa]">
                placeholder
              </span>
            )}
          </div>

          {/* Information */}
          <div className="mt-[14px]">
            <h2 className="border-b border-[#bbb] pb-[5px] text-sm font-semibold">
              Information
            </h2>

            <div className="mt-[9px] space-y-[6px] text-xs text-[#444]">
              <p>
                <span className="font-semibold">Type:</span>{" "}
                {season.type}
              </p>

              <p>
                <span className="font-semibold">Episodes:</span>{" "}
                {season.episodes}
              </p>

              <p>
                <span className="font-semibold">Status:</span>{" "}
                {season.status}
              </p>

              <p>
                <span className="font-semibold">Premiered:</span>{" "}
                {season.year}
              </p>

              <p>
                <span className="font-semibold">Studios:</span>{" "}
                {season.studio}
              </p>

              <p>
                <span className="font-semibold">Genres:</span>{" "}
                {season.genres?.join(", ")}
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT */}
        <div className="min-w-0 flex-1">

          {/* BACK TO PARENT ANIMEs */}
          <Link
            href={`/anime/${anime.id}`}
            className="text-xs text-[#1d439b] hover:underline"
          >
            {`<`} {anime.title} (all seasons)
          </Link>

          {/* SEASON TABS */}
          <div className="mt-[14px] flex flex-wrap border-b-2 border-[#3154a1]">

            {anime.seasons.map((otherSeason) => {
              const isActive =
                otherSeason.number === season.number;

              return (
                <Link
                  key={otherSeason.id}
                  href={`/anime/${anime.id}/season/${otherSeason.number}`}
                  className={`px-[9px] py-[5px] text-[13px] transition-colors ${
                    isActive
                      ? "bg-[#3154a1] text-white"
                      : "text-[#1d439b] hover:bg-[#e1e7f3]"
                  }`}
                >
                  Season {otherSeason.number}
                </Link>
              );
            })}

          </div>

          {/* STATISTICS BAR */}
          <div className="mt-[14px] flex flex-wrap items-center justify-between gap-4 border border-[#e5e5e5] bg-[#f7f7f7] px-[14px] py-[14px]">

            <div className="flex min-w-0 flex-wrap items-center gap-[20px]">

              {/* Score */}
              <div className="border-r border-[#ccc] pr-[20px] text-center">

                <div className="bg-[#3154a1] px-[12px] py-[2px] text-[11px] font-semibold text-white">
                  SCORE
                </div>

                <p className="mt-[5px] text-[30px] font-bold leading-none text-black">
                  {season.score.toFixed(2)}
                </p>

                <p className="mt-[5px] text-[10px] text-[#888]">
                  {season.scoredBy.toLocaleString()} users
                </p>

              </div>

              {/* Ranked / Popularity / Members */}
              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-x-[22px] gap-y-[6px]">

                  <p className="text-[16px] text-black">
                    Ranked
                    <span className="font-semibold ml-[6px]">
                    #{season.ranked}
                    </span>
                  </p>

                  <p className="text-[16px] text-black">
                    Popularity
                    <span className="font-semibold ml-[6px]">
                      #{season.popularity}
                    </span>
                  </p>

                  <p className="text-[16px] text-black">
                    Members
                    <span className="font-semibold ml-[6px]">
                      {season.members.toLocaleString()}
                    </span>
                  </p>

                </div>

                {/* Season metadata */}
                <div className="mt-[12px] flex flex-wrap items-center gap-[10px] text-xs text-[#1d439b]">

                  <span>{season.year}</span>

                  <span className="text-[#999]">|</span>

                  <span>{season.type}</span>

                  <span className="text-[#999]">|</span>

                  <span>{season.studio}</span>

                </div>

              </div>
            </div>

            {/* ADD TO LIST BUTTON */}
 
            <AddOrEdit
              animeId={anime.id}
              seasonNumber={season.number}
              title={season.title}
              totalEpisodes={season.episodes}
            />          
            </div>

          {/* SYNOPSIS */}
          <section className="mt-[21px] ">

            <h2 className="border-b border-[#bbb] pb-[5px] text-sm font-semibold">
              Synopsis
            </h2>

            <p className="mt-[8px] pb-[21px] text-[13px] leading-[20px] text-[#444]">
              {season.synopsis}
            </p>

          </section>

          {/* BACKGROUND */}
          <section className="my-[36px]">

            <h2 className="border-b border-[#bbb] pb-[5px] text-sm font-semibold">
              Background
            </h2>

            <p className="mt-[8px] mb-[32px] text-[13px] leading-[20px] text-[#444]">
              {season.background ??
                "No background information available."}
            </p>

          </section>

        </div>
      </div>
    </>
  );
}

export default function Season({ params }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans text-black dark:bg-white">
      <main className="flex w-full flex-col items-center px-32 py-4">

        <Suspense fallback={<p>Loading season...</p>}>
          <SeasonContent params={params} />
        </Suspense>

      </main>
    </div>
  );
}
