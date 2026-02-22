// Dynamically resolve API base URL based on where the browser is accessing from
// This works for both localhost and LAN access (e.g. friend's laptop)
const API_BASE = `http://${window.location.hostname}:5000`;

export default API_BASE;
