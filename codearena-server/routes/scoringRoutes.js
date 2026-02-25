const express = require("express");
const router = express.Router();

const {
  submitScore,
  getLeaderboard,
} = require("../controllers/scoringController");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/scoring/submit
//
// Submit a fully-scored entry (auto-computes C, E, S; accepts manual U, R).
// Body: JSON — see scoringController.submitScore for field docs.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/submit", submitScore);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/scoring/leaderboard
//
// Returns ranked leaderboard with tie-breaker rules applied.
// Query: ?eventId=global  (default)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/leaderboard", getLeaderboard);

module.exports = router;
