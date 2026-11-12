"use client";

/* ============================================================
   شاشة مذكرة الأسبوع — الأداة الفعلية للأستاذ
   شريط أدوات لاصق + أقسام أيام ببطاقات حصص + ورقة طباعة مخفية.
   لا يكتب في التخزين إلا عبر useWeekMemo (مساحة العمل).
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import type { Catalog } from "@/components/daily-memo/types";
import { useWeekMemo } from "./useWeekMemo";
import WeekLessonCard from "./WeekLessonCard";
import WeekPrintSheet from "./WeekPrintSheet";
import HolidayPanel from "./HolidayPanel";
import { createPortal } from "react-dom";

/** ترتيب أيام العمل — لاشتقاق الرقم الترتيبي لليوم الدراسي */
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat"];
const ORDINALS = [
  "اليوم الأول", "اليوم الثاني", "اليوم الثالث",
  "اليوم الرابع", "اليوم الخامس", "اليوم السادس",
];

/** تحويل ISO إلى dd/mm/yyyy للعرض */
function toDisplayDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

export default function WeekMemoApp({ catalog }: { catalog: Catalog }) {
  const wm = useWeekMemo(catalog);
  const [warningsOpen, setWarningsOpen] = useState(false);
  const [regenAsk, setRegenAsk] = useState(false);

  /* بوابة الطباعة: تُصيَّر الورقة داخل body مباشرة — القاعدة العامة تُخفي كل body > * */
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  /* اسم المادة لكل معرّف — مشتق من استعمال الزمن */
  const subjectNames = useMemo(() => {
    const map: Record<string, string> = {};
    if (wm.timetable) {
      for (const s of wm.timetable.subjects) map[s.id] = s.name;
    }
    return map;
  }, [wm.timetable]);

  /* التنقل ±7 أيام على تاريخ الاثنين */
  const prevWeek = () => wm.shiftWeek(-7);
  const nextWeek = () => wm.shiftWeek(7);

  /* حالة اليوم: دراسي / عطلة / غياب — بدل window.prompt */
  const markSchool = (date: string) => wm.setDaySkip(date, undefined);
  const markHoliday = (date: string) =>
    wm.setDaySkip(date, { kind: "manual-skip", label: "عطلة" });
  const markAbsence = (date: string) =>
    wm.setDaySkip(date, { kind: "teacher-absence", label: "غياب الأستاذ" });

  /* هل العطلة الحالية تختلف عن المذكرة المعروضة؟ (المذكرة المحفوظة مجمّدة) */
  const staleHolidays = useMemo(() => {
    if (!wm.week) return false;
    return wm.week.days.some((day) => {
      const want = wm.nonSchoolDays[day.date];
      /* لا تُعتبر «قديمة» إلا تخطيات المولّد (عطل حقيقية) — لا التخطي اليدوي اليومي */
      const isCalendarSkip =
        day.skip?.kind === "official-holiday" ||
        day.skip?.kind === "religious-holiday" ||
        day.skip?.kind === "school-vacation";
      if (want) return !day.skip || day.skip.kind !== want.kind;
      return Boolean(day.skip && isCalendarSkip);
    });
  }, [wm.week, wm.nonSchoolDays]);

  return (
    <div className="wm-app">
      {/* ===== شريط الأدوات اللاصق ===== */}
      <div className="wm-toolbar">
        <button type="button" onClick={prevWeek}>← الأسبوع السابق</button>
        <input
          type="date"
          value={wm.weekStart}
          onChange={(e) => wm.setWeekStart(e.target.value)}
        />
        <button type="button" onClick={nextWeek}>الأسبوع التالي →</button>

        <select
          value={wm.stageIndex}
          onChange={(e) => wm.setStageIndex(Number(e.target.value))}
          aria-label="ترتيب المرحلة"
        >
          <option value={0}>المرحلة 1</option>
          <option value={1}>المرحلة 2</option>
          <option value={2}>المرحلة 3</option>
        </select>
        <select
          value={wm.weekNumber}
          onChange={(e) => wm.setWeekNumber(Number(e.target.value))}
          aria-label="رقم الأسبوع"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>الأسبوع {n}</option>
          ))}
        </select>

        {wm.week ? (
          regenAsk ? (
            <>
              <button type="button" className="wm-primary" onClick={() => { wm.regenerate(); setRegenAsk(false); }}>
                تأكيد إعادة التوليد
              </button>
              <button type="button" onClick={() => setRegenAsk(false)}>إلغاء</button>
            </>
          ) : (
            <button type="button" onClick={() => setRegenAsk(true)}>أعد التوليد</button>
          )
        ) : (
          <button type="button" className="wm-primary" disabled={!wm.timetable} onClick={() => wm.generate()}>
            أنشئ مذكرة الأسبوع
          </button>
        )}

        <button type="button" onClick={() => window.print()}>طباعة الأسبوع</button>
        <span className="wm-count">الأسابيع المحفوظة: {wm.savedWeeks}</span>
      </div>

      {/* ===== لائحة العطل ===== */}
      <HolidayPanel
        calendar={wm.calendar}
        nonSchoolDays={wm.nonSchoolDays}
        weekStart={wm.weekStart}
        onAdd={wm.addHoliday}
        onRemove={wm.removeHoliday}
      />

      {/* ===== تنبيه: المذكرة المحفوظة لا تعكس العطل الحالية ===== */}
      {staleHolidays ? (
        <div className="wm-stale">
          <span>العطل تغيّرت — المذكرة المعروضة لا تعكسها.</span>
          <button type="button" onClick={() => wm.regenerate()}>أعد التوليد لتطبيقها</button>
        </div>
      ) : null}

      {/* ===== شريط التحذيرات القابل للطي ===== */}
      {wm.warnings.length > 0 ? (
        <details className="wm-warnings" open={warningsOpen} onToggle={(e) => setWarningsOpen((e.target as HTMLDetailsElement).open)}>
          <summary>تحذيرات المولّد ({wm.warnings.length})</summary>
          <ul>
            {wm.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </details>
      ) : null}

      {/* ===== المحتوى ===== */}
      {!wm.ready ? (
        <div className="wm-empty">جارٍ قراءة البيانات…</div>
      ) : !wm.timetable ? (
        <div className="wm-empty">
          لم يُعثر على استعمال زمن محفوظ.
          {" "}
          <a href="/tools/timetable-generator">افتح مولّد استعمال الزمن أولاً</a>
          {" "}ثم عد إلى هذه الصفحة.
        </div>
      ) : !wm.week ? (
        <div className="wm-empty">
          لا مذكرة محفوظة لهذا الأسبوع ({wm.weekStart ? toDisplayDate(wm.weekStart) : "—"}).
          <div style={{ marginTop: 10 }}>
            <button type="button" className="wm-primary" disabled={!wm.timetable} onClick={() => wm.generate()}>
              أنشئ مذكرة الأسبوع
            </button>
          </div>
        </div>
      ) : (
        <>
          {wm.week.days.map((day) => {
            const orderIndex = DAY_ORDER.indexOf(day.dayId);
            const ordinal = ORDINALS[orderIndex] ?? `اليوم ${orderIndex + 1}`;
            return (
              <section className="wm-day" key={day.date}>
                <div className="wm-day-head">
                  <h2>{ordinal}</h2>
                  <span className="wm-date">{toDisplayDate(day.date)}</span>
                  {day.skip ? (
                    <span className="wm-day-badge">
                      {day.skip.kind === "weekend" ? "عطلة نهاية الأسبوع" : day.skip.label}
                    </span>
                  ) : null}
                  <div className="wm-day-actions">
                    <button
                      type="button"
                      className={day.skip ? "" : "wm-active"}
                      onClick={() => markSchool(day.date)}
                    >
                      دراسي
                    </button>
                    <button
                      type="button"
                      className={day.skip?.kind === "manual-skip" ? "wm-active" : ""}
                      onClick={() => markHoliday(day.date)}
                    >
                      عطلة
                    </button>
                    <button
                      type="button"
                      className={day.skip?.kind === "teacher-absence" ? "wm-active" : ""}
                      onClick={() => markAbsence(day.date)}
                    >
                      غياب
                    </button>
                  </div>
                </div>

                {day.skip ? (
                  <div className="wm-day-skipped">
                    <span>يوم متخطّى: {day.skip.kind === "weekend" ? "عطلة نهاية الأسبوع" : day.skip.label}</span>
                    <button type="button" onClick={() => markSchool(day.date)}>إلغاء التخطي</button>
                  </div>
                ) : day.lessons.length === 0 ? (
                  <div className="wm-day-skipped">لا حصص في هذا اليوم.</div>
                ) : (
                  day.lessons.map((lesson) => (
                    <WeekLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      subjectName={subjectNames[lesson.subjectId] || ""}
                      onChange={(patch) => wm.updateLesson(lesson.id, patch)}
                    />
                  ))
                )}
              </section>
            );
          })}
        </>
      )}

      {/* ===== ورقة الطباعة — تُنقل إلى body لأن القاعدة العامة تُخفي كل body > * ===== */}
      {mounted && wm.week
        ? createPortal(
            <WeekPrintSheet
              week={wm.week}
              profile={wm.profile}
              stageIndex={wm.stageIndex}
              subjectNames={subjectNames}
              template={catalog.template}
            />,
            document.body,
          )
        : null}
    </div>
  );
}
