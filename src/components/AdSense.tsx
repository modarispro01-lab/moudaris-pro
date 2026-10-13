"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * تحميل كود Google AdSense تلقائياً.
 *
 * كيف يُستعمل:
 *   1) أضف المتغيّر التالي في ملف ‎.env‎ (محلياً) وفي إعدادات Vercel:
 *        NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 *   2) أعِد النشر. سيظهر الكود في كل الصفحات تلقائياً.
 *
 * ملاحظات احترافية:
 *   - لا يُحمَّل أي كود إن لم يُضبط المتغيّر (لا أخطاء قبل القبول).
 *   - تُستثنى صفحات الأدوات (/tools/xxx) وصفحة الدخول ولوحة التحكم، لأن أدسنس
 *     يشترط وجود محتوى ذي قيمة، وصفحات الأدوات تطبيقات لا مقالات.
 */
const EXCLUDED = [/^\/admin(\/|$)/, /^\/login(\/|$)/, /^\/tools\/.+/];

export default function AdSense() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const pathname = usePathname();

  if (!client) return null;
  if (pathname && EXCLUDED.some((re) => re.test(pathname))) return null;

  return (
    <Script
      id="adsbygoogle-init"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}
