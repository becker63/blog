"use client";

import { Provider } from "jotai";

/** Wrap private admin routes so `atomWithObservable` atoms resolve with a store. */
export function AdminJotaiRoot({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
