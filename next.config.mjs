/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_GOOGLE_MAPS_API: process.env.GOOGLE_MAPS_API,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
    transpilePackages: ['react-leaflet', 'leaflet'],
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
        ],
    },
    experimental: {
        optimizePackageImports: ['lucide-react', 'react-icons', 'framer-motion', 'date-fns', '@radix-ui/react-icons'],
    },
};

export default nextConfig;
