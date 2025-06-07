/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import { HiBolt, HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

import { useTheme } from "next-themes";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import MobileMenu from "./MobileMenu";
import NavActions from "./NavFixedActions";
import NavLinks from "./NavFixedLinks";
import TopBarHighlights from "./TopBarHighlights";

/* eslint-disable */

export default function NavbarFixed(props: {
  secondary?: boolean;
  message?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    window.addEventListener("scroll", changeNavbar);

    return () => {
      window.removeEventListener("scroll", changeNavbar);
    };
  });
  const { secondary, message } = props;

  const changeNavbar = () => {
    if (window.scrollY > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };
  return (
    <div
      className={`fixed left-[50%] top-0 z-[49] mx-auto flex w-full translate-x-[-50%] translate-y-0 flex-col items-center border-gray-300 bg-white leading-[25.6px] dark:border-white dark:bg-zinc-950 xl:justify-center`}
    >
      <TopBarHighlights />
      <div className="mb-0 flex w-[calc(100vw_-_4%)] flex-row items-center justify-between gap-[40px] py-5 sm:px-6 md:w-[calc(100vw_-_4%)] md:px-2.5 lg:w-[100vw] lg:px-3 xl:w-[calc(100vw_-_250px)] xl:pl-3 2xl:w-[1200px]">
        <Link className="flex items-center justify-center" href="/">
          <div className={`flex items-center justify-center`}>
            <div className="me-2 flex h-[40px] w-[40px] items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <HiBolt className="h-5 w-5" />
            </div>
            <h5 className="text-2xl font-bold leading-5 text-foreground dark:text-white">
              Horizon AI
            </h5>
          </div>
        </Link>
        <div className="flex items-center">
          <NavLinks />
          <Button
            variant="outline"
            className="me-3 flex min-h-10 min-w-10 cursor-pointer rounded-full border-zinc-200 p-0 text-xl text-foreground dark:border-zinc-800 dark:text-white lg:hidden"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "light" ? (
              <HiOutlineMoon className="h-4 w-4 stroke-2" />
            ) : (
              <HiOutlineSun className="h-5 w-5 stroke-2" />
            )}
          </Button>
          <MobileMenu />
        </div>
        <NavActions theme={theme} setTheme={setTheme} />
      </div>
      {secondary ? <p className="text-white">{message}</p> : null}
    </div>
  );
}
