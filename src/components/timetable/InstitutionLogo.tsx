"use client";

/* ============================================================
   شعار أعلى وسط الورقة
   — إن لم يُرفع شعار، يُعرض شعار زخرفي أصلي (ليس شعار جهة رسمية)
   ============================================================ */
import React from "react";

export default function InstitutionLogo({
  size,
  src,
  color,
}: {
  /** الارتفاع بالبكسل */
  size: number;
  /** شعار مرفوع من المستخدم (data URL) */
  src?: string;
  color?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="شعار المؤسسة"
        style={{
          height: `${size}px`,
          width: "auto",
          maxWidth: `${size * 1.3}px`,
          objectFit: "contain",
          display: "block",
        }}
      />
    );
  }

  /* شعار زخرفي أصلي: كتاب مفتوح ونجمة داخل حلقة مزدوجة */
  const c = color || "#123B5D";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="شعار الوثيقة"
      style={{ display: "block" }}
    >
      <circle cx="50" cy="50" r="48" fill="none" stroke={c} strokeWidth="2.6" />
      <circle cx="50" cy="50" r="43.5" fill="none" stroke={c} strokeWidth="1" opacity="0.6" />
      {/* كتاب مفتوح */}
      <path
        d="M20 60 Q33 51 48 57 L48 79 Q33 73 20 81 Z"
        fill={c}
        opacity="0.92"
      />
      <path
        d="M80 60 Q67 51 52 57 L52 79 Q67 73 80 81 Z"
        fill={c}
        opacity="0.65"
      />
      <line x1="50" y1="57" x2="50" y2="79" stroke={c} strokeWidth="1.4" opacity="0.5" />
      {/* نجمة */}
      <path
        d="M50 16 l4.5 9.1 10 1.5 -7.3 7 1.7 10 -8.9-4.7 -8.9 4.7 1.7-10 -7.3-7 10-1.5 Z"
        fill={c}
      />
    </svg>
  );
}