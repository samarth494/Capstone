const socketIo = require("socket.io");
const { executeSubmission } = require("../utils/executionHandler");
const User = require("../models/User");
const Battle = require("../models/Battle");
const Message = require("../models/Message");
const { calculateRank } = require("../utils/rankUtils");
const { updateStreak } = require("../utils/streakUtils");
const {
  initTabSwitchTracking,
  handleTabSwitchDetected,
  isPlayerDisqualified,
} = require("./tabSwitchHandler");

const battleQueue = []; // Simple in-memory queue
const activeBattles = {};
const competitionRooms = {}; // Tracks players and host for each competition event
const MAX_COMPETITION_PLAYERS = 30; // Maximum players per competition lobby
const COUNTDOWN_SECONDS = 10; // Countdown duration before battle starts
const TOTAL_LEVELS = 3; // Total levels in blind coding competition

const BATTLE_PROBLEMS = [
  "hello-world",
  "sum-two-numbers",
  "even-or-odd",
  "reverse-string",
  "find-maximum",
  "blind-coding"
];



// Map: userId (string) -> socketId
const onlineUsers = {};

const getOnlineUsers = () => onlineUsers;
module.exports.getOnlineUsers = getOnlineUsers;

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

      // Update daily streak — any battle participation counts as an active day
      updateStreak(user);

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
        const randomProblem = BATTLE_PROBLEMS[Math.floor(Math.random() * BATTLE_PROBLEMS.length)];

        activeBattles[roomId] = {
          players: [p1Data, p2Data],
          joinedPlayers: new Set(),
          status: "active",
          startTime: now,
          timer: 600,
          problemId: randomProblem,
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

      // Broadcast to global activity stream that someone is looking for a match
      io.emit('newGlobalActivity', {
        type: 'QUEUE_JOIN',
        username: userData.username,
        rank: userData.rank || 'Bronze',
        createdAt: new Date().toISOString()
      });
    });

    socket.on("leave_queue", () => {
      const existingIdx = battleQueue.findIndex((p) => p.id === socket.id);
      if (existingIdx !== -1) {
        battleQueue.splice(existingIdx, 1);
        console.log(`Socket ${socket.id} left the matchmaking queue.`);
      }
    });

    socket.on("join_room", (roomId, userData) => {
      socket.join(roomId);

      // Validate if battle exists (important for dev server restarts)
      if (activeBattles[roomId]) {
        const battle = activeBattles[roomId];

        if (userData && (userData._id || userData.id)) {
          const joinedUserId = (userData._id || userData.id).toString();

          // Find which player this is (0 or 1)
          // To support same-user testing, we find an UNASSIGNED player slot first, or match by socket if possible
          let playerIndex = battle.players.findIndex(p => p.id === socket.id);

          // If socket ID isn't matched yet (e.g. after refresh), find by user ID but check if already joined
          if (playerIndex === -1) {
            playerIndex = battle.players.findIndex((p, idx) =>
              (p.user._id || p.user.id)?.toString() === joinedUserId && !battle.joinedPlayers.has(idx)
            );
          }

          // Fallback to any slot that matches ID if still not found
          if (playerIndex === -1) {
            playerIndex = battle.players.findIndex(p => (p.user._id || p.user.id)?.toString() === joinedUserId);
          }

          if (playerIndex !== -1) {
            const player = battle.players[playerIndex];
            player.id = socket.id;
            battle.joinedPlayers.add(playerIndex); // Track by player INDEX (0 or 1) instead of user ID

            console.log(
              `[Battle] User [${userData.username}] (Slot ${playerIndex}) joined room [${roomId}]. Joined: ${battle.joinedPlayers.size}/2`,
            );
          } else {
            console.warn(`[Battle] User ${userData.username} (${joinedUserId}) not found in battle.players!`);
          }
        } else {
          console.warn(`[Battle] Socket [${socket.id}] joined room [${roomId}] without user ID!`);
        }

        socket.emit("battle:timerUpdate", {
          timeLeft: battle.timer,
          problemId: battle.problemId,
        });

        // Start timer when both players have joined
        if (battle.joinedPlayers.size >= 2 && !battle.intervalId) {
          console.log(
            `Both players joined ${roomId}. Starting timer for real now.`,
          );

          io.to(roomId).emit("battle:startTimer", { duration: battle.timer });

          // Broadcast to global activity stream that a battle has started
          if (battle.players && battle.players.length >= 2) {
            io.emit('newGlobalActivity', {
              type: 'BATTLE_START',
              player1: battle.players[0].user.username,
              player2: battle.players[1].user.username,
              createdAt: new Date().toISOString()
            });
          }

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

        // Identify Opponent using robust ID comparison
        if (userData && (userData._id || userData.id)) {
          const joinedUserId = (userData._id || userData.id).toString();

          // Find the player index again or use the one we have
          const myIdx = battle.players.findIndex(p => p.id === socket.id);
          const opponentIdx = myIdx === 0 ? 1 : 0;
          const opponent = battle.players[opponentIdx];

          if (opponent && opponent.user) {
            console.log(`[Battle] Identified opponent for ${userData.username}: ${opponent.user.username}`);
            socket.emit("battle:opponentInfo", {
              username: opponent.user.username,
              rank: opponent.user.rank || 'Bronze'
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
    socket.on(
      "battle:submit",
      async ({ roomId, code, language = "python", dryRun = false }) => {
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
        addReplayEvent(roomId, "submission", socket.id, {
          code,
          language,
          dryRun,
        });

        // Execute code in Docker sandbox — multi-language, resource-limited
        const result = await executeSubmission({
          roomId,
          code,
          language,
          problemId: battle.problemId || "hello-world",
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
            winnerUserId: player ? (player.user._id || player.user.id) : null,
            winnerName: username,
            reason: "solved",
          });

          persistBattleResult(roomId, socket.id); // Victory persistence
        }
      },
    );

    // --- Friend Challenge Logic ---
    socket.on("challenge:friend", ({ friendId, challenger }) => {
      console.log(`[Challenge] ${challenger.username} challenged ${friendId}`);
      io.to(`user_${friendId}`).emit("challenge:received", {
        challenger,
        gameType: "battle"
      });
      // Also send as a real-time notification
      io.to(`user_${friendId}`).emit('notification', {
        type: 'challenge',
        message: `${challenger.username} challenged you to a battle!`,
        from: challenger,
        createdAt: new Date().toISOString()
      });
    });

    socket.on("challenge:respond", async ({ challengerId, accepted, friend }) => {
      if (accepted) {
        const challenger = await User.findById(challengerId);
        const responder = await User.findById(friend._id || friend.id);

        if (!challenger || !responder) {
          console.error("[Challenge] Could not find users in DB for response");
          return;
        }

        const roomId = `battle_${challengerId}_${socket.id}`;

        // pData objects for battle initialization
        const p1Data = { id: null, user: challenger, joinedAt: Date.now() };
        const p2Data = { id: socket.id, user: responder, joinedAt: Date.now() };

        // Initialize the room state
        const randomProblem = BATTLE_PROBLEMS[Math.floor(Math.random() * BATTLE_PROBLEMS.length)];

        activeBattles[roomId] = {
          players: [p1Data, p2Data],
          joinedPlayers: new Set(),
          status: "active",
          startTime: Date.now(),
          timer: 600,
          problemId: randomProblem,
          replayEvents: [],
        };

        // Notify both players using the standard match_found event
        // This is more reliable as both use the same listener on the frontend
        io.to(`user_${challengerId}`).emit("match_found", {
          roomId,
          opponent: responder
        });

        socket.emit("match_found", {
          roomId,
          opponent: challenger
        });
      } else {
        io.to(`user_${challengerId}`).emit("challenge:rejected", {
          friendName: friend.username
        });
      }
    });

    // --- Real-Time Peer-to-Peer Chat ---
    socket.on("message:send", async ({ receiverId, senderId, senderUsername, content }) => {
      try {
        if (!receiverId || !content) return;

        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content
        });

        // Emit to receiver's private room
        io.to(`user_${receiverId}`).emit("message:received", {
          ...message.toObject(),
          senderUsername
        });

        // Notify sender of success
        socket.emit("message:sent", message);

        // Real-time notification for the receiver
        io.to(`user_${receiverId}`).emit('notification', {
          type: 'new_message',
          message: `New message from ${senderUsername}: "${content.length > 30 ? content.substring(0, 30) + '...' : content}"`,
          fromId: senderId,
          fromUsername: senderUsername,
          createdAt: new Date().toISOString()
        });

      } catch (error) {
        console.error("[Socket] Message send failed:", error);
      }
    });

    // ── Forfeit / Withdraw ────────────────────────────────────────────────────
    const handleForfeit = (socketId) => {
      // Find any active battle this socket is part of
      for (const [roomId, battle] of Object.entries(activeBattles)) {
        if (battle.status !== "active") continue;
        const forfeiter = battle.players.find((p) => p.id === socketId);
        if (!forfeiter) continue;

        // REFRESH PROTECTION: If the user is still online via a DIFFERENT socket, 
        // they probably just refreshed. Don't forfeit yet.
        const userId = (forfeiter.user._id || forfeiter.user.id).toString();
        if (onlineUsers[userId] && onlineUsers[userId] !== socketId) {
          console.log(`[Forfeit-Skip] ${forfeiter.user.username} disconnected but is still online via another socket. Not forfeiting.`);
          continue;
        }

        const winner = battle.players.find((p) => p.id !== socketId);
        if (!winner) continue;

        console.log(
          `[Forfeit] ${forfeiter.user.username} forfeited room ${roomId}. Winner: ${winner.user.username}`
        );

        clearInterval(battle.intervalId);
        battle.status = "ended";
        battle.winner = winner.id;

        // Tell everyone in the room
        io.to(roomId).emit("battle:result", {
          winnerId: winner.id,
          winnerUserId: (winner.user._id || winner.user.id),
          winnerName: winner.user.username,
          reason: "forfeit",
          forfeiterName: forfeiter.user.username,
        });

        persistBattleResult(roomId, winner.id);
        break; // A player can only be in one battle
      }
    };

    socket.on("battle:forfeit", ({ roomId }) => {
      handleForfeit(socket.id);
    });

    socket.on("disconnect", async () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      // Remove from matchmaking queue
      const idx = battleQueue.findIndex((p) => p.id === socket.id);
      if (idx !== -1) battleQueue.splice(idx, 1);
      // Award win to opponent if mid-battle
      handleForfeit(socket.id);

      // Mark user offline and notify friends
      const offlineUserId = Object.keys(onlineUsers).find(uid => onlineUsers[uid] === socket.id);
      if (offlineUserId) {
        delete onlineUsers[offlineUserId];
        try {
          const dbUser = await User.findById(offlineUserId).select('username friends').lean();
          if (dbUser && dbUser.friends) {
            dbUser.friends.forEach(friendId => {
              const friendSocket = onlineUsers[friendId.toString()];
              if (friendSocket) {
                io.to(friendSocket).emit('friend:offline', { userId: offlineUserId, username: dbUser.username });
                io.to(friendSocket).emit('notification', {
                  type: 'friend_offline',
                  message: `${dbUser.username} is now offline`,
                  userId: offlineUserId,
                  username: dbUser.username,
                  createdAt: new Date().toISOString()
                });
              }
            });
          }
        } catch (e) { /* non-critical */ }
      }
    });

    const lastBroadcasts = {}; // userId -> timestamp to prevent spam

    socket.on("user:join_self", async (userId) => {
      if (!userId) return;

      const isAlreadyOnline = !!onlineUsers[userId];
      socket.join(`user_${userId}`);
      onlineUsers[userId] = socket.id;

      const now = Date.now();
      const lastBroadcast = lastBroadcasts[userId] || 0;
      const cooldown = 120000; // 2 minutes cooldown for login broadcasts

      // Only broadcast if not already online OR if cooldown has passed
      if (!isAlreadyOnline || (now - lastBroadcast > cooldown)) {
        lastBroadcasts[userId] = now;
        console.log(`[Online] ${userId} connected (Broadcast triggered). Total online: ${Object.keys(onlineUsers).length}`);

        try {
          const dbUser = await User.findById(userId).select('username friends').lean();
          if (dbUser) {
            console.log(`[Online] Broadcasting login for ${dbUser.username} (${userId})`);
            // Broadcast to global activity stream that someone logged in
            io.emit('newGlobalActivity', {
              type: 'LOGIN',
              username: dbUser.username,
              createdAt: new Date().toISOString()
            });

            if (dbUser.friends && dbUser.friends.length > 0) {
              console.log(`[Online] Notifying ${dbUser.friends.length} friends of ${dbUser.username}`);
              dbUser.friends.forEach(friendId => {
                const friendSocket = onlineUsers[friendId.toString()];
                if (friendSocket) {
                  console.log(`[Online] -> Notifying friend ${friendId} at socket ${friendSocket}`);
                  io.to(friendSocket).emit('friend:online', { userId: userId.toString(), username: dbUser.username });
                  io.to(friendSocket).emit('notification', {
                    type: 'friend_online',
                    message: `${dbUser.username} is now online`,
                    userId: userId.toString(),
                    username: dbUser.username,
                    createdAt: new Date().toISOString(),
                    from: { _id: userId, username: dbUser.username } // Added from field for consistency
                  });
                }
              });
            } else {
              console.log(`[Online] User ${dbUser.username} has no friends to notify.`);
            }
          }
        } catch (e) { console.error('[user:join_self] friend notify failed:', e.message); }
      } else {
        console.log(`[Online] ${userId} joined (Broadcast skipped - already online/cooldown)`);
      }
    });


    socket.on("competition:join", ({ eventId, user }) => {
      if (!eventId || !user) return;

      socket.join(`competition_${eventId}`);

      if (!competitionRooms[eventId]) {
        competitionRooms[eventId] = {
          players: [],
          hostId: socket.id,
          startTime: Date.now(),
          started: false,
          currentLevel: 1,
          totalLevels: TOTAL_LEVELS,
          levelSubmissions: {}, // { level: { userId: submissionData } }
          cumulativeScores: {}, // { userId: { userId, username, totalScore, levelScores } }
          battleStartedAt: null,
          timeLeft: 300, // 5 minutes start time
        };

        // Initialize tab-switch anti-cheat tracking
        initTabSwitchTracking(competitionRooms[eventId]);

        // Start the 5-minute lobby timer
        const room = competitionRooms[eventId];
        room.timerInterval = setInterval(() => {
          if (room.started) {
            clearInterval(room.timerInterval);
            return;
          }

          room.timeLeft--;
          io.to(`competition_${eventId}`).emit(
            "competition:timerUpdate",
            room.timeLeft,
          );

          if (room.timeLeft <= 0) {
            clearInterval(room.timerInterval);
            if (!room.started && room.players.length > 0) {
              room.started = true;
              const battleStartsAt = Date.now() + COUNTDOWN_SECONDS * 1000;
              console.log(
                `[Competition ${eventId}] Timer Expired! Auto-starting with ${room.players.length} players.`,
              );
              io.to(`competition_${eventId}`).emit("competition:roundStarted", {
                battleStartsAt,
                serverTime: Date.now(),
                countdownSeconds: COUNTDOWN_SECONDS,
                problemId: "blind-coding",
                level: 1,
                totalLevels: TOTAL_LEVELS,
              });
            }
          }
        }, 1000);

        console.log(
          `Lobby Created for ${eventId}. Host: ${user.username}. Auto-start timer (5m) initiated.`,
        );
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
          message: "Lobby is full (max 30 players).",
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

      // Send current timer to the newly joined player
      socket.emit("competition:timerUpdate", room.timeLeft);

      console.log(
        `User ${user.username} joined competition ${eventId}. Total: ${room.players.length}/${MAX_COMPETITION_PLAYERS}`,
      );

      // AUTO-START: When lobby is full, start the round automatically
      if (room.players.length >= MAX_COMPETITION_PLAYERS && !room.started) {
        room.started = true;
        if (room.timerInterval) clearInterval(room.timerInterval);

        const battleStartsAt = Date.now() + COUNTDOWN_SECONDS * 1000;
        // Track when this level actually starts (after countdown)
        room.levelStartedAt = battleStartsAt;

        console.log(
          `Competition ${eventId} AUTO-STARTED! Lobby full. Battle starts at: ${new Date(battleStartsAt).toISOString()}`,
        );

        io.to(`competition_${eventId}`).emit("competition:roundStarted", {
          battleStartsAt,
          serverTime: Date.now(),
          countdownSeconds: COUNTDOWN_SECONDS,
          problemId: "blind-coding",
          level: 1,
          totalLevels: TOTAL_LEVELS,
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
      if (room.timerInterval) clearInterval(room.timerInterval);

      const battleStartsAt = Date.now() + COUNTDOWN_SECONDS * 1000;
      // Track when this level actually starts (after countdown)
      room.levelStartedAt = battleStartsAt;

      console.log(
        `Competition ${eventId} started by host ${socket.id}. Battle starts at: ${new Date(battleStartsAt).toISOString()}`,
      );
      io.to(`competition_${eventId}`).emit("competition:roundStarted", {
        battleStartsAt,
        serverTime: Date.now(),
        countdownSeconds: COUNTDOWN_SECONDS,
        problemId: "blind-coding",
        level: 1,
        totalLevels: TOTAL_LEVELS,
      });
    });

    // --- Tab Switch Detection Handler (BLIND Mode Anti-Cheat) ---
    socket.on("tab-switch-detected", ({ eventId, userId }) => {
      const room = competitionRooms[eventId];
      if (!room) return;

      handleTabSwitchDetected({ io, socket, eventId, userId, room });
    });

    // --- Competition Submission Handler (Multi-Level) ---
    socket.on(
      "competition:submit",
      ({
        eventId,
        userId,
        username,
        score,
        breakdown,
        timeTaken,
        status,
        level,
      }) => {
        const room = competitionRooms[eventId];

        // Block submissions from disqualified players
        if (room && isPlayerDisqualified(room, userId)) {
          console.log(
            `[Competition ${eventId}] Submission blocked: ${username} is disqualified.`,
          );
          socket.emit("competition:error", {
            message: "You have been disqualified and cannot submit.",
          });
          return;
        }
        if (!room) return;

        const currentLevel = level || room.currentLevel;

        // Initialize level submissions if needed
        if (!room.levelSubmissions[currentLevel]) {
          room.levelSubmissions[currentLevel] = {};
        }

        // Prevent duplicate submissions for same level
        if (room.levelSubmissions[currentLevel][userId]) {
          console.log(
            `[Competition ${eventId}] Duplicate submit ignored for ${username} on level ${currentLevel}`,
          );
          return;
        }

        // Store this player's submission for this level
        room.levelSubmissions[currentLevel][userId] = {
          userId,
          username,
          score,
          breakdown: breakdown || {
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
          timeTaken,
          status: status || "completed",
        };

        // ═══════════════════════════════════════════════════
        // SERVER-SIDE SCORE VALIDATION (Anti-Cheat)
        // ═══════════════════════════════════════════════════
        // The client calculates scores, but we validate the
        // bounds here to prevent DevTools manipulation.
        const sub = room.levelSubmissions[currentLevel][userId];
        const bd = sub.breakdown;

        // 1. Enforce participation based on status (not client claim)
        bd.participationBonus = sub.status === "timeout" ? 0 : 30;

        // 2. Cap all bonus values to their allowed maximums
        bd.correctCode = Math.min(Math.max(0, bd.correctCode || 0), 1000);
        bd.speedBonus = Math.min(Math.max(0, bd.speedBonus || 0), 500);
        bd.effortBonus = Math.min(Math.max(0, bd.effortBonus || 0), 150);
        bd.relativeBonus = 0; // Always recalculated server-side
        bd.errorCount = Math.max(0, bd.errorCount || 0);
        bd.testsPassed = Math.max(0, bd.testsPassed || 0);

        // 3. Validate timeTaken using SERVER clock — prevents fake fast submissions
        //    Client could send timeTaken=5 via DevTools to inflate speed bonus.
        //    We compute the real elapsed time from when the level started.
        if (room.levelStartedAt) {
          const serverElapsed = Math.floor(
            (Date.now() - room.levelStartedAt) / 1000,
          );
          const LEVEL_TIME_LIMIT = 300; // Must match client constant
          const claimedTime = sub.timeTaken || serverElapsed;

          // Server time is authoritative — client can't claim less than server elapsed
          if (claimedTime < serverElapsed - 5) {
            // 5s buffer for network latency
            console.log(
              `[Competition ${eventId}] TIME MANIPULATION detected for ${username}: ` +
              `claimed ${claimedTime}s but server says ${serverElapsed}s elapsed. Correcting.`,
            );
            sub.timeTaken = serverElapsed;
          }

          // Also revalidate speedBonus based on server-authoritative time
          const serverTimeLeft = Math.max(0, LEVEL_TIME_LIMIT - sub.timeTaken);
          const serverTimeRatio = serverTimeLeft / LEVEL_TIME_LIMIT;

          // Determine tier cap from tests passed
          const testsP = bd.testsPassed;
          const testsT = bd.testsTotal || 1;
          const allPassed = testsP >= testsT && testsT > 0;
          const anyPassed = testsP > 0;

          // Check effort gate (same threshold as client)
          const hasEffort = bd.effortBonus > 0; // If server gets 0 effort, speed should be 0
          let serverSpeedMax = 0;
          if (hasEffort || allPassed) {
            serverSpeedMax = allPassed ? 500 : anyPassed ? 300 : 100;
          }
          const serverSpeedBonus = Math.floor(serverTimeRatio * serverSpeedMax);

          // Use the LOWER of client-claimed vs server-computed speed bonus
          if (bd.speedBonus > serverSpeedBonus) {
            console.log(
              `[Competition ${eventId}] SPEED BONUS adjusted for ${username}: ` +
              `client claimed ${bd.speedBonus}, server computed ${serverSpeedBonus}`,
            );
            bd.speedBonus = serverSpeedBonus;
          }
        }

        // 4. Recalculate total from validated components
        //    This prevents someone from sending score: 99999
        const validatedScore =
          bd.participationBonus +
          bd.correctCode +
          bd.speedBonus +
          bd.effortBonus;
        if (sub.score !== validatedScore) {
          console.log(
            `[Competition ${eventId}] SCORE MISMATCH for ${username}: client sent ${sub.score}, validated to ${validatedScore}`,
          );
          sub.score = validatedScore;
        }

        // 5. Update Real-Time Streak
        // Participation in a competition level counts as an active day.
        User.findById(userId).then(user => {
          if (user) {
            updateStreak(user);
            user.save().catch(e => console.error("[Streak] Save failed:", e.message));
          }
        });

        // Update cumulative scores
        if (!room.cumulativeScores[userId]) {
          room.cumulativeScores[userId] = {
            userId,
            username,
            totalScore: 0,
            levelScores: {},
          };
        }
        room.cumulativeScores[userId].totalScore += sub.score;
        room.cumulativeScores[userId].levelScores[currentLevel] = sub.score;

        console.log(
          `[Competition ${eventId}] Level ${currentLevel}: ${username} submitted. Score: ${sub.score} (validated), Status: ${status}. Submissions: ${Object.keys(room.levelSubmissions[currentLevel]).length}/${room.players.length}`,
        );

        // Notify all players that someone submitted
        io.to(`competition_${eventId}`).emit("competition:playerSubmitted", {
          userId,
          username,
          totalSubmitted: Object.keys(room.levelSubmissions[currentLevel])
            .length,
          totalPlayers: room.players.length,
          level: currentLevel,
        });

        // Check if ALL players have submitted for this level
        if (
          Object.keys(room.levelSubmissions[currentLevel]).length >=
          room.players.length
        ) {
          // ═══════════════════════════════════════════════════════════
          // RELATIVE PERFORMANCE BONUS (0-500 pts)
          // ═══════════════════════════════════════════════════════════
          // This is the SERVER-SIDE bonus that ensures fair ranking
          // in ALL scenarios, including when everyone fails.
          //
          // RANKING PRIORITY (multi-factor sort):
          //   1. testsPassed (DESC) — more passed = better rank
          //   2. errorCount  (ASC)  — fewer compile errors = better
          //   3. timeTaken   (ASC)  — faster submission = better
          //   4. status priority    — completed > partial > failed > timeout
          //
          // BONUS FORMULA: rank 1 gets 500, last gets 0, linearly scaled
          //   Solo player: 0 (no opponents = no ranking bonus)
          //   2 players: 500, 0
          //   5 players: 500, 375, 250, 125, 0
          // ═══════════════════════════════════════════════════════════

          const submissions = Object.values(
            room.levelSubmissions[currentLevel],
          );
          const numPlayers = submissions.length;

          // Status priority map (higher = better)
          const STATUS_PRIORITY = {
            completed: 4,
            partial: 3,
            failed: 2,
            timeout: 1,
          };

          // Multi-factor ranking sort
          // ANTI-GAMING: effort ranks ABOVE error count, so writing real
          // code (even with some errors) beats writing trivial error-free code
          const rankedSubmissions = [...submissions].sort((a, b) => {
            // 1. Tests passed (more = better) — correctness is KING
            const passA = a.breakdown?.testsPassed || 0;
            const passB = b.breakdown?.testsPassed || 0;
            if (passB !== passA) return passB - passA;

            // 2. Status priority (completed > partial > failed > timeout)
            const statusA = STATUS_PRIORITY[a.status] || 0;
            const statusB = STATUS_PRIORITY[b.status] || 0;
            if (statusB !== statusA) return statusB - statusA;

            // 3. Effort (more code written = better) — prevents gaming
            //    Someone who wrote 200 lines ranks above "return 0;" gamer
            const effortA = a.breakdown?.effortBonus || 0;
            const effortB = b.breakdown?.effortBonus || 0;
            if (effortB !== effortA) return effortB - effortA;

            // 4. Error count (fewer = better, among equal effort)
            const errA = a.breakdown?.errorCount || 0;
            const errB = b.breakdown?.errorCount || 0;
            if (errA !== errB) return errA - errB;

            // 5. Time taken (less = better)
            return (a.timeTaken || Infinity) - (b.timeTaken || Infinity);
          });

          rankedSubmissions.forEach((sub, index) => {
            // Ranking logic kept for ordering but no longer awards relative points
            const originalSub = room.levelSubmissions[currentLevel][sub.userId];
            originalSub.breakdown.relativeBonus = 0;

            console.log(
              `[Competition] Rank: ${sub.username} | ` +
              `Rank ${index + 1}/${numPlayers} | ` +
              `Tests: ${sub.breakdown?.testsPassed || 0}/${sub.breakdown?.testsTotal || "?"} | ` +
              `Errors: ${sub.breakdown?.errorCount || 0} | ` +
              `Status: ${sub.status}`,
            );
          });

          // ── BUILD LEADERBOARD ──
          // Sort by total score (desc), with multi-layer tiebreakers
          const levelLeaderboard = Object.values(
            room.levelSubmissions[currentLevel],
          )
            .sort((a, b) => {
              // Primary: total score
              if (b.score !== a.score) return b.score - a.score;
              // Tiebreak 1: tests passed
              const passA = a.breakdown?.testsPassed || 0;
              const passB = b.breakdown?.testsPassed || 0;
              if (passB !== passA) return passB - passA;
              // Tiebreak 2: more effort (anti-gaming)
              const effortA = a.breakdown?.effortBonus || 0;
              const effortB = b.breakdown?.effortBonus || 0;
              if (effortB !== effortA) return effortB - effortA;
              // Tiebreak 3: fewer errors
              const errA = a.breakdown?.errorCount || 0;
              const errB = b.breakdown?.errorCount || 0;
              if (errA !== errB) return errA - errB;
              // Tiebreak 4: faster time
              return (a.timeTaken || Infinity) - (b.timeTaken || Infinity);
            })
            .map((entry, index) => ({
              ...entry,
              rank: index + 1,
            }));

          // Build cumulative leaderboard
          const cumulativeLeaderboard = Object.values(room.cumulativeScores)
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((entry, index) => ({
              ...entry,
              rank: index + 1,
            }));

          if (currentLevel < room.totalLevels) {
            const nextLevel = currentLevel + 1;
            // Store the pending next level — do NOT advance yet.
            // room.currentLevel advances only when ALL players signal ready.
            room.pendingNextLevel = nextLevel;
            room.readyPlayers = new Set(); // Reset ready set for this transition

            console.log(
              `[Competition ${eventId}] Level ${currentLevel} complete! Waiting for all players to signal ready before starting level ${nextLevel}.`,
            );

            // Broadcast level completion with leaderboard — clients show the overlay.
            // They must click "PROCEED" to signal they are ready.
            io.to(`competition_${eventId}`).emit("competition:levelComplete", {
              level: currentLevel,
              levelLeaderboard,
              cumulativeLeaderboard,
              nextLevel,
              totalLevels: room.totalLevels,
              eventId,
            });
          } else {
            // Competition finished! All 3 levels done.
            console.log(
              `[Competition ${eventId}] COMPETITION COMPLETE! Winner: ${cumulativeLeaderboard[0]?.username} with ${cumulativeLeaderboard[0]?.totalScore} total pts.`,
            );

            io.to(`competition_${eventId}`).emit("competition:competitionEnd", {
              level: currentLevel,
              levelLeaderboard,
              cumulativeLeaderboard,
              winner: cumulativeLeaderboard[0],
              eventId,
            });

            // CRITICAL: Delete the room state so players can start a new competition
            // without needing a server restart.
            delete competitionRooms[eventId];
            console.log(
              `[Competition ${eventId}] Competition state cleared for new session.`,
            );
          }
        }
      },
    );

    // ── READY-UP GATE ─────────────────────────────────────────────────────
    // Each player emits this when they click "PROCEED TO NEXT LEVEL".
    // The server waits until ALL active players have signalled ready,
    // then broadcasts competition:nextLevelStart so everyone advances together.
    socket.on("competition:playerReady", ({ eventId, userId }) => {
      const room = competitionRooms[eventId];
      if (!room || !room.pendingNextLevel) return;

      // Register this player as ready
      room.readyPlayers = room.readyPlayers || new Set();
      room.readyPlayers.add(userId);

      const readyCount = room.readyPlayers.size;
      const totalCount = room.players.length;

      console.log(
        `[Competition ${eventId}] Player ${userId} is ready for level ${room.pendingNextLevel}. Ready: ${readyCount}/${totalCount}`,
      );

      // Broadcast updated ready count so everyone can see the waiting state
      io.to(`competition_${eventId}`).emit("competition:readyUpdate", {
        readyCount,
        totalCount,
        nextLevel: room.pendingNextLevel,
      });

      // When ALL players are ready, advance the level for everyone
      if (readyCount >= totalCount) {
        const nextLevel = room.pendingNextLevel;
        room.currentLevel = nextLevel;
        room.pendingNextLevel = null;
        room.readyPlayers = new Set();
        // The level clock starts now (authoritative server time)
        room.levelStartedAt = Date.now() + 3000; // 3s buffer after start signal

        console.log(
          `[Competition ${eventId}] All players ready! Starting level ${nextLevel}.`,
        );

        io.to(`competition_${eventId}`).emit("competition:nextLevelStart", {
          nextLevel,
          levelStartedAt: room.levelStartedAt,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Cleanup competition rooms
      Object.keys(competitionRooms).forEach((eventId) => {
        const room = competitionRooms[eventId];
        const playerIndex = room.players.findIndex(
          (p) => p.socketId === socket.id,
        );

        if (playerIndex !== -1) {
          const disconnectedPlayer = room.players[playerIndex];
          const disconnectedUserId = disconnectedPlayer.id;
          const disconnectedUsername = disconnectedPlayer.username;

          console.log(
            `[Competition ${eventId}] Player ${disconnectedUsername} disconnected. Room started: ${room.started}`,
          );

          // ── DISCONNECT EXPLOIT FIX ──────────────────────────────────
          // If competition is ACTIVE and player hasn't submitted for the
          // current level yet, auto-submit a forfeit score (timeout, 0 pts).
          // This prevents:
          //   1. Ragequit exploit: disconnecting to avoid a bad score
          //   2. Deadlock: other players stuck waiting on "all submitted"
          if (room.started) {
            const currentLevel = room.currentLevel;

            // Initialize level submissions map if needed
            if (!room.levelSubmissions[currentLevel]) {
              room.levelSubmissions[currentLevel] = {};
            }

            // Only auto-forfeit if they haven't submitted yet
            if (!room.levelSubmissions[currentLevel][disconnectedUserId]) {
              console.log(
                `[Competition ${eventId}] Auto-forfeiting ${disconnectedUsername} for level ${currentLevel} due to disconnect.`,
              );

              // Record a forfeit submission (same structure as a timeout)
              room.levelSubmissions[currentLevel][disconnectedUserId] = {
                userId: disconnectedUserId,
                username: disconnectedUsername,
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
                status: "timeout", // Treated same as timeout — no participation bonus
              };

              // Ensure cumulative score entry exists
              if (!room.cumulativeScores[disconnectedUserId]) {
                room.cumulativeScores[disconnectedUserId] = {
                  userId: disconnectedUserId,
                  username: disconnectedUsername,
                  totalScore: 0,
                  levelScores: {},
                };
              }
              room.cumulativeScores[disconnectedUserId].levelScores[
                currentLevel
              ] = 0;

              // Notify remaining players
              const remainingPlayers = room.players.length - 1; // -1 because not yet removed
              io.to(`competition_${eventId}`).emit(
                "competition:playerSubmitted",
                {
                  userId: disconnectedUserId,
                  username: disconnectedUsername + " (disconnected)",
                  totalSubmitted: Object.keys(
                    room.levelSubmissions[currentLevel],
                  ).length,
                  totalPlayers: remainingPlayers,
                  level: currentLevel,
                },
              );

              // ── DEADLOCK CHECK ────────────────────────────────────────
              // If the disconnecting player was the last one needed to
              // complete the level, we must trigger level-complete now.
              // We use remainingPlayers (after removal) as the new player count.
              const submittedCount = Object.keys(
                room.levelSubmissions[currentLevel],
              ).length;
              if (remainingPlayers > 0 && submittedCount >= remainingPlayers) {
                console.log(
                  `[Competition ${eventId}] Disconnect triggered level ${currentLevel} completion with ${remainingPlayers} remaining players.`,
                );
                // Remove the disconnected player from the room first so counts are right
                room.players.splice(playerIndex, 1);

                // Emit the level-complete or competition-end event
                // (reuse the same logic as the normal submission handler)
                io.to(`competition_${eventId}`).emit(
                  "competition:disconnectForceComplete",
                  {
                    level: currentLevel,
                    message: `${disconnectedUsername} disconnected. Level auto-completed.`,
                  },
                );

                // Update player list for remaining
                io.to(`competition_${eventId}`).emit(
                  "competition:updatePlayers",
                  room.players,
                );
                io.to(`competition_${eventId}`).emit("competition:hostInfo", {
                  hostId: room.hostId,
                });
                return; // Skip the duplicate splice below
              }
            }
          }
          // ────────────────────────────────────────────────────────────

          // Now remove the player from the room
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

module.exports = { socketHandler, getOnlineUsers };
