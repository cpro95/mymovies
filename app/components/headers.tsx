import { Link } from "@remix-run/react";
import { useState } from "react";

const home: { to: string; name: string } = {
  to: "/",
  name: "myMovies",
};

const links: { to: string; name: string }[] = [
  {
    to: "/movies",
    name: "Movies",
  },
  {
    to: "/movies/search",
    name: "Search",
  },
];

const SettingSVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

function PlainMenu({ email }: { email: string | undefined }) {
  const menuItemStyle =
    "text-sm mx-1 rounded-lg py-2.5 px-1 text-gray-500 hover:bg-dodger-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-dodger-700 dark:focus:ring-gray-700";

  return (
    <div className="flex w-full items-center justify-between">
      {email !== undefined ? (
        <>
          <Link
            to="/users"
            className="mx-1 rounded-lg py-2.5 px-1 text-sm text-gray-500 hover:bg-dodger-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-dodger-700 dark:focus:ring-gray-700"
          >
            {SettingSVG}
          </Link>
          <form action="/logout" method="post">
            <button type="submit" className={menuItemStyle}>
              Sign out
            </button>
          </form>
        </>
      ) : (
        <Link to="/login" className={menuItemStyle}>
          Sign in
        </Link>
      )}
    </div>
  );
}

export function Headers({
  title,
  linkTo,
  email,
}: {
  title?: string;
  linkTo?: string;
  email?: string;
}) {
  const [show, setShow] = useState<boolean>(true);

  const linkStyle =
    "transform p-2.5 text-gray-600 transition-colors duration-200 hover:text-gray-700 focus:text-gray-700 focus:outline-none dark:text-gray-200 dark:hover:text-gray-400 dark:focus:text-gray-400 md:block";

  return (
    <nav>
      <div className="container mx-auto px-4 py-2">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-700">
              <Link
                to={home.to}
                className="transform text-2xl font-bold text-gray-800 transition-colors duration-200 hover:text-gray-700 dark:text-white dark:hover:text-gray-300 lg:text-3xl"
              >
                {home.name}
              </Link>
              <span className="display border-gray-100 py-2 pr-4 pl-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:hidden md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-dodger-700 md:dark:hover:bg-transparent md:dark:hover:text-white">
                {title ? (
                  <Link
                    to={linkTo ? linkTo : "."}
                    className="transform text-sm font-bold text-gray-800 transition-colors duration-200 hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
                  >
                    {title}
                  </Link>
                ) : (
                  ""
                )}
              </span>
            </div>

            {/* <!-- Mobile menu button --> */}
            <div className="flex items-center justify-evenly md:hidden">
              <PlainMenu email={email} />
              <button
                type="button"
                className="rounded-lg p-2.5 text-sm text-gray-500 hover:bg-dodger-100 hover:text-gray-600 focus:text-gray-600 focus:outline-none dark:text-gray-400 dark:hover:bg-dodger-700 dark:hover:text-gray-400 dark:focus:text-gray-400"
                aria-label="toggle menu"
                onClick={() => {
                  setShow(!show);
                }}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${show ? "hidden" : ""} h-6 w-6`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <svg
                  className={`${!show ? "hidden" : ""} h-6 w-6`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          {/* <!-- Mobile Menu open: "block", Menu closed: "hidden" --> */}
          <div
            className={`${
              !show ? "hidden" : ""
            } flex-1 md:flex md:items-center md:justify-between`}
          >
            <ul className="flex flex-row md:mx-8 md:flex-row md:items-center">
              {links.map((link) => (
                <li key={link.to} className="my-2">
                  <Link to={link.to} className={linkStyle}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 hidden items-center text-gray-700 dark:text-gray-300 md:mt-0 md:flex">
              <PlainMenu email={email} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
