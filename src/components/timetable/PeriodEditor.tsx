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
  groupLabel,
  validatePeriod,
} from "./utils";
import type { DayId } from "./types";

export default function PeriodEditor({ day }: { day: DayId }) {
  const { state, dispatch } = useTimetable();
  const list = dayPeriods(state, day);
  const overlaps = detectOverlaps(list);
  const levels = (state.info.levels || []).filter((l) => l.name.trim());

  const update = (id: string, patch: Partial<typeof list[number]>) =>
    dispatch({ type: "UPDATE_PERIOD", day, id, patch });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_PERIOD", day })}
          className="edt-btn edt-btn-sm edt-btn-primary"
        >
          <Plus className="h-4 w-4" /> إضافة حصة
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_PERIOD", day, isBreak: true })}
          className="edt-btn edt-btn-sm edt-btn-outline"
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
            const selectedLevel = levels.find((l) => l.id === p.levelId);

            return (
              <div
                key={p.id}
                className={cx(
                  "edt-period",
                  p.isBreak && "is-break",
                  (issue || overlap) && "is-warn"
                )}
              >
                {/* ===== التوقيت ===== */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="w-6 shrink-0 text-center text-sm font-extrabold text-muted">
                    {i + 1}
                  </span>

                  {p.isBreak ? (
                    <span className="edt-pill edt-pill-break inline-flex items-center gap-1.5">
                      <Coffee className="h-3.5 w-3.5" /> استراحة
                    </span>
                  ) : (
                    <span className="edt-pill edt-pill-lesson">حصة</span>
                  )}

                  <label className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-muted">من</span>
                    <input
                      type="time"
                      value={p.start}
                      onChange={(e) => update(p.id, { start: e.target.value })}
                      className="edt-input edt-time edt-w-auto"
                      style={{ width: "7.5rem" }}
                    />
                  </label>
                  <label className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-muted">إلى</span>
                    <input
                      type="time"
                      value={p.end}
                      onChange={(e) => update(p.id, { end: e.target.value })}
                      className="edt-input edt-time edt-w-auto"
                      style={{ width: "7.5rem" }}
                    />
                  </label>

                  {dur > 0 && (
                    <span className="edt-pill bg-background text-text">
                      {formatDuration(dur)}
                    </span>
                  )}

                  <div className="ms-auto flex items-center gap-1">
                    <button
                      type="button"
                      title="إلى الأعلى"
                      onClick={() => dispatch({ type: "MOVE_PERIOD", day, id: p.id, dir: -1 })}
                      disabled={i === 0}
                      className="edt-icon-btn"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="إلى الأسفل"
                      onClick={() => dispatch({ type: "MOVE_PERIOD", day, id: p.id, dir: 1 })}
                      disabled={i === list.length - 1}
                      className="edt-icon-btn"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="حذف"
                      onClick={() => dispatch({ type: "REMOVE_PERIOD", day, id: p.id })}
                      className="edt-icon-btn is-danger"
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
                      className="edt-select"
                      style={{ width: "auto", minWidth: "12rem", flex: 1 }}
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

                {/* ===== المستوى والفوج (يظهران تحت المادة في الجدول) ===== */}
                {!p.isBreak && valid && p.subjectId && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-muted">المستوى والفوج:</span>
                    {levels.length ? (
                      <>
                        <select
                          value={p.levelId ?? ""}
                          onChange={(e) => {
                            const levelId = e.target.value || undefined;
                            const lv = levels.find((l) => l.id === levelId);
                            update(p.id, {
                              levelId,
                              group: lv?.groups[0] || undefined,
                            });
                          }}
                          className="edt-select"
                          style={{ width: "auto", minWidth: "10rem", flex: 1 }}
                          aria-label="المستوى الدراسي"
                        >
                          <option value="">— بدون مستوى —</option>
                          {levels.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={p.group ?? ""}
                          onChange={(e) =>
                            update(p.id, { group: e.target.value || undefined })
                          }
                          disabled={!selectedLevel || !selectedLevel.groups.length}
                          className="edt-select"
                          style={{ width: "auto", minWidth: "8rem" }}
                          aria-label="الفوج"
                        >
                          <option value="">
                            {selectedLevel && !selectedLevel.groups.length
                              ? "لا أفواج لهذا المستوى"
                              : "— بدون فوج —"}
                          </option>
                          {(selectedLevel?.groups || []).map((g) => (
                            <option key={g} value={g}>
                              {groupLabel(g)}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <span className="text-[11px] leading-relaxed text-muted">
                        أضف المستوى والأفواج في الخطوة 1 «المعلومات» ليظهرا هنا وفي
                        الجدول.
                      </span>
                    )}
                  </div>
                )}

                {!p.isBreak && valid && (
                  <input
                    type="text"
                    value={p.label ?? ""}
                    onChange={(e) => update(p.id, { label: e.target.value })}
                    placeholder="ملاحظة (اختياري): مثلًا «حصص نهائية»"
                    className="edt-input mt-2 text-xs"
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
