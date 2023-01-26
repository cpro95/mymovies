import type {
  LoaderFunction,
  ActionFunction,
  MetaFunction,
} from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { assertIsPostOrDelete } from "~/utils/http.server";
import { deleteNote } from "~/models/note.server";
import { getNoteWithoutUserId } from "~/models/note.server";
import type { Note, User } from "@prisma/client";
import { requireUserId } from "~/utils/session.server";
import { getUserById } from "~/models/user.server";

import { Editor } from "@tinymce/tinymce-react";
import { DEFAULT_LANGUAGE, useOptionalUser } from "~/utils/utils";

type MyLoaderData = {
  note: Note;
  email: User["email"] | undefined;
};

export const meta: MetaFunction = (props) => {
  // console.log("Inside meta of $noteId ===>", props);

  if (props.data.note.title !== "") {
    return {
      title: props.data.note.title,
    };
  }

  // default return
  return {
    title: "Free BBS in MyMoives!",
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.noteId, "noteId not found");

  const note = await getNoteWithoutUserId({ id: params.noteId });
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  const user = await getUserById(note.userId);
  const email = user?.email;
  return json<MyLoaderData>({ note, email });
};

export const action: ActionFunction = async ({ request, params }) => {
  assertIsPostOrDelete(request);

  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  const formData = request.formData();
  const actionType = (await formData).get("_action");

  if (actionType === "delete-note") {
    await deleteNote({ userId: userId, id: params.noteId });
  }

  if (actionType === "update-note") {
    return redirect(`/notes/update/${params.noteId}`);
  }

  return redirect("/notes");
};

export default function NoteDetailsPage() {
  const user = useOptionalUser();
  const data = useLoaderData<typeof loader>();
  // console.log(data);
  // console.log("user ===>", user);

  const userIsOwner: boolean = data.note.userId === user?.id;

  return (
    <div>
      <div className="mb-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
        <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {data.note.title}
        </h1>
        <hr className="mt-1 pt-1" />

        <div className="mt-1 mb-4 py-2 px-1 text-base text-gray-500 dark:text-gray-300 lg:text-lg">
          {/* <textarea value={data.note.body} /> */}
          <Editor
            id="remix-view-inline-tinymce"
            // apiKey="5lwcko2su5kqhtjg6t2fgwwc5e041n4rkmszwxpl0oqsw5jd"
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            initialValue={data.note.body}
            textareaName="body"
            disabled
            inline={true}
          />
        </div>
        <hr className="mt-1 pt-1" />
        <div className="flex flex-col justify-between">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Posted on :
            {new Date(data.note.createdAt).toLocaleString(DEFAULT_LANGUAGE)}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Updated on :
            {new Date(data.note.updatedAt).toLocaleString(DEFAULT_LANGUAGE)}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            by {data.email}
          </span>
        </div>

        <hr className="mt-1 pt-1" />

        {userIsOwner ? (
          <div className="mt-1 flex flex-row justify-start pt-1">
            <Form method="delete">
              <button
                type="submit"
                name="_action"
                value="delete-note"
                className="btn-warning mr-2 mb-2"
              >
                Delete
              </button>
            </Form>
            <Form method="post">
              <button
                type="submit"
                name="_action"
                value="update-note"
                className="btn-primary mr-2 mb-2"
              >
                Modify
              </button>
            </Form>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
