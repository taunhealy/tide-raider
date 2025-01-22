/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "cdn.sanity.io",
      `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    ],
  },
};

module.exports = nextConfig;
