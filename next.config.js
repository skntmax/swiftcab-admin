/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.fallback = { fs: false, path: false };
        return config;
      },
    images: {
        domains: ["cdn.imagin.studio"]
    }
}

module.exports = nextConfig
