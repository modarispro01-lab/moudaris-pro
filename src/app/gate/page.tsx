import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Lock } from "lucide-react";
import {
  ACCESS_COOKIE,
  isGateConfigured,
  isValidAccessToken,
  safeNextPath,
} from "@/lib/private-tools";

export const metadata: Metadata = {
  title: "دخول خاص | Modaris Pro",
  description: "صفحة دخول محمية لأدوات Modaris Pro الخاصة.",
  robots: { index: false, follow: false },
};

/* الصفحة ديناميكية: كتقرا الكوكي فـ كل طلب */
export const dynamic = "force-dynamic";

export default async function GatePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = safeNextPath(sp.next);
  const hasError = sp.error === "1";
  const configured = isGateConfigured();

  /* داخل من قبل؟ كيرجع نيشان للمسار المطلوب */
  const jar = await cookies();
  if (configured && isValidAccessToken(jar.get(ACCESS_COOKIE)?.value)) {
    redirect(next);
  }

  return (
    <main dir="rtl" className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-text">دخول خاص</h1>
          <p className="text-sm text-muted">
            هاد الأداة مخصّصة. دخّل كلمة السر باش تكمّل.
          </p>
        </div>

        {!configured ? (
          <div className="rounded-xl border-2 border-dashed border-red-300 bg-red-50 p-4 text-sm text-red-700 leading-7">
            <p className="font-bold mb-1">الحماية غير مهيّأة</p>
            <p>
              المتغيّر <code className="font-mono">TOOLS_PASSWORD</code> غير مضبوط.
              أضفه في Vercel ← Settings ← Environment Variables (Production + Preview)
              ثم أعد النشر.
            </p>
          </div>
        ) : (
          <form action="/api/gate" method="POST" className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <label htmlFor="password" className="block text-sm font-bold text-text">
              كلمة السر
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="********"
            />
            {hasError && (
              <p className="text-sm font-bold text-red-600">كلمة السر غير صحيحة.</p>
            )}
            <button
              type="submit"
              className="w-full bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:opacity-90 transition"
            >
              دخول
            </button>
          </form>
        )}

        <p className="text-center text-xs text-muted">
          نسيت كلمة السر؟ تواصل مع صاحب الموقع.
        </p>
      </div>
    </main>
  );
}