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
