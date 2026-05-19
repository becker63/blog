import type { ReactNode } from "react";

import { cx } from "@/styled-system/css";

import { adminChrome } from "./tokens";

export function AdminTableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(adminChrome.tableWrap, className)}>{children}</div>;
}

export function AdminTable({ children, className }: { children: ReactNode; className?: string }) {
  return <table className={cx(adminChrome.table, className)}>{children}</table>;
}

export function AdminTh({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cx(adminChrome.th, className)}>{children}</th>;
}

export function AdminTr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cx(adminChrome.tr, className)}>{children}</tr>;
}

export function AdminTd({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cx(adminChrome.td, className)}>{children}</td>;
}
