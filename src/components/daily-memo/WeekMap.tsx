"use client";

import {
  BookOpenCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Info,
  Layers3,
  SpellCheck2,
} from "lucide-react";
import type {
  LevelData,
  LevelDay,
  LevelStage,
  LevelWeek,
  MemoSelection,
} from "./types";
import { cx, KIND_LABELS } from "./types";

interface Props {
  level: LevelData;
  levels: LevelData[];
  stage: LevelStage;
  week: LevelWeek;
  selection: MemoSelection;
  onLevelChange: (levelNumber: number) => void;
  onGo: (patch: Partial<MemoSelection>) => void;
  onAddDay: (day: LevelDay, levelNumber: number) => void;
  isAdded: (day: LevelDay, levelNumber: number) => boolean;
}

function kindClass(kind: LevelDay["kind"]): string {
  if (kind === "lesson") return "is-lesson";
  if (kind === "empty") return "is-empty";
  return "is-review";
}

export default function WeekMap({
  level,
  levels,
  stage,
  week,
  selection,
  onLevelChange,
  onGo,
  onAddDay,
  isAdded,
}: Props) {
  const stageIndex = level.stages.findIndex((item) => item.id === stage.id);
  const canPrev = stageIndex > 0;
  const canNext = stageIndex >= 0 && stageIndex < level.stages.length - 1;

  const goStage = (delta: -1 | 1) => {
    const next = level.stages[stageIndex + delta];
    if (next) onGo({ stageId: next.id, weekNumber: next.weeks[0]?.weekNumber ?? 1 });
  };

  return (
    <aside className="memo-side">
      <section className="memo-panel memo-side-panel">
        <div className="memo-panel-head is-compact">
          <div className="memo-panel-title">
            <span className="memo-panel-icon">
              <CalendarDays className="h-4 w-4" />
            </span>
            <div>
              <h2>خريطة الأسبوع</h2>
              <p>
                {levels.length > 1
                  ? "اختر المستوى النشط ثم أضف درسه إلى المذكرة المشتركة. الأحد عطلة أسبوعية."
                  : "اختر الدرس ثم أضفه إلى مذكرة اليوم. الأحد عطلة أسبوعية."}
              </p>
            </div>
          </div>
        </div>

        {levels.length > 1 ? (
          <div className="memo-level-tabs">
            <span className="memo-level-tabs-label">المستوى النشط</span>
            <div className="memo-level-tabs-list" role="tablist" aria-label="المستوى الحالي">
              {levels.map((item) => (
                <button
                  key={item.level}
                  type="button"
                  role="tab"
                  aria-selected={item.level === selection.level}
                  className={cx(
                    "memo-level-tab",
                    item.level === selection.level && "is-active"
                  )}
                  onClick={() => onLevelChange(item.level)}
                >
                  {item.levelLabel_ar}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="memo-stage-switch">
          <button
            type="button"
            className="memo-icon-btn"
            onClick={() => goStage(-1)}
            disabled={!canPrev}
            aria-label="المرحلة السابقة"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="memo-stage-current">
            <span>{level.levelLabel_ar}</span>
            <strong>{stage.title_ar}</strong>
          </div>
          <button
            type="button"
            className="memo-icon-btn"
            onClick={() => goStage(1)}
            disabled={!canNext}
            aria-label="المرحلة التالية"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="memo-stage-pills" role="tablist" aria-label="المراحل">
          {level.stages.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === stage.id}
              className={cx("memo-stage-pill", item.id === stage.id && "is-active")}
              onClick={() =>
                onGo({
                  stageId: item.id,
                  weekNumber: item.weeks[0]?.weekNumber ?? 1,
                })
              }
            >
              {item.number}
            </button>
          ))}
        </div>

        <div className="memo-week-pills" role="tablist" aria-label="الأسابيع">
          {stage.weeks.map((item) => (
            <button
              key={item.weekNumber}
              type="button"
              role="tab"
              aria-selected={item.weekNumber === week.weekNumber}
              className={cx(
                "memo-week-pill",
                item.weekNumber === week.weekNumber && "is-active"
              )}
              onClick={() => onGo({ weekNumber: item.weekNumber })}
              title={item.title_ar}
            >
              <b>{item.weekNumber}</b>
              <span>{item.title_ar.replace("الأسبوع ", "")}</span>
            </button>
          ))}
        </div>

        <div className="memo-days" aria-label="أيام الأسبوع">
          {week.days.map((day) => {
            const active = day.dayKey === selection.dayKey;
            const added = isAdded(day, level.level);
            const hasLesson = day.kind !== "empty" && !!day.content.topic_ar.trim();
            return (
              <div
                key={day.dayKey}
                className={cx("memo-day-row", active && "is-active", kindClass(day.kind))}
              >
                <button
                  type="button"
                  className="memo-day-main"
                  onClick={() => onGo({ dayKey: day.dayKey })}
                  aria-current={active ? "true" : undefined}
                >
                  <span className="memo-day-badge">
                    {day.lessonNumber ? day.lessonNumber : hasLesson ? "•" : "—"}
                  </span>
                  <span className="memo-day-text">
                    <span className="memo-day-label">
                      {day.label_ar}
                      <em>{KIND_LABELS[day.kind]}</em>
                    </span>
                    <span className="memo-day-topic">
                      {hasLesson ? day.content.topic_ar : "لا يوجد درس في التوزيع"}
                    </span>
                  </span>
                </button>
                {hasLesson ? (
                  <button
                    type="button"
                    className={cx("memo-day-add", added && "is-added")}
                    onClick={() => onAddDay(day, level.level)}
                    disabled={added}
                    title={added ? "مضاف إلى مذكرة اليوم" : "أضف إلى مذكرة اليوم"}
                    aria-label={added ? "مضاف إلى مذكرة اليوم" : "أضف إلى مذكرة اليوم"}
                  >
                    {added ? <Check className="h-4 w-4" /> : <CirclePlus className="h-4 w-4" />}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {level.dayPlanNote ? (
          <p className="memo-side-note">
            <Info className="h-3.5 w-3.5" />
            {level.dayPlanNote}
          </p>
        ) : null}
      </section>

      <section className="memo-panel memo-side-panel memo-source-card">
        <div className="memo-source-head">
          <span className="memo-source-icon">
            <BookOpenCheck className="h-4 w-4" />
          </span>
          <div>
            <h3>من التوزيع الرسمي</h3>
            <p>عبارات الدروس منقولة كما وردت في ملف التوزيع.</p>
          </div>
        </div>
        <div className="memo-source-stats">
          <div>
            <b>{level.stages.length}</b>
            <span>مراحل</span>
          </div>
          <div>
            <b>{level.stages.reduce((sum, item) => sum + item.weeks.length, 0)}</b>
            <span>أسابيع</span>
          </div>
          <div>
            <b>
              {level.stages.reduce(
                (sum, item) =>
                  sum +
                  item.weeks.reduce(
                    (weekSum, weekItem) =>
                      weekSum +
                      weekItem.days.filter(
                        (day) => day.kind !== "empty" && day.content.topic_ar
                      ).length,
                    0
                  ),
                0
              )}
            </b>
            <span>عبارة درس</span>
          </div>
        </div>
        <div className="memo-source-tags">
          <span>
            <Layers3 className="h-3.5 w-3.5" /> {level.source || "ملف التوزيع"}
          </span>
          <span>
            <SpellCheck2 className="h-3.5 w-3.5" /> بدون محتوى مُختلق
          </span>
        </div>
      </section>
    </aside>
  );
}
