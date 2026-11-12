"use client";

/* ============================================================
   Hook مذكرة الأسبوع — يربط المولّد النقي بمساحة العمل
   - لا يكتب شيئاً في التخزين قبل ضغط المستخدم «أنشئ/أعد التوليد»
     أو تعديل حصة (حفظ فوري عبر update).
   - الأسبوع المحفوظ لا يتغير عند تغيّر استعمال الزمن، إلا بإعادة
     التوليد الصريحة.
   ============================================================ */

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseImported, STORAGE_KEY } from "@/components/timetable/store";
import type { TimetableState } from "@/components/timetable/types";
import type { Catalog } from "@/components/daily-memo/types";
import { generateWeek } from "@/lib/week-memo-generator";
import { buildNonSchoolDays, mondayOfIso } from "@/lib/moroccan-calendar";
import type {
  CalendarDay,
  CalendarOverrides,
  SkipReason,
  WeekDoc,
  TeacherProfile,
} from "@/components/workspace/types";
import { readWorkspace, useWorkspace } from "@/components/workspace/useWorkspace";

export interface UseWeekMemoResult {
  timetable: TimetableState | null;
  ready: boolean;
  /** ملف الأستاذ الموحّد — لورقة الطباعة (المؤسسة/الأستاذ/السنة) */
  profile: TeacherProfile;
  /** إزاحة الأسبوع ±7 أيام — تتعامل مع الحالة الفارغة */
  shiftWeek: (days: number) => void;
  /** الأسبوع المحفوظ في مساحة العمل بمفتاح weekStart — null إن لم يُولَّد */
  week: WeekDoc | null;
  warnings: string[];
  weekStart: string;
  setWeekStart: (v: string) => void;
  stageIndex: number;
  setStageIndex: (v: number) => void;
  weekNumber: number;
  setWeekNumber: (v: number) => void;
  generate: () => void;
  regenerate: () => void;
  updateLesson: (lessonId: string, patch: Partial<LessonDocPatch>) => void;
  setDaySkip: (date: string, skip: SkipReason | undefined) => void;
  savedWeeks: number;
  /** الرزمة الدراسية: العطل المضافة والمستثناة */
  calendar: CalendarOverrides;
  /** أيام الأسبوع المعروض غير الدراسية (تاريخ ← سبب) */
  nonSchoolDays: Record<string, SkipReason>;
  /** إضافة عطلة أو استبدالها (نفس التاريخ يُستبدل) */
  addHoliday: (day: CalendarDay) => void;
  /** حذف عطلة مضافة واستثناء تاريخها من العطل الثابتة */
  removeHoliday: (date: string) => void;
}

/* رقعة جزئية للحصة — نفس حقول LessonDoc القابلة للتحرير */
export type LessonDocPatch = Partial<{
  timeFrom: string;
  timeTo: string;
  groupLabel: string;
  component: string;
  topic: string;
  objectives: string;
  stages: string;
  materials: string;
  note: string;
}>;

/** إضافة أيام على تاريخ ISO (نفس منطق المولّد — محلية لهذا الملف) */
function shiftIso(iso: string, days: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const base = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(base + days * 86400000).toISOString().slice(0, 10);
}

/** اثنين الأسبوع الحالي (بداية أسبوع التدريس) — يُحسب بعد التركيب فقط */
function currentMondayIso(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0=الأحد … 6=السبت
  const offset = (day + 6) % 7; // الاثنين=0 … الأحد=6
  const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return new Date(base - offset * 86400000).toISOString().slice(0, 10);
}

