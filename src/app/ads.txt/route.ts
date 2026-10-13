/**
 * خدمة ملف /ads.txt تلقائياً من متغيّر البيئة NEXT_PUBLIC_ADSENSE_CLIENT.
 * بعد ضبط معرّف الناشر (ca-pub-...) وإعادة النشر، يصبح الملف:
 *   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
 * (الخط أعلاه مطلوب لتفويض Google ببيع المخزون الإعلاني لموقعك.)
 */
export const dynamic = "force-static";

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";

  // ca-pub-1234...  ->  pub-1234...
  const pub = client.trim().toLowerCase().replace(/^ca-/, "");
  const valid = /^pub-\d{10,}$/.test(pub);

  const body = valid
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : [
        "# ads.txt — Modaris Pro",
        "# لم يُضبط معرّف الناشر بعد.",
        "# بعد إنشاء حساب AdSense: أضف NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX",
        "# (في .env محلياً وفي Vercel) ثم أعِد النشر لتوليد السطر الصحيح تلقائياً.",
        "",
      ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
