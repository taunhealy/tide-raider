import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./sections/Footer";
import NewsBannerWrapper from "./components/NewsBannerWrapper";
import { AppProviders } from "./providers/AppProviders";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-secondary",
  display: "swap",
});

export const metadata = {
  title:
    "Tide Raider - Daily Surf Forecast, Surf Report & Surf Spot Suggestions",
  description:
    "Read the surf report and find the best surf spots in Africa, based on current surf conditions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-chrome-192x192.png"
        />
      </head>
      <body>
        <AppProviders>
          <Navbar />
          <NewsBannerWrapper />
          {children}
          <Footer />
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
