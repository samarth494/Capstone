/**
 * ═══════════════════════════════════════════════════════════════════
 * TAB SWITCH ENFORCEMENT MODULE — Server-Side (Authoritative)
 * ═══════════════════════════════════════════════════════════════════
 *
 * This module handles anti-tab-switch detection for BLIND coding mode.
 * All counting and disqualification logic lives here on the server.
 * The client only detects and emits — the server is the judge.
 *
 * RULES:
 *   1st violation → warning
 *   2nd violation → final warning
 *   3rd violation → automatic disqualification (DQ)
 *
 * SECURITY:
 *   - Client can only emit "tab-switch-detected"
 *   - Server tracks all violations per player per competition
 *   - Server decides when to DQ — client has zero authority
 *
 * SCALABILITY:
 *   - Per-competition, per-player tracking via competitionRooms reference
 *   - No global state mutation — all state scoped to room
 * ═══════════════════════════════════════════════════════════════════
 */

const MAX_TAB_SWITCH_WARNINGS = 3;

/**
 * Initialize tab-switch tracking for a competition room.
 * Call this when a competition room is created or when a player joins.
 *
 * @param {Object} room - The competition room object from competitionRooms
 */
function initTabSwitchTracking(room) {
  if (!room.tabSwitchWarnings) {
    room.tabSwitchWarnings = {}; // { [userId]: count }
  }
  if (!room.tabSwitchEvents) {
    room.tabSwitchEvents = []; // Array of { type, playerId, timestamp }
  }
  if (!room.disqualifiedPlayers) {
    room.disqualifiedPlayers = new Set(); // Set of disqualified userIds
  }
}

/**
 * Handle a "tab-switch-detected" event from a client socket.
 *
 * @param {Object} params
 * @param {Object} params.io          - Socket.IO server instance
 * @param {Object} params.socket      - The client socket that emitted
 * @param {string} params.eventId     - The competition event ID
 * @param {string} params.userId      - The user's database ID
 * @param {Object} params.room        - The competition room object
 * @returns {{ action: string, warnings: number }} Result of handling
 */
function handleTabSwitchDetected({ io, socket, eventId, userId, room }) {
  // ── GUARD: Only enforce when competition is active ──
  if (!room || !room.started) {
    return { action: "ignored", warnings: 0, reason: "Competition not active" };
  }

  // ── GUARD: Already disqualified — ignore further events ──
  if (room.disqualifiedPlayers && room.disqualifiedPlayers.has(userId)) {
    return {
      action: "ignored",
      warnings: MAX_TAB_SWITCH_WARNINGS,
      reason: "Already disqualified",
    };
  }

  // Initialize tracking if not present
  initTabSwitchTracking(room);

  // ── INCREMENT VIOLATION ──
  if (!room.tabSwitchWarnings[userId]) {
    room.tabSwitchWarnings[userId] = 0;
  }
  room.tabSwitchWarnings[userId] += 1;

  const currentWarnings = room.tabSwitchWarnings[userId];

  // ── LOG EVENT ──
  const event = {
    type: "TAB_SWITCH",
    playerId: userId,
    timestamp: Date.now(),
    warningNumber: currentWarnings,
  };
  room.tabSwitchEvents.push(event);

  console.log(
    `[TabSwitch] Competition ${eventId} | Player ${userId} | ` +
      `Warning ${currentWarnings}/${MAX_TAB_SWITCH_WARNINGS}`,
  );

  // ── CHECK: Should we disqualify? ──
  if (currentWarnings >= MAX_TAB_SWITCH_WARNINGS) {
    // ═══ DISQUALIFY ═══
    room.disqualifiedPlayers.add(userId);

    // Find player info for logging
    const player = room.players.find((p) => p.id === userId);
    const username = player ? player.username : "Unknown";

    console.log(
      `[TabSwitch] *** DISQUALIFICATION *** Competition ${eventId} | ` +
        `Player ${username} (${userId}) exceeded ${MAX_TAB_SWITCH_WARNINGS} tab switches.`,
    );

    // Notify the disqualified player
    socket.emit("tabswitch:disqualified", {
      warnings: currentWarnings,
      maxWarnings: MAX_TAB_SWITCH_WARNINGS,
      message: "You have been disqualified for excessive tab switching.",
    });

    // Notify all players in the competition
    io.to(`competition_${eventId}`).emit("competition:playerDisqualified", {
      userId,
      username,
      reason: "Tab switching violation",
    });

    // Auto-submit a DQ score for the current level
    autoSubmitDQ({ io, room, eventId, userId, username });

    return { action: "disqualified", warnings: currentWarnings };
  }

  // ═══ SEND WARNING (only to the offending player) ═══
  socket.emit("tabswitch:warning", {
    warnings: currentWarnings,
    maxWarnings: MAX_TAB_SWITCH_WARNINGS,
    message:
      currentWarnings === MAX_TAB_SWITCH_WARNINGS - 1
        ? "⚠️ FINAL WARNING! One more tab switch and you will be DISQUALIFIED."
        : `⚠️ Tab switching detected! Warning ${currentWarnings}/${MAX_TAB_SWITCH_WARNINGS}.`,
  });

  return { action: "warned", warnings: currentWarnings };
}