export function useWeekMemo(catalog: Catalog): UseWeekMemoResult {
  const { workspace, update } = useWorkspace();
  const calendar = workspace.calendar;

  /* استعمال الزمن الحيّ: يُقرأ بعد التركيب فقط (localStorage غير متاح خادمياً) */
  const [timetable, setTimetable] = useState<TimetableState | null>(null);
  const [ready, setReady] = useState(false);

  /* مدخلات المولّد */
  const [weekStart, setWeekStart] = useState("");
  const [stageIndex, setStageIndex] = useState(0);
  const [weekNumber, setWeekNumber] = useState(1);

  /* تحذيرات آخر توليد (تُعرض في الشريط الأعلى) */
  const [warnings, setWarnings] = useState<string[]>([]);

  /* أيام غير دراسية للأسبوع المعروض — تُشتق من الرزمة الدراسية */
  const nonSchoolDays = useMemo(
    () => (weekStart ? buildNonSchoolDays(calendar, weekStart) : {}),
    [calendar, weekStart]
  );

  /* القراءة الأولى: استعمال الزمن من localStorage، والبديل مساحة العمل */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? parseImported(raw) : null;
      setTimetable(parsed ?? readWorkspace().workspace.timetable);
    } catch {
      setTimetable(readWorkspace().workspace.timetable);
    }
    setWeekStart(currentMondayIso());
    setReady(true);
    /* workspace.timetable يُقرأ مرة واحدة عند الإقلاع فقط */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* الأسبوع المحفوظ المطابق لتاريخ الاثنين المختار */
  const week = useMemo(
    () => (weekStart ? workspace.weeks.find((w) => w.id === weekStart) ?? null : null),
    [workspace.weeks, weekStart]
  );

  /* الحفظ المشترك: يستبدل الأسبوع بنفس المعرّف داخل workspace.weeks */
  const saveWeek = useCallback(
    (newWeek: WeekDoc, wsWarnings: string[]) => {
      update((ws) => ({
        ...ws,
        weeks: [newWeek, ...ws.weeks.filter((w) => w.id !== newWeek.id)],
      }));
      setWarnings(wsWarnings);
    },
    [update]
  );

  /** التوليد الأول: إن وُجد أسبوع محفوظ يُسأل المستخدم قبل الاستبدال */
  const generate = useCallback(() => {
    if (!timetable) return;
    const start = mondayOfIso(weekStart || currentMondayIso());
    if (!start) return;
    if (workspace.weeks.some((w) => w.id === start)) {
      if (!window.confirm("توجد مذكرة محفوظة لهذا الأسبوع — استبدالها بالتوليد الجديد؟")) {
        return;
      }
    }
    const { week: newWeek, warnings: ws } = generateWeek({
      state: timetable,
      catalog,
      stageIndex,
      weekNumber,
      weekStart: start,
      nonSchoolDays,
    });
    setWeekStart(start);
    saveWeek(newWeek, ws);
  }, [timetable, catalog, stageIndex, weekNumber, weekStart, workspace.weeks, saveWeek, nonSchoolDays]);

  /** إعادة التوليد بلا سؤال — الزر في الواجهة يطلب التأكيد الصريح قبل ندائها */
  const regenerate = useCallback(() => {
    if (!timetable) return;
    const start = mondayOfIso(weekStart || currentMondayIso());
    if (!start) return;
    const { week: newWeek, warnings: ws } = generateWeek({
      state: timetable,
      catalog,
      stageIndex,
      weekNumber,
      weekStart: start,
      nonSchoolDays,
    });
    setWeekStart(start);
    saveWeek(newWeek, ws);
  }, [timetable, catalog, stageIndex, weekNumber, weekStart, saveWeek, nonSchoolDays]);

  /** تعديل حصة داخل الأسبوع المحفوظ + وسم edited=true */
  const updateLesson = useCallback(
    (lessonId: string, patch: LessonDocPatch) => {
      update((ws) => ({
        ...ws,
        weeks: ws.weeks.map((w) =>
          w.id !== weekStart
            ? w
            : {
                ...w,
                days: w.days.map((d) => ({
                  ...d,
                  lessons: d.lessons.map((l) =>
                    l.id === lessonId ? { ...l, ...patch, edited: true } : l
                  ),
                })),
              }
        ),
      }));
    },
    [update, weekStart]
  );

  /** تخطي/إلغاء تخطي يوم من الأسبوع المحفوظ */
  const setDaySkip = useCallback(
    (date: string, skip: SkipReason | undefined) => {
      update((ws) => ({
        ...ws,
        weeks: ws.weeks.map((w) =>
          w.id !== weekStart
            ? w
            : {
                ...w,
                days: w.days.map((d) => (d.date === date ? { ...d, skip } : d)),
              }
        ),
      }));
    },
    [update, weekStart]
  );

  /** اختيار يوم البداية: أي تاريخ يُسحب تلقائياً إلى اثنين أسبوعه */
  const setWeekStartSafe = useCallback((v: string) => {
    setWeekStart(v ? mondayOfIso(v) : v);
  }, []);

  /** إضافة عطلة إلى الرزمة (نفس التاريخ يُستبدل) */
  const addHoliday = useCallback(
    (day: CalendarDay) => {
      update((ws) => ({
        ...ws,
        calendar: {
          ...ws.calendar,
          added: [...ws.calendar.added.filter((a) => a.date !== day.date), day].sort((a, b) =>
            a.date.localeCompare(b.date)
          ),
          removed: ws.calendar.removed.filter((d) => d !== day.date),
        },
      }));
    },
    [update]
  );

  /** حذف عطلة مضافة واستثناء تاريخها */
  const removeHoliday = useCallback(
    (date: string) => {
      update((ws) => ({
        ...ws,
        calendar: {
          ...ws.calendar,
          added: ws.calendar.added.filter((a) => a.date !== date),
          removed: ws.calendar.removed.includes(date)
            ? ws.calendar.removed
            : [...ws.calendar.removed, date],
        },
      }));
    },
    [update]
  );

  const shiftWeek = useCallback((days: number) => {
    setWeekStart((prev) => shiftIso(prev || currentMondayIso(), days));
  }, []);

  return {
    timetable,
    ready,
    profile: workspace.profile,
    week,
    warnings,
    weekStart,
    setWeekStart: setWeekStartSafe,
    stageIndex,
    setStageIndex,
    weekNumber,
    setWeekNumber,
    generate,
    regenerate,
    updateLesson,
    setDaySkip,
    shiftWeek,
    savedWeeks: workspace.weeks.length,
    calendar,
    nonSchoolDays,
    addHoliday,
    removeHoliday,
  };
}
