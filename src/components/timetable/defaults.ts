/* ============================================================
   القيم الافتراضية — مواد، أيام، قوالب، فترات
   ============================================================ */
import type {
  DayDef,
  DayId,
  Design,
  Info,
  Period,
  Subject,
  Template,
  TimetableState,
  Timing,
} from "./types";

export const DAYS: DayDef[] = [
  { id: "mon", name: "الإثنين" },
  { id: "tue", name: "الثلاثاء" },
  { id: "wed", name: "الأربعاء" },
  { id: "thu", name: "الخميس" },
  { id: "fri", name: "الجمعة" },
  { id: "sat", name: "السبت" },
];

export const DAY_BY_ID: Record<DayId, string> = DAYS.reduce(
  (acc, d) => ({ ...acc, [d.id]: d.name }),
  {} as Record<DayId, string>
);

/** المواد الافتراضية مع ألوان مميّزة */
export const DEFAULT_SUBJECTS: Subject[] = [
  { id: "ar", name: "اللغة العربية", color: "#B91C1C" },
  { id: "fr", name: "اللغة الفرنسية", color: "#1D4ED8" },
  { id: "math", name: "الرياضيات", color: "#047857" },
  { id: "sci", name: "النشاط العلمي", color: "#7C3AED" },
  { id: "isl", name: "التربية الإسلامية", color: "#0F766E" },
  { id: "soc", name: "الاجتماعيات", color: "#B45309" },
  { id: "sport", name: "التربية البدنية", color: "#DB2777" },
  { id: "amz", name: "اللغة الأمازيغية", color: "#4338CA" },
  { id: "art", name: "التربية الفنية", color: "#0891B2" },
];

export const SUBJECT_BY_ID = DEFAULT_SUBJECTS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<string, Subject>
);

/* ============================ القوالب البصرية ============================ */

export const TEMPLATES: Template[] = [
  {
    id: "classic",
    name: "تربوي كلاسيكي",
    desc: "منظّم ورسمي، رؤوس داكنة وجدول واضح — مناسب للوثائق الإدارية.",
    headerBg: "#123B5D",
    headerText: "#FFFFFF",
    headingColor: "#123B5D",
    pageBg: "#FFFFFF",
    cellBorder: "#94A3B8",
    cellText: "#172033",
    zebraBg: "#F1F5F9",
    fontId: "tajawal",
    headerShape: "flat",
    cellFill: "subject",
    radius: 0,
    swatch: ["#123B5D", "#B91C1C", "#047857"],
  },
  {
    id: "modern",
    name: "عصري هادئ",
    desc: "ألوان هادئة وحوافّ دائرية، مظهر أنيق وراقٍ.",
    headerBg: "#0F766E",
    headerText: "#FFFFFF",
    headingColor: "#0F172A",
    pageBg: "#FFFFFF",
    cellBorder: "#CBD5E1",
    cellText: "#0F172A",
    zebraBg: "#F8FAFC",
    fontId: "cairo",
    headerShape: "rounded",
    cellFill: "soft",
    radius: 10,
    swatch: ["#0F766E", "#14B8A6", "#0EA5E9"],
  },
  {
    id: "pastel",
    name: "باستيل أنيق",
    desc: "ألوان باستيلية ناعمة، لطيف ومريح للعين.",
    headerBg: "#99C7BB",
    headerText: "#14342C",
    headingColor: "#14342C",
    pageBg: "#FBFDFC",
    cellBorder: "#D7E3DE",
    cellText: "#1F2937",
    zebraBg: "#F4F9F7",
    fontId: "elmessiri",
    headerShape: "pill",
    cellFill: "soft",
    radius: 12,
    swatch: ["#99C7BB", "#F3C4D0", "#F6D9A0"],
  },
  {
    id: "mono",
    name: "أبيض وأسود",
    desc: "اقتصادي للطباعة، بلا ألوان، تباين عالٍ.",
    headerBg: "#111827",
    headerText: "#FFFFFF",
    headingColor: "#000000",
    pageBg: "#FFFFFF",
    cellBorder: "#111827",
    cellText: "#000000",
    zebraBg: "#F3F4F6",
    fontId: "almarai",
    headerShape: "flat",
    cellFill: "none",
    radius: 0,
    swatch: ["#111827", "#6B7280", "#E5E7EB"],
  },
  {
    id: "vivid",
    name: "ملوّن وواضح",
    desc: "ألوان قويّة وواضحة، مناسب للعرض داخل القسم.",
    headerBg: "#7C2D12",
    headerText: "#FFFFFF",
    headingColor: "#7C2D12",
    pageBg: "#FFFFFF",
    cellBorder: "#F3D5C0",
    cellText: "#172033",
    zebraBg: "#FFF7ED",
    fontId: "reemkufi",
    headerShape: "rounded",
    cellFill: "subject",
    radius: 8,
    swatch: ["#7C2D12", "#EA580C", "#CA8A04"],
  },
];

