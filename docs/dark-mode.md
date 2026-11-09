# نظام الوضع الداكن — Modaris Pro

## كيف يعمل

1. **متغيرات وقت التشغيل**: كل الألوان معرّفة على `:root` (فاتح) و`[data-theme="dark"]` (داكن) في `src/app/globals.css`.
2. **رموز Tailwind عبر `@theme inline`**: رموز `--color-*` تشير إلى متغيرات وقت التشغيل مباشرة، فتنقلب الألوان فور تبديل `data-theme` دون إعادة تحميل.
3. **تدرج الرمادي الافتراضي** (`gray-50…950`) و`slate` معاد توجيهه إلى نفس المتغيرات — أي صنف `bg-gray-*`/`text-gray-*` قائم يتبع الثيم تلقائيًا.
4. **سكربت منع الوميض**: أول عقدة في `<body>` (سكربت حاجب) يقرأ `localStorage.theme` داخل try/catch، وإلا يتبع `prefers-color-scheme`. يضع `data-theme` على `<html>` قبل أول رسم.
   - ملاحظة مقيسة: `next/script beforeInteractive` في Next 16/Turbopack يؤجل التنفيذ (~390ms بعد أول رسم) فيسبب وميضًا؛ ووضع السكربت في `<head>` يدويًا يطلق تحذير React dev «script tag while rendering». الأول عقد في `<body>` هو الحل السليم.
5. **التبديل**: `src/components/ThemeToggle.tsx` في الترويسة — `aria-pressed` + `aria-label` عربي، ويتبع تغيّر ثيم النظام ما لم يختر المستخدم يدويًا.
6. **الطباعة والوثائق**: داخل `@media print` تُعاد تثبيت كل المتغيرات على الفاتح. الوثائق المولّدة (ورقة A4 للمذكرة عبر `.memo-sheet`/`.memo-print-portal`، معاينة التعليم الصريح `.print-sheet`، الورقة المصغّرة `.memo-art-sheet`) مثبتة فاتحة في الشاشة والطباعة عبر إعادة تثبيت المتغيرات على عناصرها.

## قاعدة أساسية

**أي لون جديد يجب أن يكون متغيرًا.** لا تكتب hex/rgb مباشرة في CSS أو TSX. استعمل:
- للنصوص: `text-text` / `text-text-2` / `text-muted` / `text-primary-text` / `text-accent-text`.
- للخلفيات: `bg-background` / `bg-surface` / `bg-surface-2` / `bg-primary` / `bg-accent`.
- للنص فوق سطح ملون: `text-on-primary` (فوق primary) و`text-on-accent` (فوق الكهرماني) — لا `text-white`.
- الحدود: `border-border`. الظلال: `var(--shadow)`.

## فصل النص عن الخلفية

`--primary` للخلفيات والأزرار، `--primary-text` للنصوص والروابط (أفتح في الداكن). مثله `--accent` (خلفيات) مقابل `--accent-text` (نص). `--on-primary`/`--on-accent` قيم ثابتة للنص فوق تلك الأسطح.

## الاستثناءات الموثقة (ألوان حرفية مقبولة)

1. ألوان **الوثائق المولّدة**: قوالب الجدول (`timetable/defaults.ts` و`theme.ts`)، ألوان الطباعة (`PrintSheet.tsx`)، وقفات تدرج الترويسات — بيانات المنتج المطبوع وليست واجهة.
2. **شفافيات بيضاء/سوداء rgba** على أسطح ثابتة الألون (ترويسات كحلية، شارات ذهبية/تركوازية، ظلال) — تظهر بلا ضرر بالوضعين.
3. **الفوتر** (`bg-[#123b5d]`) و**ShareButtons** (ألوان العلامات التجارية) — أسطح علامة ثابتة.
4. عناصر محقونة من **سكربتات طرف ثالث** (إعلانات/أزرار consent) خارج شيفرتنا.

## أدوات الجرد

`scripts/audit-memo-colors.py` (report/unmapped/apply/leftovers/context) + مخرجاتها `scripts/audit-memo-colors.md` و`audit-memo-exceptions.md` — تُستخدم لأي تعديل ألوان قادم على memo.css.
