/* ============================================================
   أرقام الأيام داخل الدورة التربوية
   الدورة = أيام العمل في استعمال الزمن (6 عادة). العطلة لا تحجز رقمًا،
   فالأيام تتزحزح عبر الأسابيع. الدورة تبدأ من الأسبوع 1 من المرحلة
   وتُصفَّر عند بداية مرحلة جديدة.
   ============================================================ */

import type { CalendarOverrides } from "@/components/workspace/types";
import { addDaysIso, buildNonSchoolDays, mondayOfIso } from "./moroccan-calendar";

/** ترتيب أيام العمل الافتراضي من الاثنين */
const DEFAULT_DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** أول يوم في الدورة: اثنين الأسبوع 1 من المرحلة */
export function cycleAnchorIso(targetWeekStart: string, weekNumber: number): string {
  const target = mondayOfIso(targetWeekStart);
  const back = Math.max(0, (Number(weekNumber) || 1) - 1) * 7;
  return addDaysIso(target, -back);
}

/**
 * خريطة dayId → رقم اليوم داخل الدورة (1..طول الدورة) لأسبوع واحد.
 * الأيام غير الدراسية لا تأخذ رقمًا ولا تُحتسب.
 */
export function cycleDayNumbers(
  targetWeekStart: string,
  weekNumber: number,
  calendar: CalendarOverrides,
  dayOrder: readonly string[] = DEFAULT_DAY_ORDER
): Record<string, number> {
  const out: Record<string, number> = {};
  const target = mondayOfIso(targetWeekStart);
  const len = dayOrder.length;
  if (!len) return out;
  let week = cycleAnchorIso(target, weekNumber);
  let n = 0;
  /* سقف أمان: 12 أسبوعًا */
  for (let guard = 0; guard < 12 && week <= target; guard++) {
    const nonSchool = buildNonSchoolDays(calendar, week);
    for (let i = 0; i < len; i++) {
      const date = addDaysIso(week, i);
      if (nonSchool[date]) continue;
      n += 1;
      if (week === target) out[dayOrder[i]] = ((n - 1) % len) + 1;
    }
    week = addDaysIso(week, 7);
  }
  return out;
}

/**
 * حمل تسلسل الحصص: عدد حصص كل ثلاثية قبل بداية الأسبوع الهدف داخل الدورة.
 * العطلة لا تُحتسب، والعدّاد متصل من بداية المرحلة ولا يُصفَّر عند إتمام الدورة.
 */
export function sessionCarryFor(opts: {
  targetWeekStart: string;
  /** بداية المرحلة: إن وُجدت فهي الأصل، وإلا يُستعمل weekNumber */
  stageStartIso?: string;
  weekNumber?: number;
  calendar: CalendarOverrides;
  dayOrder?: readonly string[];
  keysForDay: (dayId: string) => string[];
}): Map<string, number> {
  const dayOrder = opts.dayOrder ?? DEFAULT_DAY_ORDER;
  const len = dayOrder.length;
  const carry = new Map<string, number>();
  if (!len) return carry;
  const target = mondayOfIso(opts.targetWeekStart);
  let week = opts.stageStartIso
    ? mondayOfIso(opts.stageStartIso)
    : cycleAnchorIso(target, opts.weekNumber ?? 1);
  let n = 0;
  /* سقف أمان: 12 أسبوعًا */
  for (let guard = 0; guard < 12 && week < target; guard++) {
    const nonSchool = buildNonSchoolDays(opts.calendar, week);
    for (let i = 0; i < len; i++) {
      const date = addDaysIso(week, i);
      if (nonSchool[date]) continue;
      n += 1;
      for (const key of opts.keysForDay(dayOrder[i])) {
        carry.set(key, (carry.get(key) ?? 0) + 1);
      }
    }
    week = addDaysIso(week, 7);
  }
  return carry;
}

/**
 * حمل التسلسل لكل أسبوع تربوي: عدد حصص كل ثلاثية قبل بداية كل أسبوع تربوي.
 * المفتاح: `${مفتاح الثلاثية}|${رقم الأسبوع التربوي}`.
 * ضروري لأن الأسبوع التربوي (6 أيام دراسية) قد يمتد على أسبوعين تقويميين
 * بسبب العطل، فحمل الأسبوع التقويمي وحده لا يكفي لمعرفة موضع الحصة داخله.
 */
export function sessionWeekBaseFor(opts: {
  stageStartIso: string;
  targetWeekStart: string;
  calendar: CalendarOverrides;
  dayOrder?: readonly string[];
  keysForDay: (dayId: string) => string[];
  maxWeek?: number;
}): Map<string, number> {
  const dayOrder = opts.dayOrder ?? DEFAULT_DAY_ORDER;
  const len = dayOrder.length;
  const out = new Map<string, number>();
  if (!len) return out;
  const target = mondayOfIso(opts.targetWeekStart);
  let week = mondayOfIso(opts.stageStartIso);
  if (!week || week > target) return out;
  const maxWeek = Math.max(1, opts.maxWeek ?? 6);
  const counts = new Map<string, number>();
  let n = 0;
  let lastWeek = 0;
  /* سقف أمان: 60 أسبوعًا — مطابق لـ cyclePositions */
  for (let guard = 0; guard < 60 && week <= target; guard++) {
    const nonSchool = buildNonSchoolDays(opts.calendar, week);
    for (let i = 0; i < len; i++) {
      const date = addDaysIso(week, i);
      if (nonSchool[date]) continue;
      const w = Math.min(Math.floor(n / len) + 1, maxWeek);
      /* أول يوم دراسي في هذا الأسبوع التربوي: لقطة للحمل الحالي */
      if (w !== lastWeek) {
        for (const [key, value] of counts) out.set(`${key}|${w}`, value);
        lastWeek = w;
      }
      n += 1;
      for (const key of opts.keysForDay(dayOrder[i])) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    week = addDaysIso(week, 7);
  }
  return out;
}

/** موضع يوم داخل المرحلة: الأسبوع التربوي واليوم داخله */
export interface CyclePosition {
  /** رقم الأسبوع التربوي داخل المرحلة (1، 2، 3 ...) */
  week: number;
  /** رقم اليوم داخل الأسبوع التربوي (1..طول الدورة) */
  day: number;
  /** العدد التراكمي للأيام الدراسية من بداية المرحلة */
  n: number;
}

/**
 * مواضع أيام أسبوع واحد داخل المرحلة.
 * الأسبوع التربوي = طول الدورة (6 أيام دراسية عادة)، والعطلة لا تُحتسب.
 * بعد آخر أسبوع (maxWeek) يبقى الأسبوع مثبّتًا على الأخير واليوم يكمل دورته.
 * إذا كانت بداية المرحلة بعد الأسبوع الهدف تُعاد خريطة فارغة.
 */
export function cyclePositions(opts: {
  stageStartIso: string;
  targetWeekStart: string;
  calendar: CalendarOverrides;
  dayOrder?: readonly string[];
  /** أقصى أسبوع تربوي داخل المرحلة (عدد أسابيع التوزيع) — افتراضي 6 */
  maxWeek?: number;
}): Record<string, CyclePosition> {
  const dayOrder = opts.dayOrder ?? DEFAULT_DAY_ORDER;
  const len = dayOrder.length;
  const maxWeek = Math.max(1, opts.maxWeek ?? 6);
  const out: Record<string, CyclePosition> = {};
  if (!len) return out;
  const target = mondayOfIso(opts.targetWeekStart);
  let week = mondayOfIso(opts.stageStartIso);
  if (!week || week > target) return out;
  let n = 0;
  /* سقف أمان: 60 أسبوعًا */
  for (let guard = 0; guard < 60 && week <= target; guard++) {
    const nonSchool = buildNonSchoolDays(opts.calendar, week);
    for (let i = 0; i < len; i++) {
      const date = addDaysIso(week, i);
      if (nonSchool[date]) continue;
      n += 1;
      if (week === target) {
        /* بعد آخر أسبوع في التوزيع يبقى الأسبوع على الأخير (تحذير فقط) */
        out[dayOrder[i]] = {
          week: Math.min(Math.floor((n - 1) / len) + 1, maxWeek),
          day: ((n - 1) % len) + 1,
          n,
        };
      }
    }
    week = addDaysIso(week, 7);
  }
  return out;
}
