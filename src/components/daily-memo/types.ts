/* ============================================================
   أنواع بيانات أداة المذكرة اليومية — التعليم الصريح
   ============================================================ */

export type MemoBlock = "morning" | "afternoon";

export type FieldType = "text" | "textarea" | "date" | "time" | "number" | "select";

export type FieldScope = "document" | "header" | "lesson" | "footer";

export type FieldWidth = "full" | "half" | "third";

export interface TemplateField {
  key: string;
  label_ar: string;
  label_fr: string;
  order: number;
  type: FieldType;
  scope: FieldScope;
  placeholder_ar?: string;
  required?: boolean;
  width?: FieldWidth;
}

export interface TemplateBlock {
  key: MemoBlock;
  label_ar: string;
  label_fr: string;
  order: number;
}

export interface TableColumn {
  key: string;
  label_ar: string;
  label_fr: string;
  width: string;
  kind: "timeRange" | "text" | "duration" | "content";
}

export interface TemplateSignature {
  key: "teacher" | "director" | "inspector";
  label_ar: string;
  label_fr: string;
}

export interface TemplateConfig {
  id: string;
  title_ar: string;
  title_fr: string;
  subtitle_ar?: string;
  subjectCode: string;
  subject_ar: string;
  version: string;
  fields: TemplateField[];
  blocks: TemplateBlock[];
  tableColumns: TableColumn[];
  signatures: TemplateSignature[];
  source?: { template?: string; note?: string };
}

export interface AppConfig {
  appTitle_ar?: string;
  appTitle_fr?: string;
  defaultSubjectCode?: string;
  autoDiscoverLevels?: boolean;
  dataRoot?: string;
  templatePath?: string;
  storage?: {
    profileKey?: string;
    draftsKey?: string;
    preferencesKey?: string;
  };
  /**
   * مواد تُدرَّس دون توزيع دروس (مثل الأمازيغية): تظهر في قائمة مادة الحصة،
   * وتُترك حقول الموضوع والأهداف والمراحل فارغة ليكتبها الأستاذ(ة).
   */
  extraSubjects?: Array<{
    code: string;
    name_ar: string;
    name_fr?: string;
  }>;
  weekDays?: Array<{ key: string; label_ar: string; label_fr: string }>;
  sourceFiles?: string[];
  notes?: string[];
}

export type LessonKind =
  | "lesson"
  | "weekly-review"
  | "stage-review"
  | "stage-evaluation"
  | "general-review"
  | "empty";

export interface LevelDay {
  dayKey: string;
  label_ar: string;
  label_fr: string;
  lessonNumber?: number | null;
  kind: LessonKind;
  /** المكون المقترح لهذه الحصة (محور المادة)، ويبقى قابلًا للتغيير في المحرر. */
  component?: string;
  content: {
    topic_ar: string;
    topic_fr?: string;
  };
}

export interface LevelWeek {
  weekNumber: number;
  title_ar: string;
  title_fr: string;
  days: LevelDay[];
}

export interface LevelStage {
  id: string;
  number: number;
  title_ar: string;
  title_fr: string;
  /** محور المرحلة في المواد التي تعتمد مكونات متعددة (مثل النشاط العلمي). */
  theme_ar?: string;
  theme_fr?: string;
  weeks: LevelWeek[];
}

export interface LevelData {
  subject?: string;
  subject_ar?: string;
  subjectCode: string;
  level: number;
  levelLabel_ar: string;
  levelLabel_fr: string;
  /** عدد الحصص الأسبوعية المتاحة في هذه المادة (افتراضيًا 5). */
  sessionCount?: number;
  source?: string;
  source_note?: string;
  dayPlanNote?: string;
  stages: LevelStage[];
}

export interface SubjectGroup {
  code: string;
  name_ar: string;
  levels: LevelData[];
}

export interface Catalog {
  template: TemplateConfig;
  config: AppConfig;
  subjects: SubjectGroup[];
}

/* ============================================================
   حالة المذكرة
   ============================================================ */

export interface MemoLesson {
  id: string;
  block: MemoBlock;
  timeFrom: string;
  timeTo: string;
  section: string;
  /** مادة الحصة: يمكن أن تختلف من حصة إلى أخرى داخل المذكرة نفسها. */
  subjectCode?: string;
  component: string;
  topic: string;
  objectives: string;
  stages: string;
  session: string;
  rj: string;
  sourceLessonNumber?: number | null;
  sourceDayKey?: string;
  kind?: LessonKind;
  /** مدة الاستراحة بالدقائق بعد هذه الحصة؛ 0 أو غير موجودة = بدون استراحة. */
  breakMinutes?: number;
  /** رقم المستوى عند دمج أكثر من مستوى في المذكرة نفسها. */
  levelNumber?: number;
  /** اسم المستوى كما يظهر في خانة المستوى/الفوج بالورقة. */
  levelLabel?: string;
  /** الفوج داخل المستوى، مثل: الفوج الأول. */
  groupLabel?: string;
  /** الحصة الأسبوعية المختارة من 1 إلى 5 التي تنتمي إليها هذه الحصة. */
  sessionNumber?: number;
}

/** خيارات المادة المتاحة داخل بطاقة الحصة. */
export interface LessonSubjectLevel {
  level: number;
  label: string;
  /** مكونات التوزيع الخاصة بالمستوى (تكون فارغة في المواد ذات الحقل الحر). */
  componentOptions: string[];
}

export interface LessonSubjectOption {
  code: string;
  name: string;
  /** هل تعتمد المادة مكونات محاور تُختار من قائمة؟ */
  structuredComponents: boolean;
  levels: LessonSubjectLevel[];
}

export interface MemoState {
  institution: string;
  teacher: string;
  director: string;
  inspector: string;
  academicYear: string;
  level: string;
  stage: string;
  subject: string;
  date: string;
  unit: string;
  week: string;
  day: string;
  section: string;
  notes: string;
  period: MemoBlock;
  showNotes: boolean;
  showSignatures: boolean;
  /** صف الخروج أسفل جدول الحصص؛ يُفعّل تلقائيًا عند دمج المستويات. */
  showDismissal?: boolean;
  /** الحصة الأسبوعية المختارة من 1 إلى 5 (مستقلة عن اليوم). */
  sessionNumber?: number;
  lessons: MemoLesson[];
}

export interface Profile {
  institution: string;
  teacher: string;
  director: string;
  inspector: string;
  academicYear: string;
  section: string;
}

export interface Preferences {
  showNotes: boolean;
  showSignatures: boolean;
  period?: MemoBlock;
  levels?: number[];
  activeLevel?: number;
  /** الأفواج المختارة لكل مستوى مدرّس. */
  groupsByLevel?: Record<number, string[]>;
  subjectCode?: string;
  stageId?: string;
  weekNumber?: number;
  dayKey?: string;
  sessionNumber?: number;
}

export interface MemoSelection {
  subjectCode: string;
  levels: number[];
  level: number;
  /** الأفواج المختارة لكل مستوى: مفتاح الخريطة هو رقم المستوى. */
  groupsByLevel: Record<number, string[]>;
  period: MemoBlock;
  stageId: string;
  weekNumber: number;
  /** اليوم الفعلي الذي ستُنجز فيه الحصة؛ لا يحدد موضوعها. */
  dayKey: string;
  /** الحصة الأسبوعية المختارة من 1 إلى 5 حسب استعمال الزمن. */
  sessionNumber: number;
}

/* ============================================================
   دوال مساعدة
   ============================================================ */

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function fieldByKey(
  template: TemplateConfig,
  key: string
): TemplateField | undefined {
  return template.fields.find((field) => field.key === key);
}

export function fieldLabel(
  template: TemplateConfig,
  key: string,
  fallback = key
): string {
  return fieldByKey(template, key)?.label_ar || fallback;
}

export function sortedFields(
  template: TemplateConfig,
  scope: FieldScope
): TemplateField[] {
  return template.fields
    .filter((field) => field.scope === scope)
    .slice()
    .sort((a, b) => a.order - b.order);
}

export function timeToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function minutesToTime(total: number): string {
  const safe = Math.max(0, Math.min(23 * 60 + 59, Math.round(total)));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(
    safe % 60
  ).padStart(2, "0")}`;
}

export function timesToMinutes(from: string, to: string): number | null {
  const start = timeToMinutes(from);
  const end = timeToMinutes(to);
  if (start == null || end == null || end <= start) return null;
  return end - start;
}

export function formatDuration(minutes: number | null): string {
  if (!minutes || minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} د`;
  if (!rest) return `${hours} س`;
  return `${hours} س ${rest} د`;
}

export function durationLabel(from: string, to: string): string {
  return formatDuration(timesToMinutes(from, to));
}

/** مدة الاستراحة بعد الحصة، مع تجاهل القيم غير الصالحة. */
export function lessonBreakMinutes(lesson: MemoLesson): number {
  const value = Number(lesson.breakMinutes ?? 0);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(180, Math.round(value));
}

export function breaksCountLabel(count: number): string {
  if (count === 1) return "استراحة واحدة";
  if (count === 2) return "استراحتان";
  if (count >= 3 && count <= 10) return `${count} استراحات`;
  return `${count} استراحة`;
}

export function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatLongDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat("ar-MA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return iso;
  }
}

/** أفواج التناوب الافتراضية عند تدريس مستوى واحد أو عدة مستويات. */
export const DEFAULT_GROUP_LABELS = ["الفوج الأول", "الفوج الثاني"] as const;

/** ينظّف أسماء الأفواج ويحذف الفراغات والتكرار مع الحفاظ على ترتيب الاختيار. */
export function normalizeGroupLabels(value: unknown): string[] {
  const list = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const labels: string[] = [];
  for (const item of list) {
    const label = String(item ?? "").trim();
    if (label && !labels.includes(label)) labels.push(label);
  }
  return labels;
}

/** ترتيب ثابت يطابق عرض الأفواج: الفوجان الافتراضيان ثم الأفواج المخصّصة. */
export function orderGroupLabels(labels: string[]): string[] {
  const defaults = DEFAULT_GROUP_LABELS.filter((label) =>
    labels.includes(label)
  );
  const extras = labels.filter(
    (label) => !DEFAULT_GROUP_LABELS.some((item) => item === label)
  );
  return [...defaults, ...extras];
}

/**
 * أفواج مستوى معيّن. عند غياب اختيار صريح نستعمل الفوجين معًا في المذكرة
 * المشتركة بين مستويات، والفوج الأول وحده في مذكرة مستوى واحد.
 */
export function groupsForLevel(
  selection: {
    levels?: number[];
    level?: number;
    groupsByLevel?: Record<number, string[]>;
  },
  levelNumber: number
): string[] {
  const labels = normalizeGroupLabels(selection.groupsByLevel?.[levelNumber]);
  if (labels.length) return orderGroupLabels(labels);
  const levels = selection.levels ?? [];
  return levels.length > 1
    ? [...DEFAULT_GROUP_LABELS]
    : [DEFAULT_GROUP_LABELS[0]];
}

/** قيم افتراضية لأفواج كل مستوى حسب عدد المستويات المختارة. */
export function defaultGroupsForLevels(
  levels: number[]
): Record<number, string[]> {
  const labels =
    levels.length > 1
      ? [...DEFAULT_GROUP_LABELS]
      : [DEFAULT_GROUP_LABELS[0]];
  return Object.fromEntries(levels.map((levelNumber) => [levelNumber, [...labels]]));
}

/** المفتاح القديم للمسودة قبل إضافة اختيار الأفواج (يبقى للتوافق). */
export function baseDraftKey(selection: MemoSelection): string {
  /* المستويات المختارة كلها جزء من المسودة نفسها. اليوم ليس جزءًا من
     المفتاح لأن الحصة هي التي تحدد المحتوى، أما اليوم فيحدد الترويسة فقط.
     عند مستوى واحد يبقى جزء المستويات بالصيغة القديمة نفسها. */
  const levels = selection.levels.length
    ? [...selection.levels].sort((a, b) => a - b).join("+")
    : String(selection.level);
  return [
    selection.subjectCode,
    levels,
    selection.period,
    selection.stageId,
    selection.weekNumber,
    `s${clampSessionNumber(selection.sessionNumber)}`,
  ].join(":");
}

export function draftKey(selection: MemoSelection): string {
  /* الأفواج تغيّر عدد الحصص ومحتواها، لذلك لكل تشكيلة أفواج مسودتها الخاصة. */
  const levels = selection.levels.length
    ? [...selection.levels].sort((a, b) => a - b)
    : [selection.level];
  const groups = levels.map((levelNumber) => [
    levelNumber,
    groupsForLevel(selection, levelNumber),
  ]);
  return `${baseDraftKey(selection)}:g:${encodeURIComponent(JSON.stringify(groups))}`;
}

/** مفتاح المسودات القديمة (قبل فصل الحصة عن اليوم) لاسترجاع عمل الأستاذ(ة). */
export function legacyDraftKey(selection: MemoSelection): string {
  const levels = selection.levels.length
    ? [...selection.levels].sort((a, b) => a - b).join("+")
    : String(selection.level);
  return [
    selection.subjectCode,
    levels,
    selection.period,
    selection.stageId,
    selection.weekNumber,
    selection.dayKey,
  ].join(":");
}

