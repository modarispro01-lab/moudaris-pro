"use client";

/* ============================================================
   بطاقة عائمة — تُستخدم لاختيار المادة والقوائم المنبثقة
   ============================================================ */
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

export interface Anchor {
  x: number;
  y: number;
}

interface Props {
  anchor: Anchor;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export default function FloatingCard({ anchor, onClose, children, width = 240 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Anchor>({ x: anchor.x, y: anchor.y });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = anchor.x;
    let y = anchor.y + 6;
    if (x + rect.width > vw - 8) x = vw - rect.width - 8;
    if (x < 8) x = 8;
    if (y + rect.height > vh - 8) {
      y = anchor.y - rect.height - 6;
    }
    if (y < 8) y = 8;
    setPos({ x, y });
  }, [anchor.x, anchor.y]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={ref}
        className="fixed z-50 max-h-[70vh] overflow-auto rounded-xl border border-border bg-surface shadow-xl"
        style={{ left: pos.x, top: pos.y, width }}
        role="dialog"
      >
        {children}
      </div>
    </>
  );
}
