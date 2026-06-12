import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 86400,
    qualities: [45, 55, 65, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ypsxzbezgxjhmgzfsxep.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};
export default nextConfig;
