/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Habilitar output standalone para Docker
  output: 'standalone',
  
  // Configurações de performance
  experimental: {
    // Otimizações para produção
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Configurações de imagem para otimização
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default config;
