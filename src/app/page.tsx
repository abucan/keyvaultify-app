import NavbarFixed from "@/components/navbar/NavbarFixed";

export default function LandingPage() {
  return (
    <div className="relative bg-white dark:bg-zinc-950">
      <div className="relative flex h-full min-h-screen flex-col items-center overflow-hidden">
        <div className="relative flex w-full flex-col items-center justify-center pb-0 md:pb-[80px]"></div>
      </div>
      <NavbarFixed />
    </div>
  );
}
