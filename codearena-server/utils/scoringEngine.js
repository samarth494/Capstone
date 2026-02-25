/**
 * Scoring Engine — Pure Functions
 *
 * TOTAL_SCORE = 5000 points
 * ───────────────────────────────────────────────
 *  Correctness        C  = 2000
 *  Efficiency         E  = 1000
 *  Syntax Accuracy    S  =  750
 *  Problem Understanding U =  750  (manual judge)
 *  Code Readability   R  =  500  (manual judge)
 * ───────────────────────────────────────────────
 *
 * Each function is stateless and testable in isolation.
 * All scores are clamped to [0, max] — negative values are impossible.
 */

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_TOTAL = 5000;
const MAX_CORRECTNESS = 2000;
const MAX_EFFICIENCY = 1000;
const MAX_SYNTAX = 750;
const MAX_UNDERSTANDING = 750;
const MAX_READABILITY = 500;

// ── Correctness ────────────────────────────────────────────────────────────────
// C = (passedTestCases / totalTestCases) × 2000

/**
 * @param {number} passed  – number of test cases passed  (>= 0)
 * @param {number} total   – total test cases              (>= 1)
 * @returns {number} score in [0, 2000], rounded to 2 decimals
 */
function calculateCorrectness(passed, total) {
  if (!Number.isFinite(passed) || !Number.isFinite(total)) return 0;
  if (total <= 0) return 0; // division-by-zero guard
  if (passed < 0) return 0; // negative guard
  if (passed > total) passed = total; // cap at 100 %

  return Math.round((passed / total) * MAX_CORRECTNESS * 100) / 100;
}

// ── Efficiency ─────────────────────────────────────────────────────────────────
// E = 1000 − ((executionTimeMs / maxTimeAllowed) × 1000)
// If executionTimeMs > maxTimeAllowed → E = 0

/**
 * @param {number} execMs   – actual execution time in ms  (>= 0)
 * @param {number} maxMs    – maximum allowed time in ms   (>= 1)
 * @returns {number} score in [0, 1000], rounded to 2 decimals
 */
function calculateEfficiency(execMs, maxMs) {
  if (!Number.isFinite(execMs) || !Number.isFinite(maxMs)) return 0;
  if (maxMs <= 0) return 0; // division-by-zero guard
  if (execMs < 0) execMs = 0; // treat negative as instant
  if (execMs >= maxMs) return 0; // TLE → 0

  const score = MAX_EFFICIENCY - (execMs / maxMs) * MAX_EFFICIENCY;
  return Math.round(score * 100) / 100;
}

// ── Syntax Accuracy ────────────────────────────────────────────────────────────
// penalty per error = 750 / maxSyntaxErrorsAllowed
// S = 750 − (syntaxErrors × penalty)   | min = 0

/**
 * @param {number} errors    – number of syntax errors    (>= 0)
 * @param {number} maxErrors – max errors allowed         (>= 1)
 * @returns {number} score in [0, 750], rounded to 2 decimals
 */
function calculateSyntax(errors, maxErrors) {
  if (!Number.isFinite(errors) || !Number.isFinite(maxErrors)) return 0;
  if (maxErrors <= 0) return 0; // division-by-zero guard
  if (errors < 0) errors = 0; // no negative errors
  if (errors >= maxErrors) return 0; // max-or-more errors → 0

  const penalty = MAX_SYNTAX / maxErrors;
  const score = MAX_SYNTAX - errors * penalty;
  return Math.max(Math.round(score * 100) / 100, 0);
}

// ── Understanding (Manual Judge) ───────────────────────────────────────────────
// U ∈ [0, 750] — validated and clamped

/**
 * @param {number} score – manual judge score for problem understanding
 * @returns {number} clamped to [0, 750]
 */
function validateUnderstanding(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.min(Math.max(score, 0), MAX_UNDERSTANDING);
}

// ── Readability (Manual Judge) ─────────────────────────────────────────────────
// R ∈ [0, 500] — validated and clamped

/**
 * @param {number} score – manual judge score for code readability
 * @returns {number} clamped to [0, 500]
 */
function validateReadability(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.min(Math.max(score, 0), MAX_READABILITY);
}

// ── Total ──────────────────────────────────────────────────────────────────────

/**
 * Compute all five dimension scores + total from raw inputs.
 *
 * @param {object} raw
 * @param {number} raw.passedTestCases
 * @param {number} raw.totalTestCases
 * @param {number} raw.executionTimeMs
 * @param {number} raw.maxTimeAllowed
 * @param {number} raw.syntaxErrors
 * @param {number} raw.maxSyntaxErrorsAllowed
 * @param {number} raw.understandingScore     – judge input (0–750)
 * @param {number} raw.readabilityScore       – judge input (0–500)
 * @returns {{ correctnessScore, efficiencyScore, syntaxScore, understandingScore, readabilityScore, totalScore }}
 */
function computeScores(raw) {
  const C = calculateCorrectness(raw.passedTestCases, raw.totalTestCases);
  const E = calculateEfficiency(raw.executionTimeMs, raw.maxTimeAllowed);
  const S = calculateSyntax(raw.syntaxErrors, raw.maxSyntaxErrorsAllowed);
  const U = validateUnderstanding(raw.understandingScore);
  const R = validateReadability(raw.readabilityScore);

  const total = Math.round((C + E + S + U + R) * 100) / 100;

  return {
    correctnessScore: C,
    efficiencyScore: E,
    syntaxScore: S,
    understandingScore: U,
    readabilityScore: R,
    totalScore: Math.min(total, MAX_TOTAL), // paranoia cap
  };
}

// ── Exports ────────────────────────────────────────────────────────────────────

module.exports = {
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
};
