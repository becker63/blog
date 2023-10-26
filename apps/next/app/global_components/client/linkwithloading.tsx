"use client";

import { ReactNode, useState, useEffect } from "react";
import { Loading } from "../global_loading";

export const Route = (p: { children: ReactNode; href: string; color?: string; className?: string; size: number}) => {
  const [loading, setloading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setloading(false), 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <a
      style={{color: p.color /*, textDecoration: "underline", textDecorationColor: p.color */}}
      href={p.href}
      className={p.className ? p.className + "  hover:text-white": " hover:text-white"}
      onClick={() => setloading(true)}
    >
      {!loading ? p.children : <Loading fontsize={p.size}/>}
    </a>
  );
};
