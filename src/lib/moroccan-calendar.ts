/* ============================================================
   الرزمة الدراسية المغربية — عطل رسمية ثابتة + دينية متغيّرة
   منطق نقي: بلا React، بلا تخزين، بلا شبكة.
   ============================================================ */

import type { CalendarDay, CalendarOverrides, SkipReason } from "@/components/workspace/types";

/** عطلة رسمية ثابتة التاريخ في كل سنة ميلادية */
export interface FixedHoliday {
  month: number;
  day: number;
  label_ar: string;
}

/** العطل الرسمية الثابتة في المغرب */
export const FIXED_HOLIDAYS: FixedHoliday[] = [
  { month: 1, day: 1, label_ar: "رأس السنة الميلادية" },
  { month: 1, day: 11, label_ar: "تقديم وثيقة الاستقلال" },
  { month: 1, day: 14, label_ar: "رأس السنة الأمازيغية" },
  { month: 5, day: 1, label_ar: "عيد الشغل" },
  { month: 7, day: 30, label_ar: "عيد العرش" },
  { month: 8, day: 14, label_ar: "ذكرى استرجاع وادي الذهب" },
  { month: 8, day: 20, label_ar: "ذكرى ثورة الملك والشعب" },
  { month: 8, day: 21, label_ar: "عيد الشباب" },
  { month: 10, day: 31, label_ar: "عيد الوحدة" },
  { month: 11, day: 6, label_ar: "ذكرى المسيرة الخضراء" },
  { month: 11, day: 18, label_ar: "عيد الاستقلال" },
];

/** عطلة مدرسية محدّدة النطاق (تُحدَّث كل سنة دراسية — من المذكرة الوزارية) */
export interface SchoolVacation {
  from: string; // أول يوم ISO
  to: string;   // آخر يوم ISO (شامل)
  label_ar: string;
}

/** العطل المدرسية للسنة الدراسية 2026-2027 */
export const SCHOOL_VACATIONS: SchoolVacation[] = [
  { from: "2026-10-18", to: "2026-10-25", label_ar: "العطلة البينية الأولى" },
  { from: "2026-12-06", to: "2026-12-13", label_ar: "العطلة البينية الثانية" },
  { from: "2027-01-24", to: "2027-01-31", label_ar: "عطلة منتصف السنة الدراسية" },
  { from: "2027-03-21", to: "2027-03-28", label_ar: "العطلة البينية الثالثة" },
  { from: "2027-05-09", to: "2027-05-16", label_ar: "العطلة البينية الرابعة" },
];

/** العطلة المدرسية الموافقة لتاريخ ISO — أو undefined */
function vacationFor(iso: string): SchoolVacation | undefined {
  return SCHOOL_VACATIONS.find((v) => iso >= v.from && iso <= v.to);
}

/** أسماء العطل الدينية — تُضاف بتواريخها يدوياً لأنها تُعلَن بالرؤية لا بالحساب */
export const RELIGIOUS_LABELS = ["عيد الفطر", "عيد الأضحى", "فاتح محرم", "المولد النبوي"] as const;

/** إضافة أيام على تاريخ ISO "YYYY-MM-DD" بحساب UTC */
export function addDaysIso(iso: string, n: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const base = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(base + n * 86400000).toISOString().slice(0, 10);
}

/** الاثنين الموافق لأي تاريخ ISO — أي يوم يُسحب إلى بداية أسبوعه */
export function mondayOfIso(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const base = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const dow = new Date(base).getUTCDay(); // 0=الأحد … 6=السبت
  const back = (dow + 6) % 7; // الاثنين=0
  return new Date(base - back * 86400000).toISOString().slice(0, 10);
}

/** العطلة الثابتة الموافقة لتاريخ ISO — أو undefined */
function fixedFor(iso: string): FixedHoliday | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return undefined;
  const month = Number(m[2]);
  const day = Number(m[3]);
  return FIXED_HOLIDAYS.find((h) => h.month === month && h.day === day);
}

/** تحويل يوم من الرزمة إلى سبب تخطي — null إن لم يكن عطلة نافذة */
export function skipReasonFor(day: CalendarDay): SkipReason | null {
  if (day.kind === "religious-holiday" && !day.confirmed) return null;
  if (day.kind === "official-holiday")
    return { kind: "official-holiday", id: day.date, label: day.label_ar };
  if (day.kind === "religious-holiday")
    return { kind: "religious-holiday", id: day.date, label: day.label_ar, confirmed: true };
  if (day.kind === "school-vacation")
    return { kind: "school-vacation", id: day.date, label: day.label_ar };
  return { kind: "manual-skip", label: day.label_ar };
}

/**
 * خريطة أيام غير دراسية لأسبوع كامل (٦ أيام من الاثنين).
 * الأولوية: العطلة المضافة تتقدّم على الثابتة، وremoved يلغي كل عطلة في تاريخه.
 */
export function buildNonSchoolDays(
  calendar: CalendarOverrides,
  weekStartIso: string
): Record<string, SkipReason> {
  const out: Record<string, SkipReason> = {};
  const start = mondayOfIso(weekStartIso);
  for (let i = 0; i < 6; i++) {
    const date = addDaysIso(start, i);

    const fixed = fixedFor(date);
    if (fixed) {
      out[date] = { kind: "official-holiday", id: "fixed-" + date.slice(5), label: fixed.label_ar };
    }

    const vacation = vacationFor(date);
    if (vacation) {
      out[date] = { kind: "school-vacation", id: "vac-" + date, label: vacation.label_ar };
    }

    const addedList = calendar?.added ?? [];
    const removedList = calendar?.removed ?? [];

    const added = addedList.find((a) => a.date === date);
    if (added) {
      const reason = skipReasonFor(added);
      if (reason) out[date] = reason;
      else delete out[date];
    }

    if (removedList.includes(date)) delete out[date];
  }
  return out;
}
