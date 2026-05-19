export type { AdminDomainEvent } from "./events";
export { adminDomainEventSchema } from "./events";

export {
  initialAdminWorldState,
  reduceAdminWorld,
  foldEvents,
  type AdminWorldState,
  type AdminChartPoint,
} from "./admin-world";

export { ADMIN_UI_WORLD_EVENTS } from "./fixture/admin-ui-world";

export {
  resolveAdminDataSource,
  type AdminDataSource,
  dbOverviewToEvent,
  eventsToWorldState,
  runFixtureScenario,
  runDbScenarioFromOverview,
  runAdminScenario,
  type DbOverviewPayload,
} from "./scenario";

export {
  adminWorldState$,
  adminWorldStateFromSource$,
  fixtureEventStream$,
  dbOverviewWorldStream$,
  adminWorldFromAsyncDb$,
} from "./streams";
