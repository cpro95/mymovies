import { Form, useNavigation, type FormMethod } from "@remix-run/react";
import { useFormInputProps } from "remix-params-helper";
import { z } from "zod";

export const searchMovieSchema = z.object({
  query: z.string().min(2, "Minimum length is 2"),
});

export default function SearchForm({
  method,
  action,
}: {
  method?: FormMethod;
  action?: string;
}) {
  const inputProps = useFormInputProps(searchMovieSchema);
  const navigation = useNavigation();

  const isSubmitting =
    navigation.state === "submitting" || navigation.state === "loading";

  return (
    <Form method={method} action={action} replace className="pt-8">
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
            className="block w-full rounded-lg border border-gray-300 bg-dodger-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-dodger-500 focus:ring-dodger-500  dark:border-gray-600 dark:bg-dodger-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-dodger-500 dark:focus:ring-dodger-500"
            placeholder="Search"
            type="text"
            name="query"
          />
        </div>
        <button
          className="rounded-lg border border-dodger-700 bg-dodger-700 p-2.5 text-sm font-medium text-white hover:bg-dodger-800 focus:outline-none focus:ring-4 focus:ring-dodger-300 dark:bg-dodger-600 dark:hover:bg-dodger-600 dark:focus:ring-dodger-800 ml-2"
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
  );
}
