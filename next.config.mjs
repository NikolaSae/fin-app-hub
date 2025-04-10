/** @type {import('next').NextConfig} */
const nextConfig = {
experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'fuzzy-bassoon-j4pr9rgvxx6fpp6q-3000.app.github.dev',
        // Dodajte bilo koje dodatne origine koje koristite
      ],
    },
  },
};
export default nextConfig;
