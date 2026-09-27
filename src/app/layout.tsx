import type { Metadata } from "next";
import { Suspense, type ReactElement, type ReactNode } from "react";
import { Brand, CarryLink, Navigation } from "@/components/navigation";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "VCE Compare · Victorian school results",
    template: "%s · VCE Compare",
  },
  description:
    "Explore published Victorian VCE results, compare annual school trends and understand the data.",
};
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-4"
        >
          Skip to content
        </a>
        <header className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-3 px-4 py-2 md:px-5 md:py-4">
            <Suspense>
              <Brand />
            </Suspense>
            <Suspense>
              <Navigation />
            </Suspense>
          </div>
        </header>
        <main
          id="main"
          className="mx-auto min-h-[75vh] max-w-7xl px-4 py-4 md:px-6 md:py-5"
        >
          {children}
        </main>
        <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-border px-6 py-7 text-xs text-muted">
          <p>
            Published results, with context. A single measure is not a
            school-quality rating.
          </p>
          <div className="flex gap-5">
            <Suspense>
              <CarryLink href="/about">Data &amp; methodology</CarryLink>
            </Suspense>
            <a href="https://github.com/diabolical-ninja/vce-performance">
              Source code
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
