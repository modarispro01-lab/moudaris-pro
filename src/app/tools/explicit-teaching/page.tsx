import type { Metadata } from 'next';
import { CheckCircle2, ClipboardList, FileText, Printer, ShieldCheck, Sparkles } from 'lucide-react';
import ExplicitTeachingWorkspace from './components/ExplicitTeachingWorkspace';
import './print.css';

export const metadata: Metadata = {
  title: { absolute: 'المذكرة اليومية الاحترافية — التعليم الصريح | Modaris Pro' },
  description:
    'مولّد المذكرة اليومية وفق منهج التعليم الصريح (Enseignement Explicite) للمدرسة الرائدة: الرياضيات للمستويين الأول والثاني، بالعربية أو الفرنسية أو bilingual، وفق التوازيع المرحلية الرسمية.',
  keywords: [
    'المذكرة اليومية',
    'التعليم الصريح',
    'Enseignement Explicite',
    'المدرسة الرائدة',
    'الرياضيات المستوى الأول',
    'الرياضيات المستوى الثاني',
    'التوازيع المرحلية',
    'جذاذة الرياضيات',
    'Modaris Pro',
  ],
  alternates: { canonical: '/tools/explicit-teaching' },
  openGraph: {
    title: 'المذكرة اليومية الاحترافية — التعليم الصريح | Modaris Pro',
    description:
      'مولّد المذكرة اليومية وفق منهج التعليم الصريح: الرياضيات للمستويين الأول والثاني، وفق التوازيع المرحلية الرسمية.',
    url: 'https://modarispro.com/tools/explicit-teaching',
    type: 'website',
    locale: 'ar_MA',
  },
};

const steps = [
  {
    icon: ShieldCheck,
    title: '1. اضبط الإعدادات العامة',
    text: 'حدّد مستوياتك، لغة المذكرة، وبيانات الترويسة. تُحفظ هذه الإعدادات تلقائياً في متصفحك وتُستعاد في كل زيارة.',
  },
  {
    icon: Sparkles,
    title: '2. اختر الحصة',
    text: 'المادة ← المستوى ← المرحلة ← الأسبوع ← اليوم. يُجلب عنوان الدرس ورقمه تلقائياً من التوازيع المرحلية الرسمية.',
  },
  {
    icon: FileText,
    title: '3. عدّل واطبع',
    text: 'عدّل كل خانة في المذكرة، احفظ نسخة كمسودة، ثم اطبع A4 أو صدّر PDF من نافذة الطباعة.',
  },
];

const contents = [
  'ترويسة إدارية كاملة: الأكاديمية، المديرية، المؤسسة، الموسم الدراسي، الأستاذ(ة)، المفتش(ة)، المدير(ة)، الأفواج.',
  'هدف عام، كفاية مستهدفة، مكتسبات سابقة، ووسائل ووسائط.',
  'مراحل التعليم الصريح الخمس بتوقيتها: التهيئة، النمذجة، الممارسة الموجهة، الممارسة المستقلة، التقويم والمعالجة.',
  'حقول التقويم والمعالجة والعمل المنزلي وملاحظات الأستاذ(ة).',
  'قالب مبسط لحصة الدعم يوم الجمعة، وقالب خاص للتقويم الذاتي والمراجعة العامة.',
  'خانات التوقيع والاعتماد، وإمكانية تعديل كل النصوص قبل الطباعة.',
];

export default function ExplicitTeachingPage() {
  return (
    <>
      <ExplicitTeachingWorkspace />

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-secondary">
              Enseignement Explicite · المدرسة الرائدة
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-text">
              مذكرة يومية مبنية على التوازيع الرسمية، لا على نصوص مُختلقة
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              تعتمد الأداة على بيانات التوازيع المرحلية الرسمية لمادة الرياضيات في المستويين الأول
              والثاني. عند اختيار الحصة، تُحدَّد المرحلة والأسبوع واليوم، ثم يُستخرج رقم الدرس وعنوانه
              تلقائياً. تُبنى مراحل المذكرة على منهج التعليم الصريح، وتبقى كل الحقول قابلة للتحرير
              والملاءمة مع قسمك قبل الطباعة.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-border bg-background p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-extrabold text-text">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-6 text-muted">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h3 className="flex items-center gap-2 text-base font-extrabold text-text">
                <ClipboardList className="h-4.5 w-4.5 text-secondary" />
                ماذا تتضمن المذكرة؟
              </h3>
              <ul className="mt-4 space-y-2.5">
                {contents.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs leading-6 text-muted">
                    <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-secondary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-background p-6">
                <h3 className="flex items-center gap-2 text-base font-extrabold text-text">
                  <Printer className="h-4.5 w-4.5 text-secondary" />
                  الطباعة وPDF
                </h3>
                <ol className="mt-3 space-y-2 text-xs leading-6 text-muted">
                  <li>1. اضغط «طباعة / PDF» داخل شاشة النتيجة.</li>
                  <li>2. اختر الطابعة أو «الحفظ بصيغة PDF» من نافذة المتصفح.</li>
                  <li>3. اضبط الحجم على A4 وهوامش افتراضية، ثم أكّد الطباعة.</li>
                </ol>
              </div>

              <div className="rounded-2xl border border-border bg-background p-6">
                <h3 className="text-base font-extrabold text-text">خصوصية كاملة</h3>
                <p className="mt-2 text-xs leading-6 text-muted">
                  تعمل الأداة بالكامل داخل متصفحك. لا تُرسل بياناتك إلى خادم، ولا تحتاج إلى إنشاء
                  حساب. تُخزَّن الإعدادات والمسودات محلياً على جهازك فقط.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
