import type { LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLocation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useEventSource } from "remix-utils";

import { emitter } from "~/utils/emitter";
import { Alerts } from "~/components/alerts";
import { requireUserId } from "~/utils/session.server";
import { Layout } from "~/components/layout";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  return userId;
};

export async function action({ request }: LoaderArgs) {
  const formData = await request.formData();

  const ori_message = formData.get("message") as string;
  const message = ori_message.replace(/\n/g, "¤");

  emitter.emit("message", message);
  return json({ message });
}

export default function Component() {
  const $form = useRef<HTMLFormElement>(null);
  const { key } = useLocation();

  useEffect(
    function clearFormOnSubmit() {
      $form.current?.reset();
    },
    [key]
  );

  const [showAlert, setShowAlert] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const lastMessage = useEventSource("/chat/sse/chat");

  useEffect(
    function saveMessage() {
      setMessages((current) => {
        if (
          typeof lastMessage === "string" &&
          lastMessage !== "UNKNOWN_EVENT_DATA"
        ) {
          return current.concat(lastMessage.replace(/¤/g, "\n"));
        }
        return current;
      });
    },
    [lastMessage]
  );

  const cleanup = () => {
    $form.current?.reset();
  };

  const copy = (message: string) => {
    window.navigator.clipboard
      .writeText(message)
      .then(() => setShowAlert(!showAlert));
  };

  return (
    <Layout>
      <div className="w-full px-2 pb-2 lg:w-10/12">
        <Form ref={$form} method="post">
          <p className="p-4 text-lg leading-10 text-gray-800 dark:text-white">
            안녕하세요?
            <br />
            이 사이트는 HTML의 Server-Sent Events인 EventSource를 이용해서
            Real-Time Chat 기능을 구현했습니다.
            <br />
            사용 방법은 컴퓨터와 핸드폰에서{" "}
            <a
              href="http://mymovies.fly.dev/chat"
              target="_blank"
              rel="noreferrer"
              className="font-bold underline"
            >
              mymovies.fly.dev/chat
            </a>{" "}
            사이트를 동시에 오픈해서 텍스트를 주고 받으면 됩니다.
          </p>

          <div className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
            <div className="rounded-t-lg bg-white px-4 py-2 dark:bg-gray-800">
              <label htmlFor="comment" className="sr-only">
                Your comment
              </label>
              <textarea
                id="comment"
                name="message"
                rows={5}
                className="w-full border-0 bg-white px-1 text-base text-gray-900 focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                placeholder="텍스트 입력..."
              ></textarea>
            </div>
            <div className="flex items-center space-x-2 border-t px-3 py-2 dark:border-gray-600">
              <button
                className="inline-flex items-center rounded-lg bg-dodger-700 py-2.5 px-4 text-center text-sm font-medium text-white hover:bg-dodger-800 focus:ring-4 focus:ring-dodger-200 dark:focus:ring-dodger-900"
                onClick={() => cleanup()}
              >
                다시 쓰기
              </button>
              <button
                className="inline-flex items-center rounded-lg bg-lime-700 py-2.5 px-4 text-center text-sm font-medium text-white hover:bg-lime-800 focus:ring-4 focus:ring-lime-200 dark:focus:ring-lime-900"
                onClick={() => setMessages([])}
              >
                메세지 삭제하기
              </button>
              <button
                type="submit"
                className="inline-flex items-center rounded-lg bg-sky-700 py-2.5 px-4 text-center text-sm font-medium tracking-[6px] text-white hover:bg-sky-800 focus:ring-4 focus:ring-sky-200 dark:focus:ring-sky-900"
              >
                전송하기
              </button>
            </div>
          </div>
          <p className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            아래 Copy 버튼을 누르면 입력한 내용이 클립보드에 바로 복사됩니다.{" "}
          </p>

          <div className="px-4 pt-2">
            {showAlert && (
              <Alerts
                message="클립보드로 텍스트 복사하기 성공!"
                type="success"
              />
            )}
          </div>
        </Form>
      </div>

      <div className="w-full px-2 pb-2 lg:w-10/12">
        {messages.map((message, i) => (
          <div key={i}>
            <div className="flex items-center space-x-4 py-2">
              <button
                className="flex items-center"
                onClick={() => copy(message)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-8 w-8 text-gray-500 dark:text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
                <span className="ml-2 tracking-[-2px] text-gray-500 dark:text-gray-400">
                  Copy to Clipboard
                </span>
              </button>
            </div>

            <pre className="px-2">
              <code className="whitespace-pre-wrap break-words text-gray-500 dark:text-gray-400">
                {message}
              </code>
            </pre>
            <div className="py-2">
              <hr />
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
