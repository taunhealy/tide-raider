/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      "storage.tideraider.com",
      "images.unsplash.com",
      "cdn.sanity.io",
      `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      "media.tideraider.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.tideraider.com",
        pathname: "/sessions/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        hostname: `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle electron and other missing modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      electron: false,
      fs: false,
      path: false,
      worker_threads: false,
    };

    // Ignore warnings for specific modules
    config.ignoreWarnings = [
      { module: /node_modules\/playwright-core/ },
      { module: /node_modules\/electron/ },
    ];

    if (isServer) {
      config.module.rules.push({
        test: /\.(ttf|html)$/,
        use: "null-loader",
      });
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["@sparticuz/chromium"],
  },
};

process.env.NODE_OPTIONS = "--no-deprecation";

module.exports = nextConfig;
