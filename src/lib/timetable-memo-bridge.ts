/* ============================================================
   جسر استعمال الزمن ← المذكرة اليومية (طبقة وسيطة للقراءة فقط)
   ------------------------------------------------------------
   • تقرأ حالة مولّد استعمال الزمن وتحوّلها إلى بيانات وسيطة
     جاهزة لبناء مذكرة يومية لاحقًا — دون تعديل أي بيانات أصلية.
   • دوال نقية باستثناء readTimetableState: الحد غير النقي الوحيد
     (قراءة localStorage فقط — لا كتابة ولا تعديل إطلاقًا).
   • لا تلمس مسودات المذكرة ولا ملفات التوزيعات (node:fs) ولا
     واجهات الأداتين؛ محتوى التوزيعات الرسمي لا يُستورد هنا.
   • أي فشل (غياب بيانات، JSON غير صالح، بنية قديمة) يعيد null
     أو قيمًا آمنة — لا يرمي أخطاء ولا يكسر الصفحة.
   ============================================================ */
import { DAY_BY_ID, isValidLevelNumber, parseLevelNumber } from "@/components/timetable/defaults";
import {
  dayLessonCount,
  dayPeriods,
  durationOf,
  periodBlock,
} from "@/components/timetable/schedule";
import { parseImported, STORAGE_KEY } from "@/components/timetable/store";
import type { DayId, LevelEntry, Period, TimetableState } from "@/components/timetable/types";
import { timeToMin } from "@/components/timetable/utils";

/* ============================ الأنواع ============================ */

/** نصف اليوم في المذكرة — يطابق MemoBlock في daily-memo/types.ts */
export type BridgeBlock = "morning" | "afternoon";

/** يوم قابل للتوليد من استعمال الزمن */
export interface BridgeDay {
  dayId: DayId;
  /** مفتاح اليوم في توزيعات التعليم الصريح: lundi…samedi (مطابقة مغلقة) */
  dayKey: string;
  /** اسم اليوم بالعربية كما في المولّد */
  label: string;
  /** عدد الحصص في اليوم (بلا استراحات) */
  lessonCount: number;
}

/**
 * حصة وسيطة: كل ما تحتاجه المذكرة لاحقًا عدا محتوى التوزيع
 * (الموضوع والأهداف والمراحل تُستمد في خطوة لاحقة من Catalog).
 */
export interface BridgeSession {
  /** معرّف الفترة الأصلي في استعمال الزمن */
  periodId: string;
  start: string;
  end: string;
  /** المدة بالدقائق (0 إذا كان التوقيت غير صالح) */
  durationMinutes: number;
  block: BridgeBlock;
  subjectId: string | null;
  /** اسم المادة كما في المولّد (فارغة إن لم توجد المادة) */
  subjectName: string;
  /** رمز التوزيع الرسمي المقابل؛ null = مادة حرة بلا توزيع */
  subjectCode: string | null;
  levelId: string | undefined;
  /** اسم المستوى كما كتبه الأستاذ في المولّد */
  levelName: string | undefined;
  /** رقم المستوى (1–6) المُتحقق منه أو المشتق؛ undefined = اسم حر */
  levelNumber: number | undefined;
  group: string | undefined;
  note: string | undefined;
  /**
   * ترتيب الحصة بين حصص الثلاثية نفسها (مادة+مستوى+فوج) عبر أيام
   * الأسبوع من البداية حتى هذا اليوم شاملًا (يبدأ من 1).
   * 0 = لا تسلسل (مادة حرة، أو بلا مادة، أو بلا مستوى محدد/معروف).
   */
  sessionOrdinal: number;
  /** مدة الاستراحة بعد هذه الحصة بالدقائق (0 = بلا استراحة، بسقف 180) */
  breakMinutesAfter: number;
}

/** خطة يوم واحد وسيطة */
export interface BridgeDayPlan {
  day: BridgeDay;
  /** حصص اليوم بترتيب زمني، بلا استراحات */
  sessions: BridgeSession[];
}

/* ============================ المطابقات المغلقة ============================ */

/** ترتيب الأيام القانوني في المولّد: الاثنين → السبت */
const LEGAL_DAY_ORDER: DayId[] = ["mon", "tue", "wed", "thu", "fri", "sat"];

/**
 * جدول مطابقة الأيام المغلق: DayId في المولّد ↔ dayKey في توزيعات
 * التعليم الصريح (config.json weekDays). الطرفان مجموعتان محددتان.
 */
const DAY_KEY_BY_ID: Record<DayId, string> = {
  mon: "lundi",
  tue: "mardi",
  wed: "mercredi",
  thu: "jeudi",
  fri: "vendredi",
  sat: "samedi",
};

/**
 * رمز التوزيع الرسمي لكل مادة معروفة في المولّد.
 * المواد الغائبة (fr, isl, soc, sport, art أو أي معرّف مجهول) تُعامل
 * كمواد حرة: حصصها تبقى بموضوع فارغ ولا تُربط بتوزيع.
 */
const SUBJECT_CODE_BY_ID: Record<string, string> = {
  math: "math",
  ar: "arabic",
  sci: "science",
  amz: "tamazight",
};

/* ============================ القراءة الآمنة ============================ */

/**
 * يقرأ حالة استعمال الزمن من التخزين المحلي ويطبّعها (بما يشمل ترقية
 * الصيغ القديمة عبر parseImported). الحد غير النقي الوحيد في الجسر:
 * قراءة من localStorage فقط — لا يكتب ولا يعدّل أي مفتاح.
 * يعيد null عند غياب البيانات أو فسادها أو حجب التخزين — لا يرمي خطأً أبدًا.
 */
export function readTimetableState(): TimetableState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseImported(raw);
  } catch {
    return null;
  }
}

/** تحويل نص خام (مثل محتوى ملف مشروع مُصدَّر) إلى حالة مطبّعة — دالة نقية. */
export function parseTimetableRaw(raw: string | null | undefined): TimetableState | null {
  if (!raw) return null;
  try {
    return parseImported(raw);
  } catch {
    return null;
  }
}

/* ============================ المطابقة ============================ */

/** مفتاح اليوم في التوزيعات لمعرّف يوم المولّد؛ null لمعرّف مجهول. */
export function dayKeyFor(dayId: DayId): string | null {
  return DAY_KEY_BY_ID[dayId] ?? null;
}

/** رمز التوزيع الرسمي للمادة؛ null = مادة حرة أو بلا مادة. */
export function subjectCodeFor(subjectId: string | null | undefined): string | null {
  if (!subjectId) return null;
  return SUBJECT_CODE_BY_ID[subjectId] ?? null;
}

/**
 * رقم المستوى من مدخل المستوى في المولّد: يُحتفظ بالرقم الصحيح
 * الموجود (1–6) أولاً، وإلا يُشتق من الاسم بحدوده الدقيقة.
 */
export function resolveLevelNumber(
  entry: LevelEntry | undefined | null
): number | undefined {
  if (!entry) return undefined;
  if (isValidLevelNumber(entry.levelNumber)) return entry.levelNumber;
  return parseLevelNumber(entry.name);
}

/* ============================ التسلسل ============================ */

/**
 * مفتاح التسلسل: المادة+المستوى+الفوج.
 * لا يُنشأ مفتاح (بلا تسلسل) في الحالات التالية:
 * - مادة حرة أو حصة بلا مادة (التسلسل يخص دروس التوزيعات الرسمية وحدها).
 * - levelId غير محدد أو فارغ أو غير معروف في state.info.levels.
 * الفوج الفارغ أو المكوّن من مسافات يعامل كالفوج غير المحدد.
 */
function ordinalKey(period: Period, knownLevelIds: Set<string>): string | null {
  if (!subjectCodeFor(period.subjectId)) return null;
  const levelId = period.levelId?.trim();
  if (!levelId || !knownLevelIds.has(levelId)) return null;
  const group = period.group?.trim() || "-";
  return [period.subjectId, levelId, group].join("|");
}

/**
 * ترتيب كل حصة من حصص اليوم بين حصص الثلاثية نفسها (مادة+مستوى+فوج)
 * عبر أيام الأسبوع بالترتيب القانوني من البداية حتى هذا اليوم شاملًا.
 * الاستراحات والحصص الفارغة والحصص بلا مستوى معروف لا تُحتسب إطلاقًا.
 *
 * الخريطة تُفتح على مرجع كائن Period نفسه لا على period.id:
 * dayPeriods() تنسخ المصفوفة وتحتفظ بمراجع الكائنات الأصلية، فتبقى
 * الحصتان ذواتا المعرّف المكرر داخل اليوم كائنين مستقلين لكلٍّ ترتيبه —
 * وبهذا لا يضيع رقم تسلسلي حتى مع JSON فيه معرّفات مكررة.
 */
function sessionOrdinalsForDay(
  state: TimetableState,
  dayId: DayId
): Map<Period, number> {
  const counters = new Map<string, number>();
  const result = new Map<Period, number>();
  const days = LEGAL_DAY_ORDER.filter((d) => state.days?.includes(d));
  const stopIndex = days.indexOf(dayId);
  if (stopIndex < 0) return result;
  /* المعرّفات الفعلية للمستويات — الحصة ذات levelId مجهول لا تُحتسب في أي تسلسل */
  const knownLevelIds = new Set(
    (state.info?.levels ?? [])
      .map((level) => level.id)
      .filter((id): id is string => !!id)
  );
  for (const day of days.slice(0, stopIndex + 1)) {
    for (const period of dayPeriods(state, day)) {
      if (period.isBreak) continue;
      const key = ordinalKey(period, knownLevelIds);
      if (!key) continue;
      const next = (counters.get(key) ?? 0) + 1;
      counters.set(key, next);
      if (day === dayId) result.set(period, next);
    }
  }
  return result;
}

/** الاستراحة بعد الحصة: الفجوة إلى بداية أول حصة تالية (بسقف 180 د مثل المذكرة). */
function gapToNextLesson(sortedPeriods: Period[], lessonIndex: number): number {
  for (let i = lessonIndex + 1; i < sortedPeriods.length; i++) {
    const next = sortedPeriods[i];
    if (next.isBreak) continue;
    const end = timeToMin(sortedPeriods[lessonIndex]?.end);
    const start = timeToMin(next.start);
    if (end === null || start === null) return 0;
    return Math.max(0, Math.min(180, start - end));
  }
  return 0;
}

/* ============================ التحويل ============================ */

/** أيام عمل الأستاذ بالترتيب القانوني مع عدد حصص كل يوم. */
export function listBridgeDays(state: TimetableState): BridgeDay[] {
  const days = state?.days ?? [];
  return LEGAL_DAY_ORDER.filter((dayId) => days.includes(dayId)).map((dayId) => ({
    dayId,
    dayKey: DAY_KEY_BY_ID[dayId],
    label: DAY_BY_ID[dayId],
    lessonCount: dayLessonCount(state, dayId),
  }));
}

/**
 * خطة يوم واحد وسيطة من استعمال الزمن.
 * يعيد null إن لم يكن اليوم ضمن أيام العمل أو لم توجد حصص فيه.
 * لا يعدّل الحالة الأصلية إطلاقًا (dayPeriods تعمل على نسخة مرتبة).
 */
export function buildDayPlan(
  state: TimetableState,
  dayId: DayId
): BridgeDayPlan | null {
  if (!state || !DAY_KEY_BY_ID[dayId]) return null;
  if (!state.days?.includes(dayId)) return null;

  /* الفترات مرتبة زمنيًا على نسخة؛ نحتفظ بفهرس كل حصة داخل مصفوفة
     الفترات الكاملة حتى تُحسب الفجوة إلى الحصة التالية بدقة عبر
     الاستراحات المعرّفة. */
  const periods = dayPeriods(state, dayId);
  const lessonEntries = periods
    .map((period, index) => ({ period, index }))
    .filter((entry) => !entry.period.isBreak);
  if (!lessonEntries.length) return null;

  const levelsById = new Map(
    (state.info?.levels ?? []).map((level) => [level.id, level])
  );
  const ordinals = sessionOrdinalsForDay(state, dayId);

  const sessions: BridgeSession[] = lessonEntries.map(({ period, index }) => {
    const level = period.levelId ? levelsById.get(period.levelId) : undefined;
    const isAfternoon = periodBlock(state.timing, period) === "afternoon";
    const subject = period.subjectId
      ? state.subjects?.find((s) => s.id === period.subjectId)
      : undefined;
    return {
      periodId: period.id,
      start: period.start,
      end: period.end,
      durationMinutes: durationOf(period),
      block: isAfternoon ? "afternoon" : "morning",
      subjectId: period.subjectId ?? null,
      subjectName: subject?.name ?? "",
      subjectCode: subjectCodeFor(period.subjectId),
      levelId: period.levelId,
      levelName: level?.name,
      levelNumber: resolveLevelNumber(level),
      group: period.group,
      note: period.note,
      sessionOrdinal: ordinals.get(period) ?? 0,
      breakMinutesAfter: gapToNextLesson(periods, index),
    };
  });

  return {
    day: {
      dayId,
      dayKey: DAY_KEY_BY_ID[dayId],
      label: DAY_BY_ID[dayId],
      lessonCount: sessions.length,
    },
    sessions,
  };
}

/** خطاطة الأسبوع كاملة: خطة كل يوم مبرمج (له حصص) بالترتيب القانوني. */
export function buildWeekPlans(state: TimetableState): BridgeDayPlan[] {
  return listBridgeDays(state)
    .filter((day) => day.lessonCount > 0)
    .map((day) => buildDayPlan(state, day.dayId))
    .filter((plan): plan is BridgeDayPlan => plan !== null);
}
