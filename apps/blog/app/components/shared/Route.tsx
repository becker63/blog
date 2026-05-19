"use client";

import { css, cx } from "@/styled-system/css";
import { ReactNode, useState, useEffect } from "react";
import { Loading } from "./Loading";

export interface RouteProps {
  children: ReactNode;
  href: string;
  color?: string;
  className?: string;
  size: number;
}

/**
 * A link component with loading state indicator.
 * Shows a loading animation for 3 seconds after click.
 */
export const Route = ({
  children,
  href,
  color,
  className,
  size,
}: RouteProps) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  const isExternal = href.startsWith("https://");

  return (
    <a
      style={{ color }}
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cx(className, css({ _hover: { color: "white" } }))}
      onClick={() => {
        if (!isExternal) setLoading(true);
      }}
    >
      {!loading ? children : <Loading fontsize={size} />}
    </a>
  );
};
