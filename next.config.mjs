/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Expose the API key to the client-side for this specific app architecture
    API_KEY: process.env.API_KEY,
  },
  reactStrictMode: true,
};

export default nextConfig;