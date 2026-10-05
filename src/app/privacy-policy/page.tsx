import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | Modaris Pro',
  description: 'كيف يجمع ويستخدم ويحمي موقع Modaris Pro بياناتك عند استعمال أدوات المذكرة اليومية للدعم المكثف.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <main dir="rtl" className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-extrabold text-text">سياسة الخصوصية</h1>
      <p className="text-sm text-slate-500">آخر تحديث: 28 شتنبر 2026</p>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">1. مقدمة</h2>
        <p className="leading-7 text-slate-600">
          مرحباً بك في منصة <b>Modaris Pro</b> (modarispro.com). نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.
          تشرح هذه السياسة نوع البيانات التي نجمعها، وكيف نستخدمها، وحقوقك تجاهها، وذلك وفق القانون المغربي 09-08
          المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">2. البيانات التي نجمعها</h2>
        <ul className="list-disc pr-6 space-y-2 leading-7 text-slate-600">
          <li><b>بيانات تُخزَّن على جهازك فقط:</b> كل ما تدخله في أداة المذكرة اليومية (الإعدادات، التعديلات، الملاحظات، التوقيتات) يُحفظ محلياً في متصفحك عبر تقنية التخزين المحلي (localStorage)، ولا يُرسَل إلى خوادمنا إطلاقاً.</li>
          <li><b>بيانات القياس والتحليل:</b> نستخدم Google Analytics لجمع بيانات مجهولة الهوية عن استخدام الموقع (الصفحات المزارة، مدة الزيارة، نوع المتصفح والجهاز، الدولة)، وذلك لتحسين خدماتنا.</li>
          <li><b>ملفات تعريف الارتباط (Cookies):</b> نستخدم ملفات كوكيز تقنية وتحليلية محدودة، وقد نستخدم مستقبلاً كوكيز إعلانية عبر Google AdSense لعرض إعلانات ملائمة.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">3. كيف نستخدم البيانات</h2>
        <ul className="list-disc pr-6 space-y-2 leading-7 text-slate-600">
          <li>تحسين أداء المنصة وتطوير أدواتها التعليمية.</li>
          <li>فهم احتياجات الأساتذة وتقديم محتوى أكثر ملاءمة.</li>
          <li>قياس مدى استخدام الأدوات والميزات المختلفة.</li>
          <li>عرض إعلانات ملائمة مستقبلاً عبر Google AdSense (قد تستخدم جوجل كوكيز DART لعرض إعلانات بناءً على زياراتك السابقة، ويمكنك تعطيلها من إعدادات إعلانات جوجل).</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">4. مشاركة البيانات</h2>
        <p className="leading-7 text-slate-600">
          نحن لا نبيع ولا نؤجر ولا نتبادل بياناتك الشخصية مع أي طرف ثالث لأغراض تجارية. قد تُشارك البيانات المجهولة
          فقط مع مزودي الخدمات التحليلية (مثل Google)، أو عند وجود التزام قانوني يفرض ذلك.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">5. إدارة بياناتك وحذفها</h2>
        <p className="leading-7 text-slate-600">
          بما أن بيانات المذكرة تُخزَّن على جهازك، فأنت تتحكم فيها بالكامل: يمكنك تصديرها أو حذفها نهائياً في أي وقت
          من داخل الأداة عبر زرّي «تصدير البيانات» و«مسح جميع التعديلات». كما يمكنك حذف كوكيز المتصفح من إعدادات متصفحك.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">6. حماية بيانات الأطفال</h2>
        <p className="leading-7 text-slate-600">
          خدماتنا موجهة للأساتذة والمهنيين في قطاع التعليم، وليست موجهة للأطفال دون 18 سنة. نحن لا نجمع عن علم أي بيانات تخص الأطفال.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">7. أمان البيانات</h2>
        <p className="leading-7 text-slate-600">
          نعتمد بروتوكول HTTPS لتشفير الاتصال بين متصفحك وخوادمنا، ونراجع ممارساتنا الأمنية باستمرار لحماية بياناتك من الوصول غير المصرح به.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">8. التعديلات على هذه السياسة</h2>
        <p className="leading-7 text-slate-600">
          قد نُحدِّث هذه السياسة من حين لآخر. سيتم نشر أي تعديل في هذه الصفحة مع تحديث تاريخ «آخر تحديث». استمرارك في استخدام الموقع يعني قبولك بالنسخة المحدثة.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">9. اتصل بنا</h2>
        <p className="leading-7 text-slate-600">
          لأي سؤال حول هذه السياسة أو ممارسة حقوقك، راسلنا على: <b>contact@modarispro.com</b>
        </p>
      </section>
    </main>
  );
}