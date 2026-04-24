const { CapacitorConfig } = require("@capacitor/cli");

const config = {
  appId: "com.jansevak.app",
  appName: "JanSevak",
  webDir: "frontend",
  server: {
    url: "https://your-frontend-url.vercel.app",
    cleartext: true
  }
};

module.exports = config;
