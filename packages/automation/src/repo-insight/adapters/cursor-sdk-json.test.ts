import assert from "node:assert/strict";
import test from "node:test";
import { summarizeCursorJsonShape } from "./cursor-sdk-json";

test("summarizeCursorJsonShape reports issue draft keys without content", () => {
  assert.deepEqual(
    summarizeCursorJsonShape({
      kind: "insight",
      issue: {
        title: "A generated title",
        hiddenThesis: "A thesis",
      },
    }),
    {
      topLevelType: "object",
      topLevelKeys: ["kind", "issue"],
      issueKeys: ["title", "hiddenThesis"],
    },
  );
});

test("summarizeCursorJsonShape reports malformed top-level issue drafts", () => {
  assert.deepEqual(
    summarizeCursorJsonShape({
      kind: "insight",
      title: "Flattened title",
      whySelected: "Flattened body",
    }),
    {
      topLevelType: "object",
      topLevelKeys: ["kind", "title", "whySelected"],
      issueKeys: undefined,
    },
  );
});
