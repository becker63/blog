import type { AdminDomainEvent } from "./events";

export type AdminChartPoint = {
  label: string;
  runningJobs: number;
  planProposals: number;
};

export type AdminWorldState = {
  chartPoints: AdminChartPoint[];
  signals: {
    runningJobs: number;
    jobsNeedingAttention: number;
    planProposals: number;
    unreadNotifications: number;
  };
  launchesPreview: Array<{ slug: string; title: string; audienceGate: string }>;
  dbAvailable: boolean;
};

export const initialAdminWorldState: AdminWorldState = {
  chartPoints: [],
  signals: {
    runningJobs: 0,
    jobsNeedingAttention: 0,
    planProposals: 0,
    unreadNotifications: 0,
  },
  launchesPreview: [],
  dbAvailable: false,
};

export function reduceAdminWorld(
  state: AdminWorldState,
  event: AdminDomainEvent,
): AdminWorldState {
  switch (event.type) {
    case "world.reset":
      return { ...initialAdminWorldState };

    case "chart.point": {
      const next = [...state.chartPoints, event.payload];
      return { ...state, chartPoints: next };
    }

    case "signals.sync":
      return {
        ...state,
        signals: { ...event.payload },
        dbAvailable: true,
      };

    case "launches.preview":
      return { ...state, launchesPreview: event.payload.launches };

    case "db.overviewLoaded": {
      const { payload } = event;
      const chartPoints =
        payload.chartPoints && payload.chartPoints.length > 0
          ? payload.chartPoints
          : payload.ok
            ? [
                {
                  label: "live",
                  runningJobs: payload.runningJobs,
                  planProposals: payload.planProposals,
                },
              ]
            : [];

      return {
        chartPoints,
        signals: {
          runningJobs: payload.runningJobs,
          jobsNeedingAttention: payload.jobsNeedingAttention,
          planProposals: payload.planProposals,
          unreadNotifications: payload.unreadNotifications,
        },
        launchesPreview: payload.launches.slice(0, 6),
        dbAvailable: payload.ok,
      };
    }

    default:
      return state;
  }
}

export function foldEvents(events: readonly AdminDomainEvent[]): AdminWorldState {
  return events.reduce(reduceAdminWorld, initialAdminWorldState);
}
