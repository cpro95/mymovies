import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { useEffect, useRef } from "react";
import { updatePasswordById, verifyPassword } from "~/models/user.server";
import { useUser } from "~/utils/utils";
import { useFetcher, useLocation } from "@remix-run/react";

interface ActionData {
  message?: string;
  errors?: {
    currentPassword?: string;
    password?: string;
    password2?: string;
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const currentPassword = formData.get("currentPassword") as string;
  const password = formData.get("password") as string;
  const password2 = formData.get("password2") as string;
  const userId = formData.get("userId") as string;

  if (currentPassword.length < 8) {
    // console.log("currentPassword is too Short");
    return json<ActionData>(
      {
        errors: {
          currentPassword: "Current Password is too Short, at least 8",
        },
      },
      { status: 400 }
    );
  }

  const isOk = await verifyPassword(userId, currentPassword);
  if (!isOk) {
    // console.log("Current password is not correct!");
    return json<ActionData>(
      { errors: { currentPassword: "Current Password is not Correct!" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    // console.log("too Short");
    return json<ActionData>(
      { errors: { password: "Password is too Short, at least 8" } },
      { status: 400 }
    );
  }

  if (password2.length < 8) {
    // console.log("too Short");
    return json<ActionData>(
      { errors: { password2: "Password is too Short, at least 8" } },
      { status: 400 }
    );
  }

  if (password !== password2) {
    // console.log("differ");
    return json<ActionData>(
      { errors: { password2: "New Passwords are not same." } },
      { status: 400 }
    );
  } else {
    const result = await updatePasswordById(userId, password);
    if (result) {
      return json<ActionData>(
        {
          message: "Password Changed Successfully",
        },
        { status: 200 }
      );
    } else {
      return json<ActionData>(
        {
          message: "Something Wrong happend!",
        },
        { status: 400 }
      );
    }
  }
};

export default function ChangePassword() {
  const fetcher = useFetcher();
  const location = useLocation();
  const user = useUser();

  let formRef = useRef<HTMLFormElement>(null);

  let isChanging =
    fetcher.submission && fetcher.submission.formData.get("userId") === user.id;

  useEffect(() => {
    formRef.current?.reset();
  }, [fetcher?.data?.message]);

  return (
    <div className="flex w-full max-w-md flex-col justify-start rounded-md bg-white p-6 shadow-md dark:bg-gray-800">
      {fetcher?.data?.message && (
        <div className="pt-2 text-red-700 dark:text-red-300">
          {fetcher.data.message}
        </div>
      )}
      <fetcher.Form
        replace
        method="post"
        action={location.pathname}
        ref={formRef}
        className="mx-2 space-y-4 pt-4"
      >
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Current Password
          </label>
          <div className="mt-1">
            <input type="hidden" name="userId" value={user.id} />
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
            />
            {fetcher.data?.errors?.currentPassword && (
              <div className="pt-1 text-red-700">
                {fetcher.data.errors.currentPassword}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            New Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
            />
            {fetcher.data?.errors?.password && (
              <div className="pt-1 text-red-700">
                {fetcher.data.errors.password}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="password2"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Repeat a New Password
          </label>
          <div className="mt-1">
            <input
              id="password2"
              name="password2"
              type="password"
              required
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
            />
            {fetcher.data?.errors?.password2 && (
              <div className="pt-1 text-red-700 dark:text-gray-300">
                {fetcher.data.errors.password2}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full transform rounded-md bg-gray-700 px-4 py-2 tracking-wide text-white transition-colors duration-200 hover:bg-gray-600 focus:bg-gray-600 focus:outline-none"
          disabled={isChanging}
        >
          {isChanging ? "Changing..." : "Change"}
        </button>
      </fetcher.Form>
    </div>
  );
}
