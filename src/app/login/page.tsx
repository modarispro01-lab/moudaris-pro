import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "دخول الأستاذ | Modaris Pro",
  description:
    "قريباً: حسابات الأساتذة على Modaris Pro — حفظ سحابي للمذكرات ومزامنة بين الأجهزة ومكتبة خاصة.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <main dir="rtl" className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="text-6xl">🔐</div>
      <h1 className="text-3xl font-extrabold text-text">دخول الأستاذ</h1>
      <p className="text-lg leading-8 text-slate-600">
        نعمل حالياً على نظام حسابات الأساتذة، وسيمكنك قريباً من:
      </p>

      <ul className="space-y-3 text-slate-600 leading-7 bg-surface border border-border rounded-2xl p-6 text-right">
        <li>☁️ حفظ مذكراتك وإعداداتك في السحابة بدل المتصفح فقط.</li>
        <li>🔄 مزامنة تلقائية بين هاتفك وحاسوبك.</li>
        <li>📚 مكتبة خاصة بمواردك وملاحظاتك المفضلة.</li>
        <li>🖨️ أرشيف دائم لكل المذكرات التي ولّدتها وطبعتها.</li>
      </ul>

      <p className="text-sm text-slate-500 leading-7">
        تريد أن تصلك دعوة الافتتاح قبل الجميع؟
        <br />
        اترك بريدك الإلكتروني عبر صفحة التواصل وسنراسلك فور جاهزية الخدمة.
      </p>

      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Link
          href="/tools/daily-lesson-plan"
          className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition"
        >
          📘 العودة إلى الأداة
        </Link>
        <Link
          href="/contact"
          className="bg-surface border border-border text-text font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition"
        >
          ✉️ أعلمني عند الافتتاح
        </Link>
      </div>
    </main>
  );
}