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

export const DEFAULT_DESIGN: Design = {
  templateId: "classic",
  fontId: "tajawal",
  headerShape: "flat",
  periodDisplay: "range",
  showBreaks: true,
  showTotals: false,
  showSign: true,
  showFooter: true,
  showSubjectNames: true,
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
    subjects: DEFAULT_SUBJECTS.map((s) => ({ ...s })),
    design: { ...DEFAULT_DESIGN },
    orientation: "landscape",
  };
}
