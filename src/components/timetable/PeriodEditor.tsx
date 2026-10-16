"use client";

/* ============================================================
   محرّر حصص يوم واحد — توقيت أولًا، ثم المادة
   (يُستعمل داخل خطوة "برمجة الأيام" لكل يوم على حدة)
   ============================================================ */
import React from "react";
import {
  ArrowDown,
  ArrowUp,
  Coffee,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useTimetable } from "./store";
import { dayPeriods, durationOf } from "./schedule";
import {
  cx,
  detectOverlaps,
  formatDuration,
  validatePeriod,
} from "./utils";
import type { DayId } from "./types";

export default function PeriodEditor({ day }: { day: DayId }) {
  const { state, dispatch } = useTimetable();
  const list = dayPeriods(state, day);
  const overlaps = detectOverlaps(list);

  const update = (id: string, patch: Partial<typeof list[number]>) =>
    dispatch({ type: "UPDATE_PERIOD", day, id, patch });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_PERIOD", day })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> إضافة حصة
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_PERIOD", day, isBreak: true })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-bold text-text transition-colors hover:bg-background"
        >
          <Coffee className="h-4 w-4" /> إضافة استراحة
        </button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center">
          <p className="text-sm font-bold text-muted">لا توجد حصص في هذا اليوم بعد</p>
          <p className="mt-1 text-xs text-muted">
            اضغط «إضافة حصة» لتبدأ بتحديد توقيتها، ثم اختر مادتها
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((p, i) => {
            const issue = p.isBreak ? null : validatePeriod(p.start, p.end);
            const overlap = overlaps[p.id];
            const dur = durationOf(p);
            const valid = !issue && !overlap && dur > 0;

            return (
              <div
                key={p.id}
                className={cx(
                  "rounded-xl border bg-surface p-3 transition-colors",
                  issue || overlap ? "border-amber-300" : "border-border",
                  p.isBreak && "bg-background"
                )}
              >
                {/* ===== التوقيت ===== */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="w-6 shrink-0 text-center text-sm font-extrabold text-muted">
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

                  <label className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-muted">من</span>
                    <input
                      type="time"
                      value={p.start}
                      onChange={(e) => update(p.id, { start: e.target.value })}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-muted">إلى</span>
                    <input
                      type="time"
                      value={p.end}
                      onChange={(e) => update(p.id, { end: e.target.value })}
                      className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                    />
                  </label>

                  {dur > 0 && (
                    <span className="rounded-lg bg-background px-2 py-1.5 text-xs font-bold text-text">
                      {formatDuration(dur)}
                    </span>
                  )}

                  <div className="ms-auto flex items-center gap-1">
                    <button
                      type="button"
                      title="إلى الأعلى"
                      onClick={() => dispatch({ type: "MOVE_PERIOD", day, id: p.id, dir: -1 })}
                      disabled={i === 0}
                      className="rounded-lg border border-border p-1.5 text-muted transition-colors hover:bg-background disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="إلى الأسفل"
                      onClick={() => dispatch({ type: "MOVE_PERIOD", day, id: p.id, dir: 1 })}
                      disabled={i === list.length - 1}
                      className="rounded-lg border border-border p-1.5 text-muted transition-colors hover:bg-background disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="حذف"
                      onClick={() => dispatch({ type: "REMOVE_PERIOD", day, id: p.id })}
                      className="rounded-lg border border-red-200 p-1.5 text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* ===== المادة: تظهر فقط بعد صحّة التوقيت ===== */}
                {!p.isBreak && valid && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border pt-2.5">
                    <span className="text-xs font-bold text-muted">المادة:</span>
                    <select
                      value={p.subjectId ?? ""}
                      onChange={(e) =>
                        update(p.id, { subjectId: e.target.value || null })
                      }
                      className="min-w-48 flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm font-semibold outline-none focus:border-primary"
                    >
                      <option value="">— اختر المادة —</option>
                      {state.subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {!p.isBreak && valid && (
                  <input
                    type="text"
                    value={p.label ?? ""}
                    onChange={(e) => update(p.id, { label: e.target.value })}
                    placeholder="ملاحظة (اختياري): مثلًا «حصص نهائية»"
                    className="mt-2 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                  />
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
      )}
    </div>
  );
}