import { io } from "socket.io-client";
<<<<<<< HEAD
import { SOCKET_URL } from "../config/api";
=======
import API_BASE from "../config/api";

const SOCKET_URL = API_BASE;
>>>>>>> singleplayer

let socket;
let currentToken = null;

export const initiateSocketConnection = (token) => {
  // If already connected with the SAME token, skip
  if (socket && socket.connected && currentToken === token) return;

  // If connected with a DIFFERENT token (different user), disconnect first
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
  });
  console.log("Connecting to socket...");
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinQueue = (userData) => {
  if (socket) socket.emit("join_queue", userData);
};

export const subscribeToMatchFound = (cb) => {
  if (!socket) return;
  socket.on("match_found", (data) => {
    console.log("Match found!", data);
    cb(data);
  });
};

export const getSocket = () => socket;
