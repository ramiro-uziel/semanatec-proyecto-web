/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.myanimelist.net',
                port: '',
                pathname: '/images/**',
            },
        ],
        domains: ['uploads.mangadex.org'],
    },
}

export default nextConfig;
