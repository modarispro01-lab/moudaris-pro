"use client";

/* ============================================================
   بطاقة حصة قابلة للتحرير — حفظ فوري عبر onChange
   بلا زر حفظ، وبلا زر تخطٍ (التخطي على مستوى اليوم).
   ============================================================ */

import type { LessonDoc, MindMapBranch, MindMapDoc } from "@/components/workspace/types";
import { defaultBranches } from "@/lib/mind-map";

export interface WeekLessonCardProps {
  lesson: LessonDoc;
  /** اسم المادة مشتقاً من استعمال الزمن (state.subjects) */
  subjectName: string;
  /** إرسال التعديل للأعلى — يُحفظ فوراً في مساحة العمل */
  onChange: (patch: Partial<LessonDoc>) => void;
  /** خريطة الحصة المحفوظة (مستقلة عن الأسبوع) */
  mindMap?: MindMapDoc;
  /** حفظ فروع الخريطة فوراً */
  onMindMapChange: (branches: MindMapBranch[]) => void;
}

/** حقل نصي مضبوط موحّد */
function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div className="wm-field">
      <label>{label}</label>
      {textarea ? (
        <textarea value={value} rows={2} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

export default function WeekLessonCard({
  lesson,
  subjectName,
  onChange,
  mindMap,
  onMindMapChange,
}: WeekLessonCardProps) {
  /* الفروع: المحفوظة إن وُجدت، وإلا مشتقة من حقول الحصة */
  const branches = mindMap?.branches?.length ? mindMap.branches : defaultBranches(lesson);

  return (
    <article className="wm-card">
      <div className="wm-card-head">
        <span className="wm-subject">{subjectName || "مادة"}</span>
        <span className="wm-component">{lesson.component || "—"}</span>
        <span className="wm-badge">الحصة {lesson.sessionNumber}</span>
        <span className="wm-badge wm-soft">{lesson.levelLabel}</span>
        {lesson.groupLabel ? (
          <span className="wm-badge wm-soft">{lesson.groupLabel}</span>
        ) : null}
        {lesson.edited ? <span className="wm-badge wm-soft">مُعدَّلة</span> : null}
      </div>

      {lesson.breakMinutes > 0 ? (
        <div className="wm-break">استراحة بعدها: {lesson.breakMinutes} د</div>
      ) : null}

      <div className="wm-grid">
        <div className="wm-field">
          <label>من</label>
          <input
            type="text"
            value={lesson.timeFrom}
            onChange={(e) => onChange({ timeFrom: e.target.value })}
          />
        </div>
        <div className="wm-field">
          <label>إلى</label>
          <input
            type="text"
            value={lesson.timeTo}
            onChange={(e) => onChange({ timeTo: e.target.value })}
          />
        </div>
        <div className="wm-field">
          <label>الفوج</label>
          <input
            type="text"
            value={lesson.groupLabel}
            onChange={(e) => onChange({ groupLabel: e.target.value })}
          />
        </div>
        <div className="wm-field">
          <label>المحور / المكون</label>
          <input
            type="text"
            value={lesson.component}
            onChange={(e) => onChange({ component: e.target.value })}
          />
        </div>
        <div className="wm-field wm-wide">
          <label>الموضوع</label>
          <textarea
            value={lesson.topic}
            rows={2}
            onChange={(e) => onChange({ topic: e.target.value })}
          />
        </div>
        <div className="wm-field wm-wide">
          <label>الأهداف</label>
          <textarea
            value={lesson.objectives}
            rows={2}
            onChange={(e) => onChange({ objectives: e.target.value })}
          />
        </div>
        <div className="wm-field wm-wide">
          <label>المراحل</label>
          <textarea
            value={lesson.stages}
            rows={2}
            onChange={(e) => onChange({ stages: e.target.value })}
          />
        </div>
        <div className="wm-field wm-wide">
          <label>الوسائل</label>
          <textarea
            value={lesson.materials ?? ""}
            rows={2}
            onChange={(e) => onChange({ materials: e.target.value })}
          />
        </div>
        <div className="wm-field wm-wide">
          <label>ملاحظات</label>
          <textarea
            value={lesson.note ?? ""}
            rows={2}
            onChange={(e) => onChange({ note: e.target.value })}
          />
        </div>
      </div>

      {/* ===== الخريطة الذهنية للحصة ===== */}
      <details className="wm-mm">
        <summary>الخريطة الذهنية ({branches.length} فروع)</summary>
        <div className="wm-mm-center">{lesson.topic || "بدون موضوع"}</div>
        <div className="wm-mm-grid">
          {branches.map((b) => (
            <div className="wm-mm-node" key={b.id}>
              <span className="wm-mm-label">{b.label}</span>
              <textarea
                value={b.text}
                rows={3}
                onChange={(e) =>
                  onMindMapChange(
                    branches.map((x) =>
                      x.id === b.id ? { ...x, text: e.target.value } : x
                    )
                  )
                }
              />
            </div>
          ))}
        </div>
      </details>
    </article>
  );
}
