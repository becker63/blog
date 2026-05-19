/** Normalized summed counters for Postgres or JSON metric snapshot rows / UI rollups (Hermes analytics layer). */

export type PartialMetricNums = Partial<{
  impressions: number | null | undefined;
  views: number | null | undefined;
  reactions: number | null | undefined;
  comments: number | null | undefined;
  reposts: number | null | undefined;
  clicks: number | null | undefined;
  saves: number | null | undefined;
  profileViews: number | null | undefined;
  followersDelta: number | null | undefined;
  siteVisits: number | null | undefined;
}>;

export type MetricTotals = {
  impressions: number;
  views: number;
  reactions: number;
  comments: number;
  reposts: number;
  clicks: number;
  saves: number;
  profileViews: number;
  followersDelta: number;
  siteVisits: number;
};

export const ZERO_METRICS: MetricTotals = {
  impressions: 0,
  views: 0,
  reactions: 0,
  comments: 0,
  reposts: 0,
  clicks: 0,
  saves: 0,
  profileViews: 0,
  followersDelta: 0,
  siteVisits: 0,
};

const addFinite = (a: number, v: unknown) => {
  if (typeof v !== "number" || !Number.isFinite(v)) return a;
  return a + v;
};

export const sumPartialMetrics = (rows: PartialMetricNums[]): MetricTotals => {
  return rows.reduce<MetricTotals>(
    (acc, row) => ({
      impressions: addFinite(acc.impressions, row.impressions),
      views: addFinite(acc.views, row.views),
      reactions: addFinite(acc.reactions, row.reactions),
      comments: addFinite(acc.comments, row.comments),
      reposts: addFinite(acc.reposts, row.reposts),
      clicks: addFinite(acc.clicks, row.clicks),
      saves: addFinite(acc.saves, row.saves),
      profileViews: addFinite(acc.profileViews, row.profileViews),
      followersDelta: addFinite(acc.followersDelta, row.followersDelta),
      siteVisits: addFinite(acc.siteVisits, row.siteVisits),
    }),
    { ...ZERO_METRICS },
  );
};
