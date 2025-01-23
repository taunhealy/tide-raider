"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/Button";
import { useSubscription } from "../context/SubscriptionContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "../lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAVIGATION_ITEMS = [
  { href: "/quest", label: "Daily Quest" },
  { href: "/sidequests", label: "Side Quests" },
  { href: "/chronicles", label: "Community Chronicles" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navbar() {
  const { data: session, status } = useSession({
    required: false,
  });
  const { isSubscribed } = useSubscription();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
    router.refresh();
  };

  if (status === "loading") {
    return (
      <header className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 bg-white min-h-[72px]">
        <div className="opacity-40">
          <Link href="/" className="text-[var(--color-text-primary)]">
            <h6>Side Quest</h6>
          </Link>
        </div>
        <div className="flex items-center gap-8">
          <nav>
            <ul className="flex gap-6">
              {[1, 2, 3].map((i) => (
                <li key={i}>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </li>
              ))}
            </ul>
          </nav>
          <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white ">
      <div
        className={cn(
          "flex justify-between items-center px-4 md:px-8 py-4 bg-white",
          "relative z-50"
        )}
      >
        <Link
          href="/"
          onClick={handleHomeClick}
          className="font-semibold hover:text-[var(--color-bg-tertiary)] transition-all duration-300"
        >
          <h6 className="heading-6 text-[var(--color-text-primary)]">
            Side Quest
          </h6>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav>
            <ul className="flex gap-6">
              {NAVIGATION_ITEMS.map((link, index) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={true}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = link.href;
                    }}
                    className={cn(
                      "relative text-gray-600 hover:text-gray-900 transition-colors",
                      pathname === link.href && "text-gray-900 font-medium"
                    )}
                  >
                    {link.label}
                  </Link>
                  {index < NAVIGATION_ITEMS.length - 1 && <div className="" />}
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex gap-4">
            {session ? (
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="transition-all duration-300"
              >
                Sign Out
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  signIn("google", { callbackUrl: window.location.href })
                }
                className="transition-all duration-300"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-4">
          {session ? (
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="transition-all duration-300"
            >
              Sign Out
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() =>
                signIn("google", { callbackUrl: window.location.href })
              }
              className="transition-all duration-300"
            >
              Sign In
            </Button>
          )}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-50 rounded-md transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <>
          <nav className="md:hidden absolute w-full px-4 py-6 bg-white border-t border-[var(--color-border-light)] z-50">
            <ul className="space-y-0">
              {NAVIGATION_ITEMS.map((link, index) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={true}
                    onClick={(e) => {
                      console.log("Link clicked:", link.href);
                      console.log("Current pathname:", pathname);
                      e.preventDefault();
                      console.log("Attempting navigation to:", link.href);
                      window.location.href = link.href;
                      console.log("Navigation completed");
                    }}
                    className={cn(
                      "block text-[var(--color-text-primary)] text-lg py-[16px]",
                      pathname === link.href && "font-medium"
                    )}
                  >
                    {link.label}
                  </Link>
                  {index < NAVIGATION_ITEMS.length - 1 && (
                    <div className="border-t border-[var(--color-border-light)]" />
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        </>
      )}
    </header>
  );
}
