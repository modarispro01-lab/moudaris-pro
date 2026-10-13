"use client";

import { useEffect } from "react";

/**
 * وحدة إعلانية يدوية (اختياري).
 * استعملها فقط إن أردت تحديد مكان الإعلان بدل الاعتماد على «الإعلانات التلقائية».
 * يجب ضبط NEXT_PUBLIC_ADSENSE_CLIENT، وتمرير رقم الوحدة (slot) الذي يعطيك إياه أدسنس.
 *
 * مثال:
 *   <AdSlot slot="1234567890" />
 */
export default function AdSlot({
  slot,
  format = "auto",
  layoutKey,
  className = "",
}: {
  slot: string;
  format?: string;
  layoutKey?: string;
  className?: string;
}) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client) return;
    try {
      // يحقنه كود أدسنس في الصفحة
      ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || []).push({});
    } catch {
      /* تجاهل */
    }
  }, [client]);

  if (!client) return null;

  return (
    <div className={className}>
      {/* الوسم مطلوب من سياسات أدسنس لتمييز الإعلان عن المحتوى */}
      <div className="text-center text-[10px] tracking-wide text-slate-400 mb-1">إعلان</div>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout-key={layoutKey}
        data-full-width-responsive="true"
      />
    </div>
  );
}
