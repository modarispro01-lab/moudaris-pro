/* ============================================================
   أنواع بيانات مولّد استعمال الزمن — التعليم الصريح
   ============================================================ */

/** معرّف مادة (نصّي لتسهيل التوسيع) */
export type SubjectId = string;

export interface Subject {
  id: SubjectId;
  name: string;
  color: string;
}

export type DayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export interface DayDef {
  id: DayId;
  name: string;
}

/**
 * فترة زمنية داخل يوم واحد فقط.
 *
 * كل يوم يملك فتراته المستقلة (توقيت + مادة)، لذلك لا تؤثر حصة
 * الاثنين في الثلاثاء. هذه هي الفكرة الأساسية للأداة.
 */
export interface Period {
  id: string;
  /** البداية "HH:MM" */
  start: string;
  /** النهاية "HH:MM" */
  end: string;
  /** تسمية اختيارية (تُستعمل تلقائيًا للاستراحات) */
  label: string;
  isBreak: boolean;
  /** المادة المبرمجة في هذه الفترة من يومها */
  subjectId: SubjectId | null;
  /** ملاحظة اختيارية */
  note?: string;
}

/** مستوى دراسي مع أفواجه — يختار الأستاذ مستوى أو أكثر، ولكل مستوى فوجًا أو أكثر */
export interface LevelEntry {
  id: string;
  /** اسم المستوى، مثال: "المستوى الرابع" */
  name: string;
  /** أسماء الأفواج، مثال: ["فوج أ", "فوج ب"] */
  groups: string[];
}

export interface Info {
  academy: string;
  direction: string;
  school: string;
  year: string;
  teacher: string;
  /** المستويات الدراسية وأفواجها (اختياري تمامًا) */
  levels: LevelEntry[];
  employeeId: string;
  docTitle: string;
}

export type HeaderShape = "flat" | "rounded" | "pill";
export type CellFill = "subject" | "soft" | "none";
export type PeriodDisplay = "range" | "start" | "range-duration" | "duration";

export interface Design {
  templateId: string;
  /** لون رئيسي مخصّص (يتجاوز القالب إن وُجد) */
  primary?: string;
  /** لون العناوين المخصّص */
  heading?: string;
  fontId: string;
  headerShape: HeaderShape;
  periodDisplay: PeriodDisplay;
  cellFill?: CellFill;
  showBreaks: boolean;
  showTotals: boolean;
  showSign: boolean;
  showFooter: boolean;
  /** إظهار اسم المادة داخل الخلية (لتجنّب الاعتماد على اللون وحده) */
  showSubjectNames: boolean;
}

export type Orientation = "landscape" | "portrait";

export interface TimetableState {
  info: Info;
  /** أيام العمل مرتّبة */
  days: DayId[];
  /** جدول كل يوم على حدة: DayId -> فتراته */
  plans: Record<string, Period[]>;
  subjects: Subject[];
  design: Design;
  orientation: Orientation;
}

/* ============================ القوالب ============================ */

export interface Template {
  id: string;
  name: string;
  desc: string;
  /** ألوان */
  headerBg: string;
  headerText: string;
  headingColor: string;
  pageBg: string;
  cellBorder: string;
  cellText: string;
  zebraBg: string;
  fontId: string;
  headerShape: HeaderShape;
  cellFill: CellFill;
  radius: number;
  /** لوحة صغيرة للمعاينة */
  swatch: string[];
}

/* ==================== سطر جدول موحّد (للطباعة) ==================== */

/**
 * سطر في جدول الطباعة = توقيت beginnings مشترك.
 * نجمع كل الفترات من كل الأيام، ونجمّعها حسب وقت البداية
 * حتى لو اختلف توقيت الأيام، فتبقى الوثيقة في جدول واحد مرتّب.
 */
export interface ScheduleRow {
  /** مفتاح السطر: وقت البداية */
  key: string;
  start: string;
  /** النهاية المعتمدة (الأكثر تكرارًا بين الأيام) */
  end: string;
  /** هل هو استراحة في كل الأيام؟ (عندئذٍ يشغل السطر كاملًا) */
  allBreak: boolean;
}