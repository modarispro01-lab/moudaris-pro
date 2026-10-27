"use client";

import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Clock3,
  Coffee,
  Copy,
  Eraser,
  FileText,
  GripVertical,
  Layers3,
  Plus,
  Signature,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import type {
  MemoLesson,
  MemoState,
  TemplateConfig,
  TemplateField,
} from "./types";
import {
  cx,
  durationLabel,
  fieldLabel,
  formatDuration,
  formatLongDate,
  KIND_LABELS,
  lessonBreakMinutes,
  lessonsCountLabel,
  periodLabel,
  sortedFields,
} from "./types";

interface Props {
  memo: MemoState;
  template: TemplateConfig;
  onChange: (patch: Partial<MemoState>) => void;
  onLessonChange: (id: string, patch: Partial<MemoLesson>) => void;
  onAddLesson: () => void;
  onRemoveLesson: (id: string) => void;
  onDuplicateLesson: (id: string) => void;
  onMoveLesson: (id: string, direction: -1 | 1) => void;
  onReset: () => void;
}

function Label({
  field,
  children,
  hint,
  className,
}: {
  field?: TemplateField;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cx("memo-field", className)}>
      <span className="memo-field-label">
        {field?.label_ar || ""}
        {field?.required ? <b>*</b> : null}
      </span>
      {children}
      {hint ? <span className="memo-field-hint">{hint}</span> : null}
    </label>
  );
}

