/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = { 
    images: {
        domains: [
            "cdn.imagin.studio",
            "asset.cloudinary.com"
        ]
    },
    webpack(config) {
        config.resolve.alias['@'] = path.resolve(__dirname, '.'); // This ensures it points to the project root
        return config;
    }
}

module.exports = nextConfig
