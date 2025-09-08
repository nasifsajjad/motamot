// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing config
  env: {
    ADMIN_USER_ID: process.env.ADMIN_USER_ID,
  },
};

module.exports = nextConfig;