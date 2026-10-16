"use client";

/**
 * محرّر الحصص والفترات الزمنية (الخطوة 2)
 * — تحديد البداية والنهاية أولًا، ثم يظهر اختيار المادة بعد صحّة التوقيت.
 */
import React from "react";
import {
  ArrowDown,
  ArrowUp,
  Coffee,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useTimetable } from "./store";
import { cx, durationMin, formatDuration, detectOverlaps, validatePeriod } from "./utils";
import type { Period } from "./types";

export default function PeriodEditor() {
  const { state, dispatch } = useTimetable();
  const overlaps = detectOverlaps(state.periods);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_PERIOD" })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> إضافة حصة
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_PERIOD", isBreak: true })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-bold text-text transition-colors hover:bg-background"
        >
          <Coffee className="h-4 w-4" /> إضافة استراحة
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "RESET_PERIODS" })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-bold text-muted transition-colors hover:bg-background"
        >
          <RotateCcw className="h-4 w-4" /> فترات افتراضية
        </button>
      </div>

      <div className="space-y-2">
        {state.periods.map((p, i) => {
          const issue = p.isBreak ? null : validatePeriod(p.start, p.end);
          const overlap = overlaps[p.id];
          const dur = durationMin(p.start, p.end);
          const valid = !issue && !overlap && dur && dur > 0;
          return (
            <div
              key={p.id}
              className={cx(
                "rounded-xl border bg-surface p-3 transition-colors",
                issue || overlap ? "border-amber-300" : "border-border",
                p.isBreak && "bg-background"
              )}
            >
              <div className="flex flex-wrap items-center gap-3">
                <GripVertical className="h-4 w-4 text-border" />

                <span className="w-8 text-center text-sm font-extrabold text-muted">
                  {i + 1}
                </span>

                {p.isBreak ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-bold text-amber-800">
                    <Coffee className="h-3.5 w-3.5" /> استراحة
                  </span>
                ) : (
                  <span className="rounded-lg bg-secondary/10 px-2.5 py-1.5 text-xs font-bold text-secondary">
                    حصة
                  </span>
                )}

                <label className="flex items-center gap-1.5 text-sm">
                  <span className="text-xs font-bold text-muted">من</span>
                  <input
                    type="time"
                    value={p.start}
                    onChange={(e) =>
                      dispatch({ type: "UPDATE_PERIOD", id: p.id, patch: { start: e.target.value } })
                    }
                    className="rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <span className="text-xs font-bold text-muted">إلى</span>
                  <input
                    type="time"
                    value={p.end}
                    onChange={(e) =>
                      dispatch({ type: "UPDATE_PERIOD", id: p.id, patch: { end: e.target.value } })
                    }
                    className="rounded-lg border border-border px-2 py-1.5 text-sm"
                  />
                </label>

                {dur && dur > 0 ? (
                  <span className="rounded-lg bg-background px-2.5 py-1.5 text-xs font-bold text-text">
                    {formatDuration(dur)}
                  </span>
                ) : null}

                <input
                  type="text"
                  value={p.label}
                  placeholder={p.isBreak ? "اسم الاستراحة" : "تسمية (اختياري)"}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_PERIOD", id: p.id, patch: { label: e.target.value } })
                  }
                  className="w-40 rounded-lg border border-border px-2 py-1.5 text-sm"
                />

                <div className="ms-auto flex items-center gap-1">
                  <button
                    type="button"
                    title="إلى الأعلى"
                    onClick={() => dispatch({ type: "MOVE_PERIOD", id: p.id, dir: -1 })}
                    className="rounded-lg border border-border p-1.5 text-muted hover:bg-background"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="إلى الأسفل"
                    onClick={() => dispatch({ type: "MOVE_PERIOD", id: p.id, dir: 1 })}
                    className="rounded-lg border border-border p-1.5 text-muted hover:bg-background"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="حذف"
                    onClick={() => dispatch({ type: "REMOVE_PERIOD", id: p.id })}
                    className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* اختيار المادة يظهر فقط بعد صحّة التوقيت */}
              {!p.isBreak && valid && (
                <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-2">
                  <span className="text-xs font-bold text-muted">
                    (اختياري) عمّم هذه المادة على كل أيام هذه الحصة:
                  </span>
                  <select
                    defaultValue=""
                    onChange={(e) =>
                      dispatch({
                        type: "APPLY_PERIOD_SUBJECT",
                        periodId: p.id,
                        subjectId: e.target.value || null,
                      })
                    }
                    className="rounded-lg border border-border px-2 py-1.5 text-sm"
                  >
                    <option value="">— بدووون —</option>
                    {state.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {issue && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                  <TriangleAlert className="h-3.5 w-3.5" /> {issue.msg}
                </div>
              )}
              {overlap && !issue && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                  <TriangleAlert className="h-3.5 w-3.5" /> {overlap}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {state.periods.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
          لا توجد فترات بعد. أضف حصّتك الأولى لتحديد توقيتها بحرّية كاملة.
        </div>
      )}
    </div>
  );
}

export type { Period };
