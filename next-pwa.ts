// next-pwa.ts
import { WithPWA } from "next-pwa";

// next-pwa.ts
// Use require() because next-pwa doesn't support ESM cleanly
// next-pwa.ts
// Use require() because next-pwa doesn't support ESM cleanly
const withPWA = require("next-pwa");

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWAConfig;
