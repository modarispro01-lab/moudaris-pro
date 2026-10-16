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
    <section className="edt-card">
      <h2 className="edt-card-title mb-2">
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
            className="edt-btn edt-btn-sm edt-btn-outline"
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
              className={cx("edt-chip", active && "is-on")}
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