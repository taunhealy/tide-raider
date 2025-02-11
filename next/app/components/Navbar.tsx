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
import RaidLink from "./RaidLink";
import Image from "next/image";

const NAVIGATION_ITEMS = [
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
              <li>
                <RaidLink
                  className={
                    pathname === "/raid" ? "link-nav-active" : "link-nav"
                  }
                />
              </li>
              {NAVIGATION_ITEMS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={
                      pathname === link.href ? "link-nav-active" : "link-nav"
                    }
                  >
                    <span className="relative">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex gap-4 items-center">
            {session ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <Image
                      src={session.user?.image || "/default-avatar.png"}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 font-primary">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-primary"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href={`/profile/${session.user.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-primary"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profile
                      </Link>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                  className="transition-all duration-300"
                >
                  Sign Out
                </Button>
              </>
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
              className="transition-all duration-300 font-primary"
            >
              Sign Out
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => handleSignIn()}
              className="transition-all duration-300 font-primary"
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
              <li>
                <RaidLink
                  className={
                    pathname === "/raid" ? "link-nav-active" : "link-nav"
                  }
                />
                <div className="border-t border-[var(--color-border-light)]" />
              </li>
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
