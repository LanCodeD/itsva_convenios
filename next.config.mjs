/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https', // Protocolo que usa Cloudinary
          hostname: 'res.cloudinary.com', // Dominio de las imágenes
          pathname: '/**', // Permite cargar imágenes desde cualquier subruta
        },
      ],
    },
  };
  
  export default nextConfig;
  