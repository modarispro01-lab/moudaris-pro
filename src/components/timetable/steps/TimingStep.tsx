"use client";

/* ============================================================
   الخطوة 2 — أيام العمل + إعداد الحصص والفترات الزمنية
   ============================================================ */
import React from "react";
import { CalendarDays } from "lucide-react";
import { DAYS } from "../defaults";
import { useTimetable } from "../store";
import { useConfirm } from "../ConfirmDialog";
import PeriodEditor from "../PeriodEditor";
import type { DayId } from "../types";
import { cx } from "../utils";

export default function TimingStep() {
  const { state, dispatch } = useTimetable();
  const confirm = useConfirm();

  const toggleDay = async (id: DayId) => {
    const exists = state.days.includes(id);
    if (exists) {
      const n = state.periods.filter(
        (p) => !p.isBreak && state.grid[id]?.[p.id]?.subjectId
      ).length;
      if (n > 0) {
        const name = DAYS.find((d) => d.id === id)?.name;
        const ok = await confirm(
          `يوم «${name}» يحتوي على ${n} حصة. سيتم إزالته من الجدول مع الاحتفاظ بحصصه إن أعدته لاحقًا.`,
          { title: "إزالة يوم", confirmLabel: "إزالة" }
        );
        if (!ok) return;
      }
      dispatch({ type: "SET_DAYS", days: state.days.filter((d) => d !== id) });
    } else {
      const next = DAYS.filter(
        (d) => state.days.includes(d.id) || d.id === id
      ).map((d) => d.id);
      dispatch({ type: "SET_DAYS", days: next });
    }
  };

  const setQuick = (count: number) => {
    const ids = DAYS.slice(0, count).map((d) => d.id);
    dispatch({ type: "SET_DAYS", days: ids });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-extrabold text-text">
          <CalendarDays className="h-4 w-4 text-primary" /> أيام العمل
        </h2>
        <p className="mb-4 text-xs text-muted">
          اختر الأيام التي تعمل بها فعليًا. ستظهر الأيام المختارة فقط في الجدول والطباعة.
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setQuick(5)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text hover:bg-background"
          >
            5 أيام
          </button>
          <button
            type="button"
            onClick={() => setQuick(6)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text hover:bg-background"
          >
            6 أيام
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => {
            const active = state.days.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleDay(d.id)}
                className={cx(
                  "rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-muted hover:border-primary/40"
                )}
              >
                {d.name}
              </button>
            );
          })}
        </div>
        {state.days.length === 0 && (
          <p className="mt-3 text-xs font-semibold text-amber-700">
            اختر يومًا واحدًا على الأقل.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-1 text-sm font-extrabold text-text">
          إعداد الحصص والفترات الزمنية
        </h2>
        <p className="mb-4 text-xs text-muted">
          حدّد وقت البداية والنهاية لكل حصة بحرّية تامة وفق توقيت مؤسستك. تُحسب المدّة
          تلقائيًا، وتُنبَّه إلى أي تداخل زمني.
        </p>
        <PeriodEditor />
      </section>
    </div>
  );
}
