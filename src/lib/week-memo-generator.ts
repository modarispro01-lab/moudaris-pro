/* ============================================================
   مولّد مذكرة الأسبوع — منطق نقي تمامًا
   بلا fs، بلا localStorage، بلا React، بلا "use client".
   يحوّل: استعمال الزمن (TimetableState) + الفهرس الرسمي (Catalog)
   إلى وثيقة أسبوع كاملة (WeekDoc) + تحذيرات.
   الدالة لا ترمي أبدًا على مدخلات ناقصة: تُرجع أسبوعًا صالحًا + تحذيرات.
   ============================================================ */

import { buildWeekPlans } from "@/lib/timetable-memo-bridge";
import type { BridgeSession, BridgeDayPlan } from "@/lib/timetable-memo-bridge";
import {
  clampSessionNumber,
  levelSessionCount,
  sessionSourceDay,
} from "@/components/daily-memo/types";
import type {
  Catalog,
  LevelData,
  LevelStage,
  LevelWeek,
} from "@/components/daily-memo/types";
import type { TimetableState } from "@/components/timetable/types";
import type {
  WeekDoc,
  DayDoc,
  LessonDoc,
  SkipReason,
} from "@/components/workspace/types";

/** ترتيب أيام العمل من الاثنين — يحدد إزاحة التاريخ عن weekStart */
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** مدخلات المولّد */
export interface GenerateWeekInput {
  state: TimetableState;
  catalog: Catalog;
  /** ترتيب المرحلة داخل كل مادة: 0 = المرحلة الأولى */
  stageIndex: number;
  /** رقم الأسبوع داخل المرحلة: 1..5 */
  weekNumber: number;
  /** تاريخ الاثنين ISO: "2026-11-09" */
  weekStart: string;
  /** أيام غير دراسية: تاريخ ISO ← سبب التخطي. فارغة في هذه المرحلة (المرحلة ٤ تملأها) */
  nonSchoolDays?: Record<string, SkipReason>;
}

/** ناتج المولّد */
export interface GenerateWeekResult {
  week: WeekDoc;
  warnings: string[];
}

/** إضافة أيام على تاريخ ISO "YYYY-MM-DD" بحساب UTC (دون مكتبات) */
function addDays(iso: string, n: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const base = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const next = new Date(base + n * 86400000);
  return next.toISOString().slice(0, 10);
}

/** اقتطاع نص للعرض (60 حرفًا) */
export function truncateTopic(text: string, max = 60): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

/**
 * بناء أسبوع كامل من استعمال الزمن + الفهرس الرسمي.
 * أيام بلا حصص لا تُنتج يومًا (buildWeekPlans يرشحها مسبقًا).
 */
export function generateWeek(input: GenerateWeekInput): GenerateWeekResult {
  const { state, catalog, stageIndex, weekNumber, weekStart } = input;
  const nonSchoolDays = input.nonSchoolDays ?? {};
  const warnings: string[] = [];

  try {
    /* (أ) خطة الأسبوع من الجسر — مرة واحدة */
    const plans: BridgeDayPlan[] = buildWeekPlans(state);

    /* عدّاد حصص كل ثلاثية (مادة+مستوى+فوج) لتحذير التجاوز (القاعدة و) */
    const tripleCount = new Map<string, { n: number; name: string; level: LevelData | null }>();
    for (const plan of plans) {
      for (const s of plan.sessions) {
        if (!s.subjectId && !s.subjectCode) continue;
        const key = `${s.subjectId ?? s.subjectName}|${s.levelNumber ?? s.levelName ?? ""}|${s.group ?? ""}`;
        const entry = tripleCount.get(key) ?? {
          n: 0,
          name: s.subjectName || s.subjectId || "غير معروفة",
          level: findLevelData(catalog, s),
        };
        entry.n += 1;
        tripleCount.set(key, entry);
      }
    }
    /* بناء الأيام */
    const days: DayDoc[] = [];

    for (const plan of plans) {
      const offset = DAY_ORDER.indexOf(plan.day.dayId);
      const date = addDays(weekStart, offset < 0 ? 0 : offset);

      /* (ج) يوم غير دراسي → DayDoc بتخطي وبلا حصص */
      const skip = nonSchoolDays[date];
      if (skip) {
        days.push({ date, dayId: plan.day.dayId, skip, lessons: [] });
        continue;
      }

      const lessons: LessonDoc[] = [];
      for (let i = 0; i < plan.sessions.length; i++) {
        lessons.push(
          buildLesson(plan.sessions[i], i, catalog, stageIndex, weekNumber, date, warnings)
        );
      }
      days.push({ date, dayId: plan.day.dayId, lessons });
    }

    /* (و) تحذير تجاوز العدد لكل ثلاثية */
    for (const entry of tripleCount.values()) {
      if (!entry.level) continue;
      const max = levelSessionCount(entry.level);
      if (entry.n > max) {
        warnings.push(
          `المادة ${entry.name} المستوى ${entry.level.levelLabel_ar}: ` +
            `عدد الحصص الأسبوعية (${entry.n}) أكبر من التوزيع (${max})`
        );
      }
    }

    /* (هـ) وثيقة الأسبوع */
    const week: WeekDoc = {
      id: weekStart,
      isoWeekStart: weekStart,
      weekNumber,
      stageId: "stage-" + (stageIndex + 1),
      generatedFrom: "timetable",
      generatedAt: new Date().toISOString(),
      days,
    };
    return { week, warnings };
  } catch (e) {
    /* الدالة لا ترمي أبدًا: أسبوع فارغ صالح + تحذير بنص الاستثناء */
    return {
      week: {
        id: weekStart,
        isoWeekStart: weekStart,
        weekNumber,
        stageId: "stage-" + (stageIndex + 1),
        generatedFrom: "timetable",
        generatedAt: new Date().toISOString(),
        days: [],
      },
      warnings: [
        "حدث استثناء أثناء التوليد: " + (e instanceof Error ? e.message : String(e)),
      ],
    };
  }
}