/**
 * Auto-submit a disqualification (DQ) score for the player.
 * Similar to timeout auto-submit but with a 'disqualified' status.
 */
function autoSubmitDQ({ io, room, eventId, userId, username }) {
  const currentLevel = room.currentLevel;

  // Initialize level submissions if needed
  if (!room.levelSubmissions[currentLevel]) {
    room.levelSubmissions[currentLevel] = {};
  }

  // Only auto-submit if they haven't submitted yet for this level
  if (!room.levelSubmissions[currentLevel][userId]) {
    room.levelSubmissions[currentLevel][userId] = {
      userId,
      username,
      score: 0,
      breakdown: {
        participationBonus: 0,
        correctCode: 0,
        speedBonus: 0,
        effortBonus: 0,
        relativeBonus: 0,
        errorCount: 0,
        testsPassed: 0,
        testsTotal: 0,
        passRatio: 0,
      },
      timeTaken: room.levelStartedAt
        ? Math.floor((Date.now() - room.levelStartedAt) / 1000)
        : 300,
      status: "disqualified",
    };

    // Ensure cumulative score entry exists
    if (!room.cumulativeScores[userId]) {
      room.cumulativeScores[userId] = {
        userId,
        username,
        totalScore: 0,
        levelScores: {},
      };
    }
    room.cumulativeScores[userId].levelScores[currentLevel] = 0;

    console.log(
      `[TabSwitch] Auto-submitted DQ score for ${username} on level ${currentLevel}`,
    );

    // Notify other players
    io.to(`competition_${eventId}`).emit("competition:playerSubmitted", {
      userId,
      username: `${username} (disqualified)`,
      totalSubmitted: Object.keys(room.levelSubmissions[currentLevel]).length,
      totalPlayers: room.players.length,
      level: currentLevel,
    });
  }

  // Also auto-submit DQ for ALL remaining levels so the player
  // doesn't block future round completion
  for (let lvl = currentLevel + 1; lvl <= room.totalLevels; lvl++) {
    if (!room.levelSubmissions[lvl]) {
      room.levelSubmissions[lvl] = {};
    }
    if (!room.levelSubmissions[lvl][userId]) {
      room.levelSubmissions[lvl][userId] = {
        userId,
        username,
        score: 0,
        breakdown: {
          participationBonus: 0,
          correctCode: 0,
          speedBonus: 0,
          effortBonus: 0,
          relativeBonus: 0,
          errorCount: 0,
          testsPassed: 0,
          testsTotal: 0,
          passRatio: 0,
        },
        timeTaken: 0,
        status: "disqualified",
      };
      room.cumulativeScores[userId].levelScores[lvl] = 0;
    }
  }
}

/**
 * Check if a player is disqualified in a given competition.
 *
 * @param {Object} room    - The competition room
 * @param {string} userId  - The player's user ID
 * @returns {boolean}
 */
function isPlayerDisqualified(room, userId) {
  return room.disqualifiedPlayers && room.disqualifiedPlayers.has(userId);
}

/**
 * Get the current warning count for a player.
 *
 * @param {Object} room    - The competition room
 * @param {string} userId  - The player's user ID
 * @returns {number}
 */
function getWarningCount(room, userId) {
  if (!room.tabSwitchWarnings) return 0;
  return room.tabSwitchWarnings[userId] || 0;
}

module.exports = {
  MAX_TAB_SWITCH_WARNINGS,
  initTabSwitchTracking,
  handleTabSwitchDetected,
  isPlayerDisqualified,
  getWarningCount,
};
