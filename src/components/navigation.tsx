"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { hrefWith } from "@/lib/query";
import { cn } from "@/lib/utils";

export function CarryLink({
  href,
  children,
  className,
  updates = {},
}: {
  href: string;
  children: ReactNode;
  className?: string;
  updates?: Record<string, string>;
}): ReactElement {
  const params = useSearchParams();
  return (
    <Link
      className={className}
      href={hrefWith(href, new URLSearchParams(params), updates)}
    >
      {children}
    </Link>
  );
}
export function Brand(): ReactElement {
  return (
    <CarryLink
      href="/"
      className="text-xl font-medium tracking-tight text-heading hover:no-underline"
    >
      <strong>VCE</strong> Compare
    </CarryLink>
  );
}
export function Navigation(): ReactElement {
  const pathname = usePathname();
  const destinations = [
    ["/", "Rankings"],
    ["/schools", "Schools"],
    ["/compare", "Compare"],
    ["/map", "Map"],
    ["/about", "About the data"],
  ];
  return (
    <nav aria-label="Main navigation" className="flex flex-wrap gap-1">
      {destinations.map(([href, label]): ReactElement => (
        <NavItem
          key={href}
          href={href}
          label={label}
          active={
            pathname === href ||
            (href === "/schools" && pathname.startsWith("/schools/"))
          }
        />
      ))}
    </nav>
  );
}
function NavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}): ReactElement {
  const params = useSearchParams();
  return (
    <Link
      href={hrefWith(href, new URLSearchParams(params), {})}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted hover:bg-accent hover:no-underline",
        active && "bg-accent text-primary",
      )}
    >
      {label}
    </Link>
  );
}