export const TEMPLATE_BY_ID: Record<string, Template> = TEMPLATES.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<string, Template>
);

/* ============================ الخطوط ============================ */

export interface FontDef {
  id: string;
  name: string;
  css: string;
}

export const FONTS: FontDef[] = [
  { id: "tajawal", name: "طجوال (Tajawal)", css: "'Tajawal', sans-serif" },
  { id: "cairo", name: "القاهرة (Cairo)", css: "'Cairo', sans-serif" },
  { id: "almarai", name: "المراعي (Almarai)", css: "'Almarai', sans-serif" },
  { id: "elmessiri", name: "المصيري (El Messiri)", css: "'El Messiri', sans-serif" },
  { id: "amiri", name: "أميري (Amiri)", css: "'Amiri', serif" },
  { id: "reemkufi", name: "ريم كوفي", css: "'Reem Kufi', sans-serif" },
  { id: "notokufi", name: "كوفي نوتو", css: "'Noto Kufi Arabic', sans-serif" },
];

export const FONT_BY_ID: Record<string, FontDef> = FONTS.reduce(
  (acc, f) => ({ ...acc, [f.id]: f }),
  {} as Record<string, FontDef>
);

/* ============================ الفترات الافتراضية ============================ */

export function uid(prefix = "p"): string {
  return (
    prefix +
    "_" +
    Math.random().toString(36).slice(2, 8) +
    Date.now().toString(36).slice(-4)
  );
}

/**
 * فترات افتراضية يسهل تعديلها بالكامل (قابلة للحذف).
 * تُستعمل كنقطة انطلاق لأي يوم يُبرمجه الأستاذ — ويمكن حذفها كليًا.
 */
export function defaultPeriods(): Period[] {
  return [
    { id: uid(), start: "08:00", end: "09:00", label: "", isBreak: false, subjectId: null },
    { id: uid(), start: "09:00", end: "10:00", label: "", isBreak: false, subjectId: null },
    { id: uid(), start: "10:00", end: "10:15", label: "استراحة", isBreak: true, subjectId: null },
    { id: uid(), start: "10:15", end: "11:15", label: "", isBreak: false, subjectId: null },
    { id: uid(), start: "11:15", end: "12:15", label: "", isBreak: false, subjectId: null },
  ];
}

/** نفس التوقيت لكن بمواد فارغة — لنسخ توقيت يوم إلى يوم آخر */
export function emptyPeriods(template: Period[]): Period[] {
  return template.map((p) => ({
    ...p,
    id: uid(),
    subjectId: null,
  }));
}

export const LEVEL_SUGGESTIONS = [
  "المستوى الأول",
  "المستوى الثاني",
  "المستوى الثالث",
  "المستوى الرابع",
  "المستوى الخامس",
  "المستوى السادس",
];

export const GROUP_SUGGESTIONS = ["أ", "ب", "ج", "د", "هـ", "و"];

/* ===================== رقم المستوى (لمطابقة التوزيعات) ===================== */

/** المدى المسموح لرقم المستوى في توزيعات التعليم الصريح. */
export const LEVEL_NUMBER_MIN = 1;
export const LEVEL_NUMBER_MAX = 6;

/** هل القيمة رقم مستوى صحيح ضمن المدى المسموح؟ */
export function isValidLevelNumber(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= LEVEL_NUMBER_MIN &&
    value <= LEVEL_NUMBER_MAX
  );
}

/** كلمات الترتيب العربية لكل مستوى، بالترتيب: الأول = 1 … السادس = 6. */
const ORDINAL_WORDS = [
  "الأول",
  "الأولى",
  "الثاني",
  "الثانية",
  "الثالث",
  "الثالثة",
  "الرابع",
  "الرابعة",
  "الخامس",
  "الخامسة",
  "السادس",
  "السادسة",
] as const;

const ORDINAL_VALUE: Record<string, number> = Object.fromEntries(
  ORDINAL_WORDS.map((word, index) => [word, Math.floor(index / 2) + 1])
);

/** الأرقام الهندية المستعملة في الأسماء، مرتّبة للاستبدال بمقابلها اللاتيني. */
const ARABIC_INDIC_DIGITS = /[\u0660-\u0669]/g;
const EASTERN_ARABIC_INDIC_DIGITS = /[\u06F0-\u06F9]/g;

