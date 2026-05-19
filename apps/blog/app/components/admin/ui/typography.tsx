import type { ReactNode } from "react";

import { css, cx } from "@/styled-system/css";

import { adminChrome } from "./tokens";

export function AdminPageTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={cx(adminChrome.pageTitle, className)}>{children}</h1>;
}

export function AdminSectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cx(adminChrome.sectionTitle, className)}>{children}</h2>;
}

export function AdminSubsectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cx(adminChrome.subsectionTitle, className)}>{children}</h3>;
}

export function AdminSubsectionTitleSpaced({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cx(adminChrome.subsectionTitle, css({ mt: "6", mb: "2" }), className)}>{children}</h3>
  );
}

export function AdminBody({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx(adminChrome.body, className)}>{children}</p>;
}

export function AdminMuted({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx(adminChrome.muted, className)}>{children}</p>;
}

export function AdminInlineCode({ children, className }: { children: ReactNode; className?: string }) {
  return <code className={cx(adminChrome.inlineCode, className)}>{children}</code>;
}

export function AdminLoginHeading({ children, className }: { children: ReactNode; className?: string }) {
  return <h1 className={cx(adminChrome.loginTitle, className)}>{children}</h1>;
}

export function AdminMono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx(adminChrome.mono, className)}>{children}</span>;
}

export function AdminMonoBreak({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx(adminChrome.monoBreak, className)}>{children}</span>;
}

export function AdminBulletList({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cx(adminChrome.listDisc, className)}>{children}</ul>;
}

export function AdminDetailList({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cx(adminChrome.detailList, className)}>{children}</ul>;
}

export function AdminMeta({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx(adminChrome.metaCaption, className)}>{children}</span>;
}

export function AdminNoWrap({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx(adminChrome.noWrap, className)}>{children}</span>;
}

export function AdminPreWrap({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx(adminChrome.preWrap, className)}>{children}</p>;
}
