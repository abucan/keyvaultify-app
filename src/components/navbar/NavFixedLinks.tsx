import Link from "next/link";

export default function NavLinks() {
  const links = [
    { href: "/dashboard/main", label: "Dashboard" },
    { href: "/#features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "#faqs", label: "FAQs" },
  ];

  return (
    <>
      {links.map(({ href, label }) => (
        <Link
          key={label}
          href={href}
          className="my-auto mr-[30px] hidden text-sm font-medium leading-[0px] text-foreground dark:text-white lg:block"
        >
          {label}
        </Link>
      ))}
    </>
  );
}
