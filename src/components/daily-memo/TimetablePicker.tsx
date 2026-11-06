"use client";

/* ============================================================
   لوحة التوليد من استعمال الزمن — اختيار اليوم والحصص والمعاينة
   ------------------------------------------------------------
   • عرض فقط: تقرأ حالة الجدول عبر الجسر ولا تكتب في أي تخزين،
     ولا تلمس بيانات مولّد استعمال الزمن إطلاقًا.
   • الاستراحات والفترات الفارغة (بلا مادة) مستبعدة من العرض
     ومن التوليد — يختار الأستاذ من الحصص ذات المادة فقط.
   • دوال البناء والمقارنة نقية ومصدَّرة لاختبارها خارج الواجهة.
   ============================================================ */
import { useMemo, useState } from "react";
import { buildWeekPlans } from "@/lib/timetable-memo-bridge";
import type { BridgeSession } from "@/lib/timetable-memo-bridge";
import type { TimetableState } from "@/components/timetable/types";
import {
  findStage,
  findWeek,
  isComponentAxisSubject,
  KIND_LABELS,
  lessonBreakMinutes,
  levelSessionCount,
  sessionLabel,
  sessionSourceDay,
  todayIso,
  uid,
} from "./types";
import type {
  Catalog,
  LessonKind,
  MemoLesson,
  MemoSelection,
  MemoState,
  Profile,
} from "./types";

/* ============================ مساعدات نقية ============================ */

/** خيارات اليوم التربوي — نفس نصوص DailyMemoApp (نسخة محلية لهذه الوحدة). */
const STUDY_DAY_OPTIONS = [
  "اليوم التربوي الأول",
  "اليوم التربوي الثاني",
  "اليوم التربوي الثالث",
  "اليوم التربوي الرابع",
  "اليوم التربوي الخامس",
  "اليوم التربوي السادس",
];

function studyDayLabel(catalog: Catalog, dayKey: string): string {
  const index = (catalog.config.weekDays ?? []).findIndex(
    (day) => day.key === dayKey
  );
  if (index < 0) return "";
  return STUDY_DAY_OPTIONS[index] ?? "";
}

function defaultAcademicYear(): string {
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}/${year + 1}`;
}

/** نتيجة اشتقاق محتوى حصة من التوزيع عبر رقمها التسلسلي. */
export interface TimetableLessonContent {
  topic: string;
  component: string;
  componentAxis?: string;
  kind: LessonKind;
  sourceLessonNumber: number | null;
  sourceDayKey?: string;
  hasSource: boolean;
  /** رمز المادة المهيكلة؛ undefined للمواد الحرة وبلا مستوى معروف */
  subjectCode?: string;
}

/**
 * محتوى حصة واحدة من التوزيع حسب رقمها التسلسلي في استعمال الزمن:
 * المواد الحرة وحصص بلا مستوى معروف تُعاد بمكون فارغ المحتوى (اسم المادة
 * فقط)، والترتيب الذي يتجاوز حصص المادة لا يُنتج مصدرًا (لا موضوع خاطئ).
 */
export function resolveTimetableLessonContent(
  catalog: Catalog,
  selection: Pick<MemoSelection, "stageId" | "weekNumber">,
  session: BridgeSession
): TimetableLessonContent {
  const subjectCode = session.subjectCode;
  if (!subjectCode) {
    /* مادة حرة (بلا توزيع رسمي): الحصة باسمها ومحتواها يدوي */
    return {
      topic: "",
      component: session.subjectName || session.subjectId || "",
      kind: "lesson",
      sourceLessonNumber: null,
      hasSource: false,
    };
  }
  const subject = catalog.subjects.find((item) => item.code === subjectCode);
  const level =
    session.levelNumber != null
      ? subject?.levels.find((item) => item.level === session.levelNumber)
      : undefined;
  if (!subject || !level) {
    /* مادة مهيكلة بلا مستوى معروف: لا نُخمّن محتوى مستوى آخر */
    return {
      topic: "",
      component: subject?.name_ar || session.subjectName || subjectCode,
      kind: "lesson",
      sourceLessonNumber: null,
      hasSource: false,
      subjectCode,
    };
  }
  const stage = findStage(level, selection.stageId);
  const week = findWeek(stage, selection.weekNumber);
  const inRange =
    session.sessionOrdinal >= 1 &&
    session.sessionOrdinal <= levelSessionCount(level);
  const source = inRange && week ? sessionSourceDay(week, session.sessionOrdinal) : undefined;
  const axisSubject = isComponentAxisSubject(catalog.config, subjectCode);
  const name = subject.name_ar || level.subject_ar || level.subject || subjectCode;
  const axis = source?.component || stage?.theme_ar || "";
  return {
    topic: source?.content.topic_ar ?? "",
    component: axisSubject ? name : source?.component || stage?.theme_ar || name,
    componentAxis: axisSubject ? axis : undefined,
    kind: source?.kind ?? "lesson",
    sourceLessonNumber: source?.lessonNumber ?? null,
    sourceDayKey: source?.dayKey,
    hasSource: !!source,
    subjectCode,
  };
}

/** يبني مذكرة يومية كاملة من الحصص المختارة في لوحة استعمال الزمن. */
export function buildMemoFromTimetable(
  catalog: Catalog,
  selection: MemoSelection,
  profile: Profile,
  chosen: BridgeSession[],
  dayKey: string,
  dateIso: string
): MemoState {
  const lessons: MemoLesson[] = chosen.map((session) => {
    const content = resolveTimetableLessonContent(catalog, selection, session);
    return {
      id: uid(),
      block: session.block,
      timeFrom: session.start,
      timeTo: session.end,
      section: profile.section,
      subjectCode: content.subjectCode,
      component: content.component,
      componentAxis: content.componentAxis,
      topic: content.topic,
      objectives: "",
      stages: "",
      session:
        session.sessionOrdinal >= 1 ? sessionLabel(session.sessionOrdinal) : "",
      sessionNumber: session.sessionOrdinal >= 1 ? session.sessionOrdinal : undefined,
      rj: "",
      sourceLessonNumber: content.sourceLessonNumber,
      sourceDayKey: content.sourceDayKey,
      kind: content.kind,
      breakMinutes: session.breakMinutesAfter,
      levelNumber: session.levelNumber,
      levelLabel: session.levelName,
      groupLabel: session.group?.trim() || undefined,
    };
  });

  const levelLabels = Array.from(
    new Set(lessons.map((lesson) => lesson.levelLabel?.trim()).filter(Boolean))
  );
  const subjectNames = Array.from(
    new Set(lessons.map((lesson) => lesson.component.trim()).filter(Boolean))
  );
  /* المرحلة والأسبوع من أول حصة مهيكلة (مرساة المحتوى نفسها المستعملة في الاشتقاق) */
  const anchor = lessons.find(
    (lesson) => lesson.subjectCode && lesson.levelNumber != null
  );
  const anchorLevel = anchor?.subjectCode
    ? catalog.subjects
        .find((item) => item.code === anchor.subjectCode)
        ?.levels.find((item) => item.level === anchor.levelNumber)
    : undefined;
  const anchorStage = findStage(anchorLevel, selection.stageId);
  const anchorWeek = findWeek(anchorStage, selection.weekNumber);
  const groupTuples = new Set(
    lessons.map((lesson) => `${lesson.levelNumber ?? "-"}|${lesson.groupLabel ?? "-"}`)
  );

  return {
    institution: profile.institution,
    teacher: profile.teacher,
    director: profile.director,
    inspector: profile.inspector,
    academicYear: profile.academicYear || defaultAcademicYear(),
    level: levelLabels.join(" · "),
    stage: anchorStage?.title_ar ?? "",
    subject: subjectNames.join(" · "),
    date: dateIso,
    unit: "",
    week: anchorWeek?.title_ar ?? "",
    day: studyDayLabel(catalog, dayKey),
    section: profile.section,
    notes: "",
    period: lessons[0]?.block ?? "morning",
    showNotes: true,
    showSignatures: true,
    showDismissal: lessons.length > 1 && groupTuples.size > 1,
    lessons,
  };
}

/* ============================ مقارنة إعادة التوليد ============================ */

/** هوية الحصة: مستوى+فوج+مادة+رقم الحصة — لا مطابقة بين حصص متشابهة مختلفة الهوية. */
function lessonIdentity(lesson: MemoLesson): string {
  return [
    lesson.levelNumber ?? "-",
    (lesson.groupLabel ?? "").trim() || "-",
    (lesson.subjectCode ?? lesson.component.trim()) || "-",
    lesson.sessionNumber ?? lesson.sourceLessonNumber ?? "-",
  ].join("|");
}

function lessonDescription(lesson: MemoLesson): string {
  return [
    `${lesson.timeFrom}–${lesson.timeTo}`,
    lesson.component.trim() || "بدون مادة",
    lesson.levelLabel?.trim() || "",
    lesson.groupLabel?.trim() || "",
    `«${lesson.topic.trim() || "بدون موضوع"}»`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * فروق بين مسودة مولّدة قديمة ونتيجة التوليد الجديدة، تُعرض قبل الاستبدال.
 * المطابقة بالهوية الكاملة (مستوى+فوج+مادة+رقم حصة) مع فهرس تكرار احتياطي،
 * فلا تتزاوج حصص متشابهة العرض مختلفة الهوية — وتغيّر المادة/الفوج/المستوى
 * يظهر كحذف+إضافة بوصف كامل (لا إغفال ولا زواج خاطئ).
 * حقول الحصة المقارنة: التوقيت، الموضوع، المكون، المحور، نوع الحصة،
 * الاستراحة بعدها، نصف اليوم، المستوى، ومصدر التوزيع. معرّف uid لا يُقارن
 * أبدًا (يتغير كل توليد وليس تغييرًا جوهريًا).
 * وتُقارن كذلك حقول الترويسة كاملة (اليوم، الوحدة، التاريخ، القسم، الموسم،
 * الفترة، المرحلة، الأسبوع، المادة، المستوى، صف الخروج، المؤسسة، الأستاذ،
 * المدير، المفتش، الملاحظات، مفاتيح الإظهار) — فبعضها يكتبه الأستاذ فوق
 * المذكرة المولّدة وإعادة التوليد قد تفرّغه.
 * دالة نقية: لا تقرأ ولا تكتب أي حالة.
 */
export function compareMemoDrafts(
  oldMemo: MemoState,
  newMemo: MemoState
): string[] {
  const keyOf = (lesson: MemoLesson, seen: Map<string, number>): string => {
    const base = lessonIdentity(lesson);
    const index = seen.get(base) ?? 0;
    seen.set(base, index + 1);
    return `${base}#${index}`;
  };

  const periodLabelOf = (block: MemoLesson["block"]) =>
    block === "afternoon" ? "مسائية" : "صباحية";
  const orDash = (value: string | undefined) => (value ?? "").trim() || "—";

  const oldMap = new Map<string, MemoLesson>();
  const seenOld = new Map<string, number>();
  for (const lesson of oldMemo.lessons) oldMap.set(keyOf(lesson, seenOld), lesson);

  const diffs: string[] = [];
  const matched = new Set<string>();
  const seenNew = new Map<string, number>();
  for (const lesson of newMemo.lessons) {
    const key = keyOf(lesson, seenNew);
    const previous = oldMap.get(key);
    if (!previous) {
      diffs.push(`إضافة حصة: ${lessonDescription(lesson)}`);
      continue;
    }
    matched.add(key);
    const fieldDiffs: string[] = [];
    if (previous.timeFrom !== lesson.timeFrom || previous.timeTo !== lesson.timeTo) {
      fieldDiffs.push(
        `التوقيت: من ${previous.timeFrom}–${previous.timeTo} إلى ${lesson.timeFrom}–${lesson.timeTo}`
      );
    }
    if ((previous.topic || "").trim() !== (lesson.topic || "").trim()) {
      fieldDiffs.push(
        `الموضوع: من «${(previous.topic || "").trim() || "بدون"}» إلى «${(lesson.topic || "").trim() || "بدون"}»`
      );
    }
    if ((previous.component || "").trim() !== (lesson.component || "").trim()) {
      fieldDiffs.push(
        `المكون: من «${(previous.component || "").trim() || "بدون"}» إلى «${(lesson.component || "").trim() || "بدون"}»`
      );
    }
    if ((previous.componentAxis ?? "").trim() !== (lesson.componentAxis ?? "").trim()) {
      fieldDiffs.push(
        `المحور: من «${orDash(previous.componentAxis)}» إلى «${orDash(lesson.componentAxis)}»`
      );
    }
    if (previous.kind !== lesson.kind) {
      fieldDiffs.push(
        `نوع الحصة: من ${KIND_LABELS[previous.kind ?? "lesson"]} إلى ${KIND_LABELS[lesson.kind ?? "lesson"]}`
      );
    }
    if (lessonBreakMinutes(previous) !== lessonBreakMinutes(lesson)) {
      fieldDiffs.push(
        `الاستراحة بعدها: من ${lessonBreakMinutes(previous)} د إلى ${lessonBreakMinutes(lesson)} د`
      );
    }
    if (previous.block !== lesson.block) {
      fieldDiffs.push(
        `الفترة: من ${periodLabelOf(previous.block)} إلى ${periodLabelOf(lesson.block)}`
      );
    }
    if ((previous.levelLabel || "").trim() !== (lesson.levelLabel || "").trim()) {
      fieldDiffs.push(
        `المستوى: من «${(previous.levelLabel || "").trim() || "—"}» إلى «${(lesson.levelLabel || "").trim() || "—"}»`
      );
    }
    if (
      (previous.sourceDayKey ?? "") !== (lesson.sourceDayKey ?? "") ||
      (previous.sourceLessonNumber ?? null) !== (lesson.sourceLessonNumber ?? null)
    ) {
      fieldDiffs.push(
        `مصدر التوزيع: من ${orDash(previous.sourceDayKey)}#${previous.sourceLessonNumber ?? "—"} إلى ${orDash(lesson.sourceDayKey)}#${lesson.sourceLessonNumber ?? "—"}`
      );
    }
    if (fieldDiffs.length) {
      diffs.push(`تعديل حصة (${lessonDescription(lesson)}): ${fieldDiffs.join("؛ ")}`);
    }
  }
  for (const [key, lesson] of oldMap) {
    if (!matched.has(key)) diffs.push(`حذف حصة: ${lessonDescription(lesson)}`);
  }

  /* فروق الترويسة — بينها حقول يكتبها الأستاذ فوق المولّدة (unit/notes/day/section)
     وإعادة التوليد قد تفرّغها أو تغيّرها بمصادر الملف الشخصي */
  const text = (value: string) => (value ?? "").trim() || "—";
  const headerFields: string[] = [];
  const pushIfChanged = (label: string, from: string, to: string) => {
    if (from !== to) headerFields.push(`${label}: من «${from}» إلى «${to}»`);
  };
  pushIfChanged("اليوم", text(oldMemo.day), text(newMemo.day));
  pushIfChanged("الوحدة", text(oldMemo.unit), text(newMemo.unit));
  pushIfChanged("التاريخ", text(oldMemo.date), text(newMemo.date));
  pushIfChanged("القسم", text(oldMemo.section), text(newMemo.section));
  pushIfChanged("الموسم الدراسي", text(oldMemo.academicYear), text(newMemo.academicYear));
  pushIfChanged(
    "الفترة",
    periodLabelOf(oldMemo.period),
    periodLabelOf(newMemo.period)
  );
  pushIfChanged("المرحلة", text(oldMemo.stage), text(newMemo.stage));
  pushIfChanged("الأسبوع", text(oldMemo.week), text(newMemo.week));
  pushIfChanged("المادة", text(oldMemo.subject), text(newMemo.subject));
  pushIfChanged("المستوى", text(oldMemo.level), text(newMemo.level));
  pushIfChanged("المؤسسة", text(oldMemo.institution), text(newMemo.institution));
  pushIfChanged("الأستاذ(ة)", text(oldMemo.teacher), text(newMemo.teacher));
  pushIfChanged("المدير", text(oldMemo.director), text(newMemo.director));
  pushIfChanged("المفتش", text(oldMemo.inspector), text(newMemo.inspector));
  pushIfChanged("الملاحظات", text(oldMemo.notes), text(newMemo.notes));
  if (oldMemo.showDismissal !== newMemo.showDismissal) {
    headerFields.push(
      `صف الخروج: من ${oldMemo.showDismissal ? "مفعل" : "معطل"} إلى ${newMemo.showDismissal ? "مفعل" : "معطل"}`
    );
  }
  if (oldMemo.showNotes !== newMemo.showNotes) {
    headerFields.push(
      `الملاحظات في الطباعة: من ${oldMemo.showNotes ? "ظاهرة" : "مخفية"} إلى ${newMemo.showNotes ? "ظاهرة" : "مخفية"}`
    );
  }
  if (oldMemo.showSignatures !== newMemo.showSignatures) {
    headerFields.push(
      `التواقيع: من ${oldMemo.showSignatures ? "ظاهرة" : "مخفية"} إلى ${newMemo.showSignatures ? "ظاهرة" : "مخفية"}`
    );
  }
  if (headerFields.length) {
    diffs.push(`فروق الترويسة: ${headerFields.join("؛ ")}`);
  }
  return diffs;
}

/* ============================ الواجهة ============================ */

export interface SavedTtDraft {
  dayKey: string;
  dateIso: string;
}

interface Props {
  catalog: Catalog;
  selection: MemoSelection;
  /** حالة الجدول المقروءة مسبقًا عبر الجسر في معالج الفتح (لا قراءة هنا) */
  ttState: TimetableState | null;
  savedTtDrafts: SavedTtDraft[];
  onGenerate: (chosen: BridgeSession[], dayKey: string, dateIso: string) => void;
  onOpenDraft: (dayKey: string, dateIso: string) => void;
  onClose: () => void;
}

export default function TimetablePicker({
  catalog,
  selection,
  ttState,
  savedTtDrafts,
  onGenerate,
  onOpenDraft,
  onClose,
}: Props) {
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [dateIso, setDateIso] = useState(todayIso());

  const weekPlans = useMemo(
    () => (ttState ? buildWeekPlans(ttState) : []),
    [ttState]
  );
  const activePlan =
    weekPlans.find((plan) => plan.day.dayId === selectedDayId) ?? weekPlans[0] ?? null;

  /* الحصص القابلة للتحويل: ذات مادة، ومختارة، بترتيبها الزمني.
     الاختيار بمفتاح مرجع كائن الحصة (Set<BridgeSession>) لا بـperiodId:
     كائنات الجلسات ثابتة المرجع طوال عمر اللوحة (weekPlans مُحفَظ)،
     فتظل حصتا periodId مكرر مستقلتين في التحديد. */
  const selectable = activePlan
    ? activePlan.sessions.filter((session) => !!session.subjectId)
    : [];
  const [selectedSessions, setSelectedSessions] = useState<Set<BridgeSession>>(
    () => new Set(selectable)
  );

  function selectDay(dayId: string) {
    setSelectedDayId(dayId);
    const plan = weekPlans.find((item) => item.day.dayId === dayId) ?? null;
    setSelectedSessions(
      new Set((plan?.sessions ?? []).filter((session) => !!session.subjectId))
    );
  }

  const chosen: BridgeSession[] = selectable.filter((session) =>
    selectedSessions.has(session)
  );
  const hasSavedForTarget =
    activePlan != null &&
    savedTtDrafts.some(
      (draft) => draft.dayKey === activePlan.day.dayKey && draft.dateIso === dateIso
    );
  const dayLabel = (key: string) =>
    (catalog.config.weekDays ?? []).find((day) => day.key === key)?.label_ar ?? key;

  return (
    <div className="memo-picker-overlay" role="dialog" aria-modal="true">
      <div className="memo-picker-panel">
        <div className="memo-picker-head">
          <div>
            <h3>توليد مذكرة من استعمال الزمن</h3>
            <p>اختر اليوم والحصص التي تريد تحويلها — المعاينة أدناه هي ما سيُبنى.</p>
          </div>
          <button
            type="button"
            className="memo-picker-close"
            onClick={onClose}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {!ttState ? (
          <p className="memo-picker-empty">
            لا يوجد استعمال زمن محفوظ في هذا المتصفح. افتح مولّد استعمال الزمن
            وأنشئ جدولك أولاً، ثم عد إلى هنا.
          </p>
        ) : weekPlans.length === 0 ? (
          <p className="memo-picker-empty">
            استعمال الزمن المحفوظ لا يحتوي أيامًا بحصص قابلة للتحويل.
          </p>
        ) : (
          <>
            <div className="memo-picker-section">
              <span className="memo-picker-label">اليوم</span>
              <div className="memo-picker-days">
                {weekPlans.map((plan) => (
                  <button
                    key={plan.day.dayId}
                    type="button"
                    className={
                      "memo-picker-day" +
                      (activePlan?.day.dayId === plan.day.dayId ? " is-active" : "")
                    }
                    onClick={() => selectDay(plan.day.dayId)}
                  >
                    {plan.day.label}
                    <em>{plan.day.lessonCount} حصص</em>
                  </button>
                ))}
              </div>
            </div>

            <div className="memo-picker-section">
              <label className="memo-picker-label" htmlFor="memo-tt-date">
                تاريخ المذكرة
              </label>
              <input
                id="memo-tt-date"
                type="date"
                className="memo-picker-date"
                value={dateIso}
                onChange={(event) => setDateIso(event.target.value || todayIso())}
              />
            </div>

            {savedTtDrafts.length > 0 && (
              <div className="memo-picker-section">
                <span className="memo-picker-label">مسودات مولّدة محفوظة</span>
                <div className="memo-picker-saved">
                  {savedTtDrafts.map((draft) => (
                    <button
                      key={`ttm:${draft.dayKey}:${draft.dateIso}`}
                      type="button"
                      className="memo-picker-saved-chip"
                      onClick={() => onOpenDraft(draft.dayKey, draft.dateIso)}
                    >
                      {dayLabel(draft.dayKey)} · {draft.dateIso}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="memo-picker-section">
              <span className="memo-picker-label">
                حصص {activePlan?.day.label ?? ""} — المعاينة قبل التحويل
              </span>
              {!activePlan ||
              activePlan.sessions.filter((session) => !!session.subjectId).length === 0 ? (
                <p className="memo-picker-empty">
                  لا توجد حصص بمادة في هذا اليوم (الاستراحات والفترات الفارغة
                  مستبعدة).
                </p>
              ) : (
                <div className="memo-picker-list">
                  {selectable
                    .map((session, index) => ({ session, index }))
                    .map(({ session, index }) => {
                      const content = resolveTimetableLessonContent(
                        catalog,
                        selection,
                        session
                      );
                      const checked = selectedSessions.has(session);
                      return (
                        <label
                          key={`${session.periodId}#${index}`}
                          className={"memo-picker-session" + (checked ? " is-checked" : "")}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              setSelectedSessions((previous) => {
                                const next = new Set(previous);
                                if (event.target.checked) next.add(session);
                                else next.delete(session);
                                return next;
                              });
                            }}
                          />
                          <span className="memo-picker-session-time">
                            {session.start}–{session.end}
                          </span>
                          <span className="memo-picker-session-main">
                            <b>{session.subjectName || session.subjectId}</b>
                            <small>
                              {session.levelName || "—"}
                              {session.group ? ` · ${session.group}` : ""}
                              {session.sessionOrdinal >= 1
                                ? ` · ${sessionLabel(session.sessionOrdinal)}`
                                : ""}
                              {session.breakMinutesAfter > 0
                                ? ` · استراحة ${session.breakMinutesAfter} د بعدها`
                                : ""}
                            </small>
                            <em>
                              {content.hasSource
                                ? content.topic || "بدون عبارة درس في التوزيع"
                                : "بدون محتوى تلقائي — يُكتب يدويًا"}
                            </em>
                          </span>
                        </label>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="memo-picker-foot">
              <span>
                {chosen.length > 0
                  ? `سيتم تحويل ${chosen.length} حصة إلى مذكرة.`
                  : "اختر حصة واحدة على الأقل."}
              </span>
              <div className="memo-picker-foot-actions">
                <button type="button" className="memo-btn memo-btn-ghost" onClick={onClose}>
                  إلغاء
                </button>
                <button
                  type="button"
                  className="memo-btn memo-btn-primary"
                  disabled={chosen.length === 0 || !activePlan}
                  onClick={() =>
                    activePlan &&
                    onGenerate(chosen, activePlan.day.dayKey, dateIso)
                  }
                >
                  توليد المذكرة
                </button>
              </div>
            </div>
            {hasSavedForTarget && (
              <p className="memo-picker-warning">
                توجد مسودة مولّدة محفوظة لهذا اليوم والتاريخ — سيُطلب تأكيد
                الاستبدال مع عرض التغييرات.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
