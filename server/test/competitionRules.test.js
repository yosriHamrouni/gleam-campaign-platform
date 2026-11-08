// server/test/competitionRules.test.js — run with `npm test`
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeEntries, drawWinners, slugify, validateCompetitionInput } from "../lib/competitionRules.js";

const validBody = {
  title: "Summer Giveaway",
  description: "Win a prize",
  startDate: "2026-01-01T10:00:00Z",
  endDate: "2026-01-31T10:00:00Z",
  actions: [{ type: "visit_website", value: "https://example.com", points: 2 }],
};

test("accepts a valid competition and fills default labels", () => {
  const { value, errors } = validateCompetitionInput(validBody);
  assert.deepEqual(errors, []);
  assert.equal(value.actions[0].label, "Visit website");
  assert.ok(value.startDate instanceof Date);
});

test("rejects an end date before the start date", () => {
  const { errors } = validateCompetitionInput({ ...validBody, endDate: "2025-12-01T00:00:00Z" });
  assert.ok(errors.includes("endDate must be after startDate"));
});

test("rejects unknown action types, empty values and bad points", () => {
  const { errors } = validateCompetitionInput({
    ...validBody,
    actions: [{ type: "hack", value: "", points: 0 }],
  });
  assert.equal(errors.length, 3);
});

test("requires at least one action", () => {
  const { errors } = validateCompetitionInput({ ...validBody, actions: [] });
  assert.ok(errors.includes("add at least one action"));
});

test("partial validation only checks the fields sent", () => {
  const { value, errors } = validateCompetitionInput({ title: "New name" }, { partial: true });
  assert.deepEqual(errors, []);
  assert.deepEqual(Object.keys(value), ["title"]);
});

test("rejects a non-http cover image", () => {
  const { errors } = validateCompetitionInput({ ...validBody, coverImage: "javascript:alert(1)" });
  assert.ok(errors.includes("coverImage must be an http(s) URL"));
});

test("computeEntries sums points and ignores unknown or repeated ids", () => {
  const actions = [
    { _id: "a", points: 1 },
    { _id: "b", points: 5 },
  ];
  const result = computeEntries(actions, ["b", "b", "zzz"]);
  assert.equal(result.entries, 5);
  assert.deepEqual(result.completedActions, ["b"]);
});

test("drawWinners never picks the same participant twice", () => {
  const people = [
    { user: "u1", entries: 1 },
    { user: "u2", entries: 1 },
    { user: "u3", entries: 1 },
  ];
  const winners = drawWinners(people, 3, () => 0);
  assert.deepEqual(winners.map((w) => w.user).sort(), ["u1", "u2", "u3"]);
});

test("drawWinners weights the draw by entries", () => {
  const people = [
    { user: "small", entries: 1 },
    { user: "big", entries: 9 },
  ];
  // Tickets 0 belongs to "small"; tickets 1..9 belong to "big".
  assert.equal(drawWinners(people, 1, () => 0)[0].user, "small");
  assert.equal(drawWinners(people, 1, () => 1)[0].user, "big");
  assert.equal(drawWinners(people, 1, () => 9)[0].user, "big");
});

test("drawWinners returns fewer winners when there are fewer participants", () => {
  assert.equal(drawWinners([{ user: "only", entries: 3 }], 5).length, 1);
  assert.equal(drawWinners([], 2).length, 0);
});

test("slugify strips accents and punctuation", () => {
  assert.equal(slugify("  Été — Grand Concours! "), "ete-grand-concours");
});
