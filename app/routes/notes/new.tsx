import { Editor } from "@tinymce/tinymce-react";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { getFormData, useFormInputProps } from "remix-params-helper";
import { z } from "zod";

import { assertIsPost } from "~/utils/http.server";

import { Theme, useTheme } from "~/utils/theme-provider";
import { createNote } from "~/models/note.server";
import { requireUser, requireUserId } from "~/utils/session.server";

export const NewNoteFormSchema = z.object({
  title: z.string().min(2, "require-title"),
  body: z.string().min(1, "require-body"),
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
  assertIsPost(request);

  const userId = await requireUserId(request);
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

  const { title, body } = formValidation.data;

  const note = await createNote({ title, body, userId });

  return redirect(`/notes/${note.id}`);
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  if (!user) return redirect("/notes");
  return {};
};

export default function NewNotePage() {
  const actionData = useActionData() as ActionData;
  const inputProps = useFormInputProps(NewNoteFormSchema);
  const transition = useTransition();
  const disabled =
    transition.state === "submitting" || transition.state === "loading";

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
        <input
          {...inputProps("title")}
          name="title"
          id="title"
          placeholder="Title"
          className="search-label mb-4"
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
        // scriptLoading={{ async: true }}
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
            " fullscreen | undo redo | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | link image media | numlist bullist | codesample preview",
          menubar: false,
          media_dimensions: false,
          media_live_embeds: true,
          image_description: false,
          image_dimensions: false,
          image_title: false,
          fullscreen_native: true,
          height: 500,
        }}
        textareaName="body"
      />

      <div className="mt-4 text-left">
        <button type="submit" className="btn-primary mr-2" disabled={disabled}>
          Post
        </button>
      </div>
    </Form>
  );
}
