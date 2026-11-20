
"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faCheck,
  faPause,
  faXmark,
  faStar,
  faMinus,
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faRegularStar } from "@fortawesome/free-regular-svg-icons";

const statuses = [
  {
    value: "Watching",
    icon: faCircle,
    color: "text-blue-500",
    border: "border-blue-500",
    background: "bg-blue-50"
  },
  {
    value: "Completed",
    icon: faCheck,
    color: "text-green-500",
    border: "border-green-500",
    background: "bg-green-50"
  },
  {
    value: "On-Hold",
    icon: faPause,
    color: "text-yellow-500",
    border: "border-yellow-500",
    background: "bg-yellow-50"
  },
  {
    value: "Dropped",
    icon: faXmark,
    color: "text-red-500",
    border: "border-red-500",
    background: "bg-red-50"
  }
];

export default function AddOrEdit({
  animeId,
  seasonNumber,
  title,
  totalEpisodes
}) {
  const [inList, setInList] = useState(false);
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("Watching");
  const [episodesWatched, setEpisodesWatched] = useState(0);
  const [userScore, setUserScore] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  const hasChanges =
      status !== (entry?.status ?? "Watching") ||
      episodesWatched !== (entry?.episodesWatched ?? 0) ||
      userScore !== (entry?.userScore ?? null);

    const canSave = !inList || hasChanges;


  useEffect(() => {
    const controller = new AbortController();

    async function checkList() {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/anime?animeId=${animeId}&seasonNumber=${seasonNumber}`,
          {
            cache: "no-store",
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user list");
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setInList(data.inList);
          setEntry(data.entry);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setError("Failed to check your anime list.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    checkList();

    return () => controller.abort();
  }, [animeId, seasonNumber]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event) {
      if (event.key !== "Escape") return;

      if (showDiscard) {
        setShowDiscard(false);
      } else {
        requestClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, showDiscard, hasChanges, saving]);

  function openModal() {  //reset state of selected status, episodes watched and user selected score /10
    setStatus(entry?.status ?? "Watching");
    setEpisodesWatched(entry?.episodesWatched ?? 0);
    setUserScore(entry?.userScore ?? null);

    setSavedSuccessfully(false);
    setShowDiscard(false);
    setError("");
    setIsOpen(true);
  }

  function changeProgress(value) {
    setEpisodesWatched(
      Math.max(0, Math.min(totalEpisodes, value))
    );
  }

  function changeStatus(value) {
    setStatus(value);

    if (value === "Completed") {
      setEpisodesWatched(totalEpisodes);
      }
    }

    function requestClose() {
      if (saving) return;

      if (hasChanges) {
        setShowDiscard(true);
      } else {
        setIsOpen(false);
      }
    }

    function discardChanges() {
      setShowDiscard(false);
      setIsOpen(false);
      setSavedSuccessfully(false);
    }

  async function saveEntry() {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/anime", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          animeId,
          seasonNumber,
          status,
          episodesWatched,
          userScore
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save anime");
      }

      const data = await response.json();

      setEntry(data.entry);
      setInList(true);
      setSavedSuccessfully(true);

      // show green success message
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      {/* ADD / EDIT BUTTON */}
      <div className="w-[198px] shrink-0 text-center">
        <button
          type="button"
          onClick={openModal}
          disabled={loading || Boolean(error)}
          className="w-full cursor-pointer rounded-[3px] bg-[#3154a1] px-[18px] py-[11px] text-[16px] font-semibold text-white hover:bg-[#24458b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Loading..."
            : inList
              ? "Edit from List"
              : "+ Add to List"}
        </button>

        <p className="mt-[8px] text-[11px] text-[#888]">
          {error && !isOpen
            ? error
            : inList
              ? `In your list: ${entry?.status}`
              : "Not in your list yet"}
        </p>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-[12px]"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            requestClose();
          }
        }}
        >
          
          <div
            aria-label={`Edit ${title}`}
            className="w-full max-w-[720px] max-h-[90vh] overflow-y-auto border border-[#bbb] bg-white text-black shadow-xl"
          >
            {/* HEADER CLOSE BUTTON */}
            <div className="flex min-h-[35px] items-center justify-between bg-[#3154a1] px-[13px] text-white">
              <h2 className="truncate pr-[10px] text-[14px] font-semibold">
                {title}
              </h2>

              <button
                type="button"
                onClick={requestClose}
                disabled={saving}
                className="cursor-pointer text-[18px]"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            {/* CONTENT */}
            <div className="grid grid-cols-1 gap-0 p-[16px] sm:grid-cols-[1fr_1.3fr_1fr]">
              {/* STATUS */}
      
<div className="border-b border-[#eee] px-[12px] pb-[20px] sm:border-b-0 sm:border-r sm:pb-[30px]">
  <h3 className="mb-[12px] text-[13px] font-semibold">
    Status
  </h3>

  <div className="flex flex-col gap-[12px]">
    {statuses.map((item) => {
      const isSelected = status === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => changeStatus(item.value)}
                      className="flex cursor-pointer items-center gap-[10px] text-left"
                    >
                      <span
                        className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border text-[13px] transition-colors ${
                          isSelected
                            ? `${item.border} ${item.background}`
                            : "border-[#bbb] bg-white"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={
                            isSelected
                              ? item.color
                              : "text-[#aaa]"
                          }
                        />
                      </span>

                      <span
                        className={`text-[13px] ${
                          isSelected
                            ? "font-semibold text-[#222]"
                            : "text-[#777]"
                        }`}
                      >
                        {item.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
              {/* EPISODES WATCHED */}
              <div className="border-b border-[#eee] px-[12px] py-[16px] sm:border-b-0 sm:border-r sm:px-[24px] sm:py-0">
                <h3 className="mb-[10px] text-[13px] font-semibold">
                  Episodes watched
                </h3>

                <div className="grid grid-cols-5 gap-[7px]">
                  {Array.from(
                    { length: totalEpisodes },
                    (_, i) => i + 1
                  ).map((episode) => (
                    <button
                      type="button"
                      key={episode}
                      onClick={() => changeProgress(episode)}
                      className={`flex aspect-square cursor-pointer items-center justify-center border text-[12px] ${
                        episode <= episodesWatched
                          ? "border-[#3154a1] bg-[#3154a1] text-white"
                          : "border-[#ccc] bg-white text-[#888] hover:border-[#3154a1]"
                      }`}
                    >
                      {episode}
                    </button>
                  ))}
                </div>

                {/* PROGRESS CONTROLS */}
                <div className="mt-[12px] flex items-center gap-[7px]">
                  <button
                    type="button"
                    onClick={() => changeProgress(episodesWatched - 1)}
                    className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center border border-[#ccc] text-[14px]"
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>

                  <span className="flex h-[30px] min-w-[45px] items-center justify-center border border-[#ccc] text-[13px] font-semibold">
                    {episodesWatched}
                  </span>

                  <button
                    type="button"
                    onClick={() => changeProgress(episodesWatched + 1)}
                    className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center border border-[#ccc] text-[14px]"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>

                  <span className="whitespace-nowrap text-[12px]">
                    / {totalEpisodes} eps
                  </span>
                </div>
              </div>

              {/* SCORE */}
              <div className="px-[12px] pt-[16px] sm:pl-[20px] sm:pt-0">
                <h3 className="mb-[24px] text-[13px] font-semibold">
                  Score
                </h3>

                <div className="grid grid-cols-5 gap-x-[5px] gap-y-[15px]">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(
                    (score) => (
                      <button
                        key={score}
                        type="button"
                        title={`Score: ${score}`}
                        aria-label={`Score ${score}`}
                        onClick={() => setUserScore(score)}
                        className={`cursor-pointer text-[27px] leading-none ${
                          userScore !== null && score <= userScore
                            ? "text-[#e0ae39]"
                            : "text-[#bbb] hover:text-[#e0ae39]"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={
                            userScore !== null && score <= userScore
                              ? faStar
                              : faRegularStar
                          }
                        />
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setUserScore(null)}
                  className="mt-[30px] w-full cursor-pointer border border-[#ccc] px-[8px] py-[6px] text-[12px] text-[#777] hover:bg-[#f3f3f3]"
                >
                  {userScore === null
                    ? "Not scored"
                    : `Score: ${userScore}/10 (Clear)`}
                </button>
              </div>
            </div>


{/* FOOTER */}
<div className="mt-[5px] flex flex-wrap items-center justify-between gap-[12px] border-t border-[#e5e5e5] px-[17px] py-[16px]">

  {/* SAVE STATUS */}
  <div className="flex items-start gap-[9px] text-[12px]">

    <FontAwesomeIcon
      icon={faCircle}
      className={`mt-[4px] text-[10px] ${
        savedSuccessfully && !hasChanges
          ? "text-[#28a745]"
          : hasChanges
            ? "text-[#dc3545]"
            : "text-[#aaa]"
      }`}
    />

    <div>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : savedSuccessfully && !hasChanges ? (
        <>
          <p className="font-semibold text-[#28a745]">
            Saved successfully
          </p>

          <p className="mt-[3px] text-[#888]">
            Season {seasonNumber} is in your list:{" "}
            {status}, {episodesWatched}/{totalEpisodes} episodes,{" "}
            {userScore !== null
              ? `${userScore}/10 score`
              : "Not scored"}
          </p>
        </>
      ) : hasChanges ? (
        <>
          <p className="font-semibold text-[#dc3545]">
            Unsaved changes
          </p>

          <p className="mt-[3px] text-[#888]">
            Click Save to add these changes to your list.
          </p>
        </>
      ) : (
        <p className="text-[#888]">
          No changes
        </p>
      )}
    </div>
  </div>

  {/* x and cancel button */}
  <div className="flex gap-[12px]">
    <button
      type="button"
      onClick={requestClose}
      disabled={saving}
      className="cursor-pointer border border-[#ccc] px-[22px] py-[8px] text-[13px] font-semibold hover:bg-[#eee]"
    >
      Cancel
    </button>

    <button
      type="button"
      onClick={saveEntry}
      disabled={saving || !canSave}
      className="cursor-pointer rounded-[2px] bg-[#3154a1] px-[26px] py-[8px] text-[13px] font-semibold text-white hover:bg-[#24458b] disabled:cursor-not-allowed disabled:bg-[#ddd] disabled:text-[#999]"
    >
      {saving ? "Saving..." : "Save"}
    </button>
  </div>
      </div>
    </div> 
  </div> 
)}

{/* DISCARD CHANGES CONFIRMATION — rendered after the editor modal */}
{showDiscard && (
  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-[12px]">
    <div
      className="w-full max-w-[435px] border border-[#bbb] bg-white text-black shadow-xl"
    >
      <div className="flex min-h-[35px] items-center bg-[#3154a1] px-[13px] text-white">
        <h2 id="discard-title" className="text-[14px] font-semibold">
          Discard changes?
        </h2>
      </div>

      <div className="mx-[14px] my-[24px]">
        <p className="text-[12px] leading-[19px] text-[#444]">
          Your changes to {title} have not been saved. If you discard them,
          your list stays the same.
        </p>
      </div>

      <div className="flex justify-end gap-[8px] px-[14px] pb-[14px]">
        <button
          type="button"
          onClick={discardChanges}
          className="cursor-pointer rounded-[2px] border border-red-500 bg-white px-[22px] py-[8px] text-[13px] font-semibold text-red-600 hover:bg-red-50"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={() => setShowDiscard(false)}
          className="cursor-pointer rounded-[2px] bg-[#3154a1] px-[12px] py-[8px] text-[13px] font-semibold text-white hover:bg-[#24458b]"
        >
          Keep editing
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}