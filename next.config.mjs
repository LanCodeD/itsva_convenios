/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // <-- AÑADE ESTO:
  async rewrites() {
    return [
      {
        source: '/Itsva_Convenios/:path*',
        destination: '/Itsva/Convenios/:path*',
      },
      {
        source: '/Itsva_Perfile/:path*',
        destination: '/Itsva/Perfile/:path*',
      },
    ]
  },
}

export default nextConfig
