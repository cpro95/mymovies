import type { ReactNode } from "react";
import { Headers } from "./headers";
import { Footers } from "./footers";
import { useOptionalUser } from "~/utils/utils";

export function Layout({
  children,
  title,
  linkTo,
  email,
}: {
  children: ReactNode;
  title?: string;
  linkTo?: string;
  email?: string;
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
