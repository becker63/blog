import { buildTasteProfile } from "../taste-profile";

buildTasteProfile()
  .then(() => {
    console.log("Updated content/automation/taste-profile.md");
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
