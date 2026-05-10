import { writeInsightIndex } from "../render/index-json";

writeInsightIndex()
  .then(() => {
    console.log("Updated content/insights/index.json");
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
