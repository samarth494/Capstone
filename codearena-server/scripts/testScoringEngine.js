/**
 * Scoring Engine — Unit Tests
 *
 * Usage:
 *   node scripts/testScoringEngine.js
 *
 * Validates every scoring function against known inputs/outputs,
 * including all edge cases (division by zero, NaN, negatives, overflow).
 */

const {
  MAX_TOTAL,
  MAX_CORRECTNESS,
  MAX_EFFICIENCY,
  MAX_SYNTAX,
  MAX_UNDERSTANDING,
  MAX_READABILITY,
  calculateCorrectness,
  calculateEfficiency,
  calculateSyntax,
  validateUnderstanding,
  validateReadability,
  computeScores,
} = require("../utils/scoringEngine");

let passed = 0;
let failed = 0;

function assert(testName, actual, expected) {
  // Round both to avoid floating-point comparison issues
  const a = Math.round(actual * 100) / 100;
  const e = Math.round(expected * 100) / 100;

  if (a === e) {
    console.log(`   ✅  ${testName}: ${a}`);
    passed++;
  } else {
    console.error(`   ❌  ${testName}: expected ${e}, got ${a}`);
    failed++;
  }
}

console.log("═══════════════════════════════════════════════════════════════");
console.log("  SCORING ENGINE — UNIT TESTS");
console.log(
  "═══════════════════════════════════════════════════════════════\n",
);

// ── Correctness Tests ────────────────────────────────────────────────────────
console.log("📋  CORRECTNESS (max = 2000)");
assert("All passed (10/10)", calculateCorrectness(10, 10), 2000);
assert("Half passed (5/10)", calculateCorrectness(5, 10), 1000);
assert("None passed (0/10)", calculateCorrectness(0, 10), 0);
assert("One of three (1/3)", calculateCorrectness(1, 3), 666.67);
assert("Division by zero (0/0)", calculateCorrectness(0, 0), 0);
assert("Negative passed (-1/10)", calculateCorrectness(-1, 10), 0);
assert("Passed > total (15/10)", calculateCorrectness(15, 10), 2000); // capped
assert("NaN input", calculateCorrectness(NaN, 10), 0);
assert("Infinity input", calculateCorrectness(Infinity, 10), 0);
console.log("");

// ── Efficiency Tests ─────────────────────────────────────────────────────────
console.log("⚡  EFFICIENCY (max = 1000)");
assert("Instant (0/500)", calculateEfficiency(0, 500), 1000);
assert("Half time (250/500)", calculateEfficiency(250, 500), 500);
assert("At limit (500/500)", calculateEfficiency(500, 500), 0); // TLE
assert("Over limit (600/500)", calculateEfficiency(600, 500), 0); // TLE
assert("Division by zero (100/0)", calculateEfficiency(100, 0), 0);
assert("Negative time (-50/500)", calculateEfficiency(-50, 500), 1000); // treated as 0ms
assert("NaN input", calculateEfficiency(NaN, 500), 0);
assert("Very fast (1/500)", calculateEfficiency(1, 500), 998);
console.log("");

// ── Syntax Tests ─────────────────────────────────────────────────────────────
console.log("📝  SYNTAX ACCURACY (max = 750)");
assert("No errors (0/5)", calculateSyntax(0, 5), 750);
assert("One error (1/5)", calculateSyntax(1, 5), 600);
assert("Half errors (2.5/5)", calculateSyntax(2.5, 5), 375);
assert("Max errors (5/5)", calculateSyntax(5, 5), 0);
assert("Over max errors (8/5)", calculateSyntax(8, 5), 0);
assert("Division by zero (0/0)", calculateSyntax(0, 0), 0);
assert("Negative errors (-1/5)", calculateSyntax(-1, 5), 750); // treated as 0
assert("NaN input", calculateSyntax(NaN, 5), 0);
console.log("");

// ── Understanding Tests ──────────────────────────────────────────────────────
console.log("🧠  UNDERSTANDING (max = 750, manual judge)");
assert("Full marks (750)", validateUnderstanding(750), 750);
assert("Zero", validateUnderstanding(0), 0);
assert("Mid (400)", validateUnderstanding(400), 400);
assert("Over max (900)", validateUnderstanding(900), 750); // clamped
assert("Negative (-100)", validateUnderstanding(-100), 0); // clamped
assert("NaN", validateUnderstanding(NaN), 0);
console.log("");

// ── Readability Tests ────────────────────────────────────────────────────────
console.log("📖  READABILITY (max = 500, manual judge)");
assert("Full marks (500)", validateReadability(500), 500);
assert("Zero", validateReadability(0), 0);
assert("Mid (250)", validateReadability(250), 250);
assert("Over max (999)", validateReadability(999), 500); // clamped
assert("Negative (-50)", validateReadability(-50), 0); // clamped
assert("NaN", validateReadability(NaN), 0);
console.log("");

// ── Total Score Tests ────────────────────────────────────────────────────────
console.log("🏆  TOTAL SCORE (max = 5000)");

const perfect = computeScores({
  passedTestCases: 10,
  totalTestCases: 10,
  executionTimeMs: 0,
  maxTimeAllowed: 500,
  syntaxErrors: 0,
  maxSyntaxErrorsAllowed: 5,
  understandingScore: 750,
  readabilityScore: 500,
});
assert("Perfect score total", perfect.totalScore, 5000);
assert("Perfect correctness", perfect.correctnessScore, 2000);
assert("Perfect efficiency", perfect.efficiencyScore, 1000);
assert("Perfect syntax", perfect.syntaxScore, 750);
assert("Perfect understanding", perfect.understandingScore, 750);
assert("Perfect readability", perfect.readabilityScore, 500);

const worst = computeScores({
  passedTestCases: 0,
  totalTestCases: 10,
  executionTimeMs: 999,
  maxTimeAllowed: 500,
  syntaxErrors: 10,
  maxSyntaxErrorsAllowed: 5,
  understandingScore: 0,
  readabilityScore: 0,
});
assert("Worst score total", worst.totalScore, 0);

const mid = computeScores({
  passedTestCases: 5,
  totalTestCases: 10,
  executionTimeMs: 250,
  maxTimeAllowed: 500,
  syntaxErrors: 2,
  maxSyntaxErrorsAllowed: 5,
  understandingScore: 375,
  readabilityScore: 250,
});
// C = (5/10)*2000 = 1000, E = 1000-(250/500)*1000 = 500,
// S = 750-(2*150) = 450, U = 375, R = 250 → Total = 2575
assert("Mid score total", mid.totalScore, 2575);

console.log("");

// ── Summary ──────────────────────────────────────────────────────────────────
console.log("═══════════════════════════════════════════════════════════════");
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log("═══════════════════════════════════════════════════════════════");

process.exit(failed > 0 ? 1 : 0);
