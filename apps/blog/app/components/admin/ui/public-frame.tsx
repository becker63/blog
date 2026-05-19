import type { ReactNode } from "react";

import { css } from "@/styled-system/css";

/** Login and other public admin routes: same viewport rhythm as the blog (`pageWithMargins`). */
export function AdminPublicFrame({ children }: { children: ReactNode }) {
  return (
    <main data-admin-app="public-proof" className={css({ layerStyle: "pageWithMargins" })}>
      {children}
    </main>
  );
}

export function AdminPublicCenter({ children }: { children: ReactNode }) {
  return (
    <div className={css({ maxW: "420px", mx: "auto", w: "100%" })}>
      {children}
    </div>
  );
}
