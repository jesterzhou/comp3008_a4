
import { NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { mockAnimeList } from "../../../data/mockdata.js";

const filePath = path.join(process.cwd(), "data", "userlist.json");

async function getUserList() {
  const data = await readFile(filePath, "utf8");
  return JSON.parse(data);
}

//delete anime from user's my anime list //delete request
export async function DELETE(request) {
  try {
    const { entries } = await request.json();

    if (
      !Array.isArray(entries) ||
      entries.length === 0 ||
      !entries.every(
        (item) =>
          Number.isInteger(item.animeId) &&
          item.animeId > 0 &&
          Number.isInteger(item.seasonNumber) &&
          item.seasonNumber > 0
      )
    ) {
      return NextResponse.json(
        { error: "Invalid anime selection" },
        { status: 400 }
      );
    }

    const userList = await getUserList();

    const selected = new Set(
      entries.map(
        (item) => `${item.animeId}-${item.seasonNumber}`
      )
    );

    const updatedList = userList.filter(
      (anime) =>
        !selected.has(`${anime.animeId}-${anime.seasonNumber}`)
    );

    const deletedCount = userList.length - updatedList.length;

    await writeFile(
      filePath,
      JSON.stringify(updatedList, null, 2),
      "utf8"
    );

    return NextResponse.json({
      success: true,
      deletedCount
    });
  } catch (error) {
    console.error("deleted anime list error:", error);

    return NextResponse.json(
      { error: "Failed to delete anime" },
      { status: 500 }
    );
  }
}

// GET - check if a season exists in the user's list
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const animeIdParam = searchParams.get("animeId");
  const seasonNumberParam = searchParams.get("seasonNumber");

  try {
    const userList = await getUserList();

    // No parameters: return entire user list
    if (animeIdParam === null && seasonNumberParam === null) {
      return NextResponse.json(userList, {
        headers: { "Cache-Control": "no-store" }
      });
    }

    const animeId = Number(animeIdParam);
    const seasonNumber = Number(seasonNumberParam);

    if (
      animeIdParam === null ||
      seasonNumberParam === null ||
      !Number.isInteger(animeId) ||
      animeId <= 0 ||
      !Number.isInteger(seasonNumber) ||
      seasonNumber <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid anime ID or season number" },
        { status: 400 }
      );
    }

    const entry = userList.find(
      (item) =>
        item.animeId === animeId &&
        item.seasonNumber === seasonNumber
    );

    return NextResponse.json({
      inList: Boolean(entry),
      entry: entry ?? null
    });
  } catch (error) {
    console.error("GET anime list error:", error);

    return NextResponse.json(
      { error: "Failed to fetch anime list" },
      { status: 500 }
    );
  }
}

// POST - add or update a season in the user's list
export async function POST(request) {
  try {
    const {
      animeId,
      seasonNumber,
      status,
      episodesWatched,
      userScore
    } = await request.json();

    const anime = mockAnimeList.find(
      (anime) => anime.id === animeId
    );

    const season = anime?.seasons.find(
      (season) => season.number === seasonNumber
    );

    if (!season) {
      return NextResponse.json(
        { error: "Anime season not found" },
        { status: 404 }
      );
    }

    const validStatuses = [
      "Watching",
      "Completed",
      "On-Hold",
      "Dropped"
    ];

    if (
      !validStatuses.includes(status) ||
      !Number.isInteger(episodesWatched) ||
      episodesWatched < 0 ||
      episodesWatched > season.episodes ||
      (userScore !== null &&
        (!Number.isInteger(userScore) ||
          userScore < 1 ||
          userScore > 10))
    ) {
      return NextResponse.json(
        { error: "Invalid list entry" },
        { status: 400 }
      );
    }

    const userList = await getUserList();

    const entry = {
      animeId,
      animeTitle: anime.title,
      seasonNumber,
      seasonTitle: season.title,
      totalEpisodes: season.episodes,
      status,
      episodesWatched,
      userScore
    };

    const existingIndex = userList.findIndex(
      (item) =>
        item.animeId === animeId &&
        item.seasonNumber === seasonNumber
    );

    if (existingIndex === -1) {
      userList.push(entry);
    } else {
      userList[existingIndex] = entry;
    }

    await writeFile(
      filePath,
      JSON.stringify(userList, null, 2),
      "utf8"
    );

    return NextResponse.json({
      inList: true,
      entry
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save anime" },
      { status: 500 }
    );
  }
}
