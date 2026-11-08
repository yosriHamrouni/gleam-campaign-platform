// server/seed.js — fills a local database with fictional demo data.  Usage: npm run seed
// Wipes the users, competitions and entries collections first.
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";
import User from "./models/User.js";
import Competition from "./models/Competition.js";
import Entry from "./models/Entry.js";
import { computeEntries, defaultActionLabel, makeShortCode, slugify } from "./lib/competitionRules.js";

if (env.isProduction) {
  console.error("Refusing to seed a production database.");
  process.exit(1);
}

// Demo accounts — local development only.
export const DEMO_CREATOR = { name: "Demo Creator", email: "creator@demo.test", password: "demo-pass-123" };
const PARTICIPANT_PASSWORD = "demo-pass-123";
const PARTICIPANT_NAMES = [
  "Amira Ben Salah", "Lucas Martin", "Sofia Rossi", "Karim Haddad", "Emma Dubois", "Noah Weber",
  "Lina Trabelsi", "Hugo Bernard", "Maya Cohen", "Yanis Mansour", "Chloé Petit", "Omar Jaziri",
];

const day = 24 * 60 * 60 * 1000;
const at = (days) => new Date(Date.now() + days * day);

const CAMPAIGNS = [
  {
    title: "Summer Sneaker Giveaway",
    description: "Win a pair of limited-edition running shoes. Every action you complete earns extra entries.",
    prize: "Limited-edition running shoes",
    type: "standard",
    startDate: at(-6), endDate: at(21), winnersCount: 2,
    coverImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=70",
    actions: [
      { type: "follow_instagram", value: "@stridelab", points: 2 },
      { type: "follow_twitter", value: "@stridelab", points: 2 },
      { type: "visit_website", value: "https://example.com/stridelab", points: 1 },
      { type: "subscribe_youtube", value: "https://youtube.com/@stridelab", points: 3 },
    ],
    participants: 10,
  },
  {
    title: "Coffee Lovers Quick Draw",
    description: "A one-week draw for a year of specialty coffee.",
    prize: "12 months of specialty coffee",
    type: "quick-draw",
    startDate: at(-3), endDate: at(4), winnersCount: 1,
    coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=70",
    actions: [
      { type: "follow_twitter", value: "@beanbox", points: 1 },
      { type: "share_post", value: "https://example.com/beanbox/launch", points: 3 },
    ],
    participants: 7,
  },
  {
    title: "Indie Game Launch Contest",
    description: "Celebrate our launch: win early-access keys and merch.",
    prize: "5 early-access keys + merch pack",
    type: "challenge",
    startDate: at(-20), endDate: at(-1), winnersCount: 3,
    coverImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=70",
    actions: [
      { type: "subscribe_youtube", value: "https://youtube.com/@pixelfox", points: 2 },
      { type: "visit_website", value: "https://example.com/pixelfox", points: 1 },
      { type: "custom", value: "Wishlist the game on your favourite store", points: 3, label: "Wishlist the game" },
    ],
    participants: 9,
  },
  {
    title: "Back-to-School Bundle",
    description: "Laptop bag and stationery bundle for students.",
    prize: "Laptop bag + stationery bundle",
    type: "standard",
    startDate: at(5), endDate: at(30), winnersCount: 1,
    coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=70",
    actions: [{ type: "follow_instagram", value: "@campuskit", points: 1 }],
    participants: 0,
  },
];

const pickSome = (arr, seed) => arr.filter((_, i) => (seed + i) % 3 !== 0 || i === 0);

async function main() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Competition.deleteMany({}), Entry.deleteMany({})]);

  const creator = await User.create({ ...DEMO_CREATOR, password: await bcrypt.hash(DEMO_CREATOR.password, 10) });
  const hash = await bcrypt.hash(PARTICIPANT_PASSWORD, 10);
  const participants = await User.insertMany(
    PARTICIPANT_NAMES.map((name) => ({ name, email: `${slugify(name)}@demo.test`, password: hash }))
  );

  for (const spec of CAMPAIGNS) {
    const { participants: count, ...data } = spec;
    const competition = await Competition.create({
      ...data,
      actions: data.actions.map((a) => ({ ...a, label: a.label || defaultActionLabel(a.type) })),
      createdBy: creator._id,
      slug: slugify(data.title),
      shortCode: makeShortCode(),
      impressions: count * 4 + 11,
    });
    let total = 0;
    for (let i = 0; i < count; i++) {
      const done = pickSome(competition.actions, i).map((a) => a._id);
      const { completedActions, entries } = computeEntries(competition.actions, done);
      await Entry.create({ competition: competition._id, user: participants[i]._id, completedActions, entries });
      total += entries;
    }
    competition.participants = count;
    competition.totalEntries = total;
    await competition.save();
    console.log(`• ${competition.title}: ${count} participants, ${total} entries`);
  }

  console.log(`\nSign in as ${DEMO_CREATOR.email} / ${DEMO_CREATOR.password}`);
  console.log(`Participants: <name>@demo.test / ${PARTICIPANT_PASSWORD} (e.g. ${participants[0].email})`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
