import assert from "node:assert/strict";
import test from "node:test";
import { summarizeCursorJsonShape } from "./cursor-sdk-json";

test("summarizeCursorJsonShape reports nested artifact keys without content", () => {
  assert.deepEqual(
    summarizeCursorJsonShape({
      kind: "insight",
      artifact: {
        frontmatter: { title: "A generated title" },
        sections: { hiddenThesis: "A thesis" },
      },
    }),
    {
      topLevelType: "object",
      topLevelKeys: ["kind", "artifact"],
      artifactKeys: ["frontmatter", "sections"],
    },
  );
});

test("summarizeCursorJsonShape reports flattened near-miss artifacts", () => {
  assert.deepEqual(
    summarizeCursorJsonShape({
      kind: "insight",
      artifact: {
        title: "Flattened title",
        whySelected: "Flattened body",
      },
    }),
    {
      topLevelType: "object",
      topLevelKeys: ["kind", "artifact"],
      artifactKeys: ["title", "whySelected"],
    },
  );
});