function toLatinDigits(text: string): string {
  return text
    .replace(ARABIC_INDIC_DIGITS, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(EASTERN_ARABIC_INDIC_DIGITS, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * نمط كلمات المستوى المدعومة كاملةً بحدّي كلمة (بداية ونهاية):
 * المستوى، مستوى، مستواي — مع أداة التعريف الاختيارية.
 * الحدّ بعد الكلمة يمنع اعتبار مشتقات «مستو» مثل «مستودع الرابع»
 * أو «المستودعات» أسماء مستويات.
 * وجود كلمة المستوى شرط لاعتبار الاسم مستوى دراسيًا — كلمة الترتيب أو
 * الرقم وحده لا يكفي، وإلا حُسب «الفوج الأول» و«القسم الثاني» مستويين،
 * و«قاعة 5» مستوى خامسًا.
 */
const LEVEL_WORD_PATTERN =
  /(?:^|[^\p{L}\p{N}])(?:ال)?(?:مستوى|مستواي)(?=$|[^\p{L}\p{N}])/u;

/**
 * يستخرج رقم المستوى (1–6) من اسم حر، بحدود دقيقة تمنع التقاط رقم عرضي:
 * 1) مطابقة حرفية لاقتراحات المستويات («المستوى الرابع» → 4).
 * 2) بشرط احتواء الاسم على كلمة «مستوى»: كلمة ترتيب معزولة
 *    («مستواي الرابع» → 4) — لا تطابق داخل كلمة أطول.
 * 3) بشرط الاحتواء نفسه: رقم معزول 1–6 («مستوى 4»، «المستوى ٤») —
 *    لا يلتقط أرقامًا أطول أو ملتصقة بأحرف.
 * أسماء الأفواج والأسماء الحرة («الفوج الأول»، «القسم الثاني»، «قاعة 5»)
 * تبقى بلا رقم — الاسم يبقى حرًّا دون ربط بتوزيع.
 */
export function parseLevelNumber(name: string): number | undefined {
  const text = (name ?? "").trim();
  if (!text) return undefined;

  /* 1) مطابقة حرفية للاقتراحات القياسية */
  const exactIndex = LEVEL_SUGGESTIONS.indexOf(text);
  if (exactIndex >= 0) return exactIndex + 1;

  /* ليس مستوى دراسيًا إلا بوجود كلمة «مستوى» في الاسم */
  if (!LEVEL_WORD_PATTERN.test(text)) return undefined;

  /* 2) كلمة ترتيب معزولة (حدود كلمات: بداية/نهاية النص أو حرف غير حرفي/رقمي) */
  for (const word of ORDINAL_WORDS) {
    const pattern = new RegExp(
      `(^|[^\\p{L}\\p{N}])${word}($|[^\\p{L}\\p{N}])`,
      "u"
    );
    if (pattern.test(text)) return ORDINAL_VALUE[word];
  }

  /* 3) رقم معزول 1–6: يتطلب فصلًا عن الأحرف لتجنب أسماء مثل «م4ت» أو «السنة2025» */
  const latin = toLatinDigits(text);
  const numberPattern = /(?:^|[\s\-\u0640_\/()])0*([1-6])(?:$|[\s\-\u0640_\/()])/;
  const match = numberPattern.exec(latin);
  if (match) return Number(match[1]);

  return undefined;
}

export const DEFAULT_INFO: Info = {
  academy: "",
  direction: "",
  school: "",
  year: "2026/2027",
  teacher: "",
  levels: [],
  employeeId: "",
  docTitle: "استعمال الزمن الأسبوعي – فترة التعليم الصريح",
};

/** التوقيت الافتراضي: صباحية 08:00–12:40 ثم مسائية 12:45–17:25 */
export const DEFAULT_TIMING: Timing = {
  morningStart: "08:00",
  morningEnd: "12:40",
  afternoonStart: "12:45",
  afternoonEnd: "17:25",
};

export const DEFAULT_DESIGN: Design = {
  templateId: "classic",
  fontId: "tajawal",
  fontScale: 1,
  subjectFontScale: 1,
  metaFontScale: 1,
  timeFontScale: 1,
  headerShape: "flat",
  periodDisplay: "range",
  showBreaks: true,
  showTotals: false,
  showSign: true,
  showFooter: true,
  showSubjectNames: true,
  showDuration: true,
  showLevelGroup: true,
  showLogo: true,
  logoDataUrl: undefined,
  feminine: true,
  signLabels: {},
};

/** جدول فارغ لكل الأيام — الأستاذ يبرمج كل يوم بنفسه */
export function emptyPlans(): Record<string, Period[]> {
  return { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] };
}

export function makeInitialState(): TimetableState {
  return {
    info: { ...DEFAULT_INFO },
    days: ["mon", "tue", "wed", "thu", "fri"],
    plans: emptyPlans(),
    timing: { ...DEFAULT_TIMING },
    subjects: DEFAULT_SUBJECTS.map((s) => ({ ...s })),
    design: { ...DEFAULT_DESIGN },
    orientation: "landscape",
  };
}
