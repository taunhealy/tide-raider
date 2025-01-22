import { Inter } from "next/font/google";

// Use local font

import "./globals.css";
import { Montserrat } from "next/font/google";
import { AppProviders } from "./providers/AppProviders";
import Navbar from "./components/Navbar";
import Footer from "./sections/Footer";
import NewsBannerWrapper from "./components/NewsBannerWrapper";

import { client } from "./lib/sanity";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

async function getBlogPosts() {
  return await client.fetch(`
    *[_type == "post"] | order(publishedAt desc)[0...10] {
      title,
      slug,
    }
  `);
}

export const metadata = {
  title: "Daily Surf Forecast & Surf Report, Surf Spot Suggestions",
  description:
    "Read the surf report and find the best surf spots in the Western Cape based on current surf conditions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <AppProviders>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <NewsBannerWrapper />
        </AppProviders>
      </body>
    </html>
  );
}
