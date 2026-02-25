const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");

// ── Load env vars FIRST before any other require ──────────────────────────────
dotenv.config();

const connectDB = require("./config/db");
const socketHandler = require("./sockets/battleSocket");
const socketManager = require("./sockets/socketManager");
const fileUtility = require("./utils/fileUtility");

const app = express();
const server = http.createServer(app);

// ── Global error guards ───────────────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("[Server] Uncaught Exception:", err.name, err.message);
  // Do NOT shut down — keeps the server alive for other requests
});

process.on("unhandledRejection", (reason) => {
  console.error("[Server] Unhandled Promise Rejection:", reason);
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // uses CLIENT_URL in production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" })); // cap body size
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

// ── Request logger (dev only) ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/code", require("./routes/codeRoutes"));
app.use("/api/leaderboard", require("./routes/leaderboardRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/battles", require("./routes/battleRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/problems", require("./routes/problemRoutes"));
app.use("/api/scoring", require("./routes/scoringRoutes"));

// ── Health-check ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) =>
  res.json({ status: "ok", service: "CodeArena API" }),
);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[Server] Express error handler:", err.message);
  const status = err.status || 500;
  res.status(status).json({
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred."
        : err.message,
  });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    // Wire Socket.io AFTER DB is ready
    const io = socketHandler(server);
    socketManager.init(io);

    // Sweep orphaned temp files from any previous crash
    fileUtility.clearAllTemp();

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () =>
      console.log(
        `[Server] Running on port ${PORT} (${process.env.NODE_ENV || "development"})`,
      ),
    );
  } catch (error) {
    console.error("[Server] Fatal startup error:", error.message);
    process.exit(1);
  }
};

startServer();
