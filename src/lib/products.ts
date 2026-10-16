/* =========================================================
   المنتجات الرقمية — Modaris Pro
   ---------------------------------------------------------
   مصدر واحد لكل منتج. كل الأرقام مأخوذة من الملفّات النهائية
   الفعلية (الإصدار 2.0.1)، لا من نيّة.

   الدفع: لم يُجهَّز بعد. أبقِ purchase.enabled = false حتى
   يتوفّر نظام دفع حقيقي، ثم ضع رابط الدفع في checkoutUrl.
   الصور موجودة في public/huroofi/.
   ========================================================= */

export interface ProductDoc {
  file: string;
  title: string;
  detail: string;
  pages: number;
}

export interface ProductImage {
  src: string;
  width: number;
  height: number;
  caption: string;
}

export const HUROOFI = {
  slug: "huroofi",
  name: "حروفي",
  latinName: "My Arabic Letters",
  version: "2.0.1",
  tagline: "حزمة ملفّات PDF جاهزة للطباعة لتعلّم الحروف العربية",
  ageLabel: "من ٣ إلى ٧ سنوات",
  /** الاستعمال: الروض، المستوى الأول، ودعم المنزل */
  audience: "الروض والمستوى الأول + دعم في المنزل",
  pagesPerSize: 102,
  sizes: ["A4", "US Letter"],

  /* وصف صادق: ما هو وما ليس هو */
  summary:
    "حزمة ملفّات PDF جاهزة للطباعة: بوسترات الحروف، أوراق عمل متدرّجة، بطاقات، ألعاب تعليمية " +
    "بمفاتيح إجابات، لوحة مكافآت وشهادة، ودليل للمعلّم والوالد. تُطبع في القسم أو البيت وتُستعمل مباشرة، " +
    "بمقاسَي A4 و US Letter.",
  notAnApp:
    "تنبيه صريح: هذا المنتج ملفّات PDF للطباعة وليس تطبيقًا تفاعليًّا، ولا يحتوي صوتًا أو نطقًا " +
    "تلقائيًّا أو تصحيحًا آليًّا. النطق السليم يبقى من المعلّم.",
  teacherNote:
    "مصمَّم ليكون جاهزًا للحصة: كل حرف في صفحة واحدة واضحة، وترقيم ثابت للملفّات، وأوراق بلا حبر زائد " +
    "لتوفير الطباعة. يمكن طبع الصفحات المطلوبة فقط حسب الحرف الذي تدرّسه.",

  /* السعر المقترح (قابل للتعديل من هنا فقط) */
  price: {
    mad: 79,
    eur: 8,
    note: "سعر مقترح لمرة واحدة لكل الحزمة — بلا اشتراك.",
  },

  contents: [
    { file: "01-start-here.pdf", title: "ابدأ من هنا", detail: "صفحة تعريف سريعة", pages: 1 },
    { file: "02-posters.pdf", title: "بوسترات الحروف", detail: "٢٨ بوسترًا: الشكل + الكلمة + رسم أصلي", pages: 28 },
    { file: "03-worksheets.pdf", title: "أوراق العمل", detail: "٢٨ ورقة بخمس مراحل: أعرّف ← ألوّن ← أتتبّع ← أكتب ← أستعمل", pages: 28 },
    { file: "04-flashcards-fronts.pdf", title: "البطاقات — أوجه أمامية", detail: "٢٨ بطاقة (٤ صفحات)", pages: 4 },
    { file: "05-flashcards-backs.pdf", title: "البطاقات — أوجه خلفية", detail: "٢٨ وجهًا خلفيًّا (٤ صفحات)", pages: 4 },
    { file: "06-games.pdf", title: "الألعاب + مفاتيح الإجابات", detail: "٦ لوحات بِنغو، ٤ أوراق «صِل الحرف بالكلمة»، ٢٨ نشاط «ابحث عن الحرف»", pages: 30 },
    { file: "07-reward-chart.pdf", title: "لوحة المكافآت والشهادة", detail: "لوحة «حديقتي» بـ٢٨ زهرة + شهادة", pages: 2 },
    { file: "08-extra-alif-hamza.pdf", title: "ملحق الألف والهمزة", detail: "صفحتان إضافيتان", pages: 2 },
    { file: "09-guide.pdf", title: "دليل المعلّم والوالد", detail: "كيف تستعمل كل جزء داخل الحصة", pages: 3 },
  ] as ProductDoc[],

  hero: { src: "/huroofi/huroofi-hero.png", width: 1200, height: 675 },
  sizesImage: { src: "/huroofi/huroofi-sizes.png", width: 1200, height: 675 },
  ogImage: "/huroofi/huroofi-og.png",

  gallery: [
    { src: "/huroofi/huroofi-whats-inside.png", width: 1200, height: 1200, caption: "نظرة عامة على ما داخل الحزمة" },
    { src: "/huroofi/02-posters__p1.png", width: 700, height: 1021, caption: "بوستر حرف (نموذج حقيقي)" },
    { src: "/huroofi/03-worksheets__p1.png", width: 700, height: 1021, caption: "ورقة عمل بخمس مراحل" },
    { src: "/huroofi/04-flashcards-fronts__p1.png", width: 700, height: 1021, caption: "أوجه البطاقات الأمامية" },
    { src: "/huroofi/06-games__p29.png", width: 700, height: 1021, caption: "مفتاح إجابات لعبة «ابحث عن الحرف»" },
    { src: "/huroofi/09-guide__p1.png", width: 700, height: 1021, caption: "من دليل المعلّم والوالد" },
  ] as ProductImage[],

  license:
    "استخدام داخل القسم أو الاستعمال الشخصي/الأُسَري. يُمنع إعادة البيع أو إعادة النشر أو التوزيع " +
    "الرقمي للملفّات. الرسوم والأيقونات أصلية، والخطوط مضمّنة برخصة SIL Open Font License.",

  delivery: [
    "بعد إتمام الدفع يُعطى رابط تنزيل مباشر للحزمة (ZIP).",
    "الحزمة تضمّ مقاسَي A4 و US Letter مع دليل البداية والترخيص.",
    "الملفّات تعمل دون إنترنت بعد تنزيلها، ويمكن طبعها أكثر من مرة لقسمك.",
  ],

  /* حالة الشراء — لا تُفعّلها قبل توفّر بوابة دفع حقيقية */
  purchase: {
    enabled: false,
    checkoutUrl: "",
    providerLabel: "",
  },

  faq: [
    { q: "هل هذا تطبيق أو أداة تفاعلية؟", a: "لا. المنتج ملفّات PDF جاهزة للطباعة بمقاسَي A4 و US Letter، تُفتح في أي قارئ PDF." },
    { q: "هل يحتوي أصواتًا أو نطقًا للحروف؟", a: "لا يحتوي صوتًا ولا نطقًا تلقائيًّا. النطق السليم يبقى من المعلّم." },
    { q: "هل يمكنني طبع الصفحات التي أحتاجها فقط؟", a: "نعم. كل حرف في صفحة واحدة، فيمكنك طبع الحرف الذي تدرّسه دون بقية الملفّ." },
    { q: "هل يمكنني استعماله مع عدّة أقسام؟", a: "الترخيص يشمل قسمًا واحدًا أو الاستعمال الأُسَري. للأقسام المتعدّدة تواصل معنا لتسوية ذلك." },
    { q: "هل يحتاج إنترنت؟", a: "لا. بعد تنزيل الملفّات تُطبع وتُستعمل دون إنترنت." },
  ],
};

export const HUROOFI_TOTAL_PAGES = HUROOFI.contents.reduce((sum, doc) => sum + doc.pages, 0);

/** قائمة المنتجات المعروضة في صفحة /products */
export const PRODUCTS = [HUROOFI];
