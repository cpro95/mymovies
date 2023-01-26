import { Outlet, Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";

import { requireUserId } from "~/utils/session.server";
import { useUser } from "~/utils/utils";
import { Layout } from "~/components/layout";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  return userId;
};

export default function UsersPage() {
  const user = useUser();
  // console.log(user);

  return (
    <Layout title="settings" linkTo="/users">
      <div className="mx-auto flex w-full flex-col items-start justify-center p-4 text-xl lg:w-10/12">
        <div className="flex flex-col">
          {user.role === "admin" && (
            <Link
              className="rounded bg-red-100 px-2.5 py-0.5 text-center text-xs font-semibold text-red-800 dark:bg-red-200 dark:text-red-900"
              to="/admin"
            >
              Go to Admin Dashboard
            </Link>
          )}
          <Link
            className="block border-b px-2 py-4 text-xl text-gray-700 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-400"
            to={user.id}
          >
            {user.email}
          </Link>
        </div>
        <Outlet />
      </div>
    </Layout>
  );
}
