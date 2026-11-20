"use client";

import { useState, useEffect, useRef} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function SearchBar({
  restore=false,
  placeholder = "Search Anime, Manga, and more...",
  className = "w-[360px] h-[26px] text-xs",
  buttonClassName = "w-[20px] min-w-[20px] bg-[#e5eaf5] text-[#234b9c] hover:bg-[#d5dff1]",
}) {

  const router = useRouter();
  const path = usePathname(); // returns "/search" on /search?query=bar

  const [query, setQuery] = useState(""); //what user types into search bar, we need state as it string user types can get longer or shorter
  const [results, setResults] = useState([]); // autocomplete results

  const [loading, setLoading] = useState(false);

  const [suggest, setSuggestions] = useState(true); //toggle suggestions on/off when searching, hide dropdown once user searched

  const searched = useSearchParams().get("query");

  const searchRef = useRef(null);


  useEffect(() => {
    if (path === "/search" && !searched) {
      setQuery("");
      setResults([]);
      setLoading(false);
    }
  }, [path, searched]);


  //onclick search button or enter
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!query.trim()) return;
  
    //clear input fields
    setSuggestions(false);

    if (!restore) {
      setQuery("");
    }
    router.push(`/search?query=${encodeURIComponent(query.trim())}`);
  }

  //if user clicks off searchbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions(false);
        setResults([]);
        setLoading(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  
  //autocomplete suggestions 
  useEffect(() => {
    if (!suggest || !query.trim()) { 
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/search/suggest/?suggest=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (response.ok) {
          setResults(data);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, suggest]); //rerun useEffect whenever either query OR suggest changes
  
  //restore to searchbar if 0 results found
  useEffect(() => {
    if (!restore) return;

    const handleRestore = (event) => {
      if (event.detail) {
        setQuery(event.detail);
      }
    };

    window.addEventListener("restore", handleRestore);

    return () => {
      window.removeEventListener("restore", handleRestore);
    };
  }, [restore]);

  return (
    <div ref={searchRef} className={`relative mx-[7px] shrink-0 max-md:my-[5px] border border-[#c5cde0] ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="flex h-full w-full"
      >
        <input
          type="text"
          name="query"
          value={query}

          //on focus ie mouse click, rerun useEffect (for the saved query state in search bar and to the rerequest suggestions)
          onFocus={() => { 
            setResults([]);
            setSuggestions(true);
          }}

          //any character changes
          onChange={(e) => {
            setQuery(e.target.value);
            setSuggestions(true);
          }}

          placeholder={placeholder}
          autoComplete="off"
          className="h-full min-w-0 flex-1 border-[#c5cde0] bg-white px-[7px] text-xs outline-none focus:border-[#8099cc]"
        />

        <button
          type="submit"
          aria-label="Search"
          className={`flex h-full w-[1em] min-w-[30px] shrink-0 cursor-pointer items-center justify-center ${buttonClassName}`}
        >
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="text-[1em]"
          />
        </button>
      </form>

      {suggest && query.trim() !== "" && (
        <div className="absolute left-0 top-full z-[110] mt-1 w-full border border-[#c5cde0] bg-white shadow-md">
          {loading && (
            <div className="p-2 text-xs text-gray-500">
              Searching...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="p-2 text-xs text-gray-500">
              No results found.
            </div>
          )}


{/* CHANGE ONCLICK SO IT REDIRECTS USER TO PAGE */}
          {!loading && results.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                if (restore) {  // keep selected suggestion in main search bar (not header one)
                  setQuery(result);
                } else {
                  setQuery("");
                }
                setSuggestions(false);
                // Send selected suggestion to the main SearchBar
                window.dispatchEvent(
                  new CustomEvent("restore", {
                    detail: result,
                  })
                );

                router.push(`/search?query=${encodeURIComponent(result)}`);
              }}
              className="block w-full border-b border-gray-100 px-3 py-2 text-left text-xs hover:bg-[#e5eaf5]"
            >
              {result}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}