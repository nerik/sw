import fs from "fs/promises";
import path from "path";

const OMDB_API_KEY = 15297694;
const BASE_URL = "http://www.omdbapi.com/";


// get tmdb json path from cmd line args
const tmdbPath = process.argv[2];

const resolvedPath = path.resolve(tmdbPath);
const fileContents = await fs.readFile(resolvedPath, "utf-8");
const jsonData = JSON.parse(fileContents);

async function fetchOmdbRatings(imdbId) {
  const omdbUrl = `${BASE_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}`;
  const omdbData = await fetch(omdbUrl);
  if (!omdbData.ok) {
    console.error(`Error fetching data for ${imdbId}: ${omdbData.statusText}`);
    return null;
  }
  const json = await omdbData.json();
  if (!json.Ratings) return null;
  if (json.Ratings.length === 0) return null;
  return Object.fromEntries(
    json.Ratings.map((rating) => {
      const { Source, Value } = rating;
      return [Source, Value];
    })
  );
}

async function getOMDBRatings() {
  const itemsWithRatings = [];
  for (const item of jsonData) {
    const { type, ...rest } = item;
    if (type === "movie") {
      const ratings = await fetchOmdbRatings(item.imdb);
      itemsWithRatings.push({ ...rest, ratings });
    } else if (type === "show") {
      const episodeWithRatings = [];
      for (const episode of item.items) {
        const ratings = await fetchOmdbRatings(episode.imdb);
        episodeWithRatings.push({ ...episode, ratings });
      }
      itemsWithRatings.push({
        ...rest,
        items: episodeWithRatings,
      
      })

    }
  }
  return itemsWithRatings;
}

const result = await getOMDBRatings();

const jsonString = JSON.stringify(result, null, 2);
console.log(jsonString);
