"use client";

import { Dispatch } from "react";
import { SetStateAction } from "react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NavActions({
  theme,
  setTheme,
}: {
  theme: string | undefined;
  setTheme: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="hidden items-center lg:flex">
      <Button
        variant="outline"
        className="me-3 flex min-h-10 min-w-10 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-foreground dark:border-zinc-800 dark:text-white"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "light" ? (
          <HiOutlineMoon className="h-4 w-4 stroke-2" />
        ) : (
          <HiOutlineSun className="h-5 w-5 stroke-2" />
        )}
      </Button>
      <Link
        className="my-auto mr-[18px] text-sm font-semibold text-foreground dark:text-white"
        href="/dashboard/signin"
      >
        Login
      </Link>
      <Link href="/dashboard/signin" className="flex">
        <Button variant="outline" className="py-6 dark:text-white">
          Get started for Free
        </Button>
      </Link>
    </div>
  );
}
