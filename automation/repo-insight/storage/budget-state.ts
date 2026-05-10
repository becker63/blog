import { readFile, writeFile } from "node:fs/promises";
import { repoInsightBudgetDaySchema, repoInsightBudgetStateSchema } from "../model/schemas";
import { RepoInsightBudgetState } from "../model/types";
import { repoInsightBudgetStatePath } from "./paths";

export type UsageEstimate = {
  inputTokens?: number;
  outputTokens?: number;
};

const emptyBudgetState = (): RepoInsightBudgetState => ({
  schemaVersion: 1,
  days: {},
});

export const utcDay = (date = new Date()) => date.toISOString().slice(0, 10);

export const estimateTokens = (chars: number) => Math.ceil(Math.max(0, chars) / 4);

export const readBudgetState = async (): Promise<RepoInsightBudgetState> => {
  try {
    return repoInsightBudgetStateSchema.parse(JSON.parse(await readFile(repoInsightBudgetStatePath, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyBudgetState();
    throw error;
  }
};

export const writeBudgetState = async (state: RepoInsightBudgetState) => {
  const text = `${JSON.stringify(repoInsightBudgetStateSchema.parse(state), null, 2)}\n`;
  await writeFile(repoInsightBudgetStatePath, text, "utf8");
};

/** Avoid touching the file/git when nothing changed. */
export const writeBudgetStateIfChanged = async (nextState: RepoInsightBudgetState) => {
  const canonical = `${JSON.stringify(repoInsightBudgetStateSchema.parse(nextState), null, 2)}\n`;
  try {
    const previous = await readFile(repoInsightBudgetStatePath, "utf8");
    if (previous === canonical) return;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  await writeFile(repoInsightBudgetStatePath, canonical, "utf8");
};

export const getTodayBudget = (state: RepoInsightBudgetState, date = new Date()) => {
  const day = utcDay(date);
  return {
    day,
    budget: repoInsightBudgetDaySchema.parse(state.days[day] ?? {}),
  };
};

const budgetDisabled = () => process.env.REPO_INSIGHT_DISABLE_BUDGET === "true";

export const producerScheduledLimit = () => Number(process.env.REPO_INSIGHT_PRODUCER_DAILY_LIMIT ?? "4");
export const aggregatorDailyLimit = () => Number(process.env.REPO_INSIGHT_AGGREGATOR_DAILY_LIMIT ?? "1");

export const canRunProducerScheduled = (state: RepoInsightBudgetState, date = new Date()) => {
  if (budgetDisabled()) return { ok: true, limit: producerScheduledLimit(), used: 0 };
  const { budget } = getTodayBudget(state, date);
  const limit = producerScheduledLimit();
  return {
    ok: budget.producerScheduledRuns < limit,
    limit,
    used: budget.producerScheduledRuns,
  };
};

export const canRunAggregator = (state: RepoInsightBudgetState, date = new Date()) => {
  if (budgetDisabled()) return { ok: true, limit: aggregatorDailyLimit(), used: 0 };
  const { budget } = getTodayBudget(state, date);
  const limit = aggregatorDailyLimit();
  return {
    ok: budget.aggregatorRuns < limit,
    limit,
    used: budget.aggregatorRuns,
  };
};

const updateToday = (
  state: RepoInsightBudgetState,
  updater: (day: ReturnType<typeof getTodayBudget>["budget"], now: string) => ReturnType<typeof getTodayBudget>["budget"],
  date = new Date(),
) => {
  const { day, budget } = getTodayBudget(state, date);
  return repoInsightBudgetStateSchema.parse({
    ...state,
    days: {
      ...state.days,
      [day]: updater(budget, date.toISOString()),
    },
  });
};

const addUsage = <T extends { estimatedInputTokens: number; estimatedOutputTokens: number }>(
  budget: T,
  usage: UsageEstimate,
) => ({
  ...budget,
  estimatedInputTokens: budget.estimatedInputTokens + Math.max(0, Math.round(usage.inputTokens ?? 0)),
  estimatedOutputTokens: budget.estimatedOutputTokens + Math.max(0, Math.round(usage.outputTokens ?? 0)),
});

export const recordProducerScheduledRun = (
  state: RepoInsightBudgetState,
  usage: UsageEstimate = {},
  date = new Date(),
) =>
  updateToday(
    state,
    (budget, now) => ({
      ...addUsage(budget, usage),
      producerScheduledRuns: budget.producerScheduledRuns + 1,
      lastProducerRunAt: now,
    }),
    date,
  );

export const recordProducerManualRun = (
  state: RepoInsightBudgetState,
  usage: UsageEstimate = {},
  date = new Date(),
) =>
  updateToday(
    state,
    (budget, now) => ({
      ...addUsage(budget, usage),
      producerManualRuns: budget.producerManualRuns + 1,
      lastProducerRunAt: now,
    }),
    date,
  );

export const recordAggregatorRun = (
  state: RepoInsightBudgetState,
  usage: UsageEstimate = {},
  date = new Date(),
) =>
  updateToday(
    state,
    (budget, now) => ({
      ...addUsage(budget, usage),
      aggregatorRuns: budget.aggregatorRuns + 1,
      lastAggregatorRunAt: now,
    }),
    date,
  );
