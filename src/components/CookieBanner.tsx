"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "modaris_cookies_ok";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const ok = localStorage.getItem(STORAGE_KEY);
    if (!ok) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-label="إشعار ملفات تعريف الارتباط"
      className="fixed bottom-0 inset-x-0 z-50 bg-primary/95 backdrop-blur text-white border-t-4 border-accent shadow-2xl"
    >
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center gap-3 md:gap-6">
        <p className="text-sm leading-relaxed flex-1 text-white/90">
          🍪 نستخدم ملفات تعريف الارتباط وتحليلات Google Analytics لتحسين تجربتك.
          بمتابعتك التصفح فأنت توافق على{" "}
          <Link
            href="/privacy-policy"
            className="underline font-bold text-accent hover:text-white"
          >
            سياسة الخصوصية
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="shrink-0 bg-accent text-primary font-extrabold px-6 py-2.5 rounded-xl hover:brightness-110 transition"
        >
          موافق ✓
        </button>
      </div>
    </div>
  );
}