import type { PlatformPlan } from "./schemas";

export type PlatformProvider = PlatformPlan["provider"];

export const enabledPlatforms = (plans: PlatformPlan[]): PlatformPlan[] =>
  plans.filter((plan) => plan.enabled);

export const findPlatformPlan = (
  plans: PlatformPlan[],
  provider: PlatformProvider,
): PlatformPlan | undefined => plans.find((plan) => plan.provider === provider);
