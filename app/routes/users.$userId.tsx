import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link, Outlet, useSubmit, Form, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";

import { toggleUserLang, toggleUserRole } from "~/models/user.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.userId, "userId not found");
  return { userId };
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.userId, "userId not found");

  const form = await request.formData();

  const actionType = form.get("_action");
  if (actionType === "change-role") {
    // console.log("Change Role");
    const userRole = form.get("userRole");

    userRole === "admin"
      ? await toggleUserRole(userId, "user")
      : await toggleUserRole(userId, "admin");

    return redirect(`/users/${userId}`);
  }

  if (actionType === "change-lang") {
    // console.log("Change Language");
    const userLang = form.get("userLang");

    userLang === "ko-KR"
      ? await toggleUserLang(userId, "en-US")
      : await toggleUserLang(userId, "ko-KR");

    return redirect(`/users/${userId}`);
  }
};

export default function UserDetailsPage() {
  const user = useUser();
  const mySubmit = useSubmit();
  const navigation = useNavigation();
  const isChangeRole =
    navigation.state === "submitting" &&
    navigation.formData?.get("_action") === "change-role";

  const isChangeLang =
    navigation.state === "submitting" &&
    navigation.formData?.get("_action") === "change-lang";

  const handleChange = (event: any) => {
    mySubmit(event.currentTarget, { replace: true });
  };

  return (
    <>
      <div className="mt-4 space-y-4">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  id
                </th>
                <th scope="col" className="px-6 py-3">
                  {isChangeLang ? "..." : user.TMDB_LANG}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white dark:bg-gray-800">
                <th
                  scope="row"
                  className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-gray-400"
                >
                  {user.id}
                </th>
                <td className="px-6 py-4">
                  <Form replace method="post" onChange={handleChange}>
                    <input
                      type="hidden"
                      name="userLang"
                      value={user.TMDB_LANG}
                    />
                    <input type="hidden" name="_action" value="change-lang" />
                    <label
                      htmlFor="default-toggle2"
                      className="relative inline-flex cursor-pointer items-center"
                    >
                      <input
                        type="checkbox"
                        id="default-toggle2"
                        className="peer sr-only"
                        checked={user.TMDB_LANG === "en-US" ? true : false}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                    </label>
                  </Form>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3">
                  Last Update
                </th>
                <th scope="col" className="px-6 py-3">
                  {isChangeRole ? "..." : user.role}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white dark:bg-gray-800">
                <td className="px-6 py-4">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {user.role === "admin" ? (
                    <Form replace method="post" onChange={handleChange}>
                      <input type="hidden" name="userRole" value={user.role} />
                      <input type="hidden" name="_action" value="change-role" />
                      <label
                        htmlFor="default-toggle"
                        className="relative inline-flex cursor-pointer items-center"
                      >
                        <input
                          type="checkbox"
                          id="default-toggle"
                          className="peer sr-only"
                          checked={user.role === "admin" ? true : false}
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                      </label>
                    </Form>
                  ) : null}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Link
          className="block border-b px-2 py-4 text-xl text-gray-700 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-400"
          to="./change-password"
        >
          Change Password
        </Link>
      </div>
      <Outlet />
    </>
  );
}
