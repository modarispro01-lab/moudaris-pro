/* ============================================================
   أسابيع المرحلة كاملة — منطق نقي (للطباعة)
   بلا fs، بلا localStorage، بلا React.
   يمشي من بداية المرحلة أسبوعًا تقويميًا بأسبوع ويجمع الأسابيع
   التي فيها أيام دراسية من المرحلة (n ≤ maxDays).
   الأسبوع المحفوظ يُستعمل كما هو، وغير المحفوظ يُولَّد في الذاكرة
   بلا حفظ — للطباعة فقط.
   ============================================================ */

import { addDaysIso, buildNonSchoolDays, mondayOfIso } from "@/lib/moroccan-calendar";
import { cyclePositions, sessionCarryFor, sessionWeekBaseFor } from "@/lib/cycle-days";
import { generateWeek } from "@/lib/week-memo-generator";
import { sessionTripleKeys } from "@/lib/timetable-memo-bridge";
import type { DayId, TimetableState } from "@/components/timetable/types";
import type { Catalog } from "@/components/daily-memo/types";
import type { CalendarOverrides, WeekDoc } from "@/components/workspace/types";

/** ترتيب أيام العمل — يطابق ترتيب cycle-days.ts */
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat"] as const;

export interface StageWeeksInput {
  state: TimetableState;
  catalog: Catalog;
  stageIndex: number;
  /** بداية المرحلة — أي تاريخ داخل أسبوعها */
  stageStartIso: string;
  calendar: CalendarOverrides;
  /** الأسابيع المحفوظة في مساحة العمل */
  savedWeeks: WeekDoc[];
  /** عدد الأيام الدراسية في المرحلة (افتراضي 36 = 6 أسابيع × 6 أيام) */
  maxDays?: number;
  /** سقف أمان لعدد الأسابيع التقويمية الممسوحة */
  maxWeeks?: number;
}

export interface StageWeeksResult {
  /** أسابيع المرحلة بالترتيب — كل يوم دراسي فيها داخل المرحلة فقط */
  weeks: WeekDoc[];
  /** عدد الأسابيع المولّدة في الذاكرة (غير محفوظة) */
  generated: number;
  /** عدد الأيام الدراسية المجموعة */
  days: number;
  /** هل بلغنا نهاية المرحلة */
  complete: boolean;
}

/**
 * يبني أسابيع المرحلة كاملة للطباعة.
 * الأسبوع المحفوظ يُستعمل كما هو (بتعديلات المعلّم)، وغير المحفوظ يُولَّد.
 * الأيام التي تتجاوز نهاية المرحلة (n > maxDays) تُستبعد.
 */
export function buildStageWeeks(input: StageWeeksInput): StageWeeksResult {
  const maxDays = Math.max(1, input.maxDays ?? 36);
  const maxWeeks = Math.max(1, input.maxWeeks ?? 24);
  const weeks: WeekDoc[] = [];
  let generated = 0;
  let days = 0;
  const start = mondayOfIso(input.stageStartIso);
  if (!start) return { weeks, generated, days, complete: false };

  let cursor = start;
  for (let guard = 0; guard < maxWeeks && days < maxDays; guard++) {
    const positions = cyclePositions({
      stageStartIso: start,
      targetWeekStart: cursor,
      calendar: input.calendar,
      dayOrder: DAY_ORDER,
    });
    const entries = Object.entries(positions);
    /* أسبوع عطلة كاملة: لا مواضع — يُتخطى بلا إضافة */
    if (entries.length > 0) {
      const inStage = entries.filter(([, p]) => p.n <= maxDays);
      if (inStage.length > 0) {
        days += inStage.length;
        const saved = input.savedWeeks.find((w) => w.id === cursor);
        if (saved) {
          weeks.push({
            ...saved,
            days: saved.days.filter((d) => {
              const p = positions[d.dayId];
              return !p || p.n <= maxDays;
            }),
          });
        } else {
          const cycleDayByDay: Record<string, number> = {};
          const cyclePosByDay: Record<string, { week: number; day: number }> = {};
          for (const [dayId, p] of entries) {
            cycleDayByDay[dayId] = p.day;
            cyclePosByDay[dayId] = { week: p.week, day: p.day };
          }
          const sessionCarry = sessionCarryFor({
            targetWeekStart: cursor,
            stageStartIso: start,
            calendar: input.calendar,
            dayOrder: DAY_ORDER,
            keysForDay: (dayId) => sessionTripleKeys(input.state, dayId as DayId),
          });
          const sessionWeekBase = sessionWeekBaseFor({
            targetWeekStart: cursor,
            stageStartIso: start,
            calendar: input.calendar,
            dayOrder: DAY_ORDER,
            keysForDay: (dayId) => sessionTripleKeys(input.state, dayId as DayId),
          });
          const { week } = generateWeek({
            state: input.state,
            catalog: input.catalog,
            stageIndex: input.stageIndex,
            weekStart: cursor,
            nonSchoolDays: buildNonSchoolDays(input.calendar, cursor),
            cycleDayByDay,
            cyclePosByDay,
            sessionCarry,
            sessionWeekBase,
          });
          weeks.push({
            ...week,
            days: week.days
              .filter((d) => {
                const p = positions[d.dayId];
                return !p || p.n <= maxDays;
              })
              .map((d) => {
                const p = positions[d.dayId];
                return p ? { ...d, cycleDay: p.day, weekNumber: p.week } : d;
              }),
          });
          generated += 1;
        }
      }
    }
    cursor = addDaysIso(cursor, 7);
  }
  return { weeks, generated, days, complete: days >= maxDays };
}