/* ============================ مساعدات داخلية ============================ */

/** إيجاد بيانات المادة في الفهرس برمز التوزيع (subjectCode) */
function findLevelData(catalog: Catalog, session: BridgeSession): LevelData | null {
  if (!session.subjectCode) return null;
  const group = catalog.subjects.find((sg) => sg.code === session.subjectCode);
  if (!group) return null;
  if (session.levelNumber == null) return null;
  return group.levels.find((l) => l.level === session.levelNumber) ?? null;
}

/** بناء حصة واحدة من جلسة الجسر + الفهرس */
function buildLesson(
  session: BridgeSession,
  lessonIndex: number,
  catalog: Catalog,
  stageIndex: number,
  weekNumber: number,
  date: string,
  warnings: string[]
): LessonDoc {
  const group = catalog.subjects.find((sg) => sg.code === session.subjectCode);
  let level: LevelData | null = null;

  if (!group) {
    /* (د) مادة بلا توزيع رسمي: حصة بموضوع فارغ + تحذير */
    warnings.push(`لا يوجد توزيع رسمي للمادة: (${session.subjectName || session.subjectId || "بلا اسم"})`);
  } else if (session.levelNumber == null) {
    warnings.push(
      `لا يوجد توزيع رسمي للمادة: (${session.subjectName}) — اسم مستوى حر: (${session.levelName ?? "بلا"})`
    );
  } else {
    level = group.levels.find((l) => l.level === session.levelNumber) ?? null;
    if (!level) {
      warnings.push(
        `لا يوجد توزيع رسمي للمادة: (${session.subjectName}) للمستوى رقم ${session.levelNumber}`
      );
    }
  }

  /* المرحلة: بالترتيب — وإن غابت فآخر مرحلة متاحة + تحذير */
  let stage: LevelStage | null = null;
  if (level) {
    const stages = level.stages;
    stage = stages[stageIndex] ?? stages[stages.length - 1] ?? null;
    if (!stage) {
      warnings.push(`لا توجد مراحل في توزيع المادة: (${session.subjectName})`);
    } else if (stageIndex >= stages.length) {
      warnings.push(
        `المرحلة المطلوبة (${stageIndex + 1}) غير متوفرة في ${session.subjectName} — ` +
          `استُعملت آخر مرحلة (${stages.length})`
      );
    }
  }

  /* الأسبوع: بالمطابقة — وإلا أول أسبوع + تحذير عند الاختلاف */
  let week: LevelWeek | null = null;
  if (stage) {
    week = stage.weeks.find((w) => w.weekNumber === weekNumber) ?? stage.weeks[0] ?? null;
    if (week && week.weekNumber !== weekNumber) {
      warnings.push(
        `الأسبوع المطلوب (${weekNumber}) غير متوفر في ${session.subjectName} — ` +
          `استُعمل الأسبوع (${week.weekNumber})`
      );
    } else if (!week) {
      warnings.push(`لا توجد أسابيع في توزيع المادة: (${session.subjectName})`);
    }
  }

  /* رقم الحصة: مقصوص على نطاق التوزيع */
  const sessionNumber = level
    ? clampSessionNumber(session.sessionOrdinal || 1, 1, levelSessionCount(level))
    : session.sessionOrdinal || 1;

  /* المصدر: يوم التوزيع الموافق لرقم الحصة */
  const sourceDay = level && week ? sessionSourceDay(week, sessionNumber) : undefined;

  const subjectName = session.subjectName || session.subjectId || "";
  const component = sourceDay?.component || (stage?.theme_ar ?? "") || subjectName;

  return {
    id: "L-" + date + "-" + session.periodId + "-" + lessonIndex,
    periodId: session.periodId,
    block: session.block,
    timeFrom: session.start,
    timeTo: session.end,
    breakMinutes: session.breakMinutesAfter,
    subjectId: session.subjectId ?? "",
    subjectCode: session.subjectCode,
    levelNumber: session.levelNumber ?? 0,
    levelLabel: level ? level.levelLabel_ar : (session.levelName ?? ""),
    groupLabel: session.group ?? "",
    sessionNumber,
    sessionOrdinal: session.sessionOrdinal,
    component,
    topic: sourceDay?.content.topic_ar ?? "",
    objectives: "",
    stages: "",
    edited: false,
  };
}
