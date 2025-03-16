/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {hostname: "lh3.googleusercontent.com"},
            {hostname: "static.www.nfl.com"},
            {hostname: "a.espncdn.com"},
            {hostname: "secure.espncdn.com"},
            {hostname: "cdn.nba.com"},
            {hostname: "ak-static.cms.nba.com"}
        ]
    }
}

module.exports = nextConfig
