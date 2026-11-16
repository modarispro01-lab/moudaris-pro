/* ============================================================
   مولّد مذكرة الأسبوع — منطق نقي تمامًا
   بلا fs، بلا localStorage، بلا React، بلا "use client".
   يحوّل: استعمال الزمن (TimetableState) + الفهرس الرسمي (Catalog)
   إلى وثيقة أسبوع كاملة (WeekDoc) + تحذيرات.
   الدالة لا ترمي أبدًا على مدخلات ناقصة: تُرجع أسبوعًا صالحًا + تحذيرات.
   ============================================================ */

import { buildWeekPlans, sessionTripleKeys } from "@/lib/timetable-memo-bridge";
import type { BridgeSession, BridgeDayPlan } from "@/lib/timetable-memo-bridge";
import {
  clampSessionNumber,
  isComponentAxisSubject,
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
import { mondayOfIso } from "@/lib/moroccan-calendar";

/** ترتيب أيام العمل من الاثنين — يحدد إزاحة التاريخ عن weekStart */
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** مدخلات المولّد */
export interface GenerateWeekInput {
  state: TimetableState;
  catalog: Catalog;
  /** ترتيب المرحلة داخل كل مادة: 0 = المرحلة الأولى */
  stageIndex: number;
  /** رقم الأسبوع التربوي — احتياطي فقط إن لم تُمرَّر cyclePosByDay */
  weekNumber?: number;
  /** تاريخ الاثنين ISO: "2026-11-09" */
  weekStart: string;
  /** أيام غير دراسية: تاريخ ISO ← سبب التخطي. فارغة في هذه المرحلة (المرحلة ٤ تملأها) */
  nonSchoolDays?: Record<string, SkipReason>;
  /** رقم اليوم داخل الدورة لكل يوم في الأسبوع (1..6) */
  cycleDayByDay?: Record<string, number>;
  /** حمل تسلسل الحصص قبل بداية الأسبوع داخل الدورة */
  sessionCarry?: Map<string, number>;
  /** حمل حصص كل ثلاثية قبل بداية كل أسبوع تربوي (المفتاح: `${key}|${week}`) */
  sessionWeekBase?: Map<string, number>;
  /** موضع كل يوم في المرحلة: الأسبوع التربوي + اليوم (يغلب weekNumber) */
  cyclePosByDay?: Record<string, { week: number; day: number }>;
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
  const { state, catalog, stageIndex, weekStart } = input;
  const weekNumber = input.weekNumber ?? 1;
  const nonSchoolDays = input.nonSchoolDays ?? {};
  /* بداية الأسبوع تُطبَّع إلى الاثنين: أي يوم يُختار يعطي نفس الأسبوع */
  const start = mondayOfIso(weekStart);
  const warnings: string[] = [];

  try {
    /* (أ) خطة الأسبوع من الجسر — مرة واحدة */
    /* حدود الدورة: أيام العطلة لا تُحتسب، وأيام «اليوم الأول» تُصفّر العدّاد */
    const skipDays = new Set(
      DAY_ORDER.filter((_, i) => !!nonSchoolDays[addDays(start, i)])
    );
    const plans: BridgeDayPlan[] = buildWeekPlans(state, {
      carry: input.sessionCarry,
      skipDays,
    });

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
      const date = addDays(start, offset < 0 ? 0 : offset);

      /* (ج) يوم غير دراسي → DayDoc بتخطي وبلا حصص */
      const skip = nonSchoolDays[date];
      if (skip) {
        days.push({ date, dayId: plan.day.dayId, skip, lessons: [] });
        continue;
      }

      /* الأسبوع التربوي لهذا اليوم: من الموضع المحسوب، وإلا الاحتياطي */
      const dayWeek = input.cyclePosByDay?.[plan.day.dayId]?.week ?? weekNumber;
      const lessons: LessonDoc[] = [];
      for (let i = 0; i < plan.sessions.length; i++) {
        const session = plan.sessions[i];
        const key = sessionTripleKeyOf(session);
        /* حصص نفس الثلاثية قبل بداية أسبوع هذا اليوم التربوي */
        const base = key
          ? (input.sessionWeekBase?.get(`${key}|${dayWeek}`) ?? 0)
          : 0;
        lessons.push(
          buildLesson(state, session, i, catalog, stageIndex, dayWeek, date, warnings, base)
        );
      }
      days.push({ date, dayId: plan.day.dayId, weekNumber: dayWeek, lessons });
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
      id: start,
      isoWeekStart: start,
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
        id: start,
        isoWeekStart: start,
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

/** مفتاح الثلاثية (مادة+مستوى+فوج) لحصة جسر */
function sessionTripleKeyOf(session: BridgeSession): string | null {
  if (!session.subjectId || !session.levelId) return null;
  return [session.subjectId, session.levelId.trim(), session.group?.trim() || "-"].join("|");
}

function sessionsPerWeekFor(state: TimetableState, session: BridgeSession): number {
  const key = sessionTripleKeyOf(session);
  if (!key) return 0;
  let n = 0;
  for (const day of state.days ?? []) {
    for (const k of sessionTripleKeys(state, day)) if (k === key) n += 1;
  }
  return n;
}

/** بناء حصة واحدة من جلسة الجسر + الفهرس */
function buildLesson(
  state: TimetableState,
  session: BridgeSession,
  lessonIndex: number,
  catalog: Catalog,
  stageIndex: number,
  weekNumber: number,
  date: string,
  warnings: string[],
  weekBase: number
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

  /* الوتيرة:
     - الأسبوع التربوي هو وحدة المحتوى: كل أسبوع يعرض دروسه هو، والحصة الزائدة
       عن عدد الدروس تتكرر على الدرس الأخير (دعم) بدل تكرار عشوائي أو قفز درس.
     - وإلا (حصص الأسبوع ≤ الدروس): يتقدم الدرس مع كل حصة حتى لا يُفقد درس. */
  const lessons = level ? levelSessionCount(level) : 0;
  const lessonCount = Math.max(1, lessons || 1);
  const perWeek = sessionsPerWeekFor(state, session);
  const ord = session.sessionOrdinal || 1;
  const moreSessionsThanLessons = perWeek > lessonCount;
  const contentWeek = moreSessionsThanLessons
    ? weekNumber
    : Math.floor((ord - 1) / lessonCount) + 1;
  const sessionNumber = moreSessionsThanLessons
    ? Math.min(Math.max(1, ord - weekBase), lessonCount)
    : ((ord - 1) % lessonCount) + 1;

  /* الأسبوع: بالمطابقة — وإلا أول أسبوع + تحذير عند الاختلاف */
  let week: LevelWeek | null = null;
  if (stage) {
    week = stage.weeks.find((w) => w.weekNumber === contentWeek) ?? stage.weeks[0] ?? null;
    if (week && week.weekNumber !== contentWeek) {
      warnings.push(
        `الأسبوع المطلوب (${contentWeek}) غير متوفر في ${session.subjectName} — ` +
          `استُعمل الأسبوع (${week.weekNumber})`
      );
    } else if (!week) {
      warnings.push(`لا توجد أسابيع في توزيع المادة: (${session.subjectName})`);
    }
  }

  /* المصدر: يوم التوزيع الموافق لرقم الحصة */
  const sourceDay = level && week ? sessionSourceDay(week, sessionNumber) : undefined;

  /* المكوّن والمحور: مادة تحمل محورًا (مثل النشاط العلمي) تُعرض باسمها والمحور أسفلها */
  const axisSubject = isComponentAxisSubject(catalog.config, session.subjectCode ?? undefined);
  const subjectName =
    level?.subject_ar || group?.name_ar || session.subjectId || "";
  const axis = sourceDay?.component || (stage?.theme_ar ?? "") || "";
  const component = axisSubject ? subjectName : axis || subjectName;

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
    componentAxis: axisSubject ? axis : "",
    topic: sourceDay?.content.topic_ar ?? "",
    objectives: sourceDay?.content.objectives_ar ?? "",
    stages: sourceDay?.content.stages_ar ?? "",
    materials: sourceDay?.content.materials_ar,
    edited: false,
  };
}
