import type { ReactElement } from "react";
import Link from "next/link";
export default function NotFound(): ReactElement {
  return (
    <div className="notice">
      <h1>School or page not found</h1>
      <p className="my-4">This link does not match an available record.</p>
      <Link href="/schools">Explore the school directory</Link>
    </div>
  );
}
