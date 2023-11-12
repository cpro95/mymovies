import { DEFAULT_LANGUAGE } from "~/utils";

export interface movieType {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  media_type?: string;
  original_language: string;
  original_title: string;
  original_name?: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  first_air_date?: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface GenresType {
  id: number;
  name: string;
}

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function getPopularMovies(userLang: string = DEFAULT_LANGUAGE) {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1&language=${userLang}`,
  );
  const data = await response.json();

  return data.results;
}

export async function getMovies(
  title?: string | null,
  page?: string | null,
  userLang: string = DEFAULT_LANGUAGE,
) {
  if (!page) {
    page = "1";
  }
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&page=${page}&query=${title}&language=${userLang}`,
  );
  const data = await response.json();
  // console.log(data);
  // const results: movieType[] = data.results;
  return data;
}

export async function getMovieById(
  movieId: string,
  userLang: string = DEFAULT_LANGUAGE,
) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}&language=${userLang}&append_to_response=videos`,
  );

  const data = await response.json();
  return data;
}
