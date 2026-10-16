"use client";

/* ============================================================
   الخطوة 3 — برمجة الأيام يومًا بيوم
   يختار الأستاذ اليوم ← يضيف حصصه وتوقيتاتها ومواده ← اليوم التالي
   ============================================================ */
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Eraser,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { useTimetable } from "../store";
import { DAYS } from "../defaults";
import {
  dayFillRatio,
  dayIsComplete,
  dayLessonCount,
  dayPeriods,
  durationOf,
  nextIncompleteDay,
  weekProgress,
} from "../schedule";
import PeriodEditor from "../PeriodEditor";
import { useConfirm } from "../ConfirmDialog";
import type { DayId } from "../types";
import { cx } from "../utils";

export default function ScheduleStep() {
  const { state, dispatch } = useTimetable();
  const confirm = useConfirm();

  // نبدأ من أول يوم غير مكتمل — يوجّه الأستاذ لما يجب أن ينجزه
  const [activeDay, setActiveDay] = useState<DayId>(
    () => nextIncompleteDay(state) ?? state.days[0] ?? "mon"
  );

  // إذا حُذف اليوم النشط، ننتقل لغيره
  useEffect(() => {
    if (!state.days.includes(activeDay)) {
      setActiveDay(nextIncompleteDay(state) ?? state.days[0] ?? "mon");
    }
  }, [state.days, activeDay]);

  const idx = state.days.indexOf(activeDay);
  const activeDef = DAYS.find((d) => d.id === activeDay);
  const progress = weekProgress(state);
  const periods = dayPeriods(state, activeDay);
  const lessons = periods.filter((p) => !p.isBreak);

  const goDay = (dir: -1 | 1) => {
    const next = state.days[idx + dir];
    if (next) setActiveDay(next);
  };

  const clearDay = async () => {
    if (!periods.length) return;
    const ok = await confirm(
      `سيتم حذف كل حصص ${activeDef?.name ?? ""} (${periods.length} فترة). يمكنك التراجع بزر التراجع.`,
      { title: "تفريغ اليوم", confirmLabel: "تفريغ", danger: true }
    );
    if (ok) dispatch({ type: "CLEAR_DAY", day: activeDay });
  };

  const seedDay = () => dispatch({ type: "SEED_DAY", day: activeDay });

  const applyToAll = async () => {
    const others = state.days.filter((d) => d !== activeDay).length;
    if (!others) return;
    const ok = await confirm(
      `سيُنسخ توقيت ${activeDef?.name} (${periods.length} فترة) إلى ${others} يومًا أخرى، مع ترك موادّها فارغة لتبرمجها بنفسك.`,
      { title: "تطبيق التوقيت على كل الأيام", confirmLabel: "تطبيق" }
    );
    if (ok) dispatch({ type: "APPLY_DAY_TO_ALL", day: activeDay });
  };

  const copyFrom = async (from: DayId, withSubjects: boolean) => {
    const fromDef = DAYS.find((d) => d.id === from);
    const src = state.plans?.[from] ?? [];
    if (!src.length) {
      await confirm(`يوم ${fromDef?.name ?? ""} غير مبرمج بعد.`, {
        title: "نسخ",
        confirmLabel: "حسنًا",
      });
      return;
    }
    if (periods.length) {
      const ok = await confirm(
        `سيُستبدل جدول ${activeDef?.name} بجدول ${fromDef?.name} (${withSubjects ? "بمواده" : "بتوقيته فقط"}).`,
        { title: "نسخ جدول يوم", confirmLabel: "نسخ" }
      );
      if (!ok) return;
    }
    dispatch(
      withSubjects
        ? { type: "COPY_DAY", from, to: activeDay }
        : { type: "COPY_TIMES", from, to: activeDay }
    );
  };

  if (!state.days.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
        <p className="text-sm font-bold text-muted">
          اختر يومًا واحدًا على الأقل في الخطوة السابقة
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ===== شريط الأيام ===== */}
      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-text">
            <ListChecks className="h-4 w-4 text-primary" /> اختر يومًا وابرمج جدوله
          </h2>
          <span
            className={cx(
              "rounded-full px-2.5 py-1 text-[11px] font-bold",
              progress.done === progress.total
                ? "bg-secondary/15 text-secondary"
                : "bg-primary/10 text-primary"
            )}
          >
            أنهيت {progress.done} من {progress.total} يوم
          </span>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {state.days.map((d) => {
            const def = DAYS.find((x) => x.id === d);
            const active = d === activeDay;
            const complete = dayIsComplete(state, d);
            const empty = dayLessonCount(state, d) === 0;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDay(d)}
                className={cx(
                  "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-background text-text hover:border-primary/50"
                )}
              >
                {complete ? (
                  <CheckCircle2
                    className={cx(
                      "h-4 w-4",
                      active ? "text-white" : "text-secondary"
                    )}
                  />
                ) : empty ? (
                  <Circle
                    className={cx(
                      "h-4 w-4",
                      active ? "text-white/70" : "text-border"
                    )}
                  />
                ) : (
                  <span
                    className={cx(
                      "h-4 w-4 rounded-full",
                      active ? "bg-white/25" : "bg-primary/15"
                    )}
                    style={{
                      backgroundImage: `conic-gradient(${
                        active ? "#fff" : "var(--color-primary)"
                      } ${dayFillRatio(state, d) * 360}deg, transparent 0)`,
                    }}
                  />
                )}
                {def?.name}
                <span
                  className={cx(
                    "rounded px-1.5 text-[10px]",
                    active ? "bg-white/20" : "bg-background text-muted"
                  )}
                >
                  {dayLessonCount(state, d)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== جدول اليوم النشط ===== */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goDay(-1)}
              disabled={idx <= 0}
              title="اليوم السابق"
              className="rounded-lg border border-border p-2 text-text transition-colors hover:bg-background disabled:opacity-30"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <h3 className="min-w-32 text-center text-base font-extrabold text-primary">
              {activeDef?.name}
            </h3>
            <button
              type="button"
              onClick={() => goDay(1)}
              disabled={idx >= state.days.length - 1}
              title="اليوم التالي"
              className="rounded-lg border border-border p-2 text-text transition-colors hover:bg-background disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={applyToAll}
              disabled={!periods.length || state.days.length < 2}
              title="نسخ توقيت هذا اليوم إلى بقية الأيام (بمواد فارغة)"
              className="inline-flex items-center gap-1.5 rounded-lg border border-secondary/40 bg-secondary/5 px-2.5 py-1.5 text-[11px] font-bold text-secondary transition-colors hover:bg-secondary/10 disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5" /> توقيت لكل الأيام
            </button>
            <CopyMenu days={state.days} current={activeDay} onCopy={copyFrom} />
            <button
              type="button"
              onClick={clearDay}
              disabled={!periods.length}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-bold text-muted transition-colors hover:bg-background hover:text-red-600 disabled:opacity-40"
            >
              <Eraser className="h-3.5 w-3.5" /> تفريغ
            </button>
          </div>
        </div>

        {periods.length === 0 && (
          <button
            type="button"
            onClick={seedDay}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
          >
            <Sparkles className="h-4 w-4" /> ابدأ بتوقيت نموذجي (08:00 – 12:15) ثم عدّله
          </button>
        )}

        <PeriodEditor day={activeDay} />

        {/* ملخّص اليوم */}
        {lessons.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl bg-background px-4 py-3 text-xs text-muted">
            <span className="font-bold text-text">حصص اليوم: {lessons.length}</span>
            <span>
              المجموع:{" "}
              {formatDur(lessons.reduce((n, p) => n + durationOf(p), 0))}
            </span>
            <span>
              المواد المبرمجة: {lessons.filter((p) => p.subjectId).length}/
              {lessons.length}
            </span>
            {dayIsComplete(state, activeDay) && (
              <span className="inline-flex items-center gap-1 font-bold text-secondary">
                <Check className="h-3.5 w-3.5" /> اكتمل هذا اليوم
              </span>
            )}
          </div>
        )}

        {/* الانتقال لليوم التالي */}
        {idx < state.days.length - 1 && (
          <button
            type="button"
            onClick={() => goDay(1)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            اليوم التالي: {DAYS.find((d) => d.id === state.days[idx + 1])?.name}
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
      </section>
    </div>
  );
}

function formatDur(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} س ${m} د`;
  if (h) return `${h} س`;
  return `${m} د`;
}

/** قائمة نسخ جدول من يوم آخر */
function CopyMenu({
  days,
  current,
  onCopy,
}: {
  days: DayId[];
  current: DayId;
  onCopy: (from: DayId, withSubjects: boolean) => void;
}) {
  const { state } = useTimetable();
  const [open, setOpen] = useState(false);
  const others = days.filter((d) => d !== current);

  if (!others.length) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-bold text-muted transition-colors hover:bg-background"
      >
        <Copy className="h-3.5 w-3.5" /> نسخ من يوم
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute end-0 z-40 mt-1 w-64 rounded-xl border border-border bg-surface p-2 shadow-xl">
            <p className="px-1 pb-1.5 text-[10px] leading-relaxed font-bold text-muted">
              اختر يوم المصدر — «توقيت» ينسخ الساعات ويترك المواد فارغة:
            </p>
            <div className="max-h-64 space-y-0.5 overflow-y-auto">
              {others.map((d) => {
                const def = DAYS.find((x) => x.id === d);
                const n = dayLessonCount(state, d);
                return (
                  <div key={d} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onCopy(d, true);
                        setOpen(false);
                      }}
                      className="flex flex-1 items-center justify-between rounded-lg px-2 py-1.5 text-start text-xs font-bold text-text transition-colors hover:bg-background"
                    >
                      <span>{def?.name}</span>
                      <span className="text-[10px] font-normal text-muted">
                        {n ? `${n} حصة` : "غير مبرمج"}
                      </span>
                    </button>
                    <button
                      type="button"
                      title="نسخ التوقيت فقط (مواد فارغة)"
                      onClick={() => {
                        onCopy(d, false);
                        setOpen(false);
                      }}
                      disabled={!n}
                      className="shrink-0 rounded-lg px-1.5 py-1 text-[10px] font-bold text-secondary transition-colors hover:bg-secondary/10 disabled:opacity-30"
                    >
                      توقيت
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}