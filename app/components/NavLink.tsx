import Link from "next/link";
import { cn } from "@/app/lib/utils";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "text-[15px] font-medium transition-colors hover:text-[var(--color-text-primary)]",
        isActive
          ? "text-[var(--color-text-primary)]"
          : "text-[var(--color-text-secondary)]",
        className
      )}
    >
      {children}
    </Link>
  );
} 