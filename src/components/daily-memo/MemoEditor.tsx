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
  LogOut,
  Plus,
  Signature,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import type {
  LessonSubjectOption,
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
  levelOptions: Array<{ level: number; label: string }>;
  subjectOptions: LessonSubjectOption[];
  defaultLevel: number;
  multiLevel: boolean;
  grouped: boolean;
  onChange: (patch: Partial<MemoState>) => void;
  onLessonChange: (id: string, patch: Partial<MemoLesson>) => void;
  onAddLesson: () => void;
  onRemoveLesson: (id: string) => void;
  onDuplicateLesson: (id: string) => void;
  onMoveLesson: (id: string, direction: -1 | 1) => void;
  onReset: () => void;
}

const LEVEL_FIELD: TemplateField = {
  key: "level",
  label_ar: "المستوى",
  label_fr: "Niveau",
  order: 0,
  type: "select",
  scope: "lesson",
};

const GROUP_FIELD: TemplateField = {
  key: "group",
  label_ar: "الفوج",
  label_fr: "Groupe",
  order: 0,
  type: "text",
  scope: "lesson",
};

const SUBJECT_FIELD: TemplateField = {
  key: "subject",
  label_ar: "المادة",
  label_fr: "Matière",
  order: 0,
  type: "select",
  scope: "lesson",
};

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
  levelOptions,
  subjectOptions,
  defaultLevel,
  multiLevel,
  grouped,
  sessionNumber,
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
  levelOptions: Array<{ level: number; label: string }>;
  subjectOptions: LessonSubjectOption[];
  defaultLevel: number;
  multiLevel: boolean;
  grouped: boolean;
  sessionNumber: number;
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
  const currentSession = lesson.sessionNumber ?? sessionNumber;
  const update = (patch: Partial<MemoLesson>) => onLessonChange(lesson.id, patch);
  const currentSubjectCode = lesson.subjectCode ?? "";
  const currentSubject = subjectOptions.find(
    (subject) => subject.code === currentSubjectCode
  );
  const lessonLevel = lesson.levelNumber ?? defaultLevel;
  const subjectLevel =
    currentSubject?.levels.find((item) => item.level === lessonLevel) ??
    currentSubject?.levels[0];
  /* في المواد ذات المحاور يُعرض المكون كقائمة اختيار، مع الحفاظ على أي قيمة
     مكتوبة سابقًا حتى لا يضيع عمل الأستاذ(ة) عند تغيير المادة أو المستوى. */
  const componentChoices = currentSubject
    ? Array.from(
        new Set(
          [...(subjectLevel?.componentOptions ?? []), lesson.component]
            .map((value) => value.trim())
            .filter(Boolean)
        )
      )
    : [];
  const hasComponentChoices =
    !!currentSubject?.structuredComponents && componentChoices.length > 0;

  return (
    <article className="memo-lesson-card">
      <header className="memo-lesson-head">
        <div className="memo-lesson-handle" aria-hidden="true">
          <GripVertical className="h-4 w-4" />
          <span>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div className="memo-lesson-title">
          <h3>{`الحصة ${currentSession}`}</h3>
          <p>
            {KIND_LABELS[lesson.kind || "lesson"]}
            {lesson.sourceLessonNumber ? ` · الدرس ${lesson.sourceLessonNumber}` : ""}
            {` · السطر ${String(index + 1).padStart(2, "0")}`}
          </p>
        </div>
        {lesson.levelLabel ? (
          <span className="memo-lesson-level-pill">
            <Layers3 className="h-3.5 w-3.5" />
            {lesson.levelLabel}
            {lesson.groupLabel ? <b>{lesson.groupLabel}</b> : null}
          </span>
        ) : null}
        {currentSubject ? (
          <span className="memo-lesson-subject-pill">
            {currentSubject.name}
          </span>
        ) : null}
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
        {multiLevel ? (
          <Label
            field={LEVEL_FIELD}
            className="memo-field-level"
            hint="يحدّد المستوى الذي تتبعه هذه الحصة."
          >
            <select
              className="memo-input"
              value={lesson.levelNumber ?? defaultLevel}
              onChange={(event) => {
                const nextLevel = Number(event.target.value);
                const option = levelOptions.find(
                  (item) => item.level === nextLevel
                );
                update({
                  levelNumber: option ? option.level : undefined,
                  levelLabel: option?.label,
                });
              }}
            >
              {levelOptions.map((item) => (
                <option key={item.level} value={item.level}>
                  {item.label}
                </option>
              ))}
            </select>
          </Label>
        ) : null}
        {grouped ? (
          <Label
            field={GROUP_FIELD}
            hint="الفوج المختار لهذه الحصة، ويمكن كتابة اسم آخر."
          >
            <input
              className="memo-input"
              list={`memo-groups-${lesson.id}`}
              value={lesson.groupLabel || ""}
              onChange={(event) => update({ groupLabel: event.target.value })}
              placeholder="مثال: الفوج الأول"
            />
            <datalist id={`memo-groups-${lesson.id}`}>
              <option value="الفوج الأول" />
              <option value="الفوج الثاني" />
            </datalist>
          </Label>
        ) : null}
        <Label
          field={SUBJECT_FIELD}
          className="memo-field-subject"
          hint={
            currentSubject
              ? "مادة هذه الحصة وحدها، ويمكن أن تختلف عن بقية الحصص."
              : "اختر مادة هذه الحصة لتفعيل حقل المكون."
          }
        >
          <select
            className="memo-input"
            value={currentSubjectCode}
            onChange={(event) => {
              const nextCode = event.target.value;
              if (!nextCode) {
                update({ subjectCode: undefined, component: "", topic: "" });
                return;
              }
              update({ subjectCode: nextCode });
            }}
          >
            <option value="">— اختر المادة —</option>
            {subjectOptions.map((subject) => (
              <option key={subject.code} value={subject.code}>
                {subject.name}
              </option>
            ))}
          </select>
        </Label>
        <Label
          field={component}
          className="memo-field-component"
          hint={
            !currentSubject
              ? "يتفعّل بعد اختيار المادة."
              : hasComponentChoices
                ? "اختر المكون من محاور المادة."
                : "حقل حر: اكتب المكون كما تريده."
          }
        >
          {!currentSubject ? (
            <input
              className="memo-input"
              value=""
              disabled
              placeholder="اختر المادة أولًا"
            />
          ) : hasComponentChoices ? (
            <select
              className="memo-input"
              value={lesson.component}
              onChange={(event) => update({ component: event.target.value })}
            >
              <option value="">— اختر المكون —</option>
              {componentChoices.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          ) : (
            inputFor(component!, lesson.component, (value) =>
              update({ component: value })
            )
          )}
        </Label>
        <Label
          field={section}
          className="memo-field-section"
          hint={
            grouped
              ? "تظهر أسفل المستوى والفوج في الجدول."
              : "تظهر مباشرة في خانة القسم بالجدول."
          }
        >
          {inputFor(section!, lesson.section, (value) => update({ section: value }))}
        </Label>
        <Label field={session} className="memo-field-session">
          {inputFor(session!, lesson.session, (value) => update({ session: value }))}
        </Label>
        <Label field={rj} className="memo-field-rj">
          {inputFor(rj!, lesson.rj, (value) => update({ rj: value }))}
        </Label>
        <Label field={topic} className="memo-field-topic">
          {inputFor(topic!, lesson.topic, (value) => update({ topic: value }))}
        </Label>
        <Label field={objectives} className="memo-field-objectives">
          {inputFor(objectives!, lesson.objectives, (value) =>
            update({ objectives: value })
          )}
        </Label>
        <Label field={stages} className="memo-field-stages">
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
  levelOptions,
  subjectOptions,
  defaultLevel,
  multiLevel,
  grouped,
  onChange,
  onLessonChange,
  onAddLesson,
  onRemoveLesson,
  onDuplicateLesson,
  onMoveLesson,
  onReset,
}: Props) {
  const lastLesson = memo.lessons[memo.lessons.length - 1];
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
            {memo.sessionNumber ? <span>{`الحصة ${memo.sessionNumber}`}</span> : null}
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
            موضوع الحصة يُستخرج تلقائيًا من توزيع الأسبوع حسب الحصة والمادة المختارة.
            اختر مادة كل حصة داخل بطاقتها، ثم عدّل المكون والموضوع عند الحاجة؛ واليوم الفعلي يظهر في الترويسة فقط.
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
              <h2>
                {multiLevel
                  ? "حصص المذكرة المشتركة"
                  : grouped
                    ? "حصص الأفواج"
                    : "حصص المذكرة"}
              </h2>
              <p>
                {memo.lessons.length
                  ? multiLevel
                    ? `${lessonsCountLabel(memo.lessons.length)} — ${memo.level}. حصة لكل فوج مختار، ويمكن تعديل كل حصة ومادتها واستراحتها.`
                    : grouped
                      ? `${lessonsCountLabel(memo.lessons.length)} — ${memo.level}. حصة مستقلة لكل فوج مختار، مع إمكانية تعديل المادة والاستراحة.`
                      : `${lessonsCountLabel(memo.lessons.length)} — ${periodLabel(template, memo.period)}${memo.sessionNumber ? ` · الحصة ${memo.sessionNumber}` : ""}. لكل حصة مدتها ومادتها ومكونها وقسمها، مع استراحة قابلة للتعديل بين الحصص.`
                  : `لا توجد حصص بعد. أضف حصة فارغة أو اختر حصة جاهزة من خريطة الأسبوع — ${periodLabel(template, memo.period)}.`}
              </p>
            </div>
          </div>
          <button type="button" className="memo-btn memo-btn-soft" onClick={onAddLesson}>
            <Plus className="h-4 w-4" />
            إضافة حصة
          </button>
        </div>

        {grouped ? (
          <div className="memo-combined-note">
            <span className="memo-combined-icon">
              <UsersRound className="h-4 w-4" />
            </span>
            <div>
              <b>
                {multiLevel
                  ? `مذكرة مشتركة: ${memo.level}`
                  : `مذكرة الأفواج: ${memo.level}`}
              </b>
              <span>
                {multiLevel
                  ? "توزَّع الحصص حسب الأفواج المختارة لكل مستوى، مع استراحة بعد الجولة الأولى حين توجد جولة أخرى وصف خروج في النهاية. كل سطر قابل للتعديل، وإذا كان أحد المستويات بلا درس في هذه الحصة يُعتمد المستوى الآخر."
                  : "لكل فوج مختار حصة مستقلة بنفس موضوع الحصة، مع إمكانية تعديل الاستراحة وصف الخروج. كل سطر قابل للتعديل."}
              </span>
            </div>
          </div>
        ) : null}

        <div className="memo-lessons">
          {memo.lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index}
              template={template}
              levelOptions={levelOptions}
              subjectOptions={subjectOptions}
              defaultLevel={defaultLevel}
              multiLevel={multiLevel}
              grouped={grouped}
              sessionNumber={memo.sessionNumber ?? 1}
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
              <span>أضف حصة فارغة لهذه المذكرة</span>
              <small>أو اختر حصة جاهزة من خريطة الأسبوع الجانبية</small>
            </button>
          ) : null}
        </div>

        {memo.lessons.length && (grouped || memo.showDismissal) ? (
          <div className="memo-exit-box">
            <div className="memo-exit-info">
              <span className="memo-exit-label">
                <LogOut className="h-4 w-4" />
                الخروج
              </span>
              <strong dir="ltr">{lastLesson?.timeTo || "—"}</strong>
              <small>يُحسب تلقائيًا من نهاية آخر حصة بعد الاستراحة.</small>
            </div>
            <label className="memo-switch">
              <input
                type="checkbox"
                checked={memo.showDismissal ?? false}
                onChange={(event) =>
                  onChange({ showDismissal: event.target.checked })
                }
              />
              <span />
              إظهار صف الخروج في الطباعة
            </label>
          </div>
        ) : null}
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
