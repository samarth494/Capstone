const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const http = require("http");
const socketHandler = require("./sockets/battleSocket");

const app = express();
const server = http.createServer(app);

// Prevent crashes
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
});

// Initialize Socket.io
socketHandler(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/code", require("./routes/codeRoutes"));
app.use("/api/leaderboard", require("./routes/leaderboardRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/battles", require("./routes/battleRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/problems", require("./routes/problemRoutes"));

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server started on port ${PORT}`),
);
app.get("/", (req, res) => {
  res.send("Backend working with Socket.io");
});
