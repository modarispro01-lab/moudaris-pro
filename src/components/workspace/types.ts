/* ============================================================
   مساحة عمل الأستاذ — الأنواع الأساسية (النسخة ١)
   طبقة تخزين موحّدة جديدة: لا تعدّل أي مفتاح قديم في localStorage.
   ============================================================ */

import type { TimetableState } from "@/components/timetable/types";
import { makeInitialState } from "@/components/timetable/defaults";

/** مفتاح الحفظ الوحيد لمساحة العمل في localStorage (النسخة ١) */
export const WORKSPACE_KEY = "modaris:workspace:v1";

/** الوثيقة الوحيدة للحفظ في النسخة ١ — كل شيء داخلها */
export interface Workspace {
  version: 1;
  updatedAt: string;
  profile: TeacherProfile;
  classes: ClassRef[];
  timetable: TimetableState;
  calendar: CalendarOverrides;
  weeks: WeekDoc[];
  mindMaps: Record<string, MindMapRef>;
}

/** ملف الأستاذ الموحّد (يُملأ من الترحيل ويُحرَّر لاحقًا) */
export interface TeacherProfile {
  institution: string;
  teacher: string;
  director: string;
  inspector: string;
  academicYear: string;
}

/** مرجع صنف دراسي: مادة × مستوى × فوج */
export interface ClassRef {
  id: string;
  subjectId: string;
  levelId: string;
  group: string;
  weeklySessions: number;
}

/** وثيقة أسبوع كامل داخل مساحة العمل */
export interface WeekDoc {
  id: string;
  weekNumber: number;
  stageId: string;
  isoWeekStart: string;
  generatedFrom: "timetable" | "manual";
  generatedAt: string;
  days: DayDoc[];
}

/** يوم واحد داخل وثيقة الأسبوع */
export interface DayDoc {
  date: string;
  dayId: "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
  skip?: SkipReason;
  lessons: LessonDoc[];
}

/** سبب تخطّي يوم (عطلة نهاية الأسبوع لا تحمل معرّفًا) */
export type SkipReason =
  | { kind: "weekend" }
  | { kind: "official-holiday"; id: string; label: string }
  | { kind: "religious-holiday"; id: string; label: string; confirmed: boolean }
  | { kind: "school-vacation"; id: string; label: string }
  | { kind: "teacher-absence"; label: string }
  | { kind: "manual-skip"; label: string };

/** حصة واحدة داخل يوم العمل */
export interface LessonDoc {
  id: string;
  periodId: string;
  block: "morning" | "afternoon";
  timeFrom: string;
  timeTo: string;
  breakMinutes: number;
  subjectId: string;
  subjectCode: string | null;
  levelNumber: number;
  levelLabel: string;
  groupLabel: string;
  sessionNumber: number;
  sessionOrdinal: number;
  component: string;
  topic: string;
  objectives: string;
  stages: string;
  materials?: string;
  note?: string;
  mindMapDocId?: string;
  edited: boolean;
}

/** مرجع خطاطة ذهنية محفوظة (المعرّف يربطها بحصة) */
export interface MindMapRef {
  docId: string;
  subject: "arabic" | "french" | "math";
  updatedAt: string;
}

/** تعديلات الرزمة الدراسية: أيام مضافة أو مُزالة من جدول العمل */
export interface CalendarOverrides {
  schoolYear: string;
  added: CalendarDay[];
  removed: string[];
}

/** يوم مضاف يدويًا إلى الرزمة الدراسية */
export interface CalendarDay {
  date: string;
  label_ar: string;
  kind: "official-holiday" | "religious-holiday" | "school-vacation" | "exam";
  confirmed: boolean;
  source?: string;
}

/** ملف أستاذ فارغ (قبل الترحيل أو عند فشله) */
export function emptyProfile(): TeacherProfile {
  return {
    institution: "",
    teacher: "",
    director: "",
    inspector: "",
    academicYear: "",
  };
}

/**
 * مساحة عمل فارغة تمامًا — جدول الزمن يأتي من makeInitialState()
 * (نفس نقطة انطلاق مولّد استعمال الزمن) لضمان بنية صالحة دائمًا.
 */
export function emptyWorkspace(): Workspace {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    profile: emptyProfile(),
    classes: [],
    timetable: makeInitialState(),
    calendar: { schoolYear: "", added: [], removed: [] },
    weeks: [],
    mindMaps: {},
  };
}
