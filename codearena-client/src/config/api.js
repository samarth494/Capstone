// ============================================
//  CENTRAL API CONFIGURATION
// ============================================
//  Priority:
//  1. VITE_BACKEND_URL env variable (Docker / production)
//  2. Same-hostname with port 5000 (LAN testing)
// ============================================

const API_HOST =
  import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:5000`;

// ============================================

export const API_BASE_URL = API_HOST;
export const SOCKET_URL = API_HOST;
export default API_BASE_URL;
