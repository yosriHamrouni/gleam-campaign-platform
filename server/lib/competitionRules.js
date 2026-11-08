// server/lib/competitionRules.js
// Business rules with no Express or MongoDB dependency, so they are unit-tested directly.
import { randomInt } from "node:crypto";

export const ACTION_TYPES = [
  "follow_instagram",
  "follow_twitter",
  "subscribe_youtube",
  "visit_website",
  "share_post",
  "custom",
];

export const COMPETITION_TYPES = ["standard", "quick-draw", "tournament", "challenge"];

const ACTION_LABELS = {
  follow_instagram: "Follow on Instagram",
  follow_twitter: "Follow on X (Twitter)",
  subscribe_youtube: "Subscribe on YouTube",
  visit_website: "Visit website",
  share_post: "Share post",
  custom: "Custom action",
};

export const defaultActionLabel = (type) => ACTION_LABELS[type] || "Action";

export const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
export const makeShortCode = (length = 6) =>
  Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

const isHttpUrl = (s) => {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Validates and normalises the body of a create/update request.
 * Returns { value, errors }; `errors` is empty when the input is valid.
 * With `partial`, only the fields present are checked (for updates).
 */
export function validateCompetitionInput(body = {}, { partial = false } = {}) {
  const errors = [];
  const value = {};
  const has = (k) => body[k] !== undefined;
  const need = (k) => !partial || has(k);

  if (need("title")) {
    const title = String(body.title ?? "").trim();
    if (!title) errors.push("title is required");
    else if (title.length > 120) errors.push("title must be at most 120 characters");
    value.title = title;
  }
  if (need("description")) {
    const description = String(body.description ?? "").trim();
    if (!description) errors.push("description is required");
    else if (description.length > 2000) errors.push("description must be at most 2000 characters");
    value.description = description;
  }
  if (has("type")) {
    if (!COMPETITION_TYPES.includes(body.type)) errors.push(`type must be one of ${COMPETITION_TYPES.join(", ")}`);
    value.type = body.type;
  }
  if (has("prize")) value.prize = String(body.prize ?? "").trim().slice(0, 200);
  if (has("coverImage")) {
    const url = String(body.coverImage ?? "").trim();
    if (url && !isHttpUrl(url)) errors.push("coverImage must be an http(s) URL");
    value.coverImage = url || null;
  }
  if (has("winnersCount")) {
    const n = Number(body.winnersCount);
    if (!Number.isInteger(n) || n < 1 || n > 100) errors.push("winnersCount must be an integer between 1 and 100");
    value.winnersCount = n;
  }

  for (const key of ["startDate", "endDate"]) {
    if (!need(key)) continue;
    const d = new Date(body[key]);
    if (!body[key] || Number.isNaN(d.getTime())) errors.push(`${key} must be a valid date`);
    else value[key] = d;
  }
  if (value.startDate && value.endDate && value.endDate <= value.startDate) {
    errors.push("endDate must be after startDate");
  }

  if (need("actions")) {
    const actions = Array.isArray(body.actions) ? body.actions : [];
    if (actions.length === 0) errors.push("add at least one action");
    if (actions.length > 20) errors.push("a competition can have at most 20 actions");
    value.actions = actions.map((a, i) => {
      const type = a?.type;
      const v = String(a?.value ?? "").trim();
      const points = a?.points === undefined ? 1 : Number(a.points);
      if (!ACTION_TYPES.includes(type)) errors.push(`actions[${i}].type is not supported`);
      if (!v) errors.push(`actions[${i}].value is required`);
      if (!Number.isInteger(points) || points < 1 || points > 100) {
        errors.push(`actions[${i}].points must be an integer between 1 and 100`);
      }
      const action = { type, value: v, points, label: String(a?.label ?? "").trim() || defaultActionLabel(type) };
      if (a?._id) action._id = a._id;
      return action;
    });
  }

  return { value, errors };
}

/**
 * Entries earned for a set of completed actions: the sum of their points.
 * Unknown or duplicate action ids are ignored, so a client cannot inflate its count.
 */
export function computeEntries(actions, completedIds) {
  const wanted = new Set((completedIds || []).map(String));
  const done = actions.filter((a) => wanted.has(String(a._id)));
  return {
    completedActions: done.map((a) => a._id),
    entries: done.reduce((sum, a) => sum + (Number(a.points) || 0), 0),
  };
}

/**
 * Weighted draw without replacement: each participant's chance is proportional
 * to their entries, and nobody can win twice. `rand(max)` returns an integer in [0, max).
 */
export function drawWinners(participants, count, rand = randomInt) {
  const pool = participants.filter((p) => p.entries > 0).map((p) => ({ ...p }));
  const winners = [];
  while (winners.length < count && pool.length > 0) {
    const total = pool.reduce((s, p) => s + p.entries, 0);
    let ticket = rand(total);
    const index = pool.findIndex((p) => {
      ticket -= p.entries;
      return ticket < 0;
    });
    winners.push(pool[index]);
    pool.splice(index, 1);
  }
  return winners;
}
