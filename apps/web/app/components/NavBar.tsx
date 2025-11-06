"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Inicio" },
  ];

  return (
    <nav className="flex items-center gap-2 text-sm">
      {links
        .filter((l) => l.href !== pathname)
        .map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-zinc-200 hover:bg-zinc-900"
          >
            {l.label}
          </Link>
        ))}
    </nav>
  );
}


