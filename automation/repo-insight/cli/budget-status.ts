import {
  aggregatorDailyLimit,
  getTodayBudget,
  producerScheduledLimit,
  readBudgetState,
} from "../storage/budget-state";

const main = async () => {
  const state = await readBudgetState();
  const { day, budget } = getTodayBudget(state);

  console.log(
    [
      "Repo Insight Budget",
      `  day: ${day} UTC`,
      `  producer scheduled runs: ${budget.producerScheduledRuns}/${producerScheduledLimit()}`,
      `  producer manual runs: ${budget.producerManualRuns}`,
      `  aggregator runs: ${budget.aggregatorRuns}/${aggregatorDailyLimit()}`,
      `  last producer run: ${budget.lastProducerRunAt ?? "never"}`,
      `  last aggregator run: ${budget.lastAggregatorRunAt ?? "never"}`,
      `  estimated input tokens: ${budget.estimatedInputTokens}`,
      `  estimated output tokens: ${budget.estimatedOutputTokens}`,
    ].join("\n"),
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
