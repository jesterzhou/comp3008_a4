
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const colours = { //status colours
  Watching: "bg-blue-500",
  Completed: "bg-green-500",
  "On-Hold": "bg-yellow-500",
  Dropped: "bg-red-500"
};

const statuses = [
  "All Anime",
  "Watching",
  "Completed",
  "On-Hold",
  "Dropped"
];

export default function AnimeList() {
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState("All Anime");
    const [search, setSearch] = useState("");
    const router = useRouter();
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [selectedAnime, setSelectedAnime] = useState([]);

    useEffect(() => {
      async function getAnimeList() {
        try {
          const response = await fetch("/api/anime");

          if (!response.ok) {
            throw new Error("Failed to fetch anime list");
          }

          const data = await response.json();

          // console.log("Anime list:", data);
          // console.log("First anime:", data[0]);
          // console.log("Available fields:", Object.keys(data[0] ?? {}));

          setAnimeList(data);
        } catch (error) {
          console.error(error);
          setError("Failed to load your anime list.");
        } finally {
          setLoading(false);
        }
      }

      getAnimeList();
    }, []);

    function toggleSelection(animeId, seasonNumber) {
      const key = `${animeId}-${seasonNumber}`;
      
      setSelectedAnime((prev) =>
        prev.includes(key)
          ? prev.filter((id) => id !== key)
          : [...prev, key]
      );
    }

    async function deleteSelected() {
      if (selectedAnime.length === 0 || deleting) return;

      const confirmed = window.confirm(
        `Are you sure you want to delete ${selectedAnime.length} anime from your list?`
      );

      if (!confirmed) return;

      try {
        setDeleting(true);
        setError("");

        const entries = animeList
          .filter((anime) =>
            selectedAnime.includes(
              `${anime.animeId}-${anime.seasonNumber}`
            )
          )
          .map((anime) => ({
            animeId: anime.animeId,
            seasonNumber: anime.seasonNumber
          }));

        const response = await fetch("/api/anime", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ entries })
        });

        if (!response.ok) {
          throw new Error("Failed to delete selected anime");
        }

        const deletedKeys = new Set(selectedAnime);

        setAnimeList((prev) =>
          prev.filter(
            (anime) =>
              !deletedKeys.has(
                `${anime.animeId}-${anime.seasonNumber}`
              )
          )
        );

      setSelectedAnime([]);

    } catch (error) {
      console.error(error);
      setError("Failed to delete selected anime.");
    } finally {
      setDeleting(false);
    }
  }
  
const filteredAnime = animeList.filter((anime) => {
  const matchesStatus =
    activeStatus === "All Anime" ||
    anime.status === activeStatus;

  const query = search.trim().toLowerCase();

  const titles = [
    anime.animeTitle,
    anime.seasonTitle,
    anime.title
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matchesSearch =
    query === "" || titles.includes(query);

  return matchesStatus && matchesSearch;
});

  return (
    <div className="w-full px-[18px] pt-[12px]">

      <div className="flex min-h-[28px] flex-wrap items-center justify-between gap-2  border-[#b5bdcc]">

        {/* Status tabs */}
        <div className="flex flex-wrap items-center">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={`cursor-pointer px-[12px] py-[6px] text-[12px] transition-colors rounded-2px ${
                activeStatus === status
                  ? "bg-[#3154a1] text-white"
                  : "text-[#1d439b] hover:bg-[#e1e7f3]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search list */}
        <div className="mr-[2px] flex h-[28px] w-[360px] items-center border border-[#c5cde0] bg-white px-[6px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your list"
            className="w-full min-w-0 text-[14px] text-black outline-none placeholder:text-[#888]"
          />

          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="w-[12px] text-[#888]"
          />
        </div>
      </div>

      {/* Anime list */}
      <div className="mt-[15px] min-h-[450px]">

        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <p className="text-[14px] text-[#888]">
              Loading your anime list...
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <p className="text-[14px] text-red-500">
              {error}
            </p>
          </div>
        ) : filteredAnime.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center gap-[10px] text-center">
              <p className="text-[16px] font-semibold text-[#444]">
                {animeList.length === 0
                  ? "Your anime list is empty."
                  : "No matching anime found."}
              </p>

              <p className="text-[14px] text-[#888]">
                {animeList.length === 0
                  ? "Start adding anime to keep track of what you're watching."
                  : "Try a different search or status filter."}
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-x-[35px] gap-y-[16px] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {filteredAnime.map((anime) => {
            const key = `${anime.animeId}-${anime.seasonNumber}`;
            const isSelected = selectedAnime.includes(key);

            return (
              <div key={key} className="relative min-w-0">

                {/* Checkbox */}
                <input
                  type="checkbox"
                  aria-label={`Select ${anime.seasonTitle}`}
                  checked={isSelected}
                  onChange={() =>
                    toggleSelection(anime.animeId, anime.seasonNumber)
                  }
                  className="absolute left-[7px] top-[7px] z-10 h-[15px] w-[15px] cursor-pointer accent-[#3154a1]"
                />

                {/* Anime card */}
                <Link
                  href={`/anime/${anime.animeId}/season/${anime.seasonNumber}`}
                  className="flex flex-col gap-[6px]"
                >
                  {/* Cover placeholder */}
                  <div className="relative flex aspect-[200/285] items-center justify-center bg-[#ddd]">
                    <span className="text-[13px] text-[#aaa]">
                      placeholder
                    </span>

                    {/* Status ribbon */}
                    <div
                      className={`absolute bottom-0 left-0 h-[4px] w-full ${
                        colours[anime.status] ?? "bg-gray-400"
                      }`}
                    />
                  </div>

                  {/* Anime title */}
                  <p className="min-h-[40px] text-[13px] font-semibold text-[#1d439b] hover:underline">
                    {anime.seasonTitle}
                  </p>

                  {/* Anime information */}
                  <div className="mt-[8px]">
                    <p className="text-[12px] text-gray-500">
                      {anime.status} · {anime.episodesWatched}/{anime.totalEpisodes} eps
                    </p>

                    <p className="text-[12px] text-gray-500">
                      {anime.userScore !== null
                        ? `Score: ${anime.userScore}/10`
                        : "Not scored"}
                    </p>
                  </div>
                </Link>
              </div>
            );
        })}          
        </div>
        )}

      </div>
      {/* add delete buttons */}
      <div className="fixed bottom-[64px] right-[64px] z-40 flex items-center gap-[12px]">

        {/* del button - disabled for empty list */}
        <button
          type="button"
          onClick={deleteSelected}
          disabled={selectedAnime.length === 0 || deleting}
          title={
            selectedAnime.length > 0
              ? `Delete ${selectedAnime.length} selected anime`
              : "Select anime to delete"
          }
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-[3px] border border-[#ccc] bg-white text-[#888] hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FontAwesomeIcon
            icon={faTrashCan}
            className="w-[15px]"
          />
        </button>
        {/* Quick add button */}
        <button
          type="button"
          title="Add anime"
          onClick={() => router.push("/search")}
          className="flex h-[53px] w-[53px] cursor-pointer items-center justify-center rounded-full bg-[#3154a1] text-white shadow-sm hover:bg-[#24458b]"
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="text-[22px]"
          />
        </button>


      </div>

    </div>
  );
}
