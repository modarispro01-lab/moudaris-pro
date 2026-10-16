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

/** فترة زمنية (حصة أو استراحة) — التوقيت بصيغة 24 ساعة "HH:MM" */
export interface Period {
  id: string;
  start: string;
  end: string;
  label: string;
  isBreak: boolean;
}

/** تخصيص توقيت مادة في يوم محدّد (يتجاوز توقيت الفترة المشترك) */
export interface CellOverride {
  start?: string;
  end?: string;
}

export interface CellEntry {
  subjectId: SubjectId | null;
  override?: CellOverride;
  note?: string;
}

/** الشبكة: [dayId][periodId] = خلية */
export type Grid = Record<string, Record<string, CellEntry | undefined>>;

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
  days: DayId[];
  periods: Period[];
  grid: Grid;
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
