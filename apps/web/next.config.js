/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@makemyownmodel/encryption", "@makemyownmodel/tenant-context"],
};

module.exports = nextConfig;
