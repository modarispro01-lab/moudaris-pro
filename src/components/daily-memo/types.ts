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
  weekDays?: Array<{ key: string; label_ar: string; label_fr: string }>;
  sourceFiles?: string[];
  notes?: string[];
}

export type LessonKind =
  | "lesson"
  | "weekly-review"
  | "stage-review"
  | "general-review"
  | "empty";

export interface LevelDay {
  dayKey: string;
  label_ar: string;
  label_fr: string;
  lessonNumber?: number | null;
  kind: LessonKind;
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
  weeks: LevelWeek[];
}

export interface LevelData {
  subject?: string;
  subject_ar?: string;
  subjectCode: string;
  level: number;
  levelLabel_ar: string;
  levelLabel_fr: string;
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
  component: string;
  topic: string;
  objectives: string;
  stages: string;
  session: string;
  rj: string;
  sourceLessonNumber?: number | null;
  sourceDayKey?: string;
  kind?: LessonKind;
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
  subjectCode?: string;
  stageId?: string;
  weekNumber?: number;
  dayKey?: string;
}

export interface MemoSelection {
  subjectCode: string;
  levels: number[];
  level: number;
  period: MemoBlock;
  stageId: string;
  weekNumber: number;
  dayKey: string;
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

export function timesToMinutes(from: string, to: string): number | null {
  const parse = (value: string) => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  };
  const start = parse(from);
  const end = parse(to);
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

export function draftKey(selection: MemoSelection): string {
  return [
    selection.subjectCode,
    selection.level,
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
