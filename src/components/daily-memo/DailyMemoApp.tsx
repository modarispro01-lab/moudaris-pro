"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpenCheck,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  Printer,
  Save,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import MemoEditor from "./MemoEditor";
import MemoSheet from "./MemoSheet";
import SheetPreview from "./SheetPreview";
import WeekMap from "./WeekMap";
import type {
  Catalog,
  LevelData,
  LevelDay,
  LevelStage,
  LevelWeek,
  LessonKind,
  LessonSubjectOption,
  MemoBlock,
  MemoLesson,
  MemoSelection,
  MemoState,
  Preferences,
  Profile,
} from "./types";
import {
  baseDraftKey,
  clampSessionNumber,
  cx,
  DEFAULT_GROUP_LABELS,
  defaultGroupsForLevels,
  draftKey,
  findDay,
  findLevel,
  findStage,
  findWeek,
  groupsForLevel,
  legacyDraftKey,
  lessonBreakMinutes,
  levelSessionCount,
  minutesToTime,
  normalizeGroupLabels,
  periodLabel,
  sessionLabel,
  sessionNumberForDay,
  sessionSourceDay,
  timeToMinutes,
  todayIso,
  uid,
} from "./types";

const EMPTY_PROFILE: Profile = {
  institution: "",
  teacher: "",
  director: "",
  inspector: "",
  academicYear: "",
  section: "",
};

function defaultAcademicYear(): string {
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}/${year + 1}`;
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* المتصفح قد يمنع التخزين في وضع التصفح الخاص */
  }
}

function firstDay(week: LevelWeek | undefined): LevelDay | undefined {
  return (
    week?.days.find((day) => day.kind !== "empty" && day.content.topic_ar.trim()) ??
    week?.days[0]
  );
}

function firstSelection(catalog: Catalog): MemoSelection {
  const subject =
    catalog.subjects.find((item) => item.code === catalog.config.defaultSubjectCode) ??
    catalog.subjects[0];
  const level = subject?.levels[0];
  const stage = level?.stages[0];
  const week = stage?.weeks[0];
  const day = firstDay(week);
  const levels = [level?.level ?? 1];
  return {
    subjectCode: subject?.code || catalog.template.subjectCode || "math",
    levels,
    level: level?.level ?? 1,
    groupsByLevel: defaultGroupsForLevels(levels),
    period: "morning",
    stageId: stage?.id || "stage-1",
    weekNumber: week?.weekNumber ?? 1,
    dayKey: day?.dayKey || "lundi",
    sessionNumber: 1,
  };
}

function sameLevels(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function sameGroups(
  a: Record<number, string[]>,
  b: Record<number, string[]>
): boolean {
  const keysA = Object.keys(a).map(Number).sort((x, y) => x - y);
  const keysB = Object.keys(b).map(Number).sort((x, y) => x - y);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(
    (key, index) =>
      key === keysB[index] &&
      a[key].length === b[key]?.length &&
      a[key].every((label, labelIndex) => label === b[key][labelIndex])
  );
}

/**
 * يبني خريطة أفواج كاملة للمستويات المختارة. المستوى الجديد يبدأ بالفوج
 * الأول، ثم يختار الأستاذ(ة) بقية الأفواج من الشريط العلوي.
 */
function groupsMapForLevels(
  selection: MemoSelection,
  levels: number[]
): Record<number, string[]> {
  const next: Record<number, string[]> = {};
  for (const levelNumber of levels) {
    const existing = normalizeGroupLabels(
      selection.groupsByLevel?.[levelNumber]
    );
    next[levelNumber] = existing.length
      ? groupsForLevel(selection, levelNumber)
      : [DEFAULT_GROUP_LABELS[0]];
  }
  return next;
}

/** يعيد اختيارًا كاملًا للمستوى النشط مع الحفاظ على المرحلة والأسبوع واليوم إن أمكن. */
function selectionForLevel(
  catalog: Catalog,
  base: MemoSelection,
  levelNumber: number,
  levels: number[]
): MemoSelection {
  const nextLevel = catalog.subjects
    .find((subject) => subject.code === base.subjectCode)
    ?.levels.find((item) => item.level === levelNumber);
  const stage =
    nextLevel?.stages.find((item) => item.id === base.stageId) ??
    nextLevel?.stages[0];
  const week =
    stage?.weeks.find((item) => item.weekNumber === base.weekNumber) ??
    stage?.weeks[0];
  const day =
    week?.days.find((item) => item.dayKey === base.dayKey) ?? firstDay(week);
  return {
    ...base,
    levels,
    level: levelNumber,
    stageId: stage?.id || base.stageId,
    weekNumber: week?.weekNumber ?? base.weekNumber,
    dayKey: day?.dayKey || base.dayKey,
  };
}

function withPeriod(memo: MemoState, period: MemoBlock): MemoState {
  return {
    ...memo,
    period,
    lessons: memo.lessons.map((lesson) => ({ ...lesson, block: period })),
  };
}

function nextSlot(
  lessons: MemoLesson[],
  block: MemoBlock
): { block: MemoBlock; timeFrom: string; timeTo: string } {
  const base = (block === "morning" ? 8 : 14) * 60;
  const last = lessons[lessons.length - 1];
  const lastEnd = last ? timeToMinutes(last.timeTo) : null;
  const start =
    lastEnd == null
      ? base
      : Math.max(base, lastEnd + lessonBreakMinutes(last));
  return {
    block,
    timeFrom: minutesToTime(start),
    timeTo: minutesToTime(start + 60),
  };
}

interface CombinedPlan {
  level: LevelData;
  stage: LevelStage;
  week: LevelWeek;
  sourceDay?: LevelDay;
  hasLesson: boolean;
}

/**
 * يجلب المرحلة والأسبوع ومصدر محتوى الحصة المختارة لكل مستوى.
 * اليوم الفعلي لا يدخل في اختيار المحتوى؛ الحصة وحدها تحدد الدرس.
 */
function planForLevel(
  catalog: Catalog,
  selection: MemoSelection,
  levelNumber: number
): CombinedPlan | null {
  const level = catalog.subjects
    .find((subject) => subject.code === selection.subjectCode)
    ?.levels.find((item) => item.level === levelNumber);
  if (!level) return null;
  const stage =
    level.stages.find((item) => item.id === selection.stageId) ?? level.stages[0];
  const week =
    stage?.weeks.find((item) => item.weekNumber === selection.weekNumber) ??
    stage?.weeks[0];
  if (!stage || !week) return null;
  const sourceDay =
    selection.sessionNumber <= levelSessionCount(level)
      ? sessionSourceDay(week, selection.sessionNumber)
      : undefined;
  return {
    level,
    stage,
    week,
    sourceDay,
    hasLesson: !!sourceDay,
  };
}

interface LessonContentSnapshot {
  topic: string;
  component: string;
  kind: LessonKind;
  sourceLessonNumber: number | null;
  sourceDayKey?: string;
  hasSource: boolean;
}

/** مكونات مادة ما في مستوى محدد، مستقاة من محاور المراحل ودروس التوزيع. */
function componentOptionsForLevel(level: LevelData): string[] {
  return Array.from(
    new Set(
      level.stages
        .flatMap((stageItem) => [
          stageItem.theme_ar?.trim() ?? "",
          ...stageItem.weeks.flatMap((weekItem) =>
            weekItem.days
              .filter((dayItem) => dayItem.kind === "lesson")
              .map((dayItem) => dayItem.component?.trim() ?? "")
          ),
        ])
        .filter(Boolean)
    )
  );
}

/** يجهّز خيارات المادة لكل بطاقة حصة، مع مكونات كل مستوى على حدة. */
function buildSubjectOptions(catalog: Catalog): LessonSubjectOption[] {
  return catalog.subjects.map((subject) => {
    const levels = subject.levels.map((item) => ({
      level: item.level,
      label: item.levelLabel_ar,
      componentOptions: componentOptionsForLevel(item),
    }));
    return {
      code: subject.code,
      name: subject.name_ar,
      structuredComponents: levels.some(
        (item) => item.componentOptions.length > 0
      ),
      levels,
    };
  });
}

function subjectNameFor(catalog: Catalog, code: string | undefined): string {
  return (
    catalog.subjects.find((subject) => subject.code === code)?.name_ar ||
    code ||
    ""
  );
}

/** أقصى عدد حصص متاح للمستوى عبر كل المواد، حتى تبقى شرائح الحصة صالحة للرياضيات. */
function maxSessionCountForLevel(catalog: Catalog, levelNumber: number): number {
  return Math.max(
    1,
    ...catalog.subjects.map((subject) =>
      levelSessionCount(
        subject.levels.find((item) => item.level === levelNumber)
      )
    )
  );
}

/**
 * المحتوى الذي يقترحه توزيع مادة معيّنة للحصة المحددة.
 * لا يُستعمل التكرار من حصة سابقة إذا كان رقم الحصة يتجاوز حصص المادة.
 */
function lessonAutoContent(
  catalog: Catalog,
  subjectCode: string | undefined,
  levelNumber: number,
  selection: MemoSelection,
  sessionNumber: number
): LessonContentSnapshot {
  const subject = catalog.subjects.find((item) => item.code === subjectCode);
  const level =
    subject?.levels.find((item) => item.level === levelNumber) ??
    subject?.levels[0];
  const stage =
    level?.stages.find((item) => item.id === selection.stageId) ??
    level?.stages[0];
  const week =
    stage?.weeks.find((item) => item.weekNumber === selection.weekNumber) ??
    stage?.weeks[0];
  const source =
    week && sessionNumber <= levelSessionCount(level)
      ? sessionSourceDay(week, sessionNumber)
      : undefined;
  const name =
    subject?.name_ar ||
    level?.subject_ar ||
    level?.subject ||
    subjectCode ||
    "";
  return {
    topic: source?.content.topic_ar ?? "",
    component: source?.component || stage?.theme_ar || name,
    kind: source?.kind ?? "lesson",
    sourceLessonNumber: source?.lessonNumber ?? null,
    sourceDayKey: source?.dayKey,
    hasSource: !!source,
  };
}

/**
 * يبدّل مادة الحصة أو مستواها مع تحديث المحتوى المستخرج من التوزيع.
 * يُحافظ على ما كتبه الأستاذ(ة) بيده إذا خالف المحتوى التلقائي القديم.
 */
function refreshedLessonContent(
  previous: MemoLesson,
  nextSubjectCode: string | undefined,
  nextLevelNumber: number,
  selection: MemoSelection,
  catalog: Catalog
): Partial<MemoLesson> {
  if (!nextSubjectCode) return { subjectCode: undefined };
  const sessionNumber = previous.sessionNumber ?? selection.sessionNumber;
  const oldAuto = lessonAutoContent(
    catalog,
    previous.subjectCode ?? selection.subjectCode,
    previous.levelNumber ?? selection.level,
    selection,
    sessionNumber
  );
  const newAuto = lessonAutoContent(
    catalog,
    nextSubjectCode,
    nextLevelNumber,
    selection,
    sessionNumber
  );
  const topicIsAuto =
    !previous.topic.trim() || previous.topic === oldAuto.topic;
  const componentIsAuto =
    !previous.component.trim() || previous.component === oldAuto.component;
  return {
    subjectCode: nextSubjectCode,
    topic: topicIsAuto ? newAuto.topic : previous.topic,
    component: componentIsAuto ? newAuto.component : previous.component,
    kind: newAuto.kind,
    sourceLessonNumber: newAuto.sourceLessonNumber,
    sourceDayKey: newAuto.sourceDayKey,
  };
}

function combinedLesson(
  plan: CombinedPlan,
  selection: MemoSelection,
  profile: Profile,
  catalog: Catalog,
  startMinute: number,
  sessionNumber: number,
  groupLabel: string
): MemoLesson {
  const sourceDay = plan.sourceDay;
  return {
    id: uid(),
    block: selection.period,
    timeFrom: minutesToTime(startMinute),
    timeTo: minutesToTime(startMinute + 60),
    section: profile.section,
    subjectCode: selection.subjectCode,
    component:
      sourceDay?.component ||
      plan.stage.theme_ar ||
      plan.level.subject_ar ||
      plan.level.subject ||
      catalog.template.subject_ar,
    topic: sourceDay?.content.topic_ar ?? "",
    objectives: "",
    stages: "",
    session: sessionLabel(sessionNumber),
    sessionNumber,
    rj: "",
    sourceLessonNumber: sourceDay?.lessonNumber ?? null,
    sourceDayKey: sourceDay?.dayKey,
    kind: sourceDay?.kind ?? "lesson",
    breakMinutes: 0,
    levelNumber: plan.level.level,
    levelLabel: plan.level.levelLabel_ar,
    groupLabel,
  };
}

/** هل تستعمل المذكرة صفوف المستوى/الفوج (تعدد مستويات أو أفواج)؟ */
function isGroupedSelection(selection: MemoSelection): boolean {
  if (selection.levels.length > 1) return true;
  return selection.levels.some(
    (levelNumber) => groupsForLevel(selection, levelNumber).length > 1
  );
}

/** هل تمثّل الحصة المصدر نفسه لمستوى وفوج وحصة معيّنة؟ */
function lessonMatchesTarget(
  lesson: MemoLesson,
  selection: MemoSelection,
  sourceDay: LevelDay,
  levelNumber: number,
  sessionNumber: number,
  subjectCode: string,
  groupLabel: string
): boolean {
  if (lesson.kind === "empty") return false;
  if ((lesson.subjectCode ?? selection.subjectCode) !== subjectCode) {
    return false;
  }
  const sameSource =
    lesson.sessionNumber != null
      ? lesson.sessionNumber === sessionNumber
      : lesson.sourceDayKey === sourceDay.dayKey &&
        (lesson.sourceLessonNumber ?? null) === (sourceDay.lessonNumber ?? null);
  if (!sameSource) return false;
  const levelMatches =
    selection.levels.length > 1
      ? lesson.levelNumber === levelNumber
      : lesson.levelNumber == null || lesson.levelNumber === levelNumber;
  if (!levelMatches) return false;
  return (lesson.groupLabel?.trim() || groupLabel) === groupLabel;
}

/**
 * يبني مذكرة الحصة من التوزيع حسب المستويات والأفواج المختارة:
 * حصة مستقلة لكل فوج، وتتناوب المستويات في كل جولة كما كان في المذكرة
 * المشتركة، مع استراحة بعد الجولة الأولى حين توجد جولة أخرى.
 */
function buildGroupedMemo(
  catalog: Catalog,
  selection: MemoSelection,
  profile: Profile
): MemoState | null {
  const plans = selection.levels
    .map((levelNumber) => planForLevel(catalog, selection, levelNumber))
    .filter((plan): plan is CombinedPlan => !!plan);
  if (!plans.length) return null;

  const activePlan =
    plans.find((plan) => plan.level.level === selection.level) ?? plans[0];
  const displayDay =
    findDay(activePlan.week, selection.dayKey) ?? activePlan.sourceDay;
  const scheduled = plans.filter((plan) => plan.hasLesson);
  /* إن لم توجد حصة في التوزيع نُبقي صفوفًا فارغة قابلة للكتابة، كما كان
     الشأن في الحصص العلمية 3–5، بدل إرجاع مذكرة بلا حصص. */
  const targets = scheduled.length ? scheduled : plans;
  const groupCounts = targets.map(
    (plan) => groupsForLevel(selection, plan.level.level).length
  );
  const roundCount = Math.max(1, ...groupCounts);
  const lessons: MemoLesson[] = [];
  let cursor = (selection.period === "morning" ? 8 : 14) * 60;

  for (let round = 0; round < roundCount; round++) {
    const roundLessons: MemoLesson[] = [];
    targets.forEach((plan) => {
      const groups = groupsForLevel(selection, plan.level.level);
      /* كل فوج يظهر مرة واحدة فقط؛ المستوى الذي له فوج واحد لا يتكرر
         في جولة ثانية. ترتيب الأفواج داخل كل مستوى يبقى ثابتًا:
         الفوج الأول ثم الثاني ثم الأفواج المخصّصة. */
      if (round >= groups.length) return;
      const groupLabel = groups[round];
      const lesson = combinedLesson(
        plan,
        selection,
        profile,
        catalog,
        cursor,
        selection.sessionNumber,
        groupLabel
      );
      cursor += 60;
      roundLessons.push(lesson);
      lessons.push(lesson);
    });
    if (round < roundCount - 1 && roundLessons.length) {
      const last = roundLessons[roundLessons.length - 1];
      last.breakMinutes = 15;
      cursor += 15;
    }
  }

  return {
    institution: profile.institution,
    teacher: profile.teacher,
    director: profile.director,
    inspector: profile.inspector,
    academicYear: profile.academicYear || defaultAcademicYear(),
    level: plans.map((plan) => plan.level.levelLabel_ar).join(" · "),
    stage: activePlan.stage.title_ar,
    subject:
      activePlan.level.subject_ar ||
      activePlan.level.subject ||
      catalog.template.subject_ar,
    date: todayIso(),
    unit: "",
    week: activePlan.week.title_ar,
    day: displayDay?.label_ar ?? "",
    section: profile.section,
    notes: "",
    period: selection.period,
    showNotes: true,
    showSignatures: true,
    showDismissal: isGroupedSelection(selection) && lessons.length > 0,
    sessionNumber: selection.sessionNumber,
    lessons,
  };
}

function buildMemo(
  catalog: Catalog,
  selection: MemoSelection,
  profile: Profile
): MemoState | null {
  return buildGroupedMemo(catalog, selection, profile);
}

/** يهيّئ مسودة محفوظة للاختيار الحالي ويحوّل المسودات القديمة إلى نموذج الحصة. */
function prepareDraft(memo: MemoState, selection: MemoSelection): MemoState {
  return {
    ...withPeriod(memo, selection.period),
    sessionNumber: selection.sessionNumber,
    lessons: memo.lessons.map((lesson) => ({
      ...lesson,
      subjectCode: lesson.subjectCode || selection.subjectCode,
      ...(lesson.sessionNumber == null
        ? {
            sessionNumber: selection.sessionNumber,
            session: sessionLabel(selection.sessionNumber),
          }
        : {}),
    })),
  };
}

/**
 * يبحث عن مسودة الحصة الحالية. إن لم يجد المفتاح الجديد يستعمل مفتاح
 * النسخة القديمة (المبني على اليوم) فقط عندما يطابق اليوم رقم الحصة،
 * حتى لا تُحمّل عبارة درس يوم آخر على الحصة المختارة.
 */
function storedDraftFor(
  catalog: Catalog,
  drafts: Record<string, MemoState>,
  selection: MemoSelection,
  allowUngrouped = false
): MemoState | undefined {
  const direct = drafts[draftKey(selection)];
  if (direct) return prepareDraft(direct, selection);

  /* المسودات المحفوظة قبل إضافة اختيار الأفواج كانت بمفتاح دون جزء الأفواج. */
  if (allowUngrouped) {
    const ungrouped = drafts[baseDraftKey(selection)];
    if (ungrouped) return prepareDraft(ungrouped, selection);
  }

  const legacy = drafts[legacyDraftKey(selection)];
  if (!legacy) return undefined;
  const level = findLevel(catalog, selection);
  const stage = findStage(level, selection.stageId);
  const week = findWeek(stage, selection.weekNumber);
  if (sessionNumberForDay(week, selection.dayKey) !== selection.sessionNumber) {
    return undefined;
  }
  return prepareDraft(legacy, selection);
}

export default function DailyMemoApp({ catalog }: { catalog: Catalog }) {
  const initialSelection = useMemo(() => firstSelection(catalog), [catalog]);
  const [selection, setSelection] = useState<MemoSelection>(initialSelection);
  const [browseSubjectCode, setBrowseSubjectCode] = useState(
    initialSelection.subjectCode
  );
  const [memo, setMemo] = useState<MemoState | null>(null);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);
  const [groupEditor, setGroupEditor] = useState<number | null>(null);
  const [groupDraft, setGroupDraft] = useState<Record<number, string>>({});
  const draftsRef = useRef<Record<string, MemoState>>({});
  const hydratedRef = useRef(false);

  const profileKey =
    catalog.config.storage?.profileKey || "mp_daily_memo_profile_v1";
  const draftsKey = catalog.config.storage?.draftsKey || "mp_daily_memo_drafts_v1";
  const prefsKey =
    catalog.config.storage?.preferencesKey || "mp_daily_memo_preferences_v1";

  const level = useMemo(
    () => findLevel(catalog, selection),
    [catalog, selection]
  );
  const stage = useMemo(
    () => findStage(level, selection.stageId),
    [level, selection.stageId]
  );
  const week = useMemo(
    () => findWeek(stage, selection.weekNumber),
    [stage, selection.weekNumber]
  );
  const day = useMemo(
    () => findDay(week, selection.dayKey),
    [week, selection.dayKey]
  );

  /** المستويات مشتركة بين المواد المتاحة؛ الرياضيات والنشاط العلمي يستعملان 1–6. */
  const allLevels = useMemo(() => {
    const byLevel = new Map<number, string>();
    for (const subject of catalog.subjects) {
      for (const item of subject.levels) {
        if (!byLevel.has(item.level)) byLevel.set(item.level, item.levelLabel_ar);
      }
    }
    return Array.from(byLevel.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([levelNumber, label]) => ({ level: levelNumber, label }));
  }, [catalog]);

  const sessionNumbers = useMemo(() => {
    const max = maxSessionCountForLevel(catalog, selection.level);
    return Array.from({ length: max }, (_, index) => index + 1);
  }, [catalog, selection.level]);

  const subjectOptions = useMemo(() => buildSubjectOptions(catalog), [catalog]);

  const viewMemo = useMemo(() => {
    if (!memo) return null;
    const subjects = Array.from(
      new Set(
        memo.lessons
          .map((lesson) => subjectNameFor(catalog, lesson.subjectCode))
          .filter(Boolean)
      )
    );
    const levels = Array.from(
      new Set(
        memo.lessons
          .map((lesson) => lesson.levelLabel?.trim() ?? "")
          .filter(Boolean)
      )
    );
    return {
      ...memo,
      subject: subjects.length ? subjects.join(" · ") : memo.subject,
      level: levels.length ? levels.join(" · ") : memo.level,
    };
  }, [memo, catalog]);

  const stats = useMemo(() => {
    let levels = 0;
    let stages = 0;
    let weeks = 0;
    let lessons = 0;
    for (const subject of catalog.subjects) {
      levels += subject.levels.length;
      for (const item of subject.levels) {
        stages += item.stages.length;
        for (const stageItem of item.stages) {
          weeks += stageItem.weeks.length;
          for (const weekItem of stageItem.weeks) {
            lessons += weekItem.days.filter(
              (dayItem) => dayItem.kind !== "empty" && dayItem.content.topic_ar.trim()
            ).length;
          }
        }
      }
    }
    return { levels, stages, weeks, lessons };
  }, [catalog]);

  /* تحميل الملف الشخصي والمسودات والتفضيلات مرة واحدة */
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const storedProfile = readStorage<Partial<Profile>>(profileKey, {});
    const mergedProfile: Profile = {
      ...EMPTY_PROFILE,
      academicYear: defaultAcademicYear(),
      ...storedProfile,
    };
    const storedDrafts = readStorage<Record<string, MemoState>>(draftsKey, {});
    draftsRef.current =
      storedDrafts && typeof storedDrafts === "object" ? storedDrafts : {};

    const storedPrefs = readStorage<Partial<Preferences>>(prefsKey, {});
    const subjectCode =
      storedPrefs.subjectCode &&
      catalog.subjects.some((subject) => subject.code === storedPrefs.subjectCode)
        ? storedPrefs.subjectCode
        : initialSelection.subjectCode;
    const availableLevels =
      catalog.subjects.find((subject) => subject.code === subjectCode)
        ?.levels.map((item) => item.level) ?? [];
    const selectedLevels = Array.from(
      new Set(
        (Array.isArray(storedPrefs.levels) ? storedPrefs.levels : []).filter((value) =>
          availableLevels.includes(value)
        )
      )
    ).sort((a, b) => a - b);
    const levels = selectedLevels.length ? selectedLevels : initialSelection.levels;
    const preferredLevel =
      typeof storedPrefs.activeLevel === "number" &&
      levels.includes(storedPrefs.activeLevel)
        ? storedPrefs.activeLevel
        : initialSelection.level;
    const activeLevel = levels.includes(preferredLevel) ? preferredLevel : levels[0];
    const period: MemoBlock = storedPrefs.period === "afternoon" ? "afternoon" : "morning";
    const defaultGroups = defaultGroupsForLevels(levels);
    const storedGroups =
      storedPrefs.groupsByLevel &&
      typeof storedPrefs.groupsByLevel === "object"
        ? storedPrefs.groupsByLevel
        : {};
    const groupsByLevel: Record<number, string[]> = {};
    for (const levelNumber of levels) {
      const labels = normalizeGroupLabels(storedGroups[levelNumber]);
      groupsByLevel[levelNumber] = labels.length
        ? labels
        : defaultGroups[levelNumber];
    }
    const baseSelection: MemoSelection = {
      ...initialSelection,
      subjectCode,
      period,
      levels,
      level: activeLevel,
      groupsByLevel,
      stageId: storedPrefs.stageId || initialSelection.stageId,
      weekNumber:
        typeof storedPrefs.weekNumber === "number"
          ? storedPrefs.weekNumber
          : initialSelection.weekNumber,
      dayKey: storedPrefs.dayKey || initialSelection.dayKey,
      sessionNumber: 1,
    };
    const baseStage = findStage(
      findLevel(catalog, baseSelection),
      baseSelection.stageId
    );
    const baseWeek = findWeek(baseStage, baseSelection.weekNumber);
    const baseSessionLimit = maxSessionCountForLevel(
      catalog,
      baseSelection.level
    );
    /* عند فتح تفضيلات قديمة لا تحمل رقم الحصة، نستنتج الحصة من اليوم
       المحفوظ حتى تبقى عبارة الدرس نفسها التي كان الأستاذ(ة) يعمل عليها. */
    const sessionNumber =
      typeof storedPrefs.sessionNumber === "number"
        ? clampSessionNumber(storedPrefs.sessionNumber, 1, baseSessionLimit)
        : clampSessionNumber(
            sessionNumberForDay(baseWeek, baseSelection.dayKey) ?? 1,
            1,
            baseSessionLimit
          );
    const hydratedSelection = selectionForLevel(
      catalog,
      { ...baseSelection, sessionNumber },
      activeLevel,
      levels
    );

    setProfile(mergedProfile);
    setBrowseSubjectCode(subjectCode);
    setSelection(hydratedSelection);
    const stored = storedDraftFor(
      catalog,
      draftsRef.current,
      hydratedSelection,
      true
    );
    setMemo(stored ?? buildMemo(catalog, hydratedSelection, mergedProfile));
    setMounted(true);
  }, [catalog, draftsKey, initialSelection, prefsKey, profileKey]);

  /* حفظ المستويات المدرّسة والفترة والاختيار الحالي */
  useEffect(() => {
    if (!mounted) return;
    const timer = window.setTimeout(() => {
      const stored = readStorage<Partial<Preferences>>(prefsKey, {});
      writeStorage(prefsKey, {
        ...stored,
        subjectCode: selection.subjectCode,
        levels: selection.levels,
        activeLevel: selection.level,
        groupsByLevel: selection.groupsByLevel,
        period: selection.period,
        stageId: selection.stageId,
        weekNumber: selection.weekNumber,
        dayKey: selection.dayKey,
        sessionNumber: selection.sessionNumber,
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    mounted,
    prefsKey,
    selection.subjectCode,
    selection.levels,
    selection.level,
    selection.groupsByLevel,
    selection.period,
    selection.stageId,
    selection.weekNumber,
    selection.dayKey,
    selection.sessionNumber,
  ]);

  /* حفظ الملف الشخصي */
  useEffect(() => {
    if (!mounted) return;
    const timer = window.setTimeout(() => writeStorage(profileKey, profile), 350);
    return () => window.clearTimeout(timer);
  }, [profile, mounted, profileKey]);

  /* حفظ المسودة الحالية */
  useEffect(() => {
    if (!mounted || !memo) return;
    const key = draftKey(selection);
    const timer = window.setTimeout(() => {
      draftsRef.current[key] = memo;
      writeStorage(draftsKey, draftsRef.current);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [memo, selection, mounted, draftsKey]);

  /* إخفاء عنوان الصفحة من رؤوس الطباعة */
  useEffect(() => {
    let previous = document.title;
    const before = () => {
      previous = document.title;
      document.title = " ";
    };
    const after = () => {
      document.title = previous;
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
      document.title = previous;
    };
  }, []);

  /* إشعار مؤقت */
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function persistCurrent() {
    if (!memo) return;
    draftsRef.current[draftKey(selection)] = memo;
    writeStorage(draftsKey, draftsRef.current);
    writeStorage(profileKey, profile);
  }

  function goTo(patch: Partial<MemoSelection>) {
    const next: MemoSelection = {
      ...selection,
      ...patch,
    };
    /* رقم الحصة مساحة مشتركة بين المواد: الرياضيات تبلغ 5 حصص
       والنشاط العلمي حصتين، وقد تختلف مادة كل حصة داخل المذكرة نفسها. */
    next.sessionNumber = clampSessionNumber(
      patch.sessionNumber ?? selection.sessionNumber,
      1,
      maxSessionCountForLevel(catalog, next.level)
    );
    if (
      next.subjectCode === selection.subjectCode &&
      next.level === selection.level &&
      sameLevels(next.levels, selection.levels) &&
      sameGroups(next.groupsByLevel, selection.groupsByLevel) &&
      next.period === selection.period &&
      next.stageId === selection.stageId &&
      next.weekNumber === selection.weekNumber &&
      next.dayKey === selection.dayKey &&
      next.sessionNumber === selection.sessionNumber
    ) {
      return;
    }
    if (memo) {
      draftsRef.current[draftKey(selection)] = memo;
      writeStorage(draftsKey, draftsRef.current);
    }
    const stored = storedDraftFor(catalog, draftsRef.current, next);
    setSelection(next);
    setMemo(stored ?? buildMemo(catalog, next, profile));
  }

  /** تبديل المادة التي تعرضها خريطة الأسبوع فقط، دون المساس بمذكرة الحصص. */
  function changeBrowseSubject(code: string) {
    if (code === browseSubjectCode) return;
    setBrowseSubjectCode(code);
    setToast({
      msg: `خريطة الأسبوع تعرض الآن توزيع ${subjectNameFor(catalog, code)}.`,
      kind: "ok",
    });
  }

  /**
   * يفتح مذكرة المادة المختارة من الخريطة مع الحفاظ على المستوى والمرحلة
   * والأسبوع قدر الإمكان. تُحفظ المذكرة الحالية قبل الانتقال.
   */
  function switchPrimarySubject(code: string, patch: Partial<MemoSelection>) {
    const subject = catalog.subjects.find((item) => item.code === code);
    if (!subject?.levels.length) return;
    const shownLevels = selection.levels.filter((levelNumber) =>
      subject.levels.some((item) => item.level === levelNumber)
    );
    const nextLevels = shownLevels.length
      ? shownLevels
      : [subject.levels[0].level];
    const activeLevel = nextLevels.includes(selection.level)
      ? selection.level
      : nextLevels[0];
    const levelData =
      subject.levels.find((item) => item.level === activeLevel) ??
      subject.levels[0];
    const stage = findStage(
      levelData,
      patch.stageId ?? selection.stageId
    );
    const week = findWeek(stage, patch.weekNumber ?? selection.weekNumber);
    goTo({
      ...patch,
      subjectCode: code,
      levels: nextLevels,
      level: levelData.level,
      groupsByLevel: groupsMapForLevels(selection, nextLevels),
      stageId: stage?.id ?? selection.stageId,
      weekNumber: week?.weekNumber ?? selection.weekNumber,
    });
    setBrowseSubjectCode(code);
  }

  function switchLevel(levelNumber: number) {
    goTo(selectionForLevel(catalog, selection, levelNumber, selection.levels));
  }

  function toggleLevel(levelNumber: number) {
    const selected = selection.levels.includes(levelNumber);
    /* النقر على مستوى مختار وغير نشط يجعله المستوى الحالي بدل إلغائه */
    if (selected && selection.level !== levelNumber) {
      goTo(selectionForLevel(catalog, selection, levelNumber, selection.levels));
      return;
    }
    if (selected && selection.levels.length === 1) {
      setToast({ msg: "اختر مستوى واحدًا على الأقل.", kind: "err" });
      return;
    }
    const levels = selected
      ? selection.levels.filter((value) => value !== levelNumber)
      : [...selection.levels, levelNumber].sort((a, b) => a - b);
    const activeLevel = selected
      ? selection.level === levelNumber
        ? levels[0]
        : selection.level
      : levelNumber;
    const nextSelection = selectionForLevel(
      catalog,
      selection,
      activeLevel,
      levels
    );
    nextSelection.groupsByLevel = groupsMapForLevels(selection, levels);
    goTo(nextSelection);
    if (!selected && levels.length > 1) {
      setToast({
        msg: "تم دمج المستويات المختارة في مذكرة واحدة: حصة لكل فوج مختار، استراحة، ثم الخروج.",
        kind: "ok",
      });
    }
  }

  /** إضافة فوج أو إزالته لمستوى معيّن مع إبقاء فوج واحد على الأقل. */
  function toggleGroup(levelNumber: number, label: string) {
    const current = groupsForLevel(selection, levelNumber);
    const selected = current.includes(label);
    if (selected && current.length === 1) {
      setToast({
        msg: "اختر فوجًا واحدًا على الأقل لكل مستوى مدرّس.",
        kind: "err",
      });
      return;
    }
    const nextGroups = selected
      ? current.filter((item) => item !== label)
      : [...current, label];
    goTo({
      groupsByLevel: {
        ...selection.groupsByLevel,
        [levelNumber]: nextGroups,
      },
    });
    const levelLabel =
      allLevels.find((item) => item.level === levelNumber)?.label ||
      `المستوى ${levelNumber}`;
    setToast({
      msg: selected
        ? `أُزيل ${label} من ${levelLabel}؛ أُعيد توليد الحصص حسب الأفواج المختارة.`
        : `أُضيف ${label} إلى ${levelLabel}؛ أُضيفت حصة مستقلة لهذا الفوج.`,
      kind: "ok",
    });
  }

  /** إضافة فوج باسم مخصّص (مثل: الفوج الثالث أو فوج أ). */
  function addCustomGroup(levelNumber: number, label: string) {
    const clean = normalizeGroupLabels(label)[0];
    if (!clean) return;
    const current = groupsForLevel(selection, levelNumber);
    if (current.includes(clean)) {
      setToast({ msg: `${clean} مختار أصلًا لهذا المستوى.`, kind: "err" });
      return;
    }
    goTo({
      groupsByLevel: {
        ...selection.groupsByLevel,
        [levelNumber]: [...current, clean],
      },
    });
    setGroupEditor(null);
    setGroupDraft((previous) => ({ ...previous, [levelNumber]: "" }));
    setToast({
      msg: `أُضيف ${clean}؛ أُضيفت حصة مستقلة لهذا الفوج.`,
      kind: "ok",
    });
  }

  function changePeriod(period: MemoBlock) {
    if (period === selection.period) return;
    goTo({ period });
    setToast({
      msg: `تم اختيار ${periodLabel(catalog.template, period)} — الورقة مخصصة لها بالكامل.`,
      kind: "ok",
    });
  }

  /** الحصة تحدد موضوع الدرس، واليوم الفعلي يبقى اختيارًا مستقلًا. */
  function changeSession(sessionNumber: number) {
    const nextSession = clampSessionNumber(
      sessionNumber,
      1,
      sessionNumbers.length
    );
    if (nextSession === selection.sessionNumber) return;
    const primaryLevel = findLevel(catalog, selection);
    const hasDistribution = nextSession <= levelSessionCount(primaryLevel);
    goTo({ sessionNumber: nextSession });
    setToast({
      msg: hasDistribution
        ? `تم اختيار ${sessionLabel(nextSession)} — المحتوى من توزيع الأسبوع، واليوم مستقل عن الحصة.`
        : `تم اختيار ${sessionLabel(nextSession)} — لا توجد حصة مقابلة في توزيع المادة؛ اكتب الموضوع يدويًا أو بدّل مادة الحصة.`,
      kind: "ok",
    });
  }

  /** تغيير اليوم يحدّث ترويسة المذكرة فقط ولا يبدّل موضوع الحصة. */
  function changeDay(dayKey: string) {
    if (dayKey === selection.dayKey) return;
    const nextDay = findDay(week, dayKey);
    if (!nextDay) return;
    const updated = memo ? { ...memo, day: nextDay.label_ar } : null;
    setSelection((previous) => ({ ...previous, dayKey: nextDay.dayKey }));
    if (updated) {
      setMemo(updated);
      draftsRef.current[draftKey(selection)] = updated;
      writeStorage(draftsKey, draftsRef.current);
    }
    setToast({
      msg: `تم تغيير يوم الإنجاز إلى ${nextDay.label_ar}؛ موضوع الحصة لم يتغيّر.`,
      kind: "ok",
    });
  }

  function changeStage(stageId: string) {
    const nextStage = level?.stages.find((item) => item.id === stageId);
    const nextWeek = nextStage?.weeks[0];
    if (!nextStage || !nextWeek) return;
    const nextDay = findDay(nextWeek, selection.dayKey);
    goTo({
      stageId: nextStage.id,
      weekNumber: nextWeek.weekNumber,
      dayKey: nextDay?.dayKey ?? selection.dayKey,
    });
  }

  function changeWeek(weekNumber: number) {
    const nextWeek = stage?.weeks.find((item) => item.weekNumber === weekNumber);
    if (!nextWeek) return;
    const nextDay = findDay(nextWeek, selection.dayKey);
    goTo({
      weekNumber: nextWeek.weekNumber,
      dayKey: nextDay?.dayKey ?? selection.dayKey,
    });
  }

  function updateMemo(patch: Partial<MemoState>) {
    setMemo((previous) => {
      if (!previous) return previous;
      const next: MemoState = { ...previous, ...patch };
      if (patch.section !== undefined) {
        const oldSection = previous.section;
        next.lessons = previous.lessons.map((lesson) =>
          !lesson.section.trim() || lesson.section === oldSection
            ? { ...lesson, section: patch.section as string }
            : lesson
        );
      }
      return next;
    });

    const profilePatch: Partial<Profile> = {};
    if (patch.institution !== undefined) profilePatch.institution = patch.institution;
    if (patch.teacher !== undefined) profilePatch.teacher = patch.teacher;
    if (patch.academicYear !== undefined) profilePatch.academicYear = patch.academicYear;
    if (patch.section !== undefined) profilePatch.section = patch.section;
    if (patch.director !== undefined) profilePatch.director = patch.director;
    if (patch.inspector !== undefined) profilePatch.inspector = patch.inspector;
    if (Object.keys(profilePatch).length) {
      setProfile((previous) => ({ ...previous, ...profilePatch }));
    }
  }

  function updateLesson(id: string, patch: Partial<MemoLesson>) {
    const currentLesson = memo?.lessons.find((lesson) => lesson.id === id);
    const subjectWillChange =
      !!currentLesson &&
      Object.prototype.hasOwnProperty.call(patch, "subjectCode") &&
      (patch.subjectCode ?? "") !== (currentLesson.subjectCode ?? "");

    setMemo((previous) => {
      if (!previous) return previous;
      const index = previous.lessons.findIndex((lesson) => lesson.id === id);
      if (index < 0) return previous;
      const current = previous.lessons[index];
      const hasSubjectPatch = Object.prototype.hasOwnProperty.call(
        patch,
        "subjectCode"
      );
      const hasLevelPatch = Object.prototype.hasOwnProperty.call(
        patch,
        "levelNumber"
      );
      const nextSubjectCode = hasSubjectPatch
        ? patch.subjectCode
        : current.subjectCode;
      const nextLevelNumber =
        hasLevelPatch && typeof patch.levelNumber === "number"
          ? patch.levelNumber
          : current.levelNumber ?? selection.level;
      const subjectChanged =
        hasSubjectPatch &&
        (patch.subjectCode ?? "") !== (current.subjectCode ?? "");
      const levelChanged =
        hasLevelPatch &&
        (patch.levelNumber ?? null) !== (current.levelNumber ?? null);

      let updated: MemoLesson = { ...current, ...patch };
      if ((subjectChanged || levelChanged) && nextSubjectCode) {
        updated = {
          ...updated,
          ...refreshedLessonContent(
            current,
            nextSubjectCode,
            nextLevelNumber,
            selection,
            catalog
          ),
        };
      }

      const lessons = previous.lessons.map((lesson) =>
        lesson.id === id ? updated : lesson
      );

      /* تغيير مدة الاستراحة يزيح الحصص الموالية التي تبدأ مباشرة بعدها،
         حتى تبقى الأوقات متسقة في المعاينة والطباعة. */
      const nextBreak = patch.breakMinutes;
      const oldBreak = lessonBreakMinutes(current);
      if (
        nextBreak !== undefined &&
        nextBreak !== oldBreak &&
        lessons[index + 1]
      ) {
        const end = timeToMinutes(current.timeTo);
        const nextStart = timeToMinutes(lessons[index + 1].timeFrom);
        if (end != null && nextStart != null && nextStart === end + oldBreak) {
          const delta = nextBreak - oldBreak;
          for (let i = index + 1; i < lessons.length; i += 1) {
            const from = timeToMinutes(lessons[i].timeFrom);
            const to = timeToMinutes(lessons[i].timeTo);
            if (from == null || to == null) continue;
            lessons[i] = {
              ...lessons[i],
              timeFrom: minutesToTime(from + delta),
              timeTo: minutesToTime(to + delta),
            };
          }
        }
      }

      return { ...previous, lessons };
    });

    if (subjectWillChange && currentLesson && patch.subjectCode) {
      const code = patch.subjectCode;
      setBrowseSubjectCode(code);
      const snapshot = lessonAutoContent(
        catalog,
        code,
        currentLesson.levelNumber ?? selection.level,
        selection,
        currentLesson.sessionNumber ?? selection.sessionNumber
      );
      setToast({
        msg: snapshot.hasSource
          ? `تم اختيار ${subjectNameFor(catalog, code)} لهذه الحصة؛ حُدّث الموضوع والمكون من التوزيع.`
          : `تم اختيار ${subjectNameFor(catalog, code)} لهذه الحصة؛ لا توجد حصة مقابلة في توزيع المادة لهذا الرقم، فاكتب الموضوع يدويًا.`,
        kind: "ok",
      });
    }
  }

  function addLesson() {
    const grouped = isGroupedSelection(selection);
    const activeLevel = findLevel(catalog, selection);
    const groups = groupsForLevel(selection, selection.level);
    setMemo((previous) => {
      if (!previous) return previous;
      const slot = nextSlot(previous.lessons, previous.period);
      const sameLevelCount = previous.lessons.filter(
        (lesson) => lesson.levelNumber === selection.level
      ).length;
      const groupLabel =
        groups[sameLevelCount % groups.length] ?? groups[0];
      const lesson: MemoLesson = {
        id: uid(),
        ...slot,
        section: previous.section,
        subjectCode: undefined,
        component: "",
        topic: "",
        objectives: "",
        stages: "",
        session: sessionLabel(selection.sessionNumber),
        sessionNumber: selection.sessionNumber,
        rj: "",
        kind: "lesson",
        breakMinutes: 0,
        levelNumber: selection.level,
        levelLabel: activeLevel?.levelLabel_ar,
        groupLabel,
      };
      return {
        ...previous,
        showDismissal: previous.showDismissal || grouped,
        lessons: [...previous.lessons, lesson],
      };
    });
  }

  function addFromSession(
    sourceDay: LevelDay,
    levelNumber: number,
    sessionNumber: number,
    subjectCode: string
  ) {
    if (!sourceDay.content.topic_ar.trim()) return;
    const grouped = isGroupedSelection(selection);
    const groups = groupsForLevel(selection, levelNumber);
    const sourceLevel = findLevel(catalog, {
      subjectCode,
      level: levelNumber,
    });
    const subjectName = subjectNameFor(catalog, subjectCode);
    const missingGroups = groups.filter(
      (groupLabel) =>
        !memo?.lessons.some((lesson) =>
          lessonMatchesTarget(
            lesson,
            selection,
            sourceDay,
            levelNumber,
            sessionNumber,
            subjectCode,
            groupLabel
          )
        )
    );
    if (!missingGroups.length) {
      setToast({
        msg: `${sessionLabel(sessionNumber)} — ${subjectName} مضافة أصلًا لكل أفواج هذا المستوى.`,
        kind: "ok",
      });
      return;
    }

    setMemo((previous) => {
      if (!previous) return previous;
      const base = previous.lessons.filter(
        (lesson) =>
          lesson.kind !== "empty" ||
          lesson.topic.trim() ||
          lesson.objectives.trim() ||
          lesson.stages.trim()
      );
      let working = base;
      for (const groupLabel of missingGroups) {
        const slot = nextSlot(working, previous.period);
        const lesson: MemoLesson = {
          id: uid(),
          ...slot,
          section: previous.section,
          subjectCode,
          component:
            sourceDay.component ||
            findStage(sourceLevel, selection.stageId)?.theme_ar ||
            sourceLevel?.subject_ar ||
            sourceLevel?.subject ||
            subjectName ||
            previous.subject,
          topic: sourceDay.content.topic_ar,
          objectives: "",
          stages: "",
          session: sessionLabel(sessionNumber),
          sessionNumber,
          rj: "",
          sourceLessonNumber: sourceDay.lessonNumber ?? null,
          sourceDayKey: sourceDay.dayKey,
          kind: sourceDay.kind,
          breakMinutes: 0,
          levelNumber,
          levelLabel: sourceLevel?.levelLabel_ar,
          groupLabel,
        };
        working = [...working, lesson];
      }
      return {
        ...previous,
        showDismissal: previous.showDismissal || grouped,
        lessons: working,
      };
    });
    const levelLabel = sourceLevel?.levelLabel_ar || `المستوى ${levelNumber}`;
    setToast({
      msg:
        missingGroups.length > 1
          ? `أُضيفت ${sessionLabel(sessionNumber)} — ${subjectName} · ${levelLabel} لأفواج: ${missingGroups.join("، ")}.`
          : `أُضيفت ${sessionLabel(sessionNumber)} — ${subjectName} · ${levelLabel} · ${missingGroups[0]}.`,
      kind: "ok",
    });
  }

  function removeLesson(id: string) {
    setMemo((previous) =>
      previous
        ? { ...previous, lessons: previous.lessons.filter((lesson) => lesson.id !== id) }
        : previous
    );
  }

  function duplicateLesson(id: string) {
    setMemo((previous) => {
      if (!previous) return previous;
      const original = previous.lessons.find((lesson) => lesson.id === id);
      if (!original) return previous;
      const slot = nextSlot(previous.lessons, previous.period);
      const copy: MemoLesson = {
        ...original,
        ...slot,
        id: uid(),
        sourceDayKey: undefined,
        sourceLessonNumber: undefined,
        kind: "lesson",
        breakMinutes: 0,
      };
      return { ...previous, lessons: [...previous.lessons, copy] };
    });
  }

  function moveLesson(id: string, direction: -1 | 1) {
    setMemo((previous) => {
      if (!previous) return previous;
      const index = previous.lessons.findIndex((lesson) => lesson.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= previous.lessons.length) return previous;
      const lessons = previous.lessons.slice();
      [lessons[index], lessons[target]] = [lessons[target], lessons[index]];
      return { ...previous, lessons };
    });
  }

  function resetMemo() {
    if (!memo) return;
    const hasContent = memo.lessons.some(
      (lesson) => lesson.topic.trim() || lesson.objectives.trim() || lesson.stages.trim()
    );
    if (
      hasContent &&
      !window.confirm("سيتم استبدال محتوى المذكرة الحالية بالنسخة المستخرجة من التوزيع. هل تريد المتابعة؟")
    ) {
      return;
    }
    setMemo(buildMemo(catalog, selection, profile));
    setToast({ msg: "أُعيد توليد المذكرة من التوزيع.", kind: "ok" });
  }

  function saveNow() {
    persistCurrent();
    setToast({ msg: "تم حفظ المذكرة والملف الشخصي على هذا المتصفح.", kind: "ok" });
  }

  function printNow() {
    if (!memo) return;
    persistCurrent();
    window.setTimeout(() => window.print(), 120);
  }

  function isAdded(
    sourceDay: LevelDay,
    levelNumber: number,
    sessionNumber: number,
    subjectCode: string
  ): boolean {
    const groups = groupsForLevel(selection, levelNumber);
    return groups.every((groupLabel) =>
      !!memo?.lessons.some((lesson) =>
        lessonMatchesTarget(
          lesson,
          selection,
          sourceDay,
          levelNumber,
          sessionNumber,
          subjectCode,
          groupLabel
        )
      )
    );
  }

  function goToFromMap(patch: Partial<MemoSelection>) {
    if (browseSubjectCode !== selection.subjectCode) {
      switchPrimarySubject(browseSubjectCode, patch);
      return;
    }
    goTo(patch);
  }

  if (!level || !stage || !week || !day) {
    return (
      <div className="memo-app">
        <section className="memo-hero">
          <div className="memo-hero-inner">
            <div className="memo-hero-copy">
              <span className="memo-badge">
                <Sparkles className="h-3.5 w-3.5" /> التعليم الصريح
              </span>
              <h1>المذكرة اليومية الاحترافية</h1>
              <p>لم تُعثر على بيانات توزيع صالحة. أضف ملف مستوى داخل مجلد المادة ثم أعد التشغيل.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const dayOptions = week.days.filter((item) => item.dayKey !== "dimanche");
  const assignedLevels = allLevels.filter((item) =>
    selection.levels.includes(item.level)
  );
  const groupedMemo = isGroupedSelection(selection);
  const groupOptionsByLevel = Object.fromEntries(
    assignedLevels.map((item) => [
      item.level,
      groupsForLevel(selection, item.level),
    ])
  );

  /* خريطة الأسبوع تعرض مادة مرجعية مستقلة عن مواد الحصص، مع إمكانية الإضافة منها. */
  const mapSubject =
    catalog.subjects.find((subject) => subject.code === browseSubjectCode) ??
    catalog.subjects[0];
  const mapLevel =
    mapSubject?.levels.find((item) => item.level === selection.level) ??
    mapSubject?.levels[0] ??
    level;
  const mapStage = findStage(mapLevel, selection.stageId) ?? stage;
  const mapWeek = findWeek(mapStage, selection.weekNumber) ?? week;
  const mapLevels = (mapSubject?.levels ?? [level]).filter((item) =>
    selection.levels.includes(item.level)
  );
  const mapLevelsSafe = mapLevels.length ? mapLevels : [mapLevel];
  const subjectTabs = catalog.subjects.map((subject) => ({
    code: subject.code,
    name: subject.name_ar,
  }));

  return (
    <div className="memo-app">
      <section className="memo-hero">
        <div className="memo-hero-inner">
          <div className="memo-hero-copy">
            <span className="memo-badge">
              <Sparkles className="h-3.5 w-3.5" /> جديد · التعليم الصريح
            </span>
            <h1>المذكرة اليومية الاحترافية</h1>
            <p className="memo-hero-sub">
              من التوزيع الرسمي للمادة إلى مذكرة يومية منظمة، قابلة للتعديل وجاهزة
              للطباعة على صفحة A4 واحدة.
            </p>
            <div className="memo-hero-points">
              <span><CheckCircle2 className="h-3.5 w-3.5" /> موضوع الدرس من التوزيع</span>
              <span><CheckCircle2 className="h-3.5 w-3.5" /> مادة مستقلة لكل حصة</span>
              <span><CheckCircle2 className="h-3.5 w-3.5" /> حقول تُكتب بيدك</span>
              <span><CheckCircle2 className="h-3.5 w-3.5" /> طباعة عربية RTL</span>
            </div>
            <div className="memo-hero-stats">
              <div><b>{stats.levels}</b><span>مستويات</span></div>
              <div><b>{stats.stages}</b><span>مراحل</span></div>
              <div><b>{stats.weeks}</b><span>أسبوعًا</span></div>
              <div><b>{stats.lessons}</b><span>عبارة درس</span></div>
            </div>
          </div>
          <div className="memo-hero-art" aria-hidden="true">
            <div className="memo-art-sheet">
              <div className="memo-art-brand">
                <i />
                <span>مذكرة الدروس اليومية</span>
              </div>
              <div className="memo-art-rule" />
              <div className="memo-art-meta">
                <i /><i /><i /><i />
              </div>
              <div className="memo-art-table">
                <div className="memo-art-thead" />
                <div className="memo-art-row" />
                <div className="memo-art-row is-alt" />
                <div className="memo-art-row" />
                <div className="memo-art-row is-alt" />
              </div>
              <div className="memo-art-notes" />
              <div className="memo-art-signs"><i /><i /><i /></div>
            </div>
            <div className="memo-art-seal">A4</div>
          </div>
        </div>
      </section>

      <div className="memo-toolbar">
        <div className="memo-toolbar-inner">
          <div className="memo-toolbar-title">
            <span className="memo-live-dot" />
            اختيار سريع
          </div>

          <div className="memo-selectors">
            <div className="memo-select memo-select-levels">
              <span>
                المستويات المدرّسة
                <em>يمكن اختيار مستوى واحد أو أكثر</em>
              </span>
              <div className="memo-level-chips" role="group" aria-label="المستويات المدرّسة">
                {allLevels.map((item) => {
                  const selected = selection.levels.includes(item.level);
                  const active = selection.level === item.level;
                  return (
                    <button
                      key={item.level}
                      type="button"
                      className={cx(
                        "memo-level-chip",
                        selected && "is-selected",
                        active && "is-active"
                      )}
                      onClick={() => toggleLevel(item.level)}
                      aria-pressed={selected}
                      title={
                        active && selected
                          ? selection.levels.length > 1
                            ? `إلغاء اختيار ${item.label}`
                            : `${item.label} — المستوى الوحيد المختار`
                          : selected
                            ? `تحرير مذكرة ${item.label}`
                            : `إضافة ${item.label}`
                      }
                    >
                      <span className="memo-level-chip-mark" aria-hidden="true">
                        {selected ? <Check className="h-3 w-3" /> : null}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="memo-select memo-select-groups">
              <span>
                الأفواج المدرّسة
                <em>فوج واحد أو أكثر لكل مستوى</em>
              </span>
              <div className="memo-group-levels">
                {assignedLevels.map((levelItem) => {
                  const selectedGroups = groupsForLevel(
                    selection,
                    levelItem.level
                  );
                  const extraGroups = selectedGroups.filter(
                    (label) =>
                      !DEFAULT_GROUP_LABELS.some((item) => item === label)
                  );
                  const groupChoices = [
                    ...DEFAULT_GROUP_LABELS,
                    ...extraGroups,
                  ];
                  return (
                    <div className="memo-group-level" key={levelItem.level}>
                      <span className="memo-group-level-name">
                        {levelItem.label}
                      </span>
                      <div
                        className="memo-group-chips"
                        role="group"
                        aria-label={`أفواج ${levelItem.label}`}
                      >
                        {groupChoices.map((label) => {
                          const selected = selectedGroups.includes(label);
                          return (
                            <button
                              key={label}
                              type="button"
                              className={cx(
                                "memo-group-chip",
                                selected && "is-selected"
                              )}
                              onClick={() =>
                                toggleGroup(levelItem.level, label)
                              }
                              aria-pressed={selected}
                              title={
                                selected
                                  ? `إزالة ${label} من ${levelItem.label}`
                                  : `إضافة ${label} إلى ${levelItem.label}`
                              }
                            >
                              <span
                                className="memo-group-chip-mark"
                                aria-hidden="true"
                              >
                                {selected ? <Check className="h-3 w-3" /> : null}
                              </span>
                              {label}
                            </button>
                          );
                        })}
                        {groupEditor === levelItem.level ? (
                          <form
                            className="memo-group-add-form"
                            onSubmit={(event) => {
                              event.preventDefault();
                              addCustomGroup(
                                levelItem.level,
                                groupDraft[levelItem.level] ?? ""
                              );
                            }}
                          >
                            <input
                              autoFocus
                              value={groupDraft[levelItem.level] ?? ""}
                              onChange={(event) =>
                                setGroupDraft((previous) => ({
                                  ...previous,
                                  [levelItem.level]: event.target.value,
                                }))
                              }
                              placeholder="اسم الفوج"
                              aria-label={`اسم فوج جديد لـ${levelItem.label}`}
                            />
                            <button
                              type="submit"
                              className="memo-group-add-confirm"
                              title="إضافة الفوج"
                              aria-label="إضافة الفوج"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              className="memo-group-add-cancel"
                              onClick={() => setGroupEditor(null)}
                              title="إلغاء"
                              aria-label="إلغاء إضافة الفوج"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        ) : (
                          <button
                            type="button"
                            className="memo-group-add"
                            onClick={() => setGroupEditor(levelItem.level)}
                            title={`إضافة فوج آخر إلى ${levelItem.label}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            فوج
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <label className="memo-select memo-select-period">
              <span>الفترة</span>
              <select
                value={selection.period}
                onChange={(event) => changePeriod(event.target.value as MemoBlock)}
              >
                {catalog.template.blocks
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((block) => (
                    <option key={block.key} value={block.key}>
                      {block.label_ar}
                    </option>
                  ))}
              </select>
            </label>

            <label className="memo-select">
              <span>المرحلة</span>
              <select
                value={stage.id}
                onChange={(event) => changeStage(event.target.value)}
              >
                {level.stages.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title_ar}
                  </option>
                ))}
              </select>
            </label>

            <label className="memo-select">
              <span>الأسبوع</span>
              <select
                value={week.weekNumber}
                onChange={(event) => changeWeek(Number(event.target.value))}
              >
                {stage.weeks.map((item) => (
                  <option key={item.weekNumber} value={item.weekNumber}>
                    {item.title_ar}
                  </option>
                ))}
              </select>
            </label>

            <div className="memo-select memo-select-session">
              <span>
                الحصة
                <em>حسب استعمال الزمن</em>
              </span>
              <div
                className="memo-session-chips"
                role="group"
                aria-label="الحصة حسب استعمال الزمن"
              >
                {sessionNumbers.map((sessionNumber) => (
                  <button
                    key={sessionNumber}
                    type="button"
                    className={cx(
                      "memo-session-chip",
                      selection.sessionNumber === sessionNumber && "is-active"
                    )}
                    onClick={() => changeSession(sessionNumber)}
                    aria-pressed={selection.sessionNumber === sessionNumber}
                    aria-label={sessionLabel(sessionNumber)}
                    title={`${sessionLabel(sessionNumber)} — موضوعها من توزيع الأسبوع`}
                  >
                    {sessionNumber}
                  </button>
                ))}
              </div>
            </div>

            <label className="memo-select memo-select-day">
              <span>
                اليوم الفعلي
                <em>للترويسة فقط</em>
              </span>
              <select
                value={day.dayKey}
                onChange={(event) => changeDay(event.target.value)}
              >
                {dayOptions.map((item) => (
                  <option key={item.dayKey} value={item.dayKey}>
                    {item.label_ar}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="memo-toolbar-actions">
            <button type="button" className="memo-btn memo-btn-ghost" onClick={saveNow}>
              <Save className="h-4 w-4" />
              حفظ
            </button>
            <button type="button" className="memo-btn memo-btn-primary" onClick={printNow}>
              <Printer className="h-4 w-4" />
              طباعة A4
            </button>
          </div>
        </div>
      </div>

      <main className="memo-wrap">
        <div className="memo-layout">
          <div className="memo-main">
            {memo ? (
              <MemoEditor
                memo={viewMemo ?? memo}
                template={catalog.template}
                levelOptions={assignedLevels.map((item) => ({
                  level: item.level,
                  label: item.label,
                }))}
                groupOptionsByLevel={groupOptionsByLevel}
                subjectOptions={subjectOptions}
                defaultLevel={selection.level}
                multiLevel={selection.levels.length > 1}
                grouped={groupedMemo}
                onChange={updateMemo}
                onLessonChange={updateLesson}
                onAddLesson={addLesson}
                onRemoveLesson={removeLesson}
                onDuplicateLesson={duplicateLesson}
                onMoveLesson={moveLesson}
                onReset={resetMemo}
              />
            ) : (
              <section className="memo-panel memo-loading">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>جارٍ تجهيز المذكرة…</p>
              </section>
            )}

            <section className="memo-panel memo-preview-panel">
              <div className="memo-panel-head">
                <div className="memo-panel-title">
                  <span className="memo-panel-icon">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div>
                    <h2>معاينة الوثيقة</h2>
                    <p>هكذا ستظهر المذكرة عند الطباعة على ورق A4.</p>
                  </div>
                </div>
                <div className="memo-preview-actions">
                  <span className="memo-paper-pill">A4 · 210 × 297 مم</span>
                  <button
                    type="button"
                    className="memo-btn memo-btn-soft"
                    onClick={printNow}
                  >
                    <Printer className="h-4 w-4" />
                    طباعة
                  </button>
                </div>
              </div>
              {memo ? (
                <SheetPreview
                  memo={viewMemo ?? memo}
                  template={catalog.template}
                />
              ) : null}
            </section>
          </div>

          <WeekMap
            level={mapLevel}
            levels={mapLevelsSafe}
            stage={mapStage}
            week={mapWeek}
            selection={selection}
            subjects={subjectTabs}
            subjectCode={browseSubjectCode}
            onSubjectChange={changeBrowseSubject}
            onLevelChange={switchLevel}
            onGo={goToFromMap}
            onAddSession={addFromSession}
            isAdded={isAdded}
          />
        </div>

        <div className="memo-bottom-note">
          <div>
            <BookOpenCheck className="h-4 w-4" />
            <p>
              عبارات الدروس منقولة من ملفات التوزيع المرفقة. الأهداف والأنشطة والوسائل
              والتقويم حقول فارغة يكتبها الأستاذ(ة)، ولم تُضف إليها أي معلومات غير
              موجودة في المصدر.
            </p>
          </div>
          <span>Modaris Pro · التعليم الصريح</span>
        </div>
      </main>

      {toast ? (
        <div
          className={cx("memo-toast", toast.kind === "err" && "is-error")}
          role="status"
        >
          {toast.kind === "err" ? (
            <TriangleAlert className="h-4 w-4" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {toast.msg}
        </div>
      ) : null}

      {mounted && memo
        ? createPortal(
            <div className="memo-print-portal">
              <style>{`@page { size: A4 portrait; margin: 0; }`}</style>
              <MemoSheet
                memo={viewMemo ?? memo}
                template={catalog.template}
              />
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
