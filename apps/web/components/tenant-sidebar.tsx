"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: (s: string) => `/t/${s}/dashboard`, label: "Dashboard" },
  { href: (s: string) => `/t/${s}/settings`, label: "Settings" },
  { href: (s: string) => `/t/${s}/onboarding`, label: "Onboarding" },
];

export function TenantSidebar({ slug }: { slug: string }) {
  const pathname = usePathname();
  return (
    <nav className="p-4 space-y-1">
      {links.map(({ href, label }) => {
        const h = href(slug);
        const active = pathname === h || pathname.startsWith(h + "/");
        return (
          <Link
            key={h}
            href={h}
            className={`block px-3 py-2 rounded-md text-sm ${
              active
                ? "bg-primary text-accent"
                : "text-muted-foreground hover:bg-white/5 hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
