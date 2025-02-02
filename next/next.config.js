/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "cdn.sanity.io",
      `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      "images.unsplash.com",
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      worker_threads: false,
    };
    config.ignoreWarnings = [{ module: /node_modules\/web-worker/ }];
    return config;
  },
};

module.exports = nextConfig;
