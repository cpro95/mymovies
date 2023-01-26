import React from "react";
import invariant from "tiny-invariant";
import { Editor } from "@tinymce/tinymce-react";
import { updateNote } from "~/models/note.server";
import { requireUserId } from "~/utils/session.server";
import type { Note } from "~/models/note.server";
import { getNote } from "~/models/note.server";
import { json, redirect } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { getFormData, useFormInputProps } from "remix-params-helper";
import { z } from "zod";
import { Theme, useTheme } from "~/utils/theme-provider";

export const NewNoteFormSchema = z.object({
  title: z.string().min(2, "require-title"),
  body: z.string().min(1, "require-body"),
  noteId: z.string().min(2, "require-noteId"),
});

type ActionData = {
  title?: string;
  body?: string;
  errors?: {
    title?: string;
    body?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);
  //   console.log("update.$noteId.tsx#31", userId);

  const formValidation = await getFormData(request, NewNoteFormSchema);
  if (!formValidation.success) {
    return json<ActionData>(
      {
        errors: formValidation.errors,
      },
      {
        status: 400,
      }
    );
  }
  const { title, body, noteId } = formValidation.data;

  const note = await updateNote({ noteId, body, title });

  return redirect(`/notes/${note.id}`);
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  const note = await getNote({ userId, id: params.noteId });
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ note });
};

export default function NewNotePage() {
  const { note } = useLoaderData<typeof loader>();
  //   console.log(note);

  const actionData = useActionData() as ActionData;
  const titleRef = React.useRef<HTMLInputElement>(null);
  //   const bodyRef = React.useRef<HTMLTextAreaElement>(null);
  const inputProps = useFormInputProps(NewNoteFormSchema);
  const transition = useTransition();

  const disabled =
    transition.state === "submitting" || transition.state === "loading";

  React.useEffect(() => {
    if (note.title && titleRef.current !== null) {
      titleRef.current.value = note?.title;
      titleRef.current?.focus();
    }
  }, [note]);

  const [theme] = useTheme();

  return (
    <Form method="post">
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="h-5 w-5 text-gray-500 dark:text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
            />
          </svg>
        </div>
        <input type="hidden" name="noteId" value={note.id} />
        <input
          {...inputProps("title")}
          ref={titleRef}
          name="title"
          id="title"
          placeholder="Title"
          className="search-label mb-4 block w-full"
          aria-invalid={actionData?.errors?.title ? true : undefined}
          aria-errormessage={
            actionData?.errors?.title ? "title-error" : undefined
          }
          disabled={disabled}
        />
        {actionData?.errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        )}
      </div>
      <Editor
        id="remix-new-tinymce"
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        // scriptLoading={{ async: false }}
        init={{
          skin: theme === Theme.DARK ? "oxide-dark" : "oxide",
          content_css: theme === Theme.DARK ? "dark" : "default",
          // skin list
          // material-classic
          // material-outline
          // bootstrap
          // fabric
          // fluent
          // borderless
          // small
          // jam
          // naked
          // outside
          // snow
          icons: "default",
          //icons packs
          // bootstrap
          // material
          // small
          // jam
          // thin
          plugins:
            "media link image fullscreen lists advlist autoresize preview codesample table",
          toolbar:
            "fullscreen | undo redo | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | link image media | numlist bullist | codesample preview",
          menubar: false,
          media_dimensions: false,
          media_live_embeds: true,
          image_description: false,
          image_dimensions: false,
          image_title: false,
          fullscreen_native: true,
          height: 500,
        }}
        // init={{
        //   skin: theme === Theme.DARK ? "oxide-dark" : "fluent",
        //   content_css: theme === Theme.DARK ? "dark" : "light",
        //   // skin list
        //   // material-classic
        //   // material-outline
        //   // bootstrap
        //   // fabric
        //   // fluent
        //   // borderless
        //   // small
        //   // jam
        //   // naked
        //   // outside
        //   // snow
        //   icons: "small",
        //   //icons packs
        //   // bootstrap
        //   // material
        //   // small
        //   // jam
        //   // thin
        //   plugins:
        //     "media link image fullscreen lists advlist autoresize preview codesample table",
        //   toolbar:
        //     "fullscreen | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | link image media | numlist bullist | codesample preview",
        //   menubar: false,
        //   media_dimensions: false,
        //   media_live_embeds: true,
        //   image_description: false,
        //   image_dimensions: false,
        //   image_title: false,
        //   fullscreen_native: true,
        // }}
        textareaName="body"
        initialValue={note?.body ? note.body : ""}
      />
      {actionData?.errors?.body && (
        <div className="pt-1 text-red-700" id="title-error">
          {actionData.errors.body}
        </div>
      )}

      <div className="mt-4 text-left">
        <button
          type="submit"
          className="btn-primary ml-4 mr-2 mb-2"
          disabled={disabled}
        >
          Modify
        </button>
      </div>
    </Form>
  );
}
