import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اتصل بنا | Modaris Pro',
  description: 'تواصل مع فريق Modaris Pro: استفسارات، اقتراحات تطوير، أو الإبلاغ عن ملاحظة في أدوات المذكرة اليومية.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <main dir="rtl" className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-extrabold text-text">اتصل بنا</h1>
      <p className="leading-7 text-slate-600">
        يسعدنا تواصلك معنا! سواء كنت أستاذاً لديه اقتراح لتطوير الأداة، أو مسؤولاً عن مؤسسة تعليمية يرغب في تعميمها،
        أو زميلاً يريد الإبلاغ عن ملاحظة — نحن نقرأ كل رسالة.
      </p>

      <section className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-extrabold text-text">البريد الإلكتروني الرسمي</h2>
        <p className="text-lg font-bold text-primary" dir="ltr">contact@modarispro.com</p>
        <a
          href="mailto:contact@modarispro.com?subject=استفسار%20من%20موقع%20Modaris%20Pro"
          className="inline-block bg-primary text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition"
        >
          ✉️ إرسال بريد الآن
        </a>
        <p className="text-sm text-slate-500">نرد عادة خلال 24 إلى 48 ساعة في أيام العمل.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold text-text">قبل أن تراسلنا</h2>
        <ul className="list-disc pr-6 space-y-2 leading-7 text-slate-600">
          <li>لأسئلة استعمال الأداة، راجع تبويب <b>«المساعدة»</b> داخل المذكرة اليومية — ستجد فيه الاختصارات وشروحات الأفواج والمسارات.</li>
          <li>للبلاغ عن خطأ في محتوى حصة، يُفضل ذكر: المستوى + المادة + المسار + رقم الحصة، لنصححه في أقرب تحديث.</li>
          <li>لا تشارك أبداً كلمات المرور أو البيانات الشخصية الحساسة عبر البريد.</li>
        </ul>
      </section>
    </main>
  );
}