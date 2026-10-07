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

      {/* ===== نموذج أسر البريد الإلكتروني ===== */}
      <div className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-extrabold text-text">
          🔔 تريد دعوة الافتتاح قبل الجميع؟
        </h2>
        <p className="text-sm text-slate-500">
          اترك بريدك الآن — سنراسلك رسالة واحدة فقط فور جاهزية الخدمة.
        </p>
        <form
        action="https://formsubmit.co/modarispro01@gmail.com"          method="POST"
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <input type="hidden" name="_subject" value="اشتراك جديد: قائمة انتظار حسابات الأساتذة" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="table" />
          <input
            type="email"
            name="email"
            required
            placeholder="بريدك الإلكتروني"
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition whitespace-nowrap"
          >
            أعلمني عند الافتتاح
          </button>
        </form>
        <p className="text-xs text-slate-400">
          🔒 لن نشارك بريدك مع أي طرف ثالث — رسالة واحدة عند الافتتاح فقط.
        </p>
      </div>
      {/* ======================================= */}

      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Link
          href="/tools/daily-lesson-plan"
          className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition"
        >
          📘 العودة إلى الأداة
        </Link>
      </div>
    </main>
  );
}