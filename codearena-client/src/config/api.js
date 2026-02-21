<<<<<<< HEAD
// ============================================
//  CENTRAL API CONFIGURATION
// ============================================
//  Change this ONE line to switch between
//  localhost (solo testing) and your IP (LAN testing)
// ============================================

// For solo testing (same machine):
// For solo testing (same machine):
// const API_HOST = "http://localhost:5000";

// For LAN testing (2 systems on same WiFi):
const API_HOST = "http://10.252.225.132:5000";

// ============================================

export const API_BASE_URL = API_HOST;
export const SOCKET_URL = API_HOST;
=======
// Dynamically resolve API base URL based on where the browser is accessing from
// This works for both localhost and LAN access (e.g. friend's laptop)
const API_BASE = `http://${window.location.hostname}:5000`;

export default API_BASE;
>>>>>>> singleplayer
