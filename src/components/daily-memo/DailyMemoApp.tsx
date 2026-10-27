"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpenCheck,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Printer,
  Save,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import MemoEditor from "./MemoEditor";
import MemoSheet from "./MemoSheet";
import SheetPreview from "./SheetPreview";
import WeekMap from "./WeekMap";
import type {
  Catalog,
  LevelDay,
  LevelWeek,
  MemoBlock,
  MemoLesson,
  MemoSelection,
  MemoState,
  Preferences,
  Profile,
} from "./types";
import {
  cx,
  draftKey,
  findDay,
  findLevel,
  findStage,
  findWeek,
  periodLabel,
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
  return {
    subjectCode: subject?.code || catalog.template.subjectCode || "math",
    levels: [level?.level ?? 1],
    level: level?.level ?? 1,
    period: "morning",
    stageId: stage?.id || "stage-1",
    weekNumber: week?.weekNumber ?? 1,
    dayKey: day?.dayKey || "lundi",
  };
}

function sameLevels(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
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

function minuteToTime(total: number): string {
  const safe = Math.max(0, Math.min(23 * 60 + 59, total));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(
    safe % 60
  ).padStart(2, "0")}`;
}

function nextSlot(
  lessons: MemoLesson[],
  block: MemoBlock
): { block: MemoBlock; timeFrom: string; timeTo: string } {
  const start = (block === "morning" ? 8 : 14) * 60 + lessons.length * 60;
  return { block, timeFrom: minuteToTime(start), timeTo: minuteToTime(start + 60) };
}

function buildMemo(
  catalog: Catalog,
  selection: MemoSelection,
  profile: Profile
): MemoState | null {
  const level = findLevel(catalog, selection);
  const stage = findStage(level, selection.stageId);
  const week = findWeek(stage, selection.weekNumber);
  const day = findDay(week, selection.dayKey);
  if (!level || !stage || !week || !day) return null;

  const hasLesson = day.kind !== "empty" && !!day.content.topic_ar.trim();
  const start = selection.period === "morning" ? "08:00" : "14:00";
  const end = selection.period === "morning" ? "09:00" : "15:00";
  const lesson: MemoLesson = {
    id: uid(),
    block: selection.period,
    timeFrom: start,
    timeTo: end,
    section: profile.section,
    component: level.subject_ar || level.subject || catalog.template.subject_ar,
    topic: hasLesson ? day.content.topic_ar : "",
    objectives: "",
    stages: "",
    session: day.lessonNumber
      ? `الحصة ${day.lessonNumber}`
      : hasLesson
        ? "مراجعة"
        : "الحصة 1",
    rj: "",
    sourceLessonNumber: day.lessonNumber ?? null,
    sourceDayKey: day.dayKey,
    kind: day.kind,
    breakMinutes: 0,
  };

  return {
    institution: profile.institution,
    teacher: profile.teacher,
    director: profile.director,
    inspector: profile.inspector,
    academicYear: profile.academicYear || defaultAcademicYear(),
    level: level.levelLabel_ar,
    stage: stage.title_ar,
    subject: level.subject_ar || level.subject || catalog.template.subject_ar,
    date: todayIso(),
    unit: "",
    week: week.title_ar,
    day: day.label_ar,
    section: profile.section,
    notes: "",
    period: selection.period,
    showNotes: true,
    showSignatures: true,
    lessons: hasLesson ? [lesson] : [],
  };
}

function optionLabel(day: LevelDay): string {
  return day.kind === "empty"
    ? `${day.label_ar} — بدون درس`
    : `${day.label_ar} — ${day.content.topic_ar}`;
}

export default function DailyMemoApp({ catalog }: { catalog: Catalog }) {
  const initialSelection = useMemo(() => firstSelection(catalog), [catalog]);
  const [selection, setSelection] = useState<MemoSelection>(initialSelection);
  const [memo, setMemo] = useState<MemoState | null>(null);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);
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
    const hydratedSelection = selectionForLevel(
      catalog,
      {
        ...initialSelection,
        subjectCode,
        period,
        stageId: storedPrefs.stageId || initialSelection.stageId,
        weekNumber:
          typeof storedPrefs.weekNumber === "number"
            ? storedPrefs.weekNumber
            : initialSelection.weekNumber,
        dayKey: storedPrefs.dayKey || initialSelection.dayKey,
      },
      activeLevel,
      levels
    );

    setProfile(mergedProfile);
    setSelection(hydratedSelection);
    const stored = draftsRef.current[draftKey(hydratedSelection)];
    setMemo(
      stored
        ? withPeriod(stored, period)
        : buildMemo(catalog, hydratedSelection, mergedProfile)
    );
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
        period: selection.period,
        stageId: selection.stageId,
        weekNumber: selection.weekNumber,
        dayKey: selection.dayKey,
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    mounted,
    prefsKey,
    selection.subjectCode,
    selection.levels,
    selection.level,
    selection.period,
    selection.stageId,
    selection.weekNumber,
    selection.dayKey,
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
    const next = { ...selection, ...patch };
    if (
      next.subjectCode === selection.subjectCode &&
      next.level === selection.level &&
      sameLevels(next.levels, selection.levels) &&
      next.period === selection.period &&
      next.stageId === selection.stageId &&
      next.weekNumber === selection.weekNumber &&
      next.dayKey === selection.dayKey
    ) {
      return;
    }
    if (memo) {
      draftsRef.current[draftKey(selection)] = memo;
      writeStorage(draftsKey, draftsRef.current);
    }
    const stored = draftsRef.current[draftKey(next)];
    setSelection(next);
    setMemo(
      stored
        ? withPeriod(stored, next.period)
        : buildMemo(catalog, next, profile)
    );
  }

  function changeSubject(code: string) {
    const subject = catalog.subjects.find((item) => item.code === code);
    const nextLevel = subject?.levels[0];
    const nextStage = nextLevel?.stages[0];
    const nextWeek = nextStage?.weeks[0];
    const nextDay = firstDay(nextWeek);
    if (!subject || !nextLevel || !nextStage || !nextWeek || !nextDay) return;
    goTo({
      subjectCode: code,
      levels: [nextLevel.level],
      level: nextLevel.level,
      stageId: nextStage.id,
      weekNumber: nextWeek.weekNumber,
      dayKey: nextDay.dayKey,
    });
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
    goTo(selectionForLevel(catalog, selection, activeLevel, levels));
  }

  function changePeriod(period: MemoBlock) {
    if (period === selection.period) return;
    goTo({ period });
    setToast({
      msg: `تم اختيار ${periodLabel(catalog.template, period)} — الورقة مخصصة لها بالكامل.`,
      kind: "ok",
    });
  }

  function changeStage(stageId: string) {
    const nextStage = level?.stages.find((item) => item.id === stageId);
    const nextWeek = nextStage?.weeks[0];
    const nextDay =
      nextWeek?.days.find((item) => item.dayKey === selection.dayKey) ?? firstDay(nextWeek);
    if (!nextStage || !nextWeek || !nextDay) return;
    goTo({ stageId: nextStage.id, weekNumber: nextWeek.weekNumber, dayKey: nextDay.dayKey });
  }

  function changeWeek(weekNumber: number) {
    const nextWeek = stage?.weeks.find((item) => item.weekNumber === weekNumber);
    const nextDay =
      nextWeek?.days.find((item) => item.dayKey === selection.dayKey) ?? firstDay(nextWeek);
    if (!nextWeek || !nextDay) return;
    goTo({ weekNumber: nextWeek.weekNumber, dayKey: nextDay.dayKey });
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
    setMemo((previous) =>
      previous
        ? {
            ...previous,
            lessons: previous.lessons.map((lesson) =>
              lesson.id === id ? { ...lesson, ...patch } : lesson
            ),
          }
        : previous
    );
  }

  function addLesson() {
    setMemo((previous) => {
      if (!previous) return previous;
      const slot = nextSlot(previous.lessons, previous.period);
      const lesson: MemoLesson = {
        id: uid(),
        ...slot,
        section: previous.section,
        component: previous.subject,
        topic: "",
        objectives: "",
        stages: "",
        session: `الحصة ${previous.lessons.length + 1}`,
        rj: "",
        kind: "lesson",
        breakMinutes: 0,
      };
      return { ...previous, lessons: [...previous.lessons, lesson] };
    });
  }

  function addFromDay(sourceDay: LevelDay) {
    if (!sourceDay.content.topic_ar.trim()) return;
    setMemo((previous) => {
      if (!previous) return previous;
      const base = previous.lessons.filter(
        (lesson) =>
          lesson.kind !== "empty" ||
          lesson.topic.trim() ||
          lesson.objectives.trim() ||
          lesson.stages.trim()
      );
      const slot = nextSlot(base, previous.period);
      const lesson: MemoLesson = {
        id: uid(),
        ...slot,
        section: previous.section,
        component: previous.subject,
        topic: sourceDay.content.topic_ar,
        objectives: "",
        stages: "",
        session: sourceDay.lessonNumber ? `الحصة ${sourceDay.lessonNumber}` : "مراجعة",
        rj: "",
        sourceLessonNumber: sourceDay.lessonNumber ?? null,
        sourceDayKey: sourceDay.dayKey,
        kind: sourceDay.kind,
        breakMinutes: 0,
      };
      return { ...previous, lessons: [...base, lesson] };
    });
    setToast({ msg: "أُضيف الدرس إلى مذكرة اليوم.", kind: "ok" });
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
        session: `الحصة ${previous.lessons.length + 1}`,
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

  function isAdded(sourceDay: LevelDay): boolean {
    return !!memo?.lessons.some(
      (lesson) =>
        lesson.kind !== "empty" &&
        lesson.sourceDayKey === sourceDay.dayKey &&
        (lesson.sourceLessonNumber ?? null) === (sourceDay.lessonNumber ?? null)
    );
  }

  function goToDayFromMap(patch: Partial<MemoSelection>) {
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

  const dayOptions = week.days;
  const subjectLevels =
    catalog.subjects.find((subject) => subject.code === selection.subjectCode)?.levels ??
    [];
  const assignedLevels = subjectLevels.filter((item) =>
    selection.levels.includes(item.level)
  );

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
              من توزيع الرياضيات الرسمي إلى مذكرة يومية منظمة، قابلة للتعديل وجاهزة
              للطباعة على صفحة A4 واحدة.
            </p>
            <div className="memo-hero-points">
              <span><CheckCircle2 className="h-3.5 w-3.5" /> موضوع الدرس من التوزيع</span>
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
            {catalog.subjects.length > 1 ? (
              <label className="memo-select">
                <span>المادة</span>
                <select
                  value={selection.subjectCode}
                  onChange={(event) => changeSubject(event.target.value)}
                >
                  {catalog.subjects.map((subject) => (
                    <option key={subject.code} value={subject.code}>
                      {subject.name_ar}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="memo-select memo-select-levels">
              <span>
                المستويات المدرّسة
                <em>يمكن اختيار مستوى واحد أو أكثر</em>
              </span>
              <div className="memo-level-chips" role="group" aria-label="المستويات المدرّسة">
                {(catalog.subjects.find((subject) => subject.code === selection.subjectCode)
                  ?.levels ?? []).map((item) => {
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
                            ? `إلغاء اختيار ${item.levelLabel_ar}`
                            : `${item.levelLabel_ar} — المستوى الوحيد المختار`
                          : selected
                            ? `تحرير مذكرة ${item.levelLabel_ar}`
                            : `إضافة ${item.levelLabel_ar}`
                      }
                    >
                      <span className="memo-level-chip-mark" aria-hidden="true">
                        {selected ? <Check className="h-3 w-3" /> : null}
                      </span>
                      {item.levelLabel_ar}
                    </button>
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

            <label className="memo-select memo-select-day">
              <span>اليوم</span>
              <select
                value={day.dayKey}
                onChange={(event) => goTo({ dayKey: event.target.value })}
              >
                {dayOptions.map((item) => (
                  <option key={item.dayKey} value={item.dayKey}>
                    {optionLabel(item)}
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
                memo={memo}
                template={catalog.template}
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
                <SheetPreview memo={memo} template={catalog.template} />
              ) : null}
            </section>
          </div>

          <WeekMap
            level={level}
            levels={assignedLevels}
            stage={stage}
            week={week}
            selection={selection}
            onLevelChange={switchLevel}
            onGo={goToDayFromMap}
            onAddDay={addFromDay}
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
              <MemoSheet memo={memo} template={catalog.template} />
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
