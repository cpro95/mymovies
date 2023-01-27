import { json } from "@remix-run/node";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import {
  useLoaderData,
  Outlet,
  Link,
  NavLink,
  useSearchParams,
  useTransition,
  Form,
} from "@remix-run/react";

import { notFound } from "~/utils/http.server";
import { getAllNotes, getNoteCount } from "~/models/note.server";
import { getUserId } from "~/utils/session.server";
import { z } from "zod";
import { getSearchParams, useFormInputProps } from "remix-params-helper";
import MyPagination from "~/components/my-pagination";
import { Layout } from "~/components/layout";
import { DEFAULT_LANGUAGE } from "~/utils/utils";

type MyLoaderData = {
  email?: string | undefined;
  notes?: Awaited<ReturnType<typeof getAllNotes>>;
  nbOfNotes?: number | undefined;
};

export const searchNotesSchema = z.object({
  query: z.string().min(2, "Please provide search query!"),
});

export const notesSchema = z.object({
  index: z.void().optional(),
  query: z.string().optional(),
  page: z.string().optional(),
  itemsPerPage: z.string().optional(),
  viewType: z.string().optional(),
});

export const meta: MetaFunction = (props) => {
  // console.log("Inside meta ===>", props);
  if (props.location.pathname === "/notes/new") {
    return {
      title: "Writing in MyMoives!",
    };
  }

  if (props.location.pathname === "/notes") {
    return {
      title: "BBS in MyMoives!",
    };
  }

  if (props.params.noteId !== "") {
    const returnedTitleObjWrappedWithArray = props.data.notes?.filter(
      (note: any) => note.id === props.params.noteId
    );
    if (returnedTitleObjWrappedWithArray.length !== 0)
      return {
        title:
          returnedTitleObjWrappedWithArray[0].title + " in MyMovies Remix App",
        description:
          returnedTitleObjWrappedWithArray[0].title +
          " by " +
          returnedTitleObjWrappedWithArray[0].user.email,
      };
  }

  // default return
  return {
    title: "자유게시판 in MyMoives Remix App",
    description: "자유게시판 in MyMoives Remix App",
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = (await getUserId(request)) as string;

  const loaderQuery = getSearchParams(request, notesSchema);
  // console.log("inside loader ===> ", loaderQuery);

  let page: number = 1;
  let itemsPerPage: number = 12;
  let searchQuery: string = "";
  if (loaderQuery.data?.query && loaderQuery.data?.query !== "") {
    searchQuery = loaderQuery.data?.query;
    // console.log("searchQuery ===> ", searchQuery);
  }

  if (loaderQuery.data?.page && !isNaN(Number(loaderQuery.data?.page)))
    page = Number(loaderQuery.data?.page);

  if (
    loaderQuery.data?.itemsPerPage &&
    !isNaN(Number(loaderQuery.data?.itemsPerPage))
  )
    itemsPerPage = Number(loaderQuery.data?.itemsPerPage);
  // console.log("xxxxxxx =>", page, itemsPerPage);

  const notes = await getAllNotes(searchQuery, page, itemsPerPage);
  const nbOfNotes = await getNoteCount();

  if (!notes) {
    throw notFound(`No Notes & your id ${userId}`);
  }

  return json<MyLoaderData>({ notes, nbOfNotes });
};

export default function NotesPage() {
  const data = useLoaderData() as MyLoaderData;
  // console.log("note data is ====> ", data);
  const [myParams] = useSearchParams();

  type paramsType = {
    [key: string]: string;
  };
  let paramsArray: paramsType[] = [];
  myParams.forEach((value, name) => paramsArray.push({ [name]: value }));
  // console.log("Inside of NotesPage ===> ", paramsArray);
  paramsArray.map((p, i) => (p.index === "" ? paramsArray.splice(i, 1) : {}));
  let viewType = "list";
  paramsArray.map((p) => (p.hasOwnProperty("view") ? (viewType = p.view) : {}));
  // console.log(viewType);

  let query: string = "";
  paramsArray.map((p) => (p.hasOwnProperty("query") ? (query = p.query) : {}));
  let page: number = 1;
  let itemsPerPage: number = 12;
  paramsArray.map((p) =>
    p.hasOwnProperty("page") ? (page = Number(p.page)) : {}
  );
  paramsArray.map((p) =>
    p.hasOwnProperty("itemsPerPage")
      ? (itemsPerPage = Number(p.itemsPerPage))
      : {}
  );
  if (isNaN(page)) page = 1;
  if (isNaN(itemsPerPage)) itemsPerPage = 12;

  const inputProps = useFormInputProps(searchNotesSchema);
  const transition = useTransition();
  let isSubmitting =
    transition.state === "submitting" || transition.state === "loading";

  return (
    <Layout title="notes" linkTo="/notes">
      <div className="flex w-full flex-col items-center justify-center px-2 pb-2 lg:w-10/12">
        <div className="w-full py-4">
          <Link to="new" className="btn-primary mr-2">
            New Note
          </Link>
          <Link to="/notes" className="btn-primary mr-2">
            List Notes
          </Link>
        </div>

        {/* Start Search Component */}
        <Form replace className="flex-cols flex w-full pt-2">
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
        </Form>
        {/* End of Search Component */}

        <div className="w-full pt-4">
          <Outlet />
        </div>

        {data.notes?.length === 0 ? (
          <p className="p-4">No notes yet</p>
        ) : (
          <div className="w-full py-4">
            <ul className="bg-white text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-200">
              {data.notes?.map((note: any) => (
                <li
                  key={note.id}
                  className="flex cursor-pointer flex-row items-center justify-between border-t bg-dodger-50 py-2 text-gray-900 hover:bg-dodger-500 hover:text-gray-900 dark:border-dodger-600 dark:bg-dodger-900 dark:text-gray-300 dark:hover:bg-dodger-600 dark:hover:text-gray-900"
                >
                  <NavLink
                    className={({ isActive }) =>
                      `w-full ${
                        isActive
                          ? "bg-gray-200 px-4 py-2 font-bold underline dark:bg-gray-100 dark:text-gray-700"
                          : ""
                      }`
                    }
                    to={`${note.id}?page=${page}&itemsPerPage=${itemsPerPage}&viewType=${viewType}`}
                  >
                    <div className="flex flex-col">
                      <div className="text-lg">{note.title}</div>
                      <div className="flex flex-row justify-between">
                        <div className="text-xs">
                          {new Date(note.createdAt).toLocaleDateString(
                            DEFAULT_LANGUAGE
                          )}
                        </div>
                        <div className="ml-4 text-xs">{note.user.email}</div>
                      </div>
                    </div>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pagination */}
        <MyPagination
          query={query}
          genreId={0}
          page={page}
          itemsPerPage={itemsPerPage}
          total_pages={Math.ceil(Number(data.nbOfNotes) / itemsPerPage)}
          viewType={viewType}
        />
        {/* Pagination */}
      </div>
    </Layout>
  );
}
