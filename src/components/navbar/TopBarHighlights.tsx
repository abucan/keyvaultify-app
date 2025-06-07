import {
  HiOutlineGlobeEuropeAfrica,
  HiOutlineShieldCheck,
  HiStar,
} from "react-icons/hi2";

export default function TopBarHighlights() {
  return (
    <div className="hidden w-full justify-center bg-zinc-100 dark:bg-zinc-900 lg:flex">
      <div className="flex w-[calc(100vw_-_4%)] justify-center gap-[40px] py-3 sm:px-4 md:w-[calc(100vw_-_4%)] md:px-2.5 lg:w-[100vw] lg:px-3 xl:w-[calc(100vw_-_250px)] 2xl:w-[1200px]">
        <div className="flex flex-row items-center">
          <HiOutlineShieldCheck
            className="
        mr-1.5 h-3 w-3 stroke-2 text-foreground dark:text-white"
          />
          <p className="h-full text-xs font-medium text-foreground dark:text-white">
            Founded in EU. We respect your privacy.
          </p>
        </div>
        <div className="flex flex-row items-center">
          <HiStar
            className="
        mr-[1px] h-3 w-3 text-foreground dark:text-white"
          />
          <HiStar
            className="
        mr-[1px] h-3 w-3 text-foreground dark:text-white"
          />
          <HiStar
            className="
        mr-[1px] h-3 w-3 text-foreground dark:text-white"
          />
          <HiStar
            className="
        mr-[1px] h-3 w-3 text-foreground dark:text-white"
          />
          <HiStar
            className="
        mr-[4px] h-3 w-3 text-foreground dark:text-white"
          />
          <p className="h-full text-xs font-medium text-foreground dark:text-white">
            Loved by 80,000+ users worldwide
          </p>
        </div>
        <div className="flex flex-row items-center">
          <HiOutlineGlobeEuropeAfrica
            className="
        mr-1.5 h-3 w-3 text-foreground dark:text-white"
          />
          <p className="h-full text-xs font-medium text-foreground dark:text-white">
            #1 ShadCN UI Template & Boilerplate
          </p>
        </div>
      </div>
    </div>
  );
}
