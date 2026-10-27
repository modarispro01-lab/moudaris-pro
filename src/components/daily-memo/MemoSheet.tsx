"use client";

import type { MemoLesson, MemoState, TemplateConfig } from "./types";
import {
  cx,
  durationLabel,
  fieldLabel,
  formatLongDate,
  lessonsCountLabel,
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

export default function MemoSheet({ memo, template }: Props) {
  const blocks = template.blocks.slice().sort((a, b) => a.order - b.order);
  const morning = memo.lessons.filter((lesson) => lesson.block === "morning");
  const afternoon = memo.lessons.filter((lesson) => lesson.block === "afternoon");
  const hasAny = memo.lessons.length > 0;
  const meta = [
    { label: fieldLabel(template, "date", "التاريخ"), value: formatLongDate(memo.date) },
    { label: fieldLabel(template, "day", "اليوم"), value: valueOrDash(memo.day) },
    { label: fieldLabel(template, "week", "الأسبوع"), value: valueOrDash(memo.week) },
    { label: fieldLabel(template, "unit", "الوحدة"), value: valueOrDash(memo.unit) },
    { label: fieldLabel(template, "section", "القسم"), value: valueOrDash(memo.section) },
    { label: "المستوى / المادة", value: [memo.level, memo.subject].filter(Boolean).join(" · ") },
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
              {[memo.subject, memo.level, memo.stage].filter(Boolean).join(" · ")}
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
          <div key={item.label} className="ms-meta-item">
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
              <th key={column.key}>{column.label_ar}</th>
            ))}
          </tr>
        </thead>

        {blocks.map((block, blockIndex) => {
          const rows = block.key === "morning" ? morning : afternoon;
          if (!hasAny) return null;
          const emptyRows = Math.max(0, 4 - rows.length);
          const showBreak = blockIndex === 0;
          return (
            <tbody key={block.key}>
              <tr className="ms-block">
                <td colSpan={template.tableColumns.length}>
                  <span>{block.label_ar}</span>
                  <em>{rows.length ? lessonsCountLabel(rows.length) : "بدون حصص"}</em>
                </td>
              </tr>
              {rows.map((lesson, index) => lessonRow(lesson, template, index))}
              {Array.from({ length: emptyRows }).map((_, index) =>
                blankRow(template, `blank-${block.key}-${index}`)
              )}
              {showBreak ? (
                <tr className="ms-break">
                  <td colSpan={template.tableColumns.length}>فترة استراحة</td>
                </tr>
              ) : null}
            </tbody>
          );
        })}

        {!hasAny ? (
          <tbody>
            <tr>
              <td colSpan={template.tableColumns.length} className="ms-empty">
                لم تُضف حصص بعد — أضف حصة من لوحة التحرير لتظهر هنا.
              </td>
            </tr>
          </tbody>
        ) : null}
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
