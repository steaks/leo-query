import type { NextConfig } from 'next';
const { join } = require("path");

const nextConfig: NextConfig = {
  /* config options here */
    outputFileTracingRoot: join(__dirname, '../..')
};

module.exports = nextConfig;

export default nextConfig;
