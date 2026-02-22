const socketIo = require("socket.io");
const { executeSubmission } = require("../utils/executionHandler");
const User = require("../models/User");
const Battle = require("../models/Battle");
const { calculateRank } = require("../utils/rankUtils");

const battleQueue = []; // Simple in-memory queue
const activeBattles = {};
const competitionRooms = {}; // Tracks players and host for each competition event
const MAX_COMPETITION_PLAYERS = 2; // Maximum players per competition lobby
const COUNTDOWN_SECONDS = 10; // Countdown duration before battle starts

// Helper to persist results and update stats
const addReplayEvent = (roomId, type, playerId, data) => {
  const battle = activeBattles[roomId];
  if (!battle) return;
  if (!battle.replayEvents) battle.replayEvents = [];

  // For code updates, only keep the latest per player within a small window to avoid bloat
  if (type === "code_update") {
    const lastEvent = battle.replayEvents[battle.replayEvents.length - 1];
    if (
      lastEvent &&
      lastEvent.type === "code_update" &&
      lastEvent.playerId.toString() === playerId.toString()
    ) {
      const timeDiff = Date.now() - battle.startTime - lastEvent.timestamp;
      if (timeDiff < 2000) {
        // Update last event if within 2 seconds
        lastEvent.timestamp = Date.now() - battle.startTime;
        lastEvent.data = data;
        return;
      }
    }
  }

  battle.replayEvents.push({
    type,
    playerId: battle.players.find((p) => p.id === playerId)?.user._id,
    timestamp: Date.now() - battle.startTime,
    data,
  });
};

const persistBattleResult = async (roomId, winnerSId = null) => {
  const battleData = activeBattles[roomId];
  if (!battleData || battleData.persisted) return;

  battleData.persisted = true; // Guard against multiple calls

  try {
    const player1 = battleData.players[0];
    const player2 = battleData.players[1];

    const winner = winnerSId
      ? battleData.players.find((p) => p.id === winnerSId)
      : null;

    // Save Battle Record
    await Battle.create({
      battleId: roomId,
      players: [player1.user._id, player2.user._id],
      winnerId: winner ? winner.user._id : null,
      problemId: battleData.problemId || "hello-world",
      startTime: battleData.startTime,
      endTime: Date.now(),
      status: winner ? "ended" : "timeout",
      events: battleData.replayEvents || [],
    });

    // Update Stats for both players
    const updatePlayerStats = async (pId, isWinner, isTie) => {
      if (!pId) return;

      const user = await User.findById(pId);
      if (!user) return;

      user.battlesPlayed += 1;
      if (isWinner) user.wins += 1;
      if (!isWinner && !isTie) user.losses += 1;

      // Recalculate rank
      user.rank = calculateRank(user.wins);

      await user.save();
    };

    await updatePlayerStats(
      player1.user._id,
      winnerSId === player1.id,
      !winnerSId,
    );
    await updatePlayerStats(
      player2.user._id,
      winnerSId === player2.id,
      !winnerSId,
    );

    console.log(`Battle ${roomId} persisted successfully.`);
  } catch (error) {
    console.error(`Failed to persist battle ${roomId}:`, error);
  }
};

const RANK_PRIORITY = {
  Bronze: 0,
  Silver: 1,
  Gold: 2,
  Platinum: 3,
  Diamond: 4,
};

const socketHandler = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*", // Allow all origins for dev
      methods: ["GET", "POST"],
    },
  });

  // Matchmaking Logic Loop
  setInterval(() => {
    if (battleQueue.length < 2) return;

    const now = Date.now();
    const matchedIndices = new Set();

    for (let i = 0; i < battleQueue.length; i++) {
      if (matchedIndices.has(i)) continue;

      const p1 = battleQueue[i];
      const p1WaitTime = (now - p1.joinedAt) / 1000;
      const p1RankScore = RANK_PRIORITY[p1.user.rank] || 0;

      // Skill gap expansion: +1 tier every 15 seconds of waiting
      const allowedGap = Math.floor(p1WaitTime / 15);

      let bestMatchIndex = -1;
      let minGap = Infinity;

      for (let j = i + 1; j < battleQueue.length; j++) {
        if (matchedIndices.has(j)) continue;

        const p2 = battleQueue[j];
        const p2RankScore = RANK_PRIORITY[p2.user.rank] || 0;
        const gap = Math.abs(p1RankScore - p2RankScore);

        if (gap <= allowedGap && gap < minGap) {
          minGap = gap;
          bestMatchIndex = j;
        }
      }

      if (bestMatchIndex !== -1) {
        // Match Found!
        const p1Data = battleQueue[i];
        const p2Data = battleQueue[bestMatchIndex];

        matchedIndices.add(i);
        matchedIndices.add(bestMatchIndex);

        const roomId = `battle_${p1Data.id}_${p2Data.id}`;
        activeBattles[roomId] = {
          players: [p1Data, p2Data],
          joinedPlayers: new Set(),
          status: "active",
          startTime: now,
          timer: 60,
          problemId: "hello-world",
          replayEvents: [],
        };

        io.to(p1Data.id).emit("match_found", { roomId, opponent: p2Data.user });
        io.to(p2Data.id).emit("match_found", { roomId, opponent: p1Data.user });
        console.log(
          `Matched ${p1Data.user.username} (${p1Data.user.rank}) vs ${p2Data.user.username} (${p2Data.user.rank}) | Gap: ${minGap}`,
        );
      }
    }

    // Remove matched players from queue (reverse order to keep indices valid)
    const sortedMatched = Array.from(matchedIndices).sort((a, b) => b - a);
    sortedMatched.forEach((idx) => battleQueue.splice(idx, 1));
  }, 3000); // Check every 3 seconds

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join_queue", (userData) => {
      // Remove existing entry if any
      const existingIdx = battleQueue.findIndex((p) => p.id === socket.id);
      if (existingIdx !== -1) battleQueue.splice(existingIdx, 1);

      console.log(
        `User ${userData.username} [${userData.rank || "Bronze"}] joined queue`,
      );
      battleQueue.push({
        id: socket.id,
        user: userData,
        joinedAt: Date.now(),
      });
    });

    socket.on("join_room", (roomId, userData) => {
      socket.join(roomId);

      // Validate if battle exists (important for dev server restarts)
      if (activeBattles[roomId]) {
        const battle = activeBattles[roomId];

        if (userData && userData.username) {
          battle.joinedPlayers.add(userData.username);
          console.log(
            `User [${userData.username}] joined room [${roomId}]. Joined: ${battle.joinedPlayers.size}/2`,
          );
        } else {
          console.log(
            `Socket [${socket.id}] joined room [${roomId}] without username.`,
          );
        }

        socket.emit("battle:timerUpdate", { timeLeft: battle.timer, problemId: battle.problemId });

        // Start timer when both players have joined
        if (battle.joinedPlayers.size === 2 && !battle.intervalId) {
          console.log(
            `Both players joined ${roomId}. Starting timer for real now.`,
          );

          io.to(roomId).emit("battle:startTimer", { duration: battle.timer });

          battle.intervalId = setInterval(() => {
            if (battle.timer > 0) {
              battle.timer--;
              // Optional: Very frequent logs might slow down dev terminal
              if (battle.timer % 10 === 0) {
                console.log(`Timer tick for ${roomId}: ${battle.timer}`);
              }
              io.to(roomId).emit("battle:timerUpdate", {
                timeLeft: battle.timer,
              });
            } else {
              console.log(`Timer expired for ${roomId}`);
              clearInterval(battle.intervalId);
              battle.status = "ended";
              io.to(roomId).emit("battle:end", { reason: "timeout" });
              persistBattleResult(roomId); // Timeout persistence
            }
          }, 1000);
        }

        // Identify Opponent
        if (userData && userData.username) {
          const opponent = battle.players.find(
            (p) => p.user.username !== userData.username,
          );
          if (opponent) {
            socket.emit("battle:opponentInfo", {
              username: opponent.user.username,
            });
          }
        }
      } else {
        console.warn(`Client tried to join non-existent room: ${roomId}`);
        socket.emit("battle:error", {
          message: "Battle session not found. The server may have restarted.",
        });
      }
    });

    // Activity Indicators
    socket.on("battle:typing", ({ roomId }) => {
      socket.to(roomId).emit("battle:opponentTyping");
    });

    socket.on("battle:codeUpdate", ({ roomId, code }) => {
      addReplayEvent(roomId, "code_update", socket.id, code);
    });

    socket.on("battle:runTests", ({ roomId }) => {
      socket.to(roomId).emit("battle:opponentRunningTests");
    });

    socket.on("battle:attempt", ({ roomId }) => {
      socket.to(roomId).emit("battle:opponentAttempting");
    });

    // Async Submission Handler
    socket.on("battle:submit", async ({ roomId, code, language = 'python', dryRun = false }) => {
      console.log(
        `Handling battle:submit [${language}][DryRun: ${dryRun}] for room ${roomId} from ${socket.id}`,
      );

      if (!activeBattles[roomId]) {
        socket.emit("battle:error", { message: "Battle session not found." });
        return;
      }

      const battle = activeBattles[roomId];
      if (battle.status !== "active") return;

      // Record submission event
      addReplayEvent(roomId, "submission", socket.id, { code, language, dryRun });

      // Execute code in Docker sandbox — multi-language, resource-limited
      const result = await executeSubmission({
        roomId,
        code,
        language,
        problemId: battle.problemId || 'hello-world',
      });

      // Record result in the submission event if possible or add a new one?
      // Let's just update the last event if it was our submission
      const lastEvent = battle.replayEvents[battle.replayEvents.length - 1];
      if (
        lastEvent &&
        lastEvent.type === "submission" &&
        lastEvent.data.code === code
      ) {
        lastEvent.data.result = result;
      }

      // Find user who submitted
      const player = battle.players.find((p) => p.id === socket.id);
      const username = player ? player.user.username : "Unknown Warrior";

      // Send execution results back to the submitter
      socket.emit("battle:executionResult", result);

      // Only proceed to victory if it's NOT a dry run and result is success
      if (!dryRun && result.success && battle.status === "active") {
        console.log(`VICTORY: ${username} solved ${roomId}`);
        clearInterval(battle.intervalId);
        battle.status = "ended";
        battle.winner = socket.id;

        io.to(roomId).emit("battle:result", {
          winnerId: socket.id,
          winnerName: username,
          reason: "solved",
        });

        persistBattleResult(roomId, socket.id); // Victory persistence
      }
    });

    // --- Competition Lobby Logic ---

    socket.on("competition:join", ({ eventId, user }) => {
      if (!eventId || !user) return;

      socket.join(`competition_${eventId}`);

      if (!competitionRooms[eventId]) {
        competitionRooms[eventId] = {
          players: [],
          hostId: socket.id,
          startTime: Date.now(),
          started: false,
          submissions: {}, // Track submissions by user._id
          battleStartedAt: null, // When the battle actually started
        };
        console.log(`Lobby Created for ${eventId}. Host: ${user.username}`);
      }

      const room = competitionRooms[eventId];

      // If lobby already started, reject new joins
      if (room.started) {
        socket.emit("competition:error", {
          message: "Competition has already started.",
        });
        return;
      }

      // If lobby is full, reject
      if (room.players.length >= MAX_COMPETITION_PLAYERS) {
        socket.emit("competition:error", {
          message: "Lobby is full (max 2 players).",
        });
        return;
      }

      // Check if user already in room (by user ID, not socket ID)
      const existingPlayerIndex = room.players.findIndex(
        (p) => p.id === user._id,
      );
      if (existingPlayerIndex !== -1) {
        // Same user reconnected — update their socketId
        room.players[existingPlayerIndex].socketId = socket.id;
      } else {
        room.players.push({
          socketId: socket.id,
          username: user.username,
          rank: user.rank,
          id: user._id,
        });
      }

      // Sync everyone in room
      io.to(`competition_${eventId}`).emit(
        "competition:updatePlayers",
        room.players,
      );
      io.to(`competition_${eventId}`).emit("competition:hostInfo", {
        hostId: room.hostId,
      });

      console.log(
        `User ${user.username} joined competition ${eventId}. Total: ${room.players.length}/${MAX_COMPETITION_PLAYERS}`,
      );

      // AUTO-START: When lobby is full, start the round automatically
      if (room.players.length >= MAX_COMPETITION_PLAYERS && !room.started) {
        room.started = true;
        const battleStartsAt = Date.now() + COUNTDOWN_SECONDS * 1000; // Exact timestamp when battle begins

        console.log(
          `Competition ${eventId} AUTO-STARTED! Lobby full (${room.players.length}/${MAX_COMPETITION_PLAYERS}). Battle starts at: ${new Date(battleStartsAt).toISOString()}`,
        );

        io.to(`competition_${eventId}`).emit("competition:roundStarted", {
          battleStartsAt, // Absolute timestamp when battle begins
          serverTime: Date.now(), // Server's current time for client clock-offset calculation
          countdownSeconds: COUNTDOWN_SECONDS,
          problemId: "blind-coding-challenge",
        });
      }
    });

    socket.on("competition:startRound", ({ eventId }) => {
      const room = competitionRooms[eventId];
      if (!room) return;

      // Only host can start
      if (room.hostId !== socket.id) {
        console.warn(
          `Unauthorized start attempt by ${socket.id} for event ${eventId}`,
        );
        socket.emit("competition:error", {
          message: "Only the lobby host can start the competition.",
        });
        return;
      }

      if (room.started) {
        socket.emit("competition:error", {
          message: "Competition has already started.",
        });
        return;
      }

      room.started = true;
      const battleStartsAt = Date.now() + COUNTDOWN_SECONDS * 1000;

      console.log(
        `Competition ${eventId} started by host ${socket.id}. Battle starts at: ${new Date(battleStartsAt).toISOString()}`,
      );
      io.to(`competition_${eventId}`).emit("competition:roundStarted", {
        battleStartsAt,
        serverTime: Date.now(),
        countdownSeconds: COUNTDOWN_SECONDS,
        problemId: "blind-coding",
      });
    });

    // --- Competition Submission Handler ---
    socket.on(
      "competition:submit",
      ({ eventId, userId, username, score, breakdown, timeTaken, status }) => {
        const room = competitionRooms[eventId];
        if (!room) return;

        // Store this player's submission
        room.submissions[userId] = {
          userId,
          username,
          score,
          breakdown: breakdown || {
            correctCode: 0,
            cleanCodeBonus: 0,
            speedBonus: 0,
          },
          timeTaken,
          status: status || "completed",
        };

        console.log(
          `[Competition ${eventId}] ${username} submitted. Score: ${score}, Status: ${status}. Submissions: ${Object.keys(room.submissions).length}/${room.players.length}`,
        );

        // Notify all players that someone submitted
        io.to(`competition_${eventId}`).emit("competition:playerSubmitted", {
          userId,
          username,
          totalSubmitted: Object.keys(room.submissions).length,
          totalPlayers: room.players.length,
        });

        // Check if ALL players have submitted
        if (Object.keys(room.submissions).length >= room.players.length) {
          // Build the final leaderboard sorted by score (desc), then timeTaken (asc)
          const leaderboardData = Object.values(room.submissions)
            .sort((a, b) => {
              if (b.score !== a.score) return b.score - a.score;
              return (a.timeTaken || Infinity) - (b.timeTaken || Infinity);
            })
            .map((entry, index) => ({
              ...entry,
              rank: index + 1,
            }));

          console.log(
            `[Competition ${eventId}] All players submitted! Broadcasting leaderboard.`,
          );
          console.log(leaderboardData);

          // Broadcast final leaderboard to all players in room
          io.to(`competition_${eventId}`).emit("competition:finalLeaderboard", {
            players: leaderboardData,
            eventId,
          });
        }
      },
    );

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Cleanup competition rooms
      Object.keys(competitionRooms).forEach((eventId) => {
        const room = competitionRooms[eventId];
        const playerIndex = room.players.findIndex(
          (p) => p.socketId === socket.id,
        );

        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);

          // If host disconnected, assign new host if players left
          if (room.hostId === socket.id) {
            if (room.players.length > 0) {
              room.hostId = room.players[0].socketId;
              console.log(
                `Host changed for ${eventId}: ${room.players[0].username}`,
              );
            } else {
              delete competitionRooms[eventId];
              console.log(`Deleted empty room for ${eventId}`);
              return;
            }
          }

          io.to(`competition_${eventId}`).emit(
            "competition:updatePlayers",
            room.players,
          );
          io.to(`competition_${eventId}`).emit("competition:hostInfo", {
            hostId: room.hostId,
          });
        }
      });
    });
  });

  return io; // Expose io for socketManager registration in server.js
};

module.exports = socketHandler;
