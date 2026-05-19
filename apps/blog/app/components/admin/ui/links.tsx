import Link from "next/link";
import type { ReactNode } from "react";

import { css, cx } from "@/styled-system/css";

import { adminChrome } from "./tokens";

/** In-app navigation — white + underline (matches blog text links on dark glass). */
export function AdminTextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx(adminChrome.textLink, className)}>
      {children}
    </Link>
  );
}

/** External or accented admin links (Search / MDX style). */
export function AdminAccentLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={cx(adminChrome.accentLink, className)} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export function AdminAccentNavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cx(adminChrome.accentLink, className)}>
      {children}
    </Link>
  );
}

export function AdminBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <nav className={adminChrome.breadcrumbNav}>
      <AdminTextLink href={href}>{children}</AdminTextLink>
    </nav>
  );
}

export function AdminLoginBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={cx(adminChrome.textLink, css({ display: "block", mt: "4", fontSize: "sm" }))}>
      {children}
    </Link>
  );
}

export function AdminSubNav({ children }: { children: ReactNode }) {
  return <nav className={adminChrome.subNav}>{children}</nav>;
}
