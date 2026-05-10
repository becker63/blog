import assert from "node:assert/strict";
import test from "node:test";
import { normalizeRepoFullName } from "./collect-insights";

test("normalizeRepoFullName trims spaces around slash", () => {
  assert.equal(normalizeRepoFullName("becker63 / blog"), "becker63/blog");
});

test("normalizeRepoFullName accepts GitHub https URL", () => {
  assert.equal(normalizeRepoFullName("https://github.com/becker63/blog"), "becker63/blog");
});

test("normalizeRepoFullName rejects junk", () => {
  assert.equal(normalizeRepoFullName("not a slug"), undefined);
});
