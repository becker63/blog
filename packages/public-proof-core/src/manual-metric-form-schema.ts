import { z } from "zod";

const optionalTrim = z.preprocess((v) => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}, z.string().min(1).max(240).optional());

/** Parse empty / whitespace as `undefined`; whole non-negative ints only for admin metrics form. */
export function parseOptionalNonNegativeInt(formValue: FormDataEntryValue | null | undefined): number | undefined {
  if (formValue == null) return undefined;
  const raw = typeof formValue === "string" ? formValue.trim() : String(formValue ?? "").trim();
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("manual_metric_integer_invalid");
  }
  return n;
}

/** Zod-validated invariant fields — numeric columns parsed separately from `FormData` for clearer errors. */
export const manualMetricSnapshotFormSchema = z.object({
  slug: z.string().min(1).transform((v) => v.trim()),
  capturedAt: z.string().min(8).max(64),
  provider: optionalTrim,
  notes: z.preprocess((v) => {
    if (typeof v !== "string") return undefined;
    const t = v.trim();
    return t.length ? t : undefined;
  }, z.string().min(1).max(4000).optional()),
});

export type ManualMetricSnapshotFormInput = z.infer<typeof manualMetricSnapshotFormSchema>;
