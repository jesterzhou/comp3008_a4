
import { animeList } from "./animes";
import { studios } from "./studios"
import { genres } from "./genres";

let seed = 98765;

function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}

function randomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randomGenres() {
  const count = randomInt(1, 3);
  const available = [...genres];
  const selected = [];

  for (let i = 0; i < count; i++) {
    const index = randomInt(0, available.length - 1);

    selected.push(available[index]);

    // Remove selected genre to prevent duplicates
    available.splice(index, 1);
  }

  return selected;
}

function randomStudio() {
  return studios[randomInt(0, studios.length - 1)];
}


// random score between 6.00 and 9.50
function randomScore() {
  return Number((6 + random() * 3.5).toFixed(2));
}

function randomType() {
  // const types = ["TV", "Movie", "OVA", "ONA"];
  const types = ["TV", "OVA", "ONA"]; //for sake of assignment and PoC disabling movies so we dont have to make another add to list interface since movies dont require selecting episodes watched
  return types[randomInt(0, types.length - 1)];
}

function randomEpisodes(type) {
  switch (type) {
    case "Movie":
      return 1;

    case "TV":
      return randomInt(12, 26);

    case "OVA":
      return randomInt(2, 8);

    case "ONA":
      return randomInt(6, 24);

    case "Special":
      return randomInt(1, 4);

    default:
      return 1; //movie
  }
}

const lorem = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
];

//  random-length synopsis
function randomSynopsis(min = 8, max = 20) {
  const count = randomInt(8, 20);
  const sentences = [];

  for (let i = 0; i < count; i++) {
    const sentence = lorem[randomInt(0, lorem.length - 1)];
    sentences.push(sentence);
  }

  return sentences.join(" ");
}

// remove duplicate titles
const uniqueAnime = [
  ...new Map(
    animeList.map((anime) => [anime.title, anime])
  ).values()
];

export const mockAnimeList = uniqueAnime.map((anime, index) => {
  const type = randomType();
  const isMovie = type === "Movie";
  const studio = randomStudio();
  const animeGenres = randomGenres();

  const seasonCount = isMovie ? "N/A" : randomInt(2, 8); //if type is movie then cannot have season -> N/A else range from 2,8
  const gaps = isMovie
    ? []
    : Array.from(
        { length: seasonCount - 1 },
        () => randomInt(1, 4)
      );

  const totalGapYears = gaps.reduce(
    (total, gap) => total + gap,
    0
  );

  // Ensure the latest season doesn't exceed 2026
  const firstYear = randomInt(
    1996,
    2026 - totalGapYears
  );

  let currentYear = firstYear;

  //SEASONS SEASONS SEASONS
  // generate seasons within each series
  const seasons = isMovie
    ? []
    : Array.from(
        { length: seasonCount },
        (_, seasonIndex) => {
          const number = seasonIndex + 1;
          const isLatestSeason = seasonIndex === seasonCount - 1;

          if (seasonIndex > 0) {
            currentYear += gaps[seasonIndex - 1];
          }

          const members = randomInt(1500, 15000);
          const scoredBy = randomInt(
            Math.max(1, Math.floor(members * 0.3)),
            Math.floor(members * 0.9)
          );

          return {
            id: `${index + 1}-${number}`,
            number,
            title: `${anime.title} Season ${number}`,
            romaji: `${anime.romaji} Season ${number}`,
            type,
            studio,
            genres: animeGenres,

            episodes: randomEpisodes(type),
            score: randomScore(),

            // Season statistics
            members,
            scoredBy,
            popularity: null,
            ranked: null,

            year: currentYear,

            status: isLatestSeason
              ? (random() < 0.5
                  ? "Finished Airing"
                  : "Currently Airing")
              : "Finished Airing",
            coverUrl: null,
            synopsis: randomSynopsis(10, 20),
            background: randomSynopsis(4, 10)
          };
        }
      );
    
    // calculate total episodes
    const totalEpisodes = isMovie
      ? 1
      : seasons.reduce(
          (total, season) => total + season.episodes,
          0
        );


    // calc average score
    const averageScore = isMovie
      ? randomScore()
      : Number(
          (
            seasons.reduce(
              (total, season) => total + season.score,
              0
            ) / seasons.length
          ).toFixed(2)
        );

  // n users who added this anime to their list
  const members = randomInt(1500, 15000);

  // n users who scored the anime
  const scoredBy = randomInt(
    Math.max(1, Math.floor(members * 0.3)),
    Math.floor(members * 0.9)
  );

    return {
      id: index + 1,
      title: anime.title,
      romaji: anime.romaji,
      type,
      studio,
      genres: animeGenres,

      status: isMovie
        ? "Finished Airing"
        : seasons[seasons.length - 1].status,
      score: averageScore,

      popularity: null,
      ranked: null,
      scoredBy,
      members,

      seasonCount: isMovie ? "N/A" : seasons.length, 
      totalEpisodes,
      releaseYear: firstYear,
      coverUrl: null,
      synopsis: randomSynopsis(8, 15),      
      seasons
    };
});


 // rank parent anime by popularity
const popularityRanking = [...mockAnimeList].sort(
  (a, b) => b.members - a.members
);

popularityRanking.forEach((anime, index) => {
  anime.popularity = index + 1;
});

// rank parent anime by score
const scoreRanking = [...mockAnimeList].sort(
  (a, b) => b.score - a.score || b.scoredBy - a.scoredBy
);

scoreRanking.forEach((anime, index) => {
  anime.ranked = index + 1;
});

// get all seasons across every anime
const allSeasons = mockAnimeList.flatMap(
  (anime) => anime.seasons
);

// rank seasons by popularity
const seasonPopularityRanking = [...allSeasons].sort(
  (a, b) => b.members - a.members
);

seasonPopularityRanking.forEach((season, index) => {
  season.popularity = index + 1;
});

// seasons by score
const seasonScoreRanking = [...allSeasons].sort(
  (a, b) => b.score - a.score || b.scoredBy - a.scoredBy
);

seasonScoreRanking.forEach((season, index) => {
  season.ranked = index + 1;
});

