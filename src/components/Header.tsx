"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, User } from "lucide-react";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/resources", label: "الموارد" },
  { href: "/tools", label: "الأدوات" },
  { href: "/actualites", label: "المستجدات" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          onClick={() => setOpen(false)}
        >
          <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-extrabold text-lg">
            م
          </div>
          <span className="text-lg sm:text-xl font-extrabold text-primary">
            Moudaris<span className="text-accent">Pro</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-bold text-muted hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/resources"
            aria-label="البحث في الموارد"
            className="p-2 rounded-full hover:bg-background"
          >
            <Search className="w-5 h-5 text-muted" />
          </Link>

          <Link
            href="/login"
            className="hidden sm:flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-secondary"
          >
            <User className="w-4 h-4" />
            دخول الأستاذ
          </Link>

          <button
            type="button"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-full hover:bg-background"
          >
            {open ? (
              <X className="w-6 h-6 text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* قائمة الهاتف */}
      {open && (
        <nav className="md:hidden border-t border-border bg-surface shadow-lg">
          <div className="mx-auto max-w-7xl px-4 py-2 flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3.5 text-base font-bold text-text border-b border-border last:border-0"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="my-3 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white"
            >
              <User className="w-4 h-4" />
              دخول الأستاذ
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
