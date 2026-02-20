const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

// connectDB(); // Removed, now called inside startServer()

const http = require("http");
const socketHandler = require("./sockets/battleSocket");

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketHandler(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/code", require("./routes/codeRoutes"));
app.use("/api/leaderboard", require("./routes/leaderboardRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/battles", require("./routes/battleRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/problems", require("./routes/problemRoutes"));

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

app.get("/", (req, res) => {
  res.send("Backend working with Socket.io");
});
