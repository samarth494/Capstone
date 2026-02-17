import { io } from "socket.io-client";

const SOCKET_URL = "http://10.252.225.132:5000";

let socket;

export const initiateSocketConnection = (token) => {
    if (socket && socket.connected) return;

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
