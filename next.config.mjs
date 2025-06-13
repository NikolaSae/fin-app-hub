// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      '*.app.github.dev'
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.app.github.dev",
        process.env.NEXTAUTH_URL?.replace("https://", "") || ""
      ],
      allowedForwardedHosts: [
        "localhost:3000",
        "*.app.github.dev",
        process.env.NEXTAUTH_URL?.replace("https://", "") || ""
      ],
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "x-forwarded-host",
            value: process.env.NEXTAUTH_URL?.replace("https://", "") || "",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXTAUTH_URL || "https://*.app.github.dev",
          },
        ],
      },
    ];
  },
  webpack: (config, { webpack }) => {
    // Ignorisanje nedostajućih modula
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@\/actions\/products\/get$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^@\/components\/products\/ProductDetails$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^@\/lib\/analytics\/financial-calculations$/,
      })
    );

    return config;
  }
};

export default nextConfig;