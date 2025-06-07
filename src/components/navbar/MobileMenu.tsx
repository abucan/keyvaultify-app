import { IoMenuOutline } from "react-icons/io5";

import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MobileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="block lg:hidden">
          <IoMenuOutline className="block h-5 w-5 cursor-pointer text-foreground dark:text-white lg:hidden" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-[80] w-56 border-zinc-200 dark:border-zinc-800">
        <DropdownMenuItem>
          <Link
            className="text-md my-auto mr-[30px] font-medium text-foreground dark:text-white"
            href="/dashboard/main"
          >
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href="/dashboard/signin"
            className="text-md my-auto mr-[30px] font-semibold text-foreground dark:text-white"
          >
            Login
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link
              href="/#features"
              className="text-md my-auto mr-[30px] font-medium text-foreground dark:text-white"
            >
              Features
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              href="/pricing"
              className="text-md my-auto mr-[30px] font-medium text-foreground dark:text-white"
            >
              Pricing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              href="#faqs"
              className="text-md my-auto mr-[30px] font-medium text-foreground dark:text-white"
            >
              FAQs
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
        <DropdownMenuItem>
          <button className="my-auto rounded-md border border-gray-300 bg-[transparent] px-2 py-2 text-sm font-semibold text-foreground dark:border-white dark:text-white">
            <Link
              className="flex flex-row justify-center"
              href="/dashboard/signin"
            >
              Get started for Free
            </Link>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
