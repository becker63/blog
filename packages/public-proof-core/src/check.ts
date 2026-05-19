import fs from "node:fs";
import { audienceGateMatrix, gateChannelSchema, audienceGateSchema } from "./audience";
import { fixtureLaunchJsonPath } from "./paths";

const gates = audienceGateSchema.options;
let ok = true;
for (const g of gates) {
  const row = audienceGateMatrix[g];
  for (const channel of gateChannelSchema.options) {
    if (!(channel in row)) {
      ok = false;
      void process.stderr.write(`Audience gate "${g}" missing channel "${channel}"\n`);
    }
  }
}
const fixturePath = fixtureLaunchJsonPath("searchbench-100x");
if (!fs.existsSync(fixturePath)) {
  ok = false;
  void process.stderr.write(`missing fixture ${fixturePath}\n`);
}

if (!ok) {
  throw new Error("public-proof-core check failed.");
}

void process.stdout.write(`public-proof-core: matrix + fixture stub OK (${gates.length} gates)\n`);
