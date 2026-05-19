import assert from "node:assert";
import test from "node:test";

import { sumPartialMetrics, ZERO_METRICS } from "./metric-aggregate";

test("sumPartialMetrics aggregates finite numbers and skips invalid", () => {
  const totals = sumPartialMetrics([
    { impressions: 1, views: 2 },
    { impressions: NaN, views: 3 },
    { reactions: undefined, comments: 4 },
    { impressions: Number.POSITIVE_INFINITY },
    { impressions: Number.NEGATIVE_INFINITY },
  ]);

  assert.equal(totals.impressions, 1);
  assert.equal(totals.views, 5);
  assert.equal(totals.comments, 4);
  assert.equal(totals.reactions, 0);
  assert.deepEqual(sumPartialMetrics([]), ZERO_METRICS);
});