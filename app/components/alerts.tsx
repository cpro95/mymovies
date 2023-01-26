import { useEffect, useState } from "react";

export function Alerts(data: { message: string; type: "success" | "error" }) {
  const [hidden, setHidden] = useState<string>("");
  useEffect(() => {
    setTimeout(() => setHidden("hidden"), 3000);
  }, []);

  if (data.type === "success") {
    return (
      <div className={`w-full bg-emerald-500 text-white ${hidden}`}>
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex">
            <svg viewBox="0 0 40 40" className="h-6 w-6 fill-current">
              <path d="M20 3.33331C10.8 3.33331 3.33337 10.8 3.33337 20C3.33337 29.2 10.8 36.6666 20 36.6666C29.2 36.6666 36.6667 29.2 36.6667 20C36.6667 10.8 29.2 3.33331 20 3.33331ZM16.6667 28.3333L8.33337 20L10.6834 17.65L16.6667 23.6166L29.3167 10.9666L31.6667 13.3333L16.6667 28.3333Z"></path>
            </svg>

            <p className="mx-3">{data.message}</p>
          </div>

          <button className="transform rounded-md p-1 transition-colors duration-200 hover:bg-gray-600 hover:bg-opacity-25 focus:outline-none">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 18L18 6M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className={`w-full bg-red-500 text-white ${hidden}`}>
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex">
            <svg viewBox="0 0 40 40" className="h-6 w-6 fill-current">
              <path d="M20 3.36667C10.8167 3.36667 3.3667 10.8167 3.3667 20C3.3667 29.1833 10.8167 36.6333 20 36.6333C29.1834 36.6333 36.6334 29.1833 36.6334 20C36.6334 10.8167 29.1834 3.36667 20 3.36667ZM19.1334 33.3333V22.9H13.3334L21.6667 6.66667V17.1H27.25L19.1334 33.3333Z"></path>
            </svg>

            <p className="mx-3">{data.message}</p>
          </div>

          <button className="transform rounded-md p-1 transition-colors duration-200 hover:bg-gray-600 hover:bg-opacity-25 focus:outline-none">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 18L18 6M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }
}
