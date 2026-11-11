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
import type { SkipReason } from "@/components/workspace/types";
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

  /* تخطي يوم: سبب من المستخدم ثم حفظه */
  const askSkip = (date: string) => {
    const label = window.prompt("سبب تخطي هذا اليوم:", "ظرف خاص");
    if (label == null) return; /* أُلغي */
    const skip: SkipReason = { kind: "manual-skip", label: label || "ظرف خاص" };
    wm.setDaySkip(date, skip);
  };
  const unskip = (date: string) => wm.setDaySkip(date, undefined);

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
                  {day.skip ? null : (
                    <button type="button" onClick={() => askSkip(day.date)}>
                      تخطّي هذا اليوم
                    </button>
                  )}
                </div>

                {day.skip ? (
                  <div className="wm-day-skipped">
                    <span>يوم متخطّى: {day.skip.kind === "weekend" ? "عطلة نهاية الأسبوع" : day.skip.label}</span>
                    <button type="button" onClick={() => unskip(day.date)}>إلغاء التخطي</button>
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
            />,
            document.body,
          )
        : null}
    </div>
  );
}
