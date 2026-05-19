import type { ReactNode } from "react";

import { glassPanelShellStyles } from "@/app/components/shared/GlassCard";
import { PaneParent } from "@/app/components/shared/PaneChild";
import { css } from "@/styled-system/css";

/**
 * Blog/homepage parity: same **`glassPanelShellStyles`** + frosted blur as identity/search tiles,
 * not a separate opaque admin skin.
 */
const adminPanelSurfaceClass = css({
  ...glassPanelShellStyles,
  backdropFilter: "blur(10px)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "glass.border",
  p: "5",
  mb: "0",
});

/**
 * Root admin column: flex column (`layerStyle: "adminShell"`) so **brand bar + main**
 * share the viewport (see **`AdminMain`**).
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div
      data-admin-app="public-proof"
      className={css({ layerStyle: "adminShell" })}
    >
      {children}
    </div>
  );
}

/**
 * Route output lives here: grows under `AdminBrandBar`, keeps `minH: 0` for future
 * scroll-split layouts. Wrap **`{children}`** from `app/admin/(private)/layout.tsx` only.
 */
export function AdminMain({ children }: { children: ReactNode }) {
  return (
    <div
      data-admin-main=""
      className={css({
        display: "flex",
        flexDirection: "column",
        flex: "1",
        minH: "0",
        minW: "0",
        w: "full",
      })}
    >
      {children}
    </div>
  );
}

export function AdminPanel({ children }: { children: ReactNode }) {
  return (
    <section data-admin-surface="panel" className={adminPanelSurfaceClass}>
      {children}
    </section>
  );
}

/**
 * Broad admin route stack: **tight** `gap: "layout"` between chrome rows (sub-nav when present)
 * and major blocks — same idea as the homepage dashboard `gridGap: "layout"` / mobile card column.
 */
export function AdminPageSections({ children }: { children: ReactNode }) {
  return (
    <PaneParent gap="layout" data-admin-page-sections="">
      {children}
    </PaneParent>
  );
}

/**
 * **Glass panel rows** only: **large** `gap: "6"` between sibling `AdminPanel`s in **one column**.
 * For multi-column dashboard tiles use **`AdminPanelGrid`**.
 */
export function AdminPanelStack({ children }: { children: ReactNode }) {
  return (
    <PaneParent gap="6" data-admin-panel-stack="">
      {children}
    </PaneParent>
  );
}

/**
 * Homepage **`HomeDesktopLayout`** parity: **`gap: "layout"`** on the grid (broad parent),
 * **`md`/`xl`** breakpoints for 2–3 columns like the dashboard.
 */
export function AdminPanelGrid({ children }: { children: ReactNode }) {
  return (
    <div
      data-admin-panel-grid=""
      className={css({
        display: "grid",
        w: "full",
        alignSelf: "stretch",
        gap: "layout",
        gridTemplateColumns: {
          base: "minmax(0, 1fr)",
          md: "repeat(2, minmax(0, 1fr))",
          xl: "repeat(3, minmax(0, 1fr))",
        },
      })}
    >
      {children}
    </div>
  );
}

/** Single centered card (login) — same glass surface as **`AdminPanel`**. */
export function AdminAuthPanel({ children }: { children: ReactNode }) {
  return (
    <div data-admin-surface="auth-panel" className={adminPanelSurfaceClass}>
      {children}
    </div>
  );
}
