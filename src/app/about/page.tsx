import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'من نحن | Modaris Pro',
  description: 'تعرف على منصة Modaris Pro: رسالتنا، فريقنا، وأدواتنا المصممة لخدمة أساتذة التعليم الابتدائي بالمغرب في فترة الدعم المكثف.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <main dir="rtl" className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-extrabold text-text">من نحن</h1>

      <section className="space-y-3 leading-8 text-slate-600">
        <p>
          <b className="text-primary">Modaris Pro</b> منصة رقمية مغربية وُلدت من قلب القسم، ومن معاينة يومية لحجم الجهد الذي يبذله
          أساتذة التعليم الابتدائي في إعداد المذكرات اليومية، خصوصاً خلال فترة <b>الدعم المكثف</b> التي تتطلب تخطيطاً دقيقاً
          ومتابعة فردية لكل متعلم.
        </p>
        <p>
          رسالتنا بسيطة وواضحة: <b>أن نوفر على الأستاذ ساعات العمل الإداري المتكرر</b>، ونمنحه أداة ذكية تولّد له المذكرة
          اليومية والأسبوعية في دقائق، مطابقة للمصفوفات الرسمية 2026/2027، وجاهزة للطباعة بصيغة احترافية.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold text-text">ماذا نقدم؟</h2>
        <ul className="list-disc pr-6 space-y-2 leading-7 text-slate-600">
          <li><b>المذكرة اليومية:</b> توليد تلقائي لمذكرة أي مادة (العربية، الفرنسية، الرياضيات) لأي مستوى من الأول إلى السادس، مع مراحل سير الدرس الرسمية.</li>
          <li><b>المذكرة الأسبوعية:</b> طباعة ستة أيام كاملة دفعة واحدة، كل حصة في ورقة مستقلة، مع توقيت بداية مخصص لكل يوم.</li>
          <li><b>إدارة الأفواج والمسارات:</b> دعم كامل للتنظيم الرسمي (فوجان أو أربعة أفواج حسب المادة والمستوى) مع إمكانية الجمع بين مستويات مختلفة في نفس اليوم.</li>
          <li><b>تخصيص مطلق:</b> تعديل أي حصة، حفظ التعديلات، تصدير واستيراد البيانات، وطباعة بصيغة A4 أفقية جاهزة للتوقيع.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold text-text">لماذا نحن؟</h2>
        <ul className="list-disc pr-6 space-y-2 leading-7 text-slate-600">
          <li>محتوى مبني على <b>المصفوفات الرسمية</b> للدعم المكثف 2026/2027، لا على اجتهادات شخصية.</li>
          <li>أداة تعمل بخصوصية تامة: بياناتك تُحفظ على جهازك وحدك.</li>
          <li>واجهة عربية بسيطة تعمل على الحاسوب والهاتف دون تثبيت أي برنامج.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">تواصل معنا</h2>
        <p className="leading-7 text-slate-600">
          نحن نستمع لكل اقتراح من أساتذتنا الكرام. راسلنا على <b>contact@modarispro.com</b> أو عبر صفحة{' '}
          <a href="/contact" className="text-primary font-bold underline">اتصل بنا</a>.
        </p>
      </section>
    </main>
  );
}