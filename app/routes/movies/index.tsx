import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  Form,
  useTransition,
  useSearchParams,
} from "@remix-run/react";

import { prisma as db } from "~/utils/db.server";

import { z } from "zod";
import { getSearchParams, useFormInputProps } from "remix-params-helper";
import type { MyMoviesType } from "~/models/mymovies.server";
import { getMyMoviesCount } from "~/models/mymovies.server";
import ShowMyMovies from "~/components/show-mymovies";
import { Layout } from "~/components/layout";
import { requireUserId } from "~/utils/session.server";
import MyPagination from "~/components/my-pagination";
import { META_DESCRIPTION } from "~/utils/utils";

export const searchMovieSchema = z.object({
  query: z.string().min(2, "Please provide search query!"),
});

export const filterMovieSchema = z.object({
  index: z.void().optional(),
  query: z.string().optional(),
  genreId: z.string().optional(),
  genreName: z.string().optional(),
  sort: z.string().optional(),
  view: z.string().optional(),
  page: z.string().optional(),
  itemsPerPage: z.string().optional(),
});

type MyLoaderData = {
  email?: string;
  userId?: string;
  mymovies: MyMoviesType[];
  total_mymovies: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const query = getSearchParams(request, filterMovieSchema);
  // console.log("inside loader ===> ", query);

  let page: number = 1;
  let itemsPerPage: number = 12;
  if (query.data?.page && !isNaN(Number(query.data?.page)))
    page = Number(query.data?.page);
  if (query.data?.itemsPerPage && !isNaN(Number(query.data?.itemsPerPage)))
    itemsPerPage = Number(query.data?.itemsPerPage);
  // console.log("xxxxxxx =>", page, itemsPerPage);

  // handle sorting
  let orderByOption;
  if (query.success && query.data.hasOwnProperty("sort")) {
    if (query.data.sort === "ratings") {
      orderByOption = {
        orderBy: {
          vote_average: "desc",
        },
      };
    } else {
      orderByOption = {
        orderBy: {
          release_date: "desc",
        },
      };
    }
  } else {
    orderByOption = {
      orderBy: {
        release_date: "desc",
      },
    };
  }

  let x = {};
  let select = {
    select: {
      id: true,
      movie_id: true,
      title: true,
      poster_path: true,
      release_date: true,
      vote_average: true,
      genres: true,
    },
    skip: page === 1 ? 0 : (page - 1) * itemsPerPage,
    take: itemsPerPage,
  };
  let where = { where: { userId: userId } };
  let whereQuery = {
    where: {
      AND: [
        {
          userId: userId,
        },
      ],
      OR: [
        {
          title: {
            contains: query.data?.query,
          },
        },
        {
          original_title: {
            contains: query.data?.query,
          },
        },
      ],
    },
  };
  let whereGenre = {
    where: {
      AND: [
        {
          userId: userId,
        },
        {
          genres: {
            contains: query.data?.genreId,
          },
        },
      ],
    },
  };

  let whereQueryGenre = {
    where: {
      AND: [
        {
          userId: userId,
        },
        {
          genres: {
            contains: query.data?.genreId,
          },
        },
      ],
      OR: [
        {
          title: {
            contains: query.data?.query,
          },
        },
        {
          original_title: {
            contains: query.data?.query,
          },
        },
      ],
    },
  };

  // Default X
  Object.assign(x, select, where, orderByOption);

  // when query false and query.data is nothing
  // when query is sort or view
  if (
    !query.success ||
    (query.success && Object.keys(query.data).length === 0) ||
    (query.success && query.data.hasOwnProperty("sort")) ||
    (query.success && query.data.hasOwnProperty("view"))
  ) {
    x = {};
    Object.assign(x, select, where, orderByOption);
    // console.log(
    // "query false and query.data is nothing, query is sort or view ===>",
    // x
    // );
  }

  // when query.data.query is exist
  if (query.success && query.data.hasOwnProperty("query")) {
    x = {};
    Object.assign(x, select, whereQuery, orderByOption);
    // console.log("when query.data.query is exist ===>", x);
  }

  // when query is only genre
  if (
    query.success &&
    query.data.hasOwnProperty("genreId") &&
    query.data.genreId !== "0"
  ) {
    x = {};
    Object.assign(x, select, whereGenre, orderByOption);
    // console.log("when query is only genre ===>", x);
  }

  // when query is genre + search
  if (
    query.success &&
    query.data.hasOwnProperty("genreId") &&
    query.data.genreId !== "0" &&
    query.data.hasOwnProperty("query")
  ) {
    x = {};
    Object.assign(x, select, whereQueryGenre, orderByOption);
    // console.log("where genre + search ===>", x);
  }

  const mymovies = await db.mymovies.findMany(x);
  const total_mymovies = await getMyMoviesCount(
    userId,
    query.data?.query,
    query.data?.genreId
  );
  // const total_mymovies2 = await db.mymovies.count(x);
  // console.log(total_mymovies2);

  return json({ userId, mymovies, total_mymovies });
};

export const meta: MetaFunction = (props) => {
  return {
    title: "myMovies by TMDB API",
    description: META_DESCRIPTION,
  };
};

export default function MoviesIndex() {
  const { mymovies, total_mymovies } = useLoaderData() as MyLoaderData;
  const [myParams] = useSearchParams();

  type paramsType = {
    [key: string]: string;
  };
  let paramsArray: paramsType[] = [];
  myParams.forEach((value, name) => paramsArray.push({ [name]: value }));

  paramsArray.map((p, i) => (p.index === "" ? paramsArray.splice(i, 1) : {}));
  let viewType = "list";
  paramsArray.map((p) => (p.hasOwnProperty("view") ? (viewType = p.view) : {}));
  // console.log(viewType);

  let page: number = 1;
  let itemsPerPage: number = 12;
  let query: string = "";
  let genreId: number = 0;
  paramsArray.map((p) =>
    p.hasOwnProperty("query") ? (query = p.query as string) : {}
  );
  paramsArray.map((p) =>
    p.hasOwnProperty("page") ? (page = Number(p.page)) : {}
  );
  paramsArray.map((p) =>
    p.hasOwnProperty("itemsPerPage")
      ? (itemsPerPage = Number(p.itemsPerPage))
      : {}
  );
  paramsArray.map((p) =>
    p.hasOwnProperty("genreId") ? (genreId = Number(p.genreId)) : 0
  );
  if (isNaN(page)) page = 1;
  if (isNaN(itemsPerPage)) itemsPerPage = 12;
  if (isNaN(genreId)) genreId = 0;

  const inputProps = useFormInputProps(searchMovieSchema);

  const transition = useTransition();
  let isSubmitting =
    transition.state === "submitting" || transition.state === "loading";

  return (
    <Layout title="movies" linkTo="/movies">
      <div className="w-full px-2 pb-2 lg:w-10/12">
        <Form replace className="flex items-center pt-8">
          {paramsArray.map((p, i) =>
            !p.hasOwnProperty("query") ? (
              <input
                key={i}
                type="hidden"
                name={Object.keys(p)[0]}
                value={p[Object.keys(p)[0]]}
              />
            ) : (
              <div key={i}></div>
            )
          )}
          <div className="flex-cols mx-auto flex w-full">
            <label htmlFor="simple-search" className="sr-only">
              Search
            </label>
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-gray-500 dark:text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <input
                {...inputProps("query")}
                className="search-label"
                placeholder="Search"
                type="text"
                name="query"
              />
            </div>
            <button
              className="search-button ml-2"
              type="submit"
              disabled={isSubmitting}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </button>
          </div>
        </Form>
      </div>
      {/* show my movies */}
      {mymovies.length !== 0 ? (
        <>
          <ShowMyMovies
            mymovies={mymovies}
            viewType={viewType}
            total_mymovies={total_mymovies}
          />

          <MyPagination
            query={query}
            genreId={genreId}
            page={page}
            itemsPerPage={itemsPerPage}
            total_pages={Math.ceil(Number(total_mymovies) / itemsPerPage)}
            viewType={viewType}
          />
        </>
      ) : (
        <h1 className="mt-2 py-2 text-2xl font-bold dark:text-white">
          No Movies yet!
        </h1>
      )}
    </Layout>
  );
}
