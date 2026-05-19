import type { ReactNode } from "react";

import { cx } from "@/styled-system/css";

import { adminChrome } from "./tokens";

export function AdminStack({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(adminChrome.stack, className)}>{children}</div>;
}

export function AdminStackLoose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(adminChrome.stackLoose, className)}>{children}</div>;
}

export function AdminFormRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(adminChrome.formInline, className)}>{children}</div>;
}

export function AdminLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <label className={cx(adminChrome.label, className)}>{children}</label>;
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function AdminInput({ className, ...props }: InputProps) {
  return <input className={cx(adminChrome.input, className)} {...props} />;
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function AdminSelect({ className, ...props }: SelectProps) {
  return <select className={cx(adminChrome.select, className)} {...props} />;
}

export function AdminPrimaryButton({
  className,
  children,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cx(adminChrome.primaryButton, className)} {...props}>
      {children}
    </button>
  );
}

export function AdminSecondaryButton({
  className,
  children,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cx(adminChrome.secondaryButton, className)} {...props}>
      {children}
    </button>
  );
}

export function AdminCompactButton({
  className,
  children,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cx(adminChrome.compactButton, className)} {...props}>
      {children}
    </button>
  );
}

export function AdminGhostButton({
  className,
  children,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={cx(adminChrome.ghostButton, className)} {...props}>
      {children}
    </button>
  );
}

export function AdminAlert({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p role="alert" className={cx(adminChrome.alertError, className)}>
      {children}
    </p>
  );
}
