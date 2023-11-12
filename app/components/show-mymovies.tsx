import { Link, Form, useSearchParams, useSubmit } from "@remix-run/react";
import { useState } from "react";

import type { GenresType } from "~/models/movies.server";
import type { MyMoviesType } from "~/models/mymovies.server";

function showAllGenres(mymovies: MyMoviesType[]) {
  const allGenres: { id: number; name: string }[] = [];
  mymovies.map((m) => allGenres.push(JSON.parse(m.genres)[0]));
  // console.log("Inside ShowMyMovies & allGenres is ===> ", allGenres);

  const uniqueIds = new Set();

  const unique = allGenres.filter((element: { id: number; name: string }) => {
    const isDuplicate = uniqueIds.has(element.id);

    uniqueIds.add(element.id);

    if (!isDuplicate) {
      return true;
    } else {
      return false;
    }
  });

  // console.log("unique items is ===> ", unique);

  return unique;
}

export default function ShowMyMovies({
  mymovies,
  viewType,
  total_mymovies,
}: {
  mymovies: MyMoviesType[];
  viewType?: string;
  total_mymovies?: string;
}) {
  const [viewGrid, setViewGrid] = useState(false);
  const [viewList, setViewList] = useState(false);

  const genres: { id: number; name: string }[] = showAllGenres(mymovies);
  const [myParams] = useSearchParams();
  // let sort = myParams.get("sort");
  // type paramsType = {
  //   [key: string]: string;
  // };
  type paramsType = Record<string, string>;
  const paramsArray: paramsType[] = [];
  myParams.forEach((value, name) => paramsArray.push({ [name]: value }));
  // console.log(paramsArray);
  paramsArray.map((p, i) => (p.index === "" ? paramsArray.splice(i, 1) : {}));
  // console.log("after splice ===> ", paramsArray);

  const submit = useSubmit();

  function handleChange(e: any) {
    const x = {};
    paramsArray.map((i) => Object.assign(x, i));
    Object.assign(x, { sort: e.target.value });
    // console.log("x ==> ", x);
    submit(x, { replace: true });
  }

  let isListType;
  if (viewType === "list") isListType = true;

  let page = 1;
  let itemsPerPage = 12;
  let query = "";
  paramsArray.map((p) =>
    Object.prototype.hasOwnProperty.call(p, "query")
      ? (query = p.query as string)
      : {},
  );

  paramsArray.map((p) =>
    Object.prototype.hasOwnProperty.call(p, "page")
      ? (page = Number(p.page))
      : {},
  );
  paramsArray.map((p) =>
    Object.prototype.hasOwnProperty.call(p, "itemsPerPage")
      ? (itemsPerPage = Number(p.itemsPerPage))
      : {},
  );
  if (isNaN(page)) page = 1;
  if (isNaN(itemsPerPage)) itemsPerPage = 12;

  return (
    <section className="flex w-full flex-col items-center justify-evenly bg-dodger-100 px-6 py-8 dark:bg-dodger-800 lg:w-10/12 ">
      {/* List of Genres */}
      <div className="mx-auto flex w-full flex-row flex-wrap items-center justify-evenly space-x-8">
        {genres.map((genre) => (
          <Link
            key={genre.id}
            to={`/movies?query=${query}&genreId=${genre.id}&view=${viewType}&page=${page}&itemsPerPage=${itemsPerPage}`}
            className="block font-medium text-gray-500 hover:underline dark:text-gray-300"
          >
            {genre.name}
          </Link>
        ))}
      </div>

      {/* Display Info & Sort & ViewType */}
      <div className="mx-auto my-2 flex w-full items-center justify-around">
        <div className="text-sm uppercase text-gray-500 dark:text-gray-300">
          {mymovies.length} Movies / Total {total_mymovies}
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm">
          {/* <p className="text-gray-500 dark:text-gray-300">Sort</p> */}
          <Form method="get">
            <span className="bg-transparent font-medium text-gray-700 focus:outline-none dark:text-gray-300">
              Sort :
            </span>
            <select
              name="sort"
              onChange={handleChange}
              className="bg-transparent font-medium text-gray-700 focus:outline-none dark:text-gray-300"
            >
              <option value="date">Date</option>
              <option value="ratings">Ratings</option>
            </select>
          </Form>

          <Form method="get">
            <button
              type="submit"
              onMouseEnter={() => setViewList(!viewList)}
              onMouseLeave={() => setViewList(!viewList)}
            >
              <input type="hidden" name="view" value="list" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              <div
                className={`${
                  viewList ? "" : "hidden"
                } tooltip absolute z-10 rounded-lg bg-dodger-800 py-2 px-3 text-sm font-medium text-white shadow-sm dark:bg-dodger-700`}
              >
                List
              </div>
            </button>
          </Form>
          <Form method="get">
            <button
              type="submit"
              onMouseEnter={() => setViewGrid(!viewGrid)}
              onMouseLeave={() => setViewGrid(!viewGrid)}
            >
              <input type="hidden" name="view" value="grid" />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <div
                className={`${
                  viewGrid ? "" : "hidden"
                } tooltip absolute z-10 rounded-lg bg-dodger-800 py-2 px-3 text-sm font-medium text-white shadow-sm dark:bg-dodger-700`}
              >
                Grid
              </div>
            </button>
          </Form>
        </div>
      </div>

      <>
        {isListType ? (
          <div className="mx-auto grid w-full grid-cols-1 items-center gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mymovies
              ? mymovies.map((movie: MyMoviesType) => (
                  <div
                    key={movie.id}
                    className="rounded-lg bg-dodger-50 dark:bg-dodger-900"
                  >
                    <Link
                      key={movie.id}
                      to={`/movies/${movie.movie_id}`}
                      prefetch="intent"
                      className="cursor-pointer hover:scale-105 hover:shadow-2xl"
                    >
                      <div className="mx-auto flex w-full max-w-lg flex-row">
                        {movie.poster_path ? (
                          <img
                            className="w-28 rounded-md object-cover"
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                          />
                        ) : null}
                        <div className="ml-2 flex w-full flex-col justify-between p-2">
                          <div className="text-base dark:text-gray-300">
                            {movie.title}
                          </div>
                          <div className="text-xs dark:text-gray-400">
                            {JSON.parse(movie.genres).map(
                              (g: GenresType) => `${g.name} `,
                            )}
                          </div>
                          <div className="flex flex-row justify-between">
                            <span className="text-xs text-slate-400">
                              {Number(movie.vote_average).toFixed(1)}
                            </span>
                            <span className="text-xs text-slate-400">
                              {movie.release_date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              : null}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mymovies
              ? mymovies.map((movie: MyMoviesType) => (
                  <Link
                    key={movie.id}
                    to={`/movies/${movie.movie_id}`}
                    prefetch="intent"
                    className="cursor-pointer hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="mx-auto flex w-full max-w-lg flex-col">
                      {movie.poster_path ? (
                        <img
                          className="h-72 w-full rounded-md object-cover xl:h-80"
                          src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                          alt={movie.title}
                        />
                      ) : null}
                      <div className="ml-2 flex w-full flex-col items-center justify-between p-2">
                        <h4 className="mt-2 text-center text-lg font-medium text-gray-700 dark:text-gray-300">
                          {movie.title}
                        </h4>
                        <div className="text-xs dark:text-gray-400">
                          {JSON.parse(movie.genres).map(
                            (g: GenresType) => `${g.name} `,
                          )}
                        </div>
                        <div className="flex w-full flex-row justify-around">
                          <span className="text-sm text-slate-400">
                            {Number(movie.vote_average).toFixed(1)}
                          </span>
                          <span className="text-sm text-slate-400">
                            {movie.release_date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              : null}
          </div>
        )}
      </>
    </section>
  );
}
