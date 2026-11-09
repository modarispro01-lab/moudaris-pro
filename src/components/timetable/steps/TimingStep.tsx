"use client";

/* ============================================================
   الخطوة 2 — توقيت الفترتين + اختيار أيام العمل
   ============================================================ */
import React from "react";
import { CalendarDays, Clock, TriangleAlert } from "lucide-react";
import { DAYS } from "../defaults";
import { useTimetable } from "../store";
import { dayLessonCount } from "../schedule";
import { cx, formatDuration, timeToMin } from "../utils";
import type { DayId, Timing } from "../types";

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

  const timing = state.timing;
  const setTiming = (patch: Partial<Timing>) =>
    dispatch({ type: "SET_TIMING", patch });

  const morningStart = timeToMin(timing.morningStart);
  const morningEnd = timeToMin(timing.morningEnd);
  const afternoonStart = timeToMin(timing.afternoonStart);
  const afternoonEnd = timeToMin(timing.afternoonEnd);

  const timingValid =
    morningStart !== null &&
    morningEnd !== null &&
    afternoonStart !== null &&
    afternoonEnd !== null &&
    morningStart < morningEnd &&
    morningEnd <= afternoonStart &&
    afternoonStart < afternoonEnd;

  const morningMin =
    morningStart !== null && morningEnd !== null
      ? Math.max(0, morningEnd - morningStart)
      : 0;
  const afternoonMin =
    afternoonStart !== null && afternoonEnd !== null
      ? Math.max(0, afternoonEnd - afternoonStart)
      : 0;

  return (
    <div className="space-y-6">
      {/* ===== توقيت الفترتين ===== */}
      <section className="edt-card">
        <h2 className="edt-card-title mb-2">
          <Clock className="h-4 w-4 text-primary-text" /> توقيت الفترتين
        </h2>
        <p className="mb-4 text-xs text-muted">
          تُعرض الفترتان الصباحية والمسائية دائمًا في الجدول، حتى إن كانت إحداهما
          بلا حصص. يمكنك إضافة حصة في أي فترة لاحقًا.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TimingField
            label="بداية الصباحية"
            value={timing.morningStart}
            onChange={(v) => setTiming({ morningStart: v })}
          />
          <TimingField
            label="نهاية الصباحية"
            value={timing.morningEnd}
            onChange={(v) => setTiming({ morningEnd: v })}
          />
          <TimingField
            label="بداية المسائية"
            value={timing.afternoonStart}
            onChange={(v) => setTiming({ afternoonStart: v })}
          />
          <TimingField
            label="نهاية المسائية"
            value={timing.afternoonEnd}
            onChange={(v) => setTiming({ afternoonEnd: v })}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="rounded-full bg-background px-3 py-1 text-muted">
            ☀️ الصباحية: {formatDuration(morningMin) || "0 د"}
          </span>
          <span className="rounded-full bg-background px-3 py-1 text-muted">
            🌙 المسائية: {formatDuration(afternoonMin) || "0 د"}
          </span>
        </div>

        {!timingValid && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              تحقّق من التوقيت: يجب أن تكون بداية الصباحية قبل نهايتها، ونهايتها قبل
              بداية المسائية، وبداية المسائية قبل نهايتها.
            </span>
          </div>
        )}
      </section>

      {/* ===== أيام العمل ===== */}
      <section className="edt-card">
        <h2 className="edt-card-title mb-2">
          <CalendarDays className="h-4 w-4 text-primary-text" /> أيام العمل
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
    </div>
  );
}

function TimingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="edt-label">{label}</span>
      <input
        type="time"
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="edt-input"
      />
    </label>
  );
}
