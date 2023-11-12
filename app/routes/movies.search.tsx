import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Link, useLoaderData, useLocation } from "@remix-run/react";
import { z } from "zod";

import { Layout } from "~/components/layout";
import SearchForm from "~/components/search-form";
import SearchPagination from "~/components/search-pagination";
import { getMovies } from "~/models/movies.server";
import type { movieType } from "~/models/movies.server";
import { getUser } from "~/session.server";
import { DEFAULT_LANGUAGE, META_DESCRIPTION } from "~/utils";

export const searchMovieSchema = z.object({
  query: z.string().min(2, "Please provide search query!"),
});

export const meta: MetaFunction = () => [
  {
    title: "Searching Movies with TMDB",
    description: META_DESCRIPTION,
  },
];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const query = formData.get("query");
  let page = formData.get("page") as string;
  // console.log(page);
  if (!page) {
    page = "1";
  }
  return redirect("/movies/search?page=" + page + "&query=" + query);
};

// interface LoaderData {
//   email?: string;
//   userId?: string;
//   movies?: movieType[];
//   data: searchDataType;
// };

interface searchDataType {
  page: number;
  results: movieType[];
  total_pages: number;
  total_results: number;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const userId = user?.id;
  let userLang = "";
  if (user) {
    userLang = user.TMDB_LANG;
  } else {
    userLang = DEFAULT_LANGUAGE;
  }
  const url = new URL(request.url);
  const query = url.searchParams.get("query") as string;
  const page = url.searchParams.get("page") as string;

  //   console.log("inside loader ===> ", query);

  if (query === null) {
    const data = null;
    return json({ userId, data });
  }
  const data: searchDataType = await getMovies(query, page, userLang);
  // console.log(data);
  return json({ userId, data });
};

export default function Index() {
  const location = useLocation();
  const search = location.search;
  const params = new URLSearchParams(search);
  const query = params.get("query") as string;
  // console.log(query);
  // console.log(page);

  const { data } = useLoaderData<typeof loader>();
  // console.log(data);
  let movies;
  if (data !== null) {
    movies = data.results;
  }

  return (
    <Layout title="search" linkTo="/movies/search">
      <div className="w-full px-2 md:w-10/12">
        <SearchForm method="get" action="" />
      </div>
      {/* Search Results */}

      <div className="flex w-full flex-col bg-dodger-100 p-4 px-6 py-8 mt-2 dark:bg-dodger-800 md:w-10/12">
        {data && data.total_results === 0 ? (
          <h1 className="py-2 text-2xl font-bold dark:text-white">
            No Results
          </h1>
        ) : (
          <>
            <h1 className="py-2 text-2xl font-bold dark:text-white">
              {data ? "Search Results" : "No Results"}
            </h1>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {movies
                ? movies.map((movie: movieType) => (
                    <div
                      key={movie.id}
                      className="mx-auto flex w-full max-w-md overflow-hidden rounded-lg bg-dodger-50 shadow-lg dark:bg-dodger-800"
                    >
                      <Link
                        to={`/movies/${movie.id}`}
                        className="flex h-48 w-full cursor-pointer flex-row rounded-md"
                        prefetch="intent"
                      >
                        {movie.poster_path ? (
                          <img
                            className="rounded-md"
                            src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                            alt={movie.title}
                          />
                        ) : null}

                        <div className="w-2/3 p-4 md:p-4">
                          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-300">
                            {movie.title}
                          </h1>

                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {movie.overview?.slice(0, 20)}...
                          </p>

                          <div className="item-center mt-2 flex text-sm dark:text-gray-300">
                            {movie.vote_average}
                          </div>

                          <div className="mt-3 flex-col-reverse justify-start">
                            <h1 className="md:text-md text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {movie.release_date}
                            </h1>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                : null}
            </div>
          </>
        )}
      </div>
      {/* Search Results */}

      {/* Pagination */}
      {data && data.total_results !== 0 ? (
        <SearchPagination
          query={query}
          page={data.page}
          total_pages={data.total_pages}
        />
      ) : (
        <></>
      )}
      {/* Pagination */}
    </Layout>
  );
}
