"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import Results from "./results.jsx"
import Header from "../../components/header.jsx";
import SearchBar from "../../components/searchbar.jsx";

function RecentSearches() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searched = searchParams.get("query");

  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("recentSearches") || "[]"
    );

    if (searched?.trim()) {
      const updated = [
        searched.trim(),
        ...saved.filter((s) => s !== searched.trim())
      ].slice(0, 2);

      localStorage.setItem("recentSearches", JSON.stringify(updated));
      setRecentSearches(updated);
    } else {
      setRecentSearches(saved.slice(0, 2));
    }
  }, [searched]);

  return (
    <>
      {recentSearches.length > 0 && (
        <div className="flex justify-center items-center gap-3 w-[800px] text-xs pt-[12px]">
          <p className="text-center">Recent searches:</p>

          <div className="flex gap-5">
            {recentSearches.map((search) => (
              <button

                key={search}
                onClick={() =>
                  router.push(`/search?query=${encodeURIComponent(search)}`)
                }
                className="text-[#3154a1] cursor-pointer hover:underline"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function Search() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-white text-black">
      <main className="flex flex-1 w-full flex-col items-center py-4 px-32">
        <Header />
        <div className="pt-7 pb-4">
          <Suspense>
            <SearchBar
            restore={true}
            className="w-[800px] h-[40px] text-base"
            placeholder="Search anime by English or Japanese title"
            buttonClassName="w-[2.25em] bg-[#3154a1] text-white hover:bg-[#24458b]"
            />

            <RecentSearches />            
          </Suspense>
          </div>

          <Suspense><Results/></Suspense>
      </main>
    </div>
  );
}
