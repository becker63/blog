import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lastValueFrom } from "rxjs";
import { scan } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";

import { ADMIN_UI_WORLD_EVENTS } from "./fixture/admin-ui-world";
import { reduceAdminWorld, initialAdminWorldState, type AdminWorldState } from "./admin-world";
import { fixtureEventStream$, adminWorldState$ } from "./streams";

describe("admin world stream", () => {
  it("fixture cold stream folds to same world as runFixtureScenario", async () => {
    const st = await lastValueFrom(adminWorldState$(fixtureEventStream$()));
    assert.equal(st.signals.runningJobs, 2);
    assert.equal(st.chartPoints.length, 3);
    assert.equal(st.launchesPreview.length, 2);
    assert.equal(st.dbAvailable, true);
  });

  it("TestScheduler marble: scan applies chart.point events in order", () => {
    const ts = new TestScheduler((actual, expected) => {
      assert.deepEqual(actual, expected);
    });

    ts.run(() => {
      const a = ADMIN_UI_WORLD_EVENTS[1];
      const b = ADMIN_UI_WORLD_EVENTS[2];
      assert(a?.type === "chart.point" && b?.type === "chart.point");

      const source = ts.createColdObservable("--a--b|", { a, b });
      const result = source.pipe(scan(reduceAdminWorld, initialAdminWorldState));

      const x = reduceAdminWorld(initialAdminWorldState, a);
      const y = reduceAdminWorld(x, b);

      ts.expectObservable(result).toBe("--x--y|", {
        x,
        y,
      });
    });
  });
});
