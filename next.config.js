/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    images: {
        domains: [
            "cdn.imagin.studio",
            "asset.cloudinary.com",
            "res.cloudinary.com",
            "swiftcab-dev.s3.ap-south-1.amazonaws.com"
        ]
    },
    experimental: {
        optimizePackageImports: [
            '@mui/material',
            '@mui/icons-material',
            'lucide-react',
        ],
    },
    onDemandEntries: {
        maxInactiveAge: 60 * 60 * 1000,
        pagesBufferLength: 8,
    },
    webpack(config) {
        config.resolve.alias['@'] = path.resolve(__dirname, '.');
        return config;
    }
}

module.exports = nextConfig
