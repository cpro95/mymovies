import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import ReactPlayer from "react-player/youtube";
import invariant from "tiny-invariant";

import { Alerts } from "~/components/alerts";
import { Layout } from "~/components/layout";
import { getMovieById } from "~/models/movies.server";
import {
  addMyMoviesById,
  deleteMymoviesById,
  getMymoviesById,
} from "~/models/mymovies.server";
import { getUser } from "~/session.server";
import { DEFAULT_LANGUAGE } from "~/utils";

interface MyActionData {
  type: "success" | "error";
  message: string;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("_action");

  switch (actionType) {
    case "add-db": {
      const movie_id = formData.get("movie_id") as string;
      const userId = formData.get("userId") as string;
      const existedMovie = await getMymoviesById(movie_id, userId);

      if (!existedMovie) {
        const title = formData.get("title") as string;
        const original_title = formData.get("original_title") as string;
        const poster_path = formData.get("poster_path") as string;
        const release_date = formData.get("release_date") as string;
        const vote_average = formData.get("vote_average") as string;
        const genres = formData.get("genres") as string;

        const result = await addMyMoviesById(
          movie_id,
          title,
          original_title,
          poster_path,
          release_date,
          genres,
          vote_average,
          userId,
        );
        // console.log("add item to db ===> ", result);

        if (!result) {
          console.log("Error!");
          return {
            messages: "Error has happened when Add to Watched",
            type: "error",
          };
        }
      } else {
        console.log("Already in mymovies Table ===>", existedMovie);
        return { message: "Alreay in the Watched List!", type: "error" };
      }

      return {
        message: "Successfully added to Watched List!",
        type: "success",
      };
    }
    case "delete-db": {
      const movie_id = formData.get("movie_id") as string;
      const userId = formData.get("userId") as string;
      const existedMovie = await getMymoviesById(movie_id, userId);
      if (existedMovie) {
        const result = await deleteMymoviesById(existedMovie.id);
        if (!result) {
          console.log("Error!");
          return {
            message: "Error has happened when Delete to Watched",
            type: "error",
          };
        } else {
          console.log("Deleted in mymovies Table ===>", result.movie_id);
          return { message: "Deleted in the Watched List!", type: "success" };
        }
      } else {
        console.log("Error!");
        return {
          message: "This movie is not in the Watched List",
          type: "error",
        };
      }
    }
  }
};

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.movieId, "expected params.movieId");

  const user = await getUser(request);
  const userId = user?.id;
  let userLang = "";
  if (user) {
    userLang = user.TMDB_LANG;
  } else {
    userLang = DEFAULT_LANGUAGE;
  }

  const movie = await getMovieById(params.movieId, userLang);
  // console.log("Prefetching Movie... -->", movie);

  if (!userId) {
    return json({ movie });
  } else {
    const isMovieinMyMovies = await getMymoviesById(params.movieId, userId);
    // console.log(isMovieinMyMovies);

    return json({ userId, movie, isMovieinMyMovies });
  }
};

interface AddToDBComponentType {
  movie_id: string;
  title: string;
  original_title: string;
  poster_path: string;
  release_date: string;
  genres: string;
  vote_average: string;
  userId: string;
  isMovieinMyMovies: string | null;
}

const AddToDBComponent = (props: AddToDBComponentType) => {
  const {
    movie_id,
    title,
    original_title,
    poster_path,
    release_date,
    genres,
    vote_average,
    userId,
    isMovieinMyMovies,
  } = props;
  // console.log("inside AddToDBComponent ===> ", genres);
  // console.log("userId in component ===>", userId);

  const btnStyle =
    "rounded-lg bg-dodger-600 px-3 py-2 text-center text-xs font-medium text-white hover:bg-dodger-800 focus:outline-none focus:ring-4 focus:ring-dodger-300 dark:bg-dodger-700 dark:text-gray-300 dark:hover:bg-dodger-600 dark:focus:ring-dodger-800";
  return (
    <form method="post">
      <input type="hidden" name="movie_id" value={movie_id} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="original_title" value={original_title} />
      <input type="hidden" name="release_date" value={release_date} />
      <input type="hidden" name="poster_path" value={poster_path} />
      <input type="hidden" name="genres" value={genres} />
      <input type="hidden" name="vote_average" value={vote_average} />
      <input type="hidden" name="userId" value={userId} />

      <div className="container mx-auto mb-2 flex w-full flex-row items-center justify-evenly bg-dodger-200 py-2 dark:bg-dodger-800">
        <h2 className="mx-4 text-lg font-semibold tracking-tight text-gray-700 underline dark:text-gray-300">
          {isMovieinMyMovies === null
            ? "Do you like this movie?"
            : "You like this movie!"}
        </h2>

        {isMovieinMyMovies === null ? (
          <button
            className={btnStyle}
            type="submit"
            name="_action"
            value="add-db"
          >
            Add to my List
          </button>
        ) : (
          <button
            className={btnStyle}
            type="submit"
            name="_action"
            value="delete-db"
          >
            Delete from my List
          </button>
        )}
      </div>
    </form>
  );
};

