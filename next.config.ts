import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Allow all external images without hostname restrictions
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.globy.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.ogbete.com.ng",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s.alicdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.supermart.ng",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tehorafoodhub.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tmaglobal.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "afrominimart.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pp-new-node-medusa-prod-bucket.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "addide.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "chomart.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Ensure proper build configuration for production
  // ...(process.env.NODE_ENV === "production" && {
  //   output: "standalone",
  // }),
};

export default nextConfig;
