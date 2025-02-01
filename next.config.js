/** @type {import('next').NextConfig} */
const nextConfig = {

    env: {
        customKey: 'my-value',
      },
      
    images: {
        domains: ["cdn.imagin.studio"]
    }
}

module.exports = nextConfig