export default function MovieId() {
  const { userId, movie, isMovieinMyMovies } = useLoaderData<typeof loader>();
  const actionData = useActionData() as MyActionData;
  // console.log(movie.videos.results);

  return (
    <Layout title="movies" linkTo="/movies">
      <section className="relative h-40 w-full shadow-xl sm:h-72 sm:overflow-hidden md:h-80 lg:h-96 lg:w-10/12">
        <div className="absolute flex h-full w-full flex-col items-start justify-end">
          <div className="mb-2 bg-slate-700/60 px-4 text-2xl font-bold text-gray-300">
            {movie.original_title && movie.original_title !== movie.title
              ? `${movie.title} (${movie.original_title})`
              : movie.title}
          </div>
        </div>

        <img
          src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`}
          className="h-40 w-full object-cover sm:h-72 md:h-80 lg:h-96"
          alt={movie.title}
        />
      </section>

      {/* Details Page */}
      <section className="flex w-full flex-col p-4 lg:w-10/12">
        {userId ? (
          <AddToDBComponent
            movie_id={String(movie.id)}
            title={movie.title}
            original_title={movie.original_title}
            poster_path={movie.poster_path ? movie.poster_path : ""}
            release_date={movie.release_date}
            genres={JSON.stringify(movie.genres)}
            vote_average={movie.vote_average}
            userId={userId ? userId : ""}
            isMovieinMyMovies={isMovieinMyMovies}
          />
        ) : (
          ""
        )}
        {actionData ? (
          <Alerts message={actionData.message} type={actionData.type} />
        ) : null}
        {movie.videos &&
        movie.videos.results.length !== 0 &&
        movie.videos.results[movie.videos.results.length - 1].key ? (
          <div className="flex items-center justify-center pb-4 pt-2">
            <ReactPlayer
              controls
              url={`https://www.youtube.com/watch?v=${
                movie.videos.results[movie.videos.results.length - 1].key
              }`}
            />
          </div>
        ) : null}
        <div className="mt-4 px-6 py-2 text-2xl dark:text-gray-200">
          {movie.tagline}
        </div>
        <div className="px-6 py-2">
          {movie.genres
            ? movie.genres.map(({ id, name }: { id: number; name: string }) => (
                <span
                  key={id}
                  className="mr-2 rounded bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-200 dark:text-indigo-900"
                >
                  {name}
                </span>
              ))
            : null}
        </div>
        <div className="px-6 py-2 text-xl leading-10 dark:text-gray-300">
          {movie.overview}
        </div>

        <div className="space-x-4 px-6 py-2">
          <span className="mr-2 rounded bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-800 dark:bg-pink-200 dark:text-pink-900">
            Release : {movie.release_date}
          </span>
          <span className="mr-2 rounded bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-200 dark:text-green-900">
            Rating: {movie.vote_average}
          </span>
        </div>

        <div className="px-6 ">
          {movie.production_companies
            ? movie.production_companies.map(
                ({
                  id,
                  name,
                  origin_country,
                }: {
                  id: number;
                  name: string;
                  origin_country: string;
                }) => (
                  <span
                    key={id}
                    className="mr-2 rounded bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {name}({origin_country})
                  </span>
                ),
              )
            : null}
        </div>
      </section>
    </Layout>
  );
}
