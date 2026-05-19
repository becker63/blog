import type { ReactNode } from "react";

import { adminChrome } from "./tokens";

export function AdminDividedList({ children }: { children: ReactNode }) {
  return <ul className={adminChrome.dividedList}>{children}</ul>;
}

export function AdminDividedItem({ children }: { children: ReactNode }) {
  return <li className={adminChrome.dividedListItem}>{children}</li>;
}
