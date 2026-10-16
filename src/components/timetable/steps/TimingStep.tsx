"use client";

/* ============================================================
   الخطوة 2 — اختيار أيام العمل فقط
   ============================================================ */
import React from "react";
import { CalendarDays, TriangleAlert } from "lucide-react";
import { DAYS } from "../defaults";
import { useTimetable } from "../store";
import { dayLessonCount } from "../schedule";
import type { DayId } from "../types";
import { cx } from "../utils";

export default function TimingStep() {
  const { state, dispatch } = useTimetable();

  const toggleDay = (id: DayId) => {
    if (state.days.includes(id)) {
      dispatch({ type: "SET_DAYS", days: state.days.filter((d) => d !== id) });
    } else {
      const next = DAYS.filter((d) => state.days.includes(d.id) || d.id === id).map(
        (d) => d.id
      );
      dispatch({ type: "SET_DAYS", days: next });
    }
  };

  const setQuick = (count: number) =>
    dispatch({ type: "SET_DAYS", days: DAYS.slice(0, count).map((d) => d.id) });

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-extrabold text-text">
        <CalendarDays className="h-4 w-4 text-primary" /> أيام العمل
      </h2>
      <p className="mb-4 text-xs text-muted">
        اختر الأيام التي تعمل بها فعليًا — من 1 إلى 6 أيام. ستظهر هذه الأيام فقط في
        الجدول والطباعة، ويمكنك تغييرها لاحقًا.
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {[5, 6].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setQuick(n)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text transition-colors hover:bg-background"
          >
            {n} أيام
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {DAYS.map((d) => {
          const active = state.days.includes(d.id);
          const n = dayLessonCount(state, d.id);
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => toggleDay(d.id)}
              className={cx(
                "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors",
                active
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-background text-muted hover:border-primary/40"
              )}
            >
              {d.name}
              {active && n > 0 && (
                <span className="rounded bg-white/20 px-1.5 text-[10px]">
                  {n} حصة
                </span>
              )}
            </button>
          );
        })}
      </div>

      {state.days.length === 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
          <TriangleAlert className="h-4 w-4 shrink-0" /> اختر يومًا واحدًا على
          الأقل للمتابعة.
        </div>
      )}
    </section>
  );
}