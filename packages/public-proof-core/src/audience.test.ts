import test from "node:test";
import assert from "node:assert/strict";
import { dispositionForGate } from "./audience";

test("audience gate matrix: professional_network restricts reddit/bluesky as specified", () => {
  assert.equal(dispositionForGate("professional_network", "linkedin"), "allow_public_or_connections");
  assert.equal(dispositionForGate("professional_network", "reddit"), "disable");
  assert.equal(dispositionForGate("professional_network", "bluesky"), "disable");
  assert.equal(dispositionForGate("professional_network", "substack"), "manual_review");
});

test("technical_public exposes manual_review for Reddit", () => {
  assert.equal(dispositionForGate("technical_public", "reddit"), "manual_review");
  assert.equal(dispositionForGate("technical_public", "devto"), "allow");
});
