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
 * توقيت المؤسسة: يحدّد الفترتين الصباحية والمسائية.
 * تُعرض الفترتان دائمًا في الجدول، حتى إن كانت إحداهما فارغة.
 */
export interface Timing {
  /** بداية الفترة الصباحية "HH:MM" */
  morningStart: string;
  /** نهاية الفترة الصباحية "HH:MM" */
  morningEnd: string;
  /** بداية الفترة المسائية "HH:MM" */
  afternoonStart: string;
  /** نهاية الفترة المسائية "HH:MM" */
  afternoonEnd: string;
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
  /** معرّف المستوى الدراسي لهذه الحصة (اختياري) */
  levelId?: string;
  /** اسم الفوج داخل المستوى (اختياري) */
  group?: string;
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
  /**
   * رقم المستوى (1–6) لمطابقة توزيعات التعليم الصريح.
   * يُشتق تلقائيًا من الاسم عند الترحيل (normalizeInfo) ولا يُدخل يدويًا؛
   * undefined = اسم حر لم يُتعرف عليه (لا يُربط بتوزيع).
   */
  levelNumber?: number;
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
  /** معامل حجم خط الجدول (0.8 = 80%، 1 = 100%، 1.1 = 110%) */
  fontScale?: number;
  /** حجم خط اسم المادة (0.8–1.5) */
  subjectFontScale?: number;
  /** حجم خط المستوى والفوج (0.8–1.5) */
  metaFontScale?: number;
  /** حجم خط التوقيت (0.8–1.5) */
  timeFontScale?: number;
  headerShape: HeaderShape;
  periodDisplay: PeriodDisplay;
  cellFill?: CellFill;
  showBreaks: boolean;
  showTotals: boolean;
  showSign: boolean;
  showFooter: boolean;
  /** إظهار اسم المادة داخل الخلية (لتجنّب الاعتماد على اللون وحده) */
  showSubjectNames: boolean;
  /** إظهار مدّة الحصة بجانب اسمها داخل الخلية */
  showDuration: boolean;
  /** إظهار المستوى والفوج تحت اسم المادة داخل الخلية */
  showLevelGroup?: boolean;
  /** إظهار الشعار أعلى الوسط */
  showLogo: boolean;
  /** الشعار المرفوع (data URL) — اختياري */
  logoDataUrl?: string;
  /** صيغة المفردات: true = مؤنّث «الأستاذ(ة)»، false = مذكر «الأستاذ» */
  feminine: boolean;
  /** نصوص التوقيعات المخصّصة (تُترك فارغة لاستعمال الافتراضي) */
  signLabels?: {
    teacher?: string;
    inspector?: string;
    manager?: string;
  };
}

export type Orientation = "landscape" | "portrait";

export interface TimetableState {
  info: Info;
  /** أيام العمل مرتّبة */
  days: DayId[];
  /** جدول كل يوم على حدة: DayId -> فتراته */
  plans: Record<string, Period[]>;
  /** توقيت المؤسسة: الفترة الصباحية والمسائية */
  timing: Timing;
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