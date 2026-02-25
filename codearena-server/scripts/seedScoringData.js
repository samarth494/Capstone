/**
 * Scoring System — Test Data Seed
 *
 * Usage:
 *   node scripts/seedScoringData.js
 *
 * Seeds 8 example participants with diverse scoring profiles to
 * demonstrate ranking, tie-breaking, and edge-case handling.
 *
 * Requires MONGO_URI in .env (same as the main server).
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const ScoringSubmission = require("../models/ScoringSubmission");
const { computeScores } = require("../utils/scoringEngine");

// ── Example Participants ─────────────────────────────────────────────────────
const participants = [
  {
    userId: new mongoose.Types.ObjectId(),
    username: "alice_coder",
    eventId: "blind-coding-2026",
    passedTestCases: 10,
    totalTestCases: 10, // 100 % correct
    executionTimeMs: 120,
    maxTimeAllowed: 500, // fast
    syntaxErrors: 0,
    maxSyntaxErrorsAllowed: 5, // perfect syntax
    understandingScore: 720, // near-max judge
    readabilityScore: 480, // near-max judge
    submittedAt: new Date("2026-02-25T10:00:00Z"),
  },
  {
    userId: new mongoose.Types.ObjectId(),
    username: "bob_dev",
    eventId: "blind-coding-2026",
    passedTestCases: 10,
    totalTestCases: 10, // also 100 %
    executionTimeMs: 120,
    maxTimeAllowed: 500, // same time as alice
    syntaxErrors: 0,
    maxSyntaxErrorsAllowed: 5, // same syntax
    understandingScore: 720,
    readabilityScore: 480,
    submittedAt: new Date("2026-02-25T10:05:00Z"), // submitted LATER → lower rank (tie-break #4)
  },
  {
    userId: new mongoose.Types.ObjectId(),
    username: "charlie_hack",
    eventId: "blind-coding-2026",
    passedTestCases: 8,
    totalTestCases: 10, // 80 % correct
    executionTimeMs: 50,
    maxTimeAllowed: 500, // very fast
    syntaxErrors: 1,
    maxSyntaxErrorsAllowed: 5,
    understandingScore: 700,
    readabilityScore: 450,
    submittedAt: new Date("2026-02-25T09:55:00Z"),
  },
  {
    userId: new mongoose.Types.ObjectId(),
    username: "diana_code",
    eventId: "blind-coding-2026",
    passedTestCases: 10,
    totalTestCases: 10,
    executionTimeMs: 450,
    maxTimeAllowed: 500, // close to TLE
    syntaxErrors: 3,
    maxSyntaxErrorsAllowed: 5,
    understandingScore: 600,
    readabilityScore: 400,
    submittedAt: new Date("2026-02-25T10:10:00Z"),
  },
  {
    userId: new mongoose.Types.ObjectId(),
    username: "eve_ninja",
    eventId: "blind-coding-2026",
    passedTestCases: 5,
    totalTestCases: 10, // only 50 %
    executionTimeMs: 600,
    maxTimeAllowed: 500, // TLE → efficiency = 0
    syntaxErrors: 6,
    maxSyntaxErrorsAllowed: 5, // exceeds max → syntax = 0
    understandingScore: 300,
    readabilityScore: 200,
    submittedAt: new Date("2026-02-25T10:15:00Z"),
  },
  {
    userId: new mongoose.Types.ObjectId(),
    username: "frank_zero",
    eventId: "blind-coding-2026",
    passedTestCases: 0,
    totalTestCases: 10, // 0 % correct — edge case
    executionTimeMs: 0,
    maxTimeAllowed: 500, // instant but wrong
    syntaxErrors: 0,
    maxSyntaxErrorsAllowed: 5,
    understandingScore: 0,
    readabilityScore: 0,
    submittedAt: new Date("2026-02-25T10:20:00Z"),
  },
  {
    userId: new mongoose.Types.ObjectId(),
    username: "grace_pro",
    eventId: "blind-coding-2026",
    passedTestCases: 9,
    totalTestCases: 10,
    executionTimeMs: 200,
    maxTimeAllowed: 500,
    syntaxErrors: 2,
    maxSyntaxErrorsAllowed: 5,
    understandingScore: 750, // perfect understanding
    readabilityScore: 500, // perfect readability
    submittedAt: new Date("2026-02-25T09:50:00Z"),
  },
  {
    userId: new mongoose.Types.ObjectId(),
    username: "hank_slow",
    eventId: "blind-coding-2026",
    passedTestCases: 10,
    totalTestCases: 10,
    executionTimeMs: 500,
    maxTimeAllowed: 500, // exactly at limit → efficiency = 0
    syntaxErrors: 5,
    maxSyntaxErrorsAllowed: 5, // exactly at max → syntax = 0
    understandingScore: 750,
    readabilityScore: 500,
    submittedAt: new Date("2026-02-25T10:25:00Z"),
  },
];

// ── Seed Logic ───────────────────────────────────────────────────────────────
async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌  MONGO_URI not found in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅  Connected to MongoDB");

  // Clear existing scored submissions for this event
  const eventId = "blind-coding-2026";
  const deleted = await ScoringSubmission.deleteMany({ eventId });
  console.log(
    `🗑️   Cleared ${deleted.deletedCount} old entries for event "${eventId}"`,
  );

  // Insert scored submissions
  for (const p of participants) {
    const scores = computeScores(p);

    await ScoringSubmission.create({
      ...p,
      correctnessScore: scores.correctnessScore,
      efficiencyScore: scores.efficiencyScore,
      syntaxScore: scores.syntaxScore,
      understandingScore: scores.understandingScore,
      readabilityScore: scores.readabilityScore,
      totalScore: scores.totalScore,
    });

    console.log(
      `   📝  ${p.username.padEnd(16)} → ` +
        `C=${String(scores.correctnessScore).padStart(6)} ` +
        `E=${String(scores.efficiencyScore).padStart(6)} ` +
        `S=${String(scores.syntaxScore).padStart(6)} ` +
        `U=${String(scores.understandingScore).padStart(4)} ` +
        `R=${String(scores.readabilityScore).padStart(4)} ` +
        `| TOTAL = ${scores.totalScore}`,
    );
  }

  // Display final leaderboard
  console.log("\n🏆  LEADERBOARD (blind-coding-2026):");
  console.log("─".repeat(100));

  const ranked = await ScoringSubmission.find({ eventId })
    .sort({
      totalScore: -1,
      syntaxErrors: 1,
      executionTimeMs: 1,
      submittedAt: 1,
    })
    .lean();

  ranked.forEach((entry, idx) => {
    console.log(
      `   #${String(idx + 1).padStart(2)}  ` +
        `${entry.username.padEnd(16)} ` +
        `TOTAL=${String(entry.totalScore).padStart(7)} ` +
        `| Errors=${entry.syntaxErrors} ` +
        `Time=${String(entry.executionTimeMs).padStart(4)}ms ` +
        `Submitted=${entry.submittedAt.toISOString()}`,
    );
  });

  console.log("─".repeat(100));
  console.log(`\n✅  Seeded ${participants.length} participants. Done!`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
