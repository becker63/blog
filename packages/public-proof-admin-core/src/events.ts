import { z } from "zod";

/** Serializable domain events for admin “world” fold — DB and canonical fixture share this vocabulary. */
export const adminDomainEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("world.reset"),
    payload: z.object({}).optional(),
  }),
  z.object({
    type: z.literal("chart.point"),
    payload: z.object({
      label: z.string(),
      runningJobs: z.number(),
      planProposals: z.number(),
    }),
  }),
  z.object({
    type: z.literal("signals.sync"),
    payload: z.object({
      runningJobs: z.number(),
      jobsNeedingAttention: z.number(),
      planProposals: z.number(),
      unreadNotifications: z.number(),
    }),
  }),
  z.object({
    type: z.literal("launches.preview"),
    payload: z.object({
      launches: z.array(
        z.object({
          slug: z.string(),
          title: z.string(),
          audienceGate: z.string(),
        }),
      ),
    }),
  }),
  z.object({
    type: z.literal("db.overviewLoaded"),
    payload: z.object({
      ok: z.boolean(),
      runningJobs: z.number(),
      jobsNeedingAttention: z.number(),
      planProposals: z.number(),
      unreadNotifications: z.number(),
      launches: z.array(
        z.object({
          slug: z.string(),
          title: z.string(),
          audienceGate: z.string(),
        }),
      ),
      chartPoints: z
        .array(
          z.object({
            label: z.string(),
            runningJobs: z.number(),
            planProposals: z.number(),
          }),
        )
        .optional(),
    }),
  }),
]);

export type AdminDomainEvent = z.infer<typeof adminDomainEventSchema>;
