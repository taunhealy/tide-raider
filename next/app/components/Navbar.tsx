"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/Button";
import { useSubscription } from "../context/SubscriptionContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "../lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { handleSignIn } from "../lib/auth-utils";

const NAVIGATION_ITEMS = [
  { href: "/raid", label: "Raid" },
  { href: "/raidlogs", label: "Raid Logs" },
  { href: "/chronicles", label: "Chronicles" },
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

  return (
    <header className="sticky top-0 z-50 bg-white">
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
            Tide Raider
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
                    className={
                      pathname === link.href ? "link-nav-active" : "link-nav"
                    }
                  >
                    {link.label}
                  </Link>
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
                onClick={() => handleSignIn()}
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
              onClick={() => handleSignIn()}
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
                    className={
                      pathname === link.href ? "link-nav-active" : "link-nav"
                    }
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
