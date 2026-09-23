import Link from "next/link";
import { Search, Menu, User } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-extrabold text-lg">م</div>
          <span className="text-xl font-extrabold text-primary">
            Moudaris<span className="text-accent">Pro</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-bold text-muted hover:text-primary">الرئيسية</Link>
          <Link href="/resources" className="text-sm font-bold text-muted hover:text-primary">الموارد</Link>
          <Link href="/tools" className="text-sm font-bold text-muted hover:text-primary">الأدوات</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-background">
            <Search className="w-5 h-5 text-muted" />
          </button>
          <Link href="/login" className="hidden sm:flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-secondary">
            <User className="w-4 h-4" />
            دخول الأستاذ
          </Link>
        </div>
      </div>
    </header>
  );
}