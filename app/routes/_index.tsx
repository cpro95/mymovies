import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { Layout } from "~/components/layout";
import SearchForm from "~/components/search-form";
import { getPopularMovies, movieType } from "~/models/movies.server";
import { getUser } from "~/session.server";
import { DEFAULT_LANGUAGE, getRandomInt, META_DESCRIPTION } from "~/utils";

interface MyLoaderData {
  email?: string;
  popularMovies?: movieType[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  let userLang = "";
  if (user) {
    userLang = user.TMDB_LANG;
  } else {
    userLang = DEFAULT_LANGUAGE;
  }

  const popularMovies = (await getPopularMovies(userLang)) as movieType[];
  // console.log(popularMovies);

  return json({ popularMovies });
};
export const meta: MetaFunction = () => [
  { title: "myMovies with TMDB API", description: META_DESCRIPTION },
];

export default function Index() {
  const { popularMovies } = useLoaderData() as MyLoaderData;

  // getRandomInt : include min, exclude max
  let mainBackdrop_number = 0;
  let isPopularThere = false;
  if (popularMovies !== undefined) {
    mainBackdrop_number = getRandomInt(0, popularMovies.length);
    isPopularThere = true;
  }

  return (
    <Layout>
      <div className="relative w-full rounded-lg shadow-xl sm:overflow-hidden lg:w-10/12">
        <div className="absolute inset-0">
          {isPopularThere &&
          popularMovies !== undefined &&
          popularMovies[mainBackdrop_number].backdrop_path ? (
            <img
              className="h-full w-full object-cover"
              src={`https://image.tmdb.org/t/p/w1280${popularMovies[mainBackdrop_number].backdrop_path}`}
              alt="main background"
            />
          ) : null}
          <div className="absolute inset-0 bg-[color:rgba(111,111,27,0.5)] mix-blend-multiply" />
        </div>
        <div className="lg:pb-18 relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pt-32">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-4xl">
            <span className="block uppercase text-white drop-shadow-md">
              Welcome
            </span>
          </h1>
          <p className=" mt-6 max-w-lg text-xl text-white sm:max-w-3xl">
            Millions of movies, you loved. Explore now.
          </p>
          <SearchForm method="get" action="/movies/search" />
        </div>
      </div>
      {/* Popular Movies */}
      <div className="flex w-full flex-col p-4 lg:w-10/12">
        <h1 className="text-2xl font-bold dark:text-white">Popular Movies</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {popularMovies !== undefined
            ? popularMovies.map((movie: movieType) => (
                <Link
                  key={movie.id}
                  to={`/movies/${movie.id}`}
                  prefetch="intent"
                  className="cursor-pointer hover:scale-105 hover:shadow-2xl"
                >
                  <div className="mx-auto max-w-xs overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
                    {movie.poster_path ? (
                      <img
                        className="h-72 w-full object-cover sm:h-80 md:h-96"
                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                        alt="poster"
                      />
                    ) : null}

                    <div className="h-28 py-5 text-center">
                      <p className="block text-lg font-semibold text-gray-800 dark:text-white">
                        {movie.title !== undefined
                          ? movie.title
                          : movie.original_name}
                      </p>
                      <span className="text-xs text-gray-700 dark:text-gray-200">
                        {movie.release_date !== undefined
                          ? movie.release_date
                          : movie.first_air_date}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            : null}
        </div>
      </div>
    </Layout>
  );
}