function inputFor(
  field: TemplateField,
  value: string,
  onChange: (value: string) => void,
  className?: string
) {
  const placeholder = field.placeholder_ar || "";
  if (field.type === "textarea") {
    return (
      <textarea
        className={cx("memo-textarea", className)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={field.key === "topic" ? 2 : 3}
      />
    );
  }
  return (
    <input
      className={cx("memo-input", className)}
      type={field.type === "time" ? "time" : field.type === "date" ? "date" : "text"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
}

function LessonCard({
  lesson,
  index,
  template,
  onLessonChange,
  onRemove,
  onDuplicate,
  onMove,
  canMoveUp,
  canMoveDown,
}: {
  lesson: MemoLesson;
  index: number;
  template: TemplateConfig;
  onLessonChange: (id: string, patch: Partial<MemoLesson>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const timeFrom = template.fields.find((field) => field.key === "timeFrom");
  const timeTo = template.fields.find((field) => field.key === "timeTo");
  const section = template.fields.find((field) => field.key === "section");
  const component = template.fields.find((field) => field.key === "component");
  const session = template.fields.find((field) => field.key === "session");
  const rj = template.fields.find((field) => field.key === "rj");
  const topic = template.fields.find((field) => field.key === "topic");
  const objectives = template.fields.find((field) => field.key === "objectives");
  const stages = template.fields.find((field) => field.key === "stages");
  const duration = durationLabel(lesson.timeFrom, lesson.timeTo);
  const breakMinutes = lessonBreakMinutes(lesson);
  const breakActive = breakMinutes > 0;
  const update = (patch: Partial<MemoLesson>) => onLessonChange(lesson.id, patch);

  return (
    <article className="memo-lesson-card">
      <header className="memo-lesson-head">
        <div className="memo-lesson-handle" aria-hidden="true">
          <GripVertical className="h-4 w-4" />
          <span>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div className="memo-lesson-title">
          <h3>
            {index === 0 ? "الحصة الأولى" : index === 1 ? "الحصة الثانية" : `الحصة ${index + 1}`}
          </h3>
          <p>
            {KIND_LABELS[lesson.kind || "lesson"]}
            {lesson.sourceLessonNumber ? ` · الدرس ${lesson.sourceLessonNumber}` : ""}
          </p>
        </div>
        <div className="memo-lesson-actions">
          <span className="memo-period-tag">
            <Clock3 className="h-3.5 w-3.5" />
            {periodLabel(template, lesson.block)}
          </span>
          <button
            type="button"
            className="memo-icon-btn"
            onClick={() => onMove(lesson.id, -1)}
            disabled={!canMoveUp}
            title="تحريك للأعلى"
            aria-label="تحريك للأعلى"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="memo-icon-btn"
            onClick={() => onMove(lesson.id, 1)}
            disabled={!canMoveDown}
            title="تحريك للأسفل"
            aria-label="تحريك للأسفل"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="memo-icon-btn"
            onClick={() => onDuplicate(lesson.id)}
            title="نسخ الحصة"
            aria-label="نسخ الحصة"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="memo-icon-btn is-danger"
            onClick={() => onRemove(lesson.id)}
            title="حذف الحصة"
            aria-label="حذف الحصة"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="memo-lesson-grid">
        <Label field={timeFrom}>
          {inputFor(timeFrom!, lesson.timeFrom, (value) => update({ timeFrom: value }))}
        </Label>
        <Label field={timeTo}>
          {inputFor(timeTo!, lesson.timeTo, (value) => update({ timeTo: value }))}
        </Label>
        <div className="memo-duration-box">
          <span>
            <Clock3 className="h-3.5 w-3.5" /> {fieldLabel(template, "duration", "المدة")}
          </span>
          <strong>{duration}</strong>
        </div>
        <Label field={section} hint="تظهر مباشرة في خانة القسم بالجدول.">
          {inputFor(section!, lesson.section, (value) => update({ section: value }))}
        </Label>
        <Label field={component}>
          {inputFor(component!, lesson.component, (value) => update({ component: value }))}
        </Label>
        <Label field={session}>
          {inputFor(session!, lesson.session, (value) => update({ session: value }))}
        </Label>
        <Label field={rj}>
          {inputFor(rj!, lesson.rj, (value) => update({ rj: value }))}
        </Label>
        <Label field={topic} className="memo-span-full">
          {inputFor(topic!, lesson.topic, (value) => update({ topic: value }))}
        </Label>
        <Label field={objectives}>
          {inputFor(objectives!, lesson.objectives, (value) =>
            update({ objectives: value })
          )}
        </Label>
        <Label field={stages}>
          {inputFor(stages!, lesson.stages, (value) => update({ stages: value }))}
        </Label>
      </div>

      <div className={cx("memo-break-box", breakActive && "is-active")}>
        <div className="memo-break-head">
          <span className="memo-break-label">
            <Coffee className="h-3.5 w-3.5" />
            استراحة بين الحصص
          </span>
          {breakActive ? (
            <span className="memo-break-summary">
              {formatDuration(breakMinutes)} بعد هذه الحصة
            </span>
          ) : (
            <button
              type="button"
              className="memo-break-add"
              onClick={() => update({ breakMinutes: 15 })}
            >
              <Plus className="h-3.5 w-3.5" />
              إضافة استراحة
            </button>
          )}
        </div>
        {breakActive ? (
          <div className="memo-break-body">
            <label className="memo-break-duration">
              <span>المدة بالدقائق</span>
              <input
                type="number"
                min={1}
                max={180}
                step={1}
                value={breakMinutes}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  update({
                    breakMinutes: Number.isFinite(value)
                      ? Math.min(180, Math.max(1, Math.round(value)))
                      : 1,
                  });
                }}
              />
            </label>
            <div className="memo-break-presets" role="group" aria-label="مدد جاهزة للاستراحة">
              {[10, 15, 20, 30].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={cx("memo-break-preset", breakMinutes === value && "is-active")}
                  onClick={() => update({ breakMinutes: value })}
                >
                  {value} د
                </button>
              ))}
            </div>
            <button
              type="button"
              className="memo-break-remove"
              onClick={() => update({ breakMinutes: 0 })}
            >
              <Trash2 className="h-3.5 w-3.5" />
              إزالة
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function MemoEditor({
  memo,
  template,
  onChange,
  onLessonChange,
  onAddLesson,
  onRemoveLesson,
  onDuplicateLesson,
  onMoveLesson,
  onReset,
}: Props) {
  const documentFields = sortedFields(template, "document");
  const headerFields = sortedFields(template, "header");
  const notesField = sortedFields(template, "footer")[0];

  const docValue = (key: string) => {
    if (key === "institution") return memo.institution;
    if (key === "teacher") return memo.teacher;
    if (key === "academicYear") return memo.academicYear;
    if (key === "level") return memo.level;
    if (key === "subject") return memo.subject;
    return "";
  };

  const headerValue = (key: string) => {
    if (key === "date") return memo.date;
    if (key === "unit") return memo.unit;
    if (key === "week") return memo.week;
    if (key === "day") return memo.day;
    if (key === "section") return memo.section;
    return "";
  };

  return (
    <div className="memo-editor">
      <section className="memo-panel">
        <div className="memo-panel-head">
          <div className="memo-panel-title">
            <span className="memo-panel-icon">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h2>بطاقة اليوم</h2>
              <p>المعطيات التي تظهر في ترويسة الوثيقة المطبوعة.</p>
            </div>
          </div>
          <div className="memo-context-pills">
            <span>{memo.subject}</span>
            <span>{memo.level}</span>
            <span>{memo.stage}</span>
            <span>{periodLabel(template, memo.period)}</span>
          </div>
        </div>

        <div className="memo-form-grid">
          {documentFields
            .filter((field) => field.key !== "level" && field.key !== "subject")
            .map((field) => (
              <Label
                key={field.key}
                field={field}
                className={
                  field.key === "institution" || field.key === "teacher"
                    ? "memo-col-4"
                    : "memo-col-2"
                }
              >
                {inputFor(field, docValue(field.key), (value) =>
                  onChange({ [field.key]: value } as Partial<MemoState>)
                )}
              </Label>
            ))}

          {headerFields.map((field) => (
            <Label
              key={field.key}
              field={field}
              className={
                field.key === "week" || field.key === "day" ? "memo-col-2" : "memo-col-2"
              }
              hint={field.key === "date" ? formatLongDate(memo.date) : undefined}
            >
              {inputFor(field, headerValue(field.key), (value) =>
                onChange({ [field.key]: value } as Partial<MemoState>)
              )}
            </Label>
          ))}
        </div>

        <div className="memo-source-line">
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            موضوع الحصة يُستخرج تلقائيًا من توزيع الأسبوع. الحقول التربوية الأخرى تبقى
            فارغة لتكتبها بنفسك.
          </span>
        </div>
      </section>

      <section className="memo-panel">
        <div className="memo-panel-head">
          <div className="memo-panel-title">
            <span className="memo-panel-icon">
              <Layers3 className="h-4 w-4" />
            </span>
            <div>
              <h2>حصص اليوم</h2>
              <p>
                {memo.lessons.length
                  ? `${lessonsCountLabel(memo.lessons.length)} — ${periodLabel(template, memo.period)}. عدّل المدة من/إلى والقسم لكل حصة، وأضف استراحة قابلة للتعديل بين الحصص.`
                  : `لا توجد حصص بعد. أضف حصة فارغة أو اختر درسًا من خريطة الأسبوع — ${periodLabel(template, memo.period)}.`}
              </p>
            </div>
          </div>
          <button type="button" className="memo-btn memo-btn-soft" onClick={onAddLesson}>
            <Plus className="h-4 w-4" />
            إضافة حصة
          </button>
        </div>

        <div className="memo-lessons">
          {memo.lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index}
              template={template}
              onLessonChange={onLessonChange}
              onRemove={onRemoveLesson}
              onDuplicate={onDuplicateLesson}
              onMove={onMoveLesson}
              canMoveUp={index > 0}
              canMoveDown={index < memo.lessons.length - 1}
            />
          ))}
          {!memo.lessons.length ? (
            <button type="button" className="memo-empty-add" onClick={onAddLesson}>
              <Plus className="h-5 w-5" />
              <span>أضف الحصة الأولى لهذا اليوم</span>
              <small>أو اختر درسًا جاهزًا من خريطة الأسبوع الجانبية</small>
            </button>
          ) : null}
        </div>
      </section>

      <section className="memo-panel">
        <div className="memo-panel-head">
          <div className="memo-panel-title">
            <span className="memo-panel-icon">
              <Signature className="h-4 w-4" />
            </span>
            <div>
              <h2>الملاحظات والتوقيعات</h2>
              <p>تظهر أسفل الوثيقة، ويمكن إخفاؤها قبل الطباعة.</p>
            </div>
          </div>
          <button type="button" className="memo-btn memo-btn-ghost" onClick={onReset}>
            <Eraser className="h-4 w-4" />
            إعادة توليد المذكرة
          </button>
        </div>

        <Label field={notesField}>
          <textarea
            className="memo-textarea"
            rows={4}
            value={memo.notes}
            onChange={(event) => onChange({ notes: event.target.value })}
            placeholder={notesField?.placeholder_ar || "ملاحظات حول سير الحصة أو المتابعة"}
          />
        </Label>

        <div className="memo-switches">
          <label className="memo-switch">
            <input
              type="checkbox"
              checked={memo.showNotes}
              onChange={(event) => onChange({ showNotes: event.target.checked })}
            />
            <span />
            إظهار الملاحظات في الطباعة
          </label>
          <label className="memo-switch">
            <input
              type="checkbox"
              checked={memo.showSignatures}
              onChange={(event) => onChange({ showSignatures: event.target.checked })}
            />
            <span />
            إظهار التوقيعات في الطباعة
          </label>
        </div>

        <div className="memo-sign-grid">
          <Label field={{ key: "director", label_ar: "المدير(ة)", label_fr: "", order: 1, type: "text", scope: "footer" }}>
            <div className="memo-with-icon">
              <UserRound className="h-4 w-4" />
              <input
                className="memo-input"
                value={memo.director}
                onChange={(event) => onChange({ director: event.target.value })}
                placeholder="اسم المدير(ة)"
              />
            </div>
          </Label>
          <Label field={{ key: "inspector", label_ar: "المفتش(ة)", label_fr: "", order: 2, type: "text", scope: "footer" }}>
            <div className="memo-with-icon">
              <UserRound className="h-4 w-4" />
              <input
                className="memo-input"
                value={memo.inspector}
                onChange={(event) => onChange({ inspector: event.target.value })}
                placeholder="اسم المفتش(ة)"
              />
            </div>
          </Label>
        </div>
      </section>
    </div>
  );
}
