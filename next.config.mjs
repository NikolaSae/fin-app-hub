// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
    domains: [
      'localhost',
    ],
  },
    experimental: {
      serverActions: {
        allowedOrigins: ["localhost:3000", "friendly-invention-pg57976vrxxf7pgg-3000.app.github.dev"],
        allowedForwardedHosts: ["localhost:3000", "friendly-invention-pg57976vrxxf7pgg-3000.app.github.dev"],
      },
    },
  };
  
  export default nextConfig;
  