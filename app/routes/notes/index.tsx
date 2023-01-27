import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getNoteCount } from "~/models/note.server";

export const loader: LoaderFunction = async ({ request }) => {
  const nbOfNotes = await getNoteCount();

  return json({
    nbOfNotes,
  });
};

export default function NoteIndexPage() {
  const { nbOfNotes } = useLoaderData();

  return (
    <div className="flex w-full flex-row items-center justify-between bg-dodger-50 dark:bg-dodger-900">
      <div className="text-2xl font-semibold dark:text-gray-200">Notes</div>
      <div className="dark:text-gray-200">Total {nbOfNotes}</div>
    </div>
  );
}
