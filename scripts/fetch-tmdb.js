// Requires Node 18+ for native fetch. If on earlier version, use node-fetch.
const TMDB_API_KEY = "fb83a92a3cb8282e1aed71944106d102";
const BASE_URL = "https://api.themoviedb.org/3";

const STAR_WARS_COLLECTION_ID = 10; // Official "Star Wars Collection" on TMDB

const STAR_WARS_SHOW_IDS = [
  114479, // The Acolyte
  // 202998, // Young Jedi adventures
  // 3122, // Clone wars
  4194, // The Clone Wars
  203085, // Tales of the Jedi
  251091, // Tales of the Empire
  105971, // The Bad Batch
  // 25, // Droids
  83867, // Andor
  92830, // Obi-Wan Kenobi
  60554, // Rebels
  // 3478, // Ewoks
  82856, // The Mandalorian
  115036, // The Book of Boba Fett
  114461, // Ahsoka
  202879, // Skeleton Crew
  79093, // Resistance
  // 157374,  // Star Wars: Visions
];

const STAR_WARS_MOVIE_IDS = [
  330459, // Rogue One
  348350, // Solo
  12180, // The Clone Wars
];

async function fetchTMDB(path) {
  const res = await fetch(
    `${BASE_URL}${path}?api_key=${TMDB_API_KEY}&language=en-US`
  );
  return res.json();
}

async function getStarWarsMovies() {
  const data = await fetchTMDB(`/collection/${STAR_WARS_COLLECTION_ID}`);

  // add movies not part of the main collection like SOlo and Rogue One
  const movieIds = data.parts
    .map((movie) => movie.id)
    .concat(STAR_WARS_MOVIE_IDS);

  const movies = [];
  for (const movieId of movieIds) {
    const movieData = await fetchTMDB(`/movie/${movieId}`);
    const externalIDs = await fetchTMDB(
      `/movie/${movieId}/external_ids`
    );
    movies.push({
      type: "movie",
      id: movieData.id,
      title: movieData.title,
      overview: movieData.overview,
      release_date: movieData.release_date,
      poster: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
      popularity: movieData.popularity,
      rating: movieData.vote_average,
      vote_count: movieData.vote_count,
      runtime: movieData.runtime,
      imdb: externalIDs.imdb_id,
    });
  }

  return movies;
}

async function getTVShow(showId) {
  const showData = await fetchTMDB(`/tv/${showId}`);

  const seasonsData = showData.seasons.filter((s) => s.season_number > 0);

  const show = {
    type: "show",
    id: showData.id,
    title: showData.name,
    overview: showData.overview,
    first_air_date: showData.first_air_date,
    poster: `https://image.tmdb.org/t/p/w500${showData.poster_path}`,
    popularity: showData.popularity,
    rating: showData.vote_average,
    vote_count: showData.vote_count,
    seasons: [],
  };

  for (const season of seasonsData) {
    const seasonEpisodes = [];
    const seasonData = await fetchTMDB(
      `/tv/${showId}/season/${season.season_number}`
    );

    for (const ep of seasonData.episodes) {
      const externalIDs = await fetchTMDB(
        `/tv/${showId}/season/${season.season_number}/episode/${ep.episode_number}/external_ids`
      );
      seasonEpisodes.push({
        type: "episode",
        season: season.season_number,
        episode: ep.episode_number,
        title: ep.name,
        overview: ep.overview,
        release_date: ep.air_date,
        poster: `https://image.tmdb.org/t/p/w500${
          ep.still_path || show.poster_path
        }`,
        rating: ep.vote_average,
        vote_count: ep.vote_count,
        runtime: ep.runtime,
        imdb: externalIDs.imdb_id,
      });
    }
    show.seasons.push({
      season: season.season_number,
      title: season.name,
      overview: season.overview,
      poster: `https://image.tmdb.org/t/p/w500${
        season.poster_path || show.poster
      }`,
      rating: season.vote_average,
      episodes: seasonEpisodes,
    });
  }

  return show;
}

async function getAllStarWarsContent() {
  const movies = await getStarWarsMovies();

  let shows = [];
  for (const showId of STAR_WARS_SHOW_IDS) {
    const show = await getTVShow(showId);
    shows.push(show);
    // console.log(showId, show)
  }

  const allContent = [...movies, ...shows];

  return allContent;
}

getAllStarWarsContent().then((data) => {
  // console.log(JSON.stringify(data, null, 2));
  // console.log(data)
  // Create sections
  const sections = data.map((item) => {
    const section =
      item.type === "movie"
        ? { ...item, items: [item] }
        : {
            ...item, 
            seasons: null,
            items: item.seasons.flatMap((season) => season.episodes),
          };
    return section;
  });

  console.log(JSON.stringify(sections, null, 2));
});
