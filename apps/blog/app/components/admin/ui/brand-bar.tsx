"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteStatusBar } from "@/app/components/shared/SiteStatusBar";
import { css } from "@/styled-system/css";

import { adminChrome } from "./tokens";

const NAV: { href: string; label: string }[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/launches", label: "Launches" },
  { href: "/admin/audit", label: "Audit log" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/accounts", label: "Accounts" },
  { href: "/admin/settings", label: "Settings" },
];

function navClass(active: boolean) {
  return active ? adminChrome.navPillActive : adminChrome.navPill;
}

function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminBrandBar({ rightSlot }: { rightSlot?: ReactNode }) {
  const pathname = usePathname() ?? "";

  return (
    <SiteStatusBar mode="fixed" row="spaceBetween" data-testid="admin-brand-bar">
      <div
        className={css({
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "3",
          w: "100%",
          rowGap: "2",
        })}
      >
        <div
          className={css({
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: { base: "3", md: "5" },
            minW: "0",
          })}
        >
          <span className={adminChrome.logoMark}>PublicProof</span>
          <div
            aria-label="Admin sections"
            className={css({
              display: "flex",
              flexWrap: "wrap",
              gap: "1",
              alignItems: "center",
              pl: { base: "0", md: "3" },
              borderLeftWidth: { base: "0", md: "1px" },
              borderLeftStyle: "solid",
              borderLeftColor: "glass.border",
            })}
          >
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} className={navClass(isNavActive(pathname, href))}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        {rightSlot ? (
          <div
            className={css({
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
            })}
          >
            {rightSlot}
          </div>
        ) : null}
      </div>
    </SiteStatusBar>
  );
}
