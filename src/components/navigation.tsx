"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, type ReactElement, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
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
  const [open, setOpen] = useState(false);
  const destinations = [
    ["/", "Rankings"],
    ["/schools", "Schools"],
    ["/compare", "Compare"],
    ["/map", "Map"],
    ["/about", "About the data"],
  ];
  return (
    <>
      <Button
        variant="outline"
        className="md:hidden"
        aria-expanded={open}
        aria-controls="main-navigation"
        onClick={(): void => setOpen(!open)}
      >
        Menu
      </Button>
      <nav
        id="main-navigation"
        aria-label="Main navigation"
        className={cn(
          "w-full flex-col gap-1 md:flex md:w-auto md:flex-row",
          open ? "flex" : "hidden",
        )}
      >
        {destinations.map(([href, label]): ReactElement => (
          <NavItem
            key={href}
            href={href}
            label={label}
            onNavigate={(): void => setOpen(false)}
            active={
              pathname === href ||
              (href === "/schools" && pathname.startsWith("/schools/"))
            }
          />
        ))}
      </nav>
    </>
  );
}
function NavItem({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate: () => void;
}): ReactElement {
  const params = useSearchParams();
  return (
    <Link
      href={hrefWith(href, new URLSearchParams(params), {})}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted hover:bg-accent hover:no-underline",
        active && "bg-accent text-primary",
      )}
    >
      {label}
    </Link>
  );
}
