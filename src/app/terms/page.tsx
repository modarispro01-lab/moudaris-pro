import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'شروط الاستخدام | Modaris Pro',
  description: 'شروط استخدام منصة Modaris Pro وأدواتها التعليمية: حقوقك والتزاماتك عند استعمال المذكرة اليومية للدعم المكثف.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <main dir="rtl" className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-extrabold text-text">شروط الاستخدام</h1>
      <p className="text-sm text-slate-500">آخر تحديث: 28 شتنبر 2026</p>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">1. القبول بالشروط</h2>
        <p className="leading-7 text-slate-600">
          باستخدامك موقع Modaris Pro أو أيٍّ من أدواته، فإنك توافق على هذه الشروط وعلى سياسة الخصوصية المنشورة في الموقع.
          إن كنت لا توافق على أي منها، يرجى التوقف عن استخدام الخدمة.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">2. طبيعة الخدمة</h2>
        <p className="leading-7 text-slate-600">
          تقدم المنصة أدوات مساعدة لإعداد المذكرات والوثائق التربوية وفق المصفوفات الرسمية المرجعية. هذه الأدوات
          <b> وسيلة مساعدة تنظيمية</b>، وتبقى المسؤولية البيداغوجية الكاملة عن محتوى التدريس وملاءمته للفصل على الأستاذ(ة) المستعمِل(ة).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">3. الملكية الفكرية</h2>
        <ul className="list-disc pr-6 space-y-2 leading-7 text-slate-600">
          <li>جميع عناصر المنصة (الكود، التصميم، النصوص الأصلية، الشعار) ملك لـ Modaris Pro ومحمية بقوانين الملكية الفكرية.</li>
          <li>المصفوفات والوثائق الرسمية المشار إليها وثائق عمومية مرجعية؛ استعمالنا لها استعمال توجيهي لتنظيم العمل التربوي.</li>
          <li>يُسمح للأستاذ(ة) بطباعة واستعمال المذكرات المولَّدة لأغراض مهنية شخصية داخل مؤسسته التعليمية.</li>
          <li>يُمنع نسخ المنصة أو إعادة بيعها أو استنساخها تجارياً أو تقديمها كخدمة مدفوعة دون ترخيص كتابي منا.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">4. الاستخدام المقبول</h2>
        <ul className="list-disc pr-6 space-y-2 leading-7 text-slate-600">
          <li>يُمنع استخدام المنصة لأي غرض غير مشروع أو مخالف للقيم التربوية.</li>
          <li>يُمنع محاولة اختراق المنصة أو تعطيلها أو تحميلها بما يفوق طاقتها.</li>
          <li>يُمنع جمع بيانات مستخدمين آخرين أو انتحال صفة المنصة.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">5. إخلاء المسؤولية</h2>
        <p className="leading-7 text-slate-600">
          تُقدَّم الخدمة «كما هي». نبذل جهدنا لضمان دقة المحتوى ومطابقته للمراجع الرسمية، لكننا لا نضمن خلوّه من الأخطاء
          نهائياً، ولا نتحمل مسؤولية أي قرار إداري أو تربوي يُبنى على مخرجات الأداة دون مراجعة الأستاذ(ة).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">6. التعديلات والتوفر</h2>
        <p className="leading-7 text-slate-600">
          قد نحدّث الخدمة أو نوقفها مؤقتاً للصيانة أو التطوير دون إشعار مسبق، ونحتفظ بحق تعديل هذه الشروط مع نشر النسخة المحدثة في هذه الصفحة.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">7. القانون المطبق</h2>
        <p className="leading-7 text-slate-600">
          تخضع هذه الشروط للقانون المغربي، ويكون لأي نزاع ناشئ عنها اختصاص محاكم المملكة المغربية بعد استنفاد محاولات الحل الودي.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">8. التواصل</h2>
        <p className="leading-7 text-slate-600">لأي استفسار قانوني: <b>contact@modarispro.com</b></p>
      </section>
    </main>
  );
}