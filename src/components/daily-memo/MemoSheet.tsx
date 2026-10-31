"use client";

import { Fragment } from "react";
import type { MemoLesson, MemoState, TemplateConfig } from "./types";
import {
  breaksCountLabel,
  cx,
  durationLabel,
  fieldLabel,
  formatDuration,
  formatLongDate,
  lessonBreakMinutes,
  lessonsCountLabel,
  periodLabel,
} from "./types";

interface Props {
  memo: MemoState;
  template: TemplateConfig;
}

function valueOrDash(value: string): string {
  return value.trim() ? value : "—";
}

function ContentCell({
  lesson,
  template,
}: {
  lesson: MemoLesson;
  template: TemplateConfig;
}) {
  const objectivesLabel = fieldLabel(template, "objectives", "الأهداف");
  const stagesLabel = fieldLabel(template, "stages", "المراحل");
  return (
    <div className="ms-content">
      <div className="ms-topic">{valueOrDash(lesson.topic)}</div>
      {lesson.objectives.trim() ? (
        <div className="ms-subline">
          <span>{objectivesLabel}:</span> {lesson.objectives}
        </div>
      ) : null}
      {lesson.stages.trim() ? (
        <div className="ms-subline">
          <span>{stagesLabel}:</span> {lesson.stages}
        </div>
      ) : null}
    </div>
  );
}

function lessonRow(lesson: MemoLesson, template: TemplateConfig, index: number) {
  return (
    <tr key={lesson.id} className={cx("ms-lesson-row", index % 2 === 0 ? "ms-row-even" : "")}>
      {template.tableColumns.map((column) => {
        if (column.kind === "timeRange") {
          return (
            <td key={column.key} className="ms-center ms-time">
              <span dir="ltr">
                {lesson.timeFrom || "—"} — {lesson.timeTo || "—"}
              </span>
            </td>
          );
        }
        if (column.kind === "duration") {
          return (
            <td key={column.key} className="ms-center ms-duration">
              {durationLabel(lesson.timeFrom, lesson.timeTo)}
            </td>
          );
        }
        if (column.kind === "content") {
          return (
            <td key={column.key}>
              <ContentCell lesson={lesson} template={template} />
            </td>
          );
        }
        if (column.key === "section") {
          if (lesson.levelLabel || lesson.groupLabel) {
            return (
              <td key={column.key} className="ms-center ms-level-cell">
                <span className="ms-level-name">
                  {lesson.levelLabel || valueOrDash(lesson.section)}
                </span>
                {lesson.groupLabel ? (
                  <span className="ms-group-name">{lesson.groupLabel}</span>
                ) : null}
                {lesson.section.trim() ? (
                  <span className="ms-section-name">{lesson.section}</span>
                ) : null}
              </td>
            );
          }
          return (
            <td key={column.key} className="ms-center">
              {valueOrDash(lesson.section)}
            </td>
          );
        }
        if (column.key === "component") {
          return (
            <td key={column.key} className="ms-center">
              {valueOrDash(lesson.component)}
            </td>
          );
        }
        if (column.key === "session") {
          return (
            <td key={column.key} className="ms-center">
              {valueOrDash(lesson.session)}
            </td>
          );
        }
        if (column.key === "rj") {
          return (
            <td key={column.key} className="ms-center">
              {valueOrDash(lesson.rj)}
            </td>
          );
        }
        return <td key={column.key} />;
      })}
    </tr>
  );
}

function blankRow(template: TemplateConfig, rowKey: string) {
  return (
    <tr key={rowKey} className="ms-blank-row" aria-hidden="true">
      {template.tableColumns.map((column) => (
        <td key={column.key}>&nbsp;</td>
      ))}
    </tr>
  );
}

function breakRow(lesson: MemoLesson, template: TemplateConfig) {
  const minutes = lessonBreakMinutes(lesson);
  if (!minutes) return null;
  return (
    <tr key={`${lesson.id}-break`} className="ms-break-row">
      <td colSpan={template.tableColumns.length}>
        <span className="ms-break-inner">
          <b>استراحة</b>
          <i aria-hidden="true" />
          <em>{formatDuration(minutes)}</em>
        </span>
      </td>
    </tr>
  );
}

function dismissalRow(time: string, template: TemplateConfig) {
  return (
    <tr className="ms-dismissal-row">
      <td colSpan={template.tableColumns.length}>
        <span className="ms-dismissal-inner">
          <b>الخروج</b>
          <i aria-hidden="true" />
          <em dir="ltr">{time || "—"}</em>
        </span>
      </td>
    </tr>
  );
}

export default function MemoSheet({ memo, template }: Props) {
  const lessons = memo.lessons;
  const period = memo.period;
  const blockTitle = periodLabel(template, period);
  const breakCount = lessons.filter((lesson) => lessonBreakMinutes(lesson) > 0).length;
  const hasLevels = lessons.some(
    (lesson) => !!lesson.levelLabel || !!lesson.groupLabel
  );
  const lastLesson = lessons[lessons.length - 1];
  const showDismissal = !!memo.showDismissal && !!lastLesson;
  const dismissalTime = lastLesson?.timeTo || "";
  const blankRows = Math.max(
    0,
    8 - lessons.length - breakCount - (showDismissal ? 1 : 0)
  );
  const meta = [
    {
      key: "date",
      label: fieldLabel(template, "date", "التاريخ"),
      value: formatLongDate(memo.date),
      wide: true,
    },
    {
      key: "stage",
      label: fieldLabel(template, "stage", "المرحلة"),
      value: valueOrDash(memo.stage),
      wide: false,
    },
    {
      key: "week",
      label: fieldLabel(template, "week", "الأسبوع"),
      value: valueOrDash(memo.week),
      wide: false,
    },
    {
      key: "day",
      label: fieldLabel(template, "day", "اليوم"),
      value: valueOrDash(memo.day),
      wide: false,
    },
    {
      key: "level",
      label: "المستوى / المادة",
      value: [memo.level, memo.subject].filter(Boolean).join(" · "),
      wide: false,
    },
  ];

  return (
    <article className="memo-sheet" dir="rtl" aria-label="معاينة المذكرة اليومية">
      <header className="ms-head">
        <div className="ms-brand">
          <div className="ms-emblem" aria-hidden="true">
            <span>م</span>
          </div>
          <div className="ms-brand-text">
            <p className="ms-kicker">وثيقة تربوية · التعليم الصريح</p>
            <h1>{template.title_ar}</h1>
            <p className="ms-subtitle">
              {[memo.subject, memo.level, memo.stage, blockTitle].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        <div className="ms-identity">
          <div>
            <span>{fieldLabel(template, "institution", "المؤسسة")}</span>
            <strong>{valueOrDash(memo.institution)}</strong>
          </div>
          <div>
            <span>{fieldLabel(template, "teacher", "الأستاذ(ة)")}</span>
            <strong>{valueOrDash(memo.teacher)}</strong>
          </div>
          <div>
            <span>{fieldLabel(template, "academicYear", "الموسم الدراسي")}</span>
            <strong>{valueOrDash(memo.academicYear)}</strong>
          </div>
        </div>
      </header>

      <div className="ms-rule" aria-hidden="true">
        <i />
        <b />
        <i />
      </div>

      <section className="ms-meta" aria-label="معطيات المذكرة">
        {meta.map((item) => (
          <div
            key={item.key}
            className={cx("ms-meta-item", item.wide && "is-wide")}
          >
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </section>

      <table className="ms-table">
        <colgroup>
          {template.tableColumns.map((column) => (
            <col key={column.key} style={{ width: column.width }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {template.tableColumns.map((column) => (
              <th key={column.key}>
                {column.key === "section" && hasLevels
                  ? "المستوى / الفوج"
                  : column.label_ar}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr className="ms-block">
            <td colSpan={template.tableColumns.length}>
              <span>
                {blockTitle}
                {memo.sessionNumber ? ` · الحصة ${memo.sessionNumber}` : ""}
              </span>
              <em>
                {lessons.length
                  ? `${lessonsCountLabel(lessons.length)}${
                      breakCount ? ` · ${breaksCountLabel(breakCount)}` : ""
                    }${showDismissal ? ` · الخروج ${dismissalTime}` : ""}`
                  : "بدون حصص — استعمل الصفوف الفارغة"}
              </em>
            </td>
          </tr>
          {lessons.map((lesson, index) => (
            <Fragment key={lesson.id}>
              {lessonRow(lesson, template, index)}
              {breakRow(lesson, template)}
            </Fragment>
          ))}
          {Array.from({ length: blankRows }).map((_, index) =>
            blankRow(template, `blank-${period}-${index}`)
          )}
          {showDismissal ? dismissalRow(dismissalTime, template) : null}
        </tbody>
      </table>

      {memo.showNotes ? (
        <section className="ms-notes">
          <div className="ms-notes-head">
            <span>{fieldLabel(template, "notes", "ملاحظات")}</span>
            <i aria-hidden="true" />
          </div>
          <div className={memo.notes.trim() ? "ms-notes-text" : "ms-notes-lines"}>
            {memo.notes.trim() || "\u00a0"}
          </div>
        </section>
      ) : null}

      <footer className="ms-footer">
        {memo.showSignatures ? (
          <div className="ms-signs">
            {template.signatures.map((signature) => {
              const name =
                signature.key === "teacher"
                  ? memo.teacher
                  : signature.key === "director"
                    ? memo.director
                    : memo.inspector;
              return (
                <div key={signature.key} className="ms-sign">
                  <span>{signature.label_ar}</span>
                  <strong>{valueOrDash(name)}</strong>
                  <em>التوقيع</em>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className="ms-credit">
          <span>أُعدّت بواسطة Modaris Pro — أداة المذكرة اليومية للتعليم الصريح</span>
          <span>صفحة 1 / 1</span>
        </div>
      </footer>
    </article>
  );
}
