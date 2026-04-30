const config = {
  // If we are on mobile/network, use the computer's IP. 
  // If we are on PC, it stays localhost.
  API_BASE_URL: `http://${window.location.hostname}:3001`,
};

export default config;

