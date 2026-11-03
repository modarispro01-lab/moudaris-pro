/* ============================================================
   محرك الجدول — تحويل جدول كل يوم إلى سطور موحّدة للطباعة
   ============================================================ */
import { timeToMin } from "./utils";
import type { DayId, Period, ScheduleRow, TimetableState, Timing } from "./types";

/** فترات يوم معيّنة (مصفوفة فارغة إن لم يُبرمج بعد) */
export function dayPeriods(state: TimetableState, day: DayId): Period[] {
  const list = state.plans?.[day] ?? [];
  // ترتيب زمني مستقر
  return [...list].sort((a, b) => {
    const d = (timeToMin(a.start) ?? 9999) - (timeToMin(b.start) ?? 9999);
    if (d !== 0) return d;
    return (timeToMin(a.end) ?? 9999) - (timeToMin(b.end) ?? 9999);
  });
}

/** نافذة زمنية صحيحة بالدقائق */
function windowOf(start: string, end: string): { a: number; b: number } | null {
  const a = timeToMin(start);
  const b = timeToMin(end);
  return a !== null && b !== null && b > a ? { a, b } : null;
}

/**
 * إلى أيّ فترة تنتمي حصة/استراحة؟
 *
 * التصنيف يعتمد على أكبر تقاطع زمني مع الفترتين، لا على وقت البداية فقط؛
 * فحصة 12:45–13:50 مع بداية مسائية 12:50 هي مسائية.
 */
export function periodBlock(
  timing: Timing,
  p: Period
): "morning" | "afternoon" | "transition" {
  const pStart = timeToMin(p.start);
  const pEnd = timeToMin(p.end);
  const morning = windowOf(timing.morningStart, timing.morningEnd);
  const afternoon = windowOf(timing.afternoonStart, timing.afternoonEnd);

  if (pStart === null || pEnd === null || pEnd <= pStart) {
    return afternoon && pStart !== null && pStart >= afternoon.a
      ? "afternoon"
      : "morning";
  }

  /* استراحة واقعة بكاملها بين نهاية الصباحية وبداية المسائية.
     الحصص لا تُصنَّف انتقالًا أبدًا حتى لا تختفي من الجدول. */
  if (
    p.isBreak &&
    morning &&
    afternoon &&
    pStart >= morning.b &&
    pEnd <= afternoon.a
  ) {
    return "transition";
  }

  const overlap = (w: { a: number; b: number } | null) =>
    w ? Math.max(0, Math.min(pEnd, w.b) - Math.max(pStart, w.a)) : 0;

  const morningOverlap = overlap(morning);
  const afternoonOverlap = overlap(afternoon);

  if (afternoonOverlap > morningOverlap) return "afternoon";
  if (morningOverlap > afternoonOverlap) return "morning";
  return afternoon && pStart >= afternoon.a ? "afternoon" : "morning";
}

/**
 * إدراج استراحات عرضية عند كل فجوة ≥ minGap دقيقة بين حصتين متتاليتين.
 * الاستراحات مُشتقّة للعرض فقط ولا تُحفظ في البيانات.
 */
export function withAutoBreaks(list: Period[], minGap = 10): Period[] {
  if (minGap <= 0 || list.length < 2) return list;

  const out: Period[] = [];
  let prev: Period | null = null;

  for (const p of list) {
    if (prev && !prev.isBreak && !p.isBreak) {
      const prevEnd = timeToMin(prev.end);
      const nextStart = timeToMin(p.start);
      if (
        prevEnd !== null &&
        nextStart !== null &&
        nextStart - prevEnd >= minGap
      ) {
        out.push({
          id: `auto-break-${prev.id}-${p.id}`,
          start: prev.end,
          end: p.start,
          label: "استراحة",
          isBreak: true,
          subjectId: null,
        });
      }
    }
    out.push(p);
    prev = p;
  }

  return out;
}

/** هل اليوم مبرمج؟ (له فترة واحدة على الأقل) */
export function dayIsProgrammed(state: TimetableState, day: DayId): boolean {
  return dayPeriods(state, day).length > 0;
}

/** عدد الحصص المبرمجة في يوم (بدون الاستراحات) */
export function dayLessonCount(state: TimetableState, day: DayId): number {
  return dayPeriods(state, day).filter((p) => !p.isBreak).length;
}

/** عدد الأيام المُبرمجة من أصل كل الأيام */
export function weekProgress(state: TimetableState) {
  const total = state.days.length;
  const done = state.days.filter((d) => dayLessonCount(state, d) > 0).length;
  return { done, total };
}

