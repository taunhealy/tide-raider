import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./sections/Footer";
import NewsBannerWrapper from "./components/NewsBannerWrapper";
import { AppProviders } from "./providers/AppProviders";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

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
      <body>
        <AppProviders>
          <main>
            <Navbar />
            {children}
          </main>
          <Footer />
          <NewsBannerWrapper />
        </AppProviders>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
