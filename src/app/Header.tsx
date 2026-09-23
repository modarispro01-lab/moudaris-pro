import Link from "next/link";
import { Search, Menu, User } from "lucide-react";

const navLinks = [
  { name: "الرئيسية", href: "/" },
  { name: "المستجدات", href: "/actualites" },
  { name: "الموارد", href: "/resources" },
  { name: "الأدوات", href: "/tools" },
  { name: "المتجر", href: "/store" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-extrabold text-lg">
            م
          </div>
          <span className="text-xl font-extrabold text-primary">
            Moudaris<span className="text-accent">Pro</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-muted hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button aria-label="بحث" className="p-2 rounded-full hover:bg-background transition-colors">
            <Search className="w-5 h-5 text-muted" />
          </button>
          <Link
            href="/login"
            className="hidden sm:flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-secondary transition-colors"
          >
            <User className="w-4 h-4" />
            دخول الأستاذ
          </Link>
          <button aria-label="القائمة" className="md:hidden p-2">
            <Menu className="w-6 h-6 text-text" />
          </button>
        </div>
      </div>
    </header>
  );
}