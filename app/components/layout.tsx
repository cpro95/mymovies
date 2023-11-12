import type { ReactNode } from "react";

import { useOptionalUser } from "~/utils";

import { Footers } from "./footers";
import { Headers } from "./headers";

export function Layout({
  children,
  title,
  linkTo,
}: {
  children: ReactNode;
  title?: string;
  linkTo?: string;
}): JSX.Element {
  const user = useOptionalUser();

  return (
    <div className="h-full min-h-screen w-full bg-dodger-50 dark:bg-dodger-900">
      <Headers title={title} linkTo={linkTo} email={user?.email} />
      <main className="flex w-full flex-col items-center">{children}</main>
      <Footers />
    </div>
  );
}
