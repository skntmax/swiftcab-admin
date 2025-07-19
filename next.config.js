/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = { 
    images: {
        domains: [
            "cdn.imagin.studio",
            "asset.cloudinary.com",
            "swiftcab-dev.s3.ap-south-1.amazonaws.com"
        ]
    },
    webpack(config) {
        config.resolve.alias['@'] = path.resolve(__dirname, '.'); // This ensures it points to the project root
        return config;
    }
}

module.exports = nextConfig
