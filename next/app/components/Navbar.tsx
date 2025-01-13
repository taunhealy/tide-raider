"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/Button";
import { useSubscription } from "../context/SubscriptionContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "../lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { isSubscribed } = useSubscription();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/raid", label: "Daily Raid" },
    { href: "/blog", label: "Log" },
    { href: "/pricing", label: "Pricing" },
    { href: "/logbook", label: "LogBook"}
  ];

  if (status === "loading") {
    return (
      <header className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 bg-white min-h-[72px]">
        <div className="opacity-40">
          <h6 className="text-[var(--color-text-primary)]">Tide Raider</h6>
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
    <header className="sticky top-0 z-50 bg-white border-b border-[var(--color-border-light)]">
      <div
        className={cn(
          "flex justify-between items-center px-4 md:px-8 py-4 bg-white",
          "relative z-50"
        )}
      >
        <a
          href="/"
          onClick={handleHomeClick}
          className="font-semibold hover:text-[var(--color-bg-tertiary)] transition-all duration-300"
        >
          <h6 className="heading-6 text-[var(--color-text-primary)]">
            Tide Raider
          </h6>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav>
            <ul className="flex gap-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative text-gray-600 hover:text-gray-900 transition-colors",
                      pathname === link.href && "text-gray-900 font-medium"
                    )}
                  >
                    <span
                      className={`relative after:content-[""] after:absolute after:left-0 after:bottom-[-3px] after:h-[2px] after:bg-[var(--color-bg-tertiary)] after:transition-all after:duration-300 after:ease-out ${
                        pathname === link.href
                          ? "after:w-full"
                          : "after:w-0 hover:after:w-full"
                      }`}
                    >
                      {link.label}
                    </span>
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
                onClick={() => signIn("google")}
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
              onClick={() => signIn("google")}
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
              {navLinks.map((link, index) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block text-[var(--color-text-primary)] text-lg py-[16px]",
                      pathname === link.href && "font-medium"
                    )}
                  >
                    {link.label}
                  </Link>
                  {/* Add separator line if not the last item */}
                  {index < navLinks.length - 1 && (
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