export function uid(prefix = "l"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function findLevel(
  catalog: Catalog,
  selection: Pick<MemoSelection, "subjectCode" | "level">
): LevelData | undefined {
  return catalog.subjects
    .find((subject) => subject.code === selection.subjectCode)
    ?.levels.find((level) => level.level === selection.level);
}

export function findStage(
  level: LevelData | undefined,
  stageId: string
): LevelStage | undefined {
  return level?.stages.find((stage) => stage.id === stageId) ?? level?.stages[0];
}

export function findWeek(
  stage: LevelStage | undefined,
  weekNumber: number
): LevelWeek | undefined {
  return (
    stage?.weeks.find((week) => week.weekNumber === weekNumber) ?? stage?.weeks[0]
  );
}

export function findDay(
  week: LevelWeek | undefined,
  dayKey: string
): LevelDay | undefined {
  return week?.days.find((day) => day.dayKey === dayKey) ?? week?.days[0];
}

/** الحصص الأسبوعية التي يختار منها الأستاذ(ة) حسب استعماله الزمني. */
export const SESSION_NUMBERS = [1, 2, 3, 4, 5] as const;

/** عدد الحصص المتاحة في المادة؛ المواد التي لا تحدد عددًا تبقى على 5 حصص. */
export function levelSessionCount(level: LevelData | undefined): number {
  const value = Number(level?.sessionCount);
  if (!Number.isFinite(value)) return SESSION_NUMBERS[SESSION_NUMBERS.length - 1];
  return Math.min(
    SESSION_NUMBERS[SESSION_NUMBERS.length - 1],
    Math.max(1, Math.round(value))
  );
}

export function sessionNumbersFor(level: LevelData | undefined): number[] {
  return SESSION_NUMBERS.slice(0, levelSessionCount(level));
}

export function clampSessionNumber(
  value: unknown,
  fallback: number = 1,
  max: number = SESSION_NUMBERS[SESSION_NUMBERS.length - 1]
): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const safeMax = Math.min(
    SESSION_NUMBERS[SESSION_NUMBERS.length - 1],
    Math.max(1, Math.round(max))
  );
  return Math.min(safeMax, Math.max(SESSION_NUMBERS[0], Math.round(numeric)));
}

export function sessionLabel(sessionNumber: number): string {
  return `الحصة ${clampSessionNumber(sessionNumber)}`;
}

/** أيام الأسبوع التي تحمل محتوى دراسيًا، باستثناء الأحد العطلة والأيام الفارغة. */
export function contentDays(week: LevelWeek | undefined): LevelDay[] {
  return (week?.days ?? []).filter(
    (day) =>
      day.dayKey !== "dimanche" &&
      day.kind !== "empty" &&
      !!day.content.topic_ar.trim()
  );
}

/**
 * مصدر محتوى الحصة الأسبوعية: الحصة 1 تأخذ أول درس في توزيع الأسبوع،
 * والحصة 5 تأخذ المراجعة الأسبوعية. اليوم الفعلي لا يتدخل في هذا الاختيار.
 * إذا كان الأسبوع لا يتضمن إلا حصة واحدة (مراجعة مرحلة مثلًا) تُستعمل
 * للحصص المتبقية نفس عبارة المراجعة حتى لا تبقى المذكرة فارغة.
 */
export function sessionSourceDay(
  week: LevelWeek | undefined,
  sessionNumber: number
): LevelDay | undefined {
  const days = contentDays(week);
  if (!days.length) return undefined;
  const index = Math.min(
    clampSessionNumber(sessionNumber) - 1,
    days.length - 1
  );
  return days[index];
}

/** قائمة الحصص المتاحة مع مصدر كل واحدة، لعرضها في خريطة الأسبوع. */
export function sessionSources(
  week: LevelWeek | undefined,
  sessionCount: number = SESSION_NUMBERS[SESSION_NUMBERS.length - 1]
): Array<{ sessionNumber: number; day: LevelDay; repeated: boolean }> {
  const days = contentDays(week);
  if (!days.length) return [];
  const max = Math.min(
    SESSION_NUMBERS[SESSION_NUMBERS.length - 1],
    Math.max(1, Math.round(sessionCount))
  );
  return SESSION_NUMBERS.slice(0, max).map((sessionNumber) => {
    const index = Math.min(sessionNumber - 1, days.length - 1);
    return {
      sessionNumber,
      day: days[index],
      repeated: sessionNumber > days.length,
    };
  });
}

/** رقم الحصة الأسبوعية المقابل ليوم معيّن، لترحيل المسودات القديمة. */
export function sessionNumberForDay(
  week: LevelWeek | undefined,
  dayKey: string
): number | null {
  const index = contentDays(week).findIndex((day) => day.dayKey === dayKey);
  return index >= 0 ? index + 1 : null;
}

export function periodLabel(
  template: TemplateConfig,
  period: MemoBlock
): string {
  return (
    template.blocks.find((block) => block.key === period)?.label_ar ||
    (period === "morning" ? "الفترة الصباحية" : "الفترة المسائية")
  );
}

export const KIND_LABELS: Record<LessonKind, string> = {
  lesson: "درس",
  "weekly-review": "مراجعة أسبوعية",
  "stage-review": "مراجعة المرحلة",
  "stage-evaluation": "تقويم المرحلة",
  "general-review": "مراجعة عامة",
  empty: "بدون درس",
};

/** صيغة عربية سليمة لعدد الحصص. */
export function lessonsCountLabel(count: number): string {
  if (count === 1) return "حصة واحدة";
  if (count === 2) return "حصتان";
  if (count >= 3 && count <= 10) return `${count} حصص`;
  return `${count} حصة`;
}
