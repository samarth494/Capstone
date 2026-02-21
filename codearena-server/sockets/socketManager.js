/**
 * socketManager.js
 *
 * Single source of truth for the Socket.io `io` instance.
 * Lets any service (like LeaderboardService) emit events
 * without being tightly coupled to the server setup.
 *
 * Usage:
 *   In server.js:    socketManager.init(io)
 *   In any service:  const { getIo } = require('./socketManager'); getIo().emit(...)
 */

let _io = null;

const init = (io) => {
    _io = io;
    console.log('[SocketManager] io instance registered.');
};

const getIo = () => {
    if (!_io) {
        // Don't throw — return null so services can fail gracefully
        console.warn('[SocketManager] getIo() called before init(). Socket not ready.');
    }
    return _io;
};

module.exports = { init, getIo };
