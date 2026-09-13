import type { ReactElement } from "react";
export default function Loading(): ReactElement {
  return (
    <p role="status" className="notice">
      Loading school results…
    </p>
  );
}
