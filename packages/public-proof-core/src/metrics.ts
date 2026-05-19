import fs from "node:fs";
import path from "node:path";
import { metricSnapshotSchema, type MetricSnapshot } from "./schemas";
import { launchDir } from "./paths";

const snapshotsDir = (launchId: string) => path.join(launchDir(launchId), "snapshots");

export const readMetricSnapshots = (launchId: string): MetricSnapshot[] => {
  const dir = snapshotsDir(launchId);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8"));
      return metricSnapshotSchema.parse(raw);
    });
};

export const writeMetricSnapshot = (launchId: string, snapshot: MetricSnapshot): void => {
  const dir = snapshotsDir(launchId);
  fs.mkdirSync(dir, { recursive: true });
  const fileName = `${snapshot.publicationId}-${snapshot.capturedAt.replace(/[:.]/g, "-")}.json`;
  fs.writeFileSync(path.join(dir, fileName), `${JSON.stringify(snapshot, null, 2)}\n`);
};