/** نسبة إنجاز اليوم (0..1) */
export function dayFillRatio(state: TimetableState, day: DayId): number {
  const ps = dayPeriods(state, day);
  const lessons = ps.filter((p) => !p.isBreak);
  if (!lessons.length) return 0;
  const filled = lessons.filter((p) => !!p.subjectId).length;
  return filled / lessons.length;
}

/** هل اكتمل اليوم؟ (كل الحصص لها مادة) */
export function dayIsComplete(state: TimetableState, day: DayId): boolean {
  const ps = dayPeriods(state, day);
  const lessons = ps.filter((p) => !p.isBreak);
  if (!lessons.length) return false;
  return lessons.every((p) => !!p.subjectId);
}

/** أول يوم غير مكتمل (لتوجيه الأستاذ لما يبقى) */
export function nextIncompleteDay(state: TimetableState): DayId | null {
  for (const d of state.days) {
    if (!dayIsComplete(state, d)) return d;
  }
  return null;
}

/**
 * بناء سطور جدول الطباعة.
 *
 * نجمع كل الفترات من كل الأيام ونجمّعها حسب **وقت البداية**؛
 * فإذا اختلف توقيت يوم عن آخر، يبقى الجدول واحدًا ومرتّبًا.
 * النهاية المعتمدة هي الأكثر تكرارًا لذلك البداية.
 */
export function buildRows(state: TimetableState): ScheduleRow[] {
  const map = new Map<string, { ends: Map<string, number>; breaks: number; total: number }>();

  for (const day of state.days) {
    for (const p of dayPeriods(state, day)) {
      if (!p.start) continue;
      let e = map.get(p.start);
      if (!e) {
        e = { ends: new Map(), breaks: 0, total: 0 };
        map.set(p.start, e);
      }
      e.ends.set(p.end, (e.ends.get(p.end) ?? 0) + 1);
      e.total += 1;
      if (p.isBreak) e.breaks += 1;
    }
  }

  const rows: ScheduleRow[] = [];
  for (const [start, e] of map) {
    // النهاية الأكثر تكرارًا
    let bestEnd = "";
    let bestCount = -1;
    for (const [end, c] of e.ends) {
      if (c > bestCount) {
        bestCount = c;
        bestEnd = end;
      }
    }
    rows.push({
      key: start,
      start,
      end: bestEnd,
      allBreak: e.breaks === e.total,
    });
  }

  rows.sort((a, b) => (timeToMin(a.start) ?? 0) - (timeToMin(b.start) ?? 0));
  return rows;
}

/**
 * هل هذا السطر استراحة في كل الأيام التي فيها هذا التوقيت؟
 * إن كان كذلك يشغل السطر كاملًا بدل خلايا منفصلة.
 */
export function rowSpansAllDays(state: TimetableState, row: ScheduleRow): boolean {
  if (row.allBreak) {
    // نتحقق: كل يوم له فترة بهذا التوقيت، وكلها استراحات
    for (const day of state.days) {
      const list = dayPeriods(state, day);
      const matches = list.filter((p) => p.start === row.start);
      if (!matches.length || !matches.every((p) => p.isBreak)) return false;
    }
    return true;
  }
  return false;
}

/** خانة يوم في سطر معيّن */
export function cellAt(
  state: TimetableState,
  day: DayId,
  row: ScheduleRow
): Period | undefined {
  const list = dayPeriods(state, day);
  // مطابقة دقيقة أولًا
  const exact = list.find((p) => p.start === row.start && p.end === row.end);
  if (exact) return exact;
  // ثم بأول فترة تبدأ في نفس الوقت
  return list.find((p) => p.start === row.start);
}

/** إحصاءات الأسبوع: المجموع ومجموع كل مادة */
export function weekTotals(state: TimetableState) {
  let totalMin = 0;
  let totalLessons = 0;
  const perSubject: Record<string, number> = {};
  const perDay: Record<string, number> = {};

  for (const day of state.days) {
    let n = 0;
    for (const p of dayPeriods(state, day)) {
      if (p.isBreak) continue;
      const dur = durationOf(p);
      totalMin += dur;
      totalLessons += 1;
      n += 1;
      if (p.subjectId) perSubject[p.subjectId] = (perSubject[p.subjectId] ?? 0) + dur;
    }
    perDay[day] = n;
  }
  return { totalMin, totalLessons, perSubject, perDay };
}

/** مدّة الفترة بالدقائق (0 إن كانت التوقيتات غير صحيحة) */
export function durationOf(p: Period): number {
  const a = timeToMin(p.start);
  const b = timeToMin(p.end);
  if (a === null || b === null || b <= a) return 0;
  return b - a;
}