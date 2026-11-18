"use client";

/* ============================================================
   صفحة تشخيص مولّد مذكرة الأسبوع — عرض في الذاكرة فقط
   - يقرأ استعمال الزمن الحيّ من localStorage (قراءة فقط)
   - إن غاب يستعمل timetable من مساحة العمل (بديل مصرّح به)
   - بلا أي كتابة في التخزين، وبلا أي رابط تنقّل.
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import { parseImported, STORAGE_KEY } from "@/components/timetable/store";
import { buildWeekPlans } from "@/lib/timetable-memo-bridge";
import { readWorkspace } from "@/components/workspace/useWorkspace";
import type { TimetableState } from "@/components/timetable/types";
import type { Catalog } from "@/components/daily-memo/types";
import { generateWeek, truncateTopic } from "@/lib/week-memo-generator";

/** الاثنين القادم بتنسيق ISO (يُحسب بعد التركيب فقط لتجنب اختلاف التميؤ) */
function nextMondayIso(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0=الأحد … 6=السبت
  const offset = (8 - day) % 7 || 7; // الاثنين القادم (7 أيام إن كان اليوم اثنين)
  const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return new Date(base + offset * 86400000).toISOString().slice(0, 10);
}

export default function WeekDiag({ catalog }: { catalog: Catalog }) {
  const [timetable, setTimetable] = useState<TimetableState | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [weekNumber, setWeekNumber] = useState(1);
  const [weekStart, setWeekStart] = useState("");

  /* قراءة استعمال الزمن الحيّ (قراءة فقط) — البديل: مساحة العمل */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? parseImported(raw) : null;
      if (parsed) {
        setTimetable(parsed);
      } else {
        setTimetable(readWorkspace().workspace.timetable);
      }
    } catch {
      setTimetable(null);
    }
    setWeekStart(nextMondayIso());
  }, []);

  /* التوليد في الذاكرة فقط — يعاد عند أي تغيير في المدخلات */
  const result = useMemo(() => {
    if (!timetable || !weekStart) return null;
    return generateWeek({ state: timetable, catalog, stageIndex, weekNumber, weekStart });
  }, [timetable, catalog, stageIndex, weekNumber, weekStart]);

  /* العدادات — مقاسة من المصدرين المستقلين */
  const bridgeSessions = useMemo(
    () =>
      timetable && weekStart
        ? buildWeekPlans(timetable).reduce((sum, d) => sum + d.sessions.length, 0)
        : 0,
    [timetable]
  );
  const daysCount = result ? result.week.days.length : 0;
  const lessonsTotal = result
    ? result.week.days.reduce((s, d) => s + d.lessons.length, 0)
    : 0;

  /* إثبات تطابق العدد: حصص المذكرة المولّدة = حصص استعمال الزمن الرصدة */
  const match = lessonsTotal === bridgeSessions;

  return (
    <main style={{ direction: "rtl", padding: 24, fontFamily: "inherit" }}>
      <h1>تشخيص مولّد مذكرة الأسبوع — عرض في الذاكرة فقط</h1>

      <section style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBlock: 12 }}>
        <h2>المدخلات</h2>
        <label style={{ display: "block", marginBlock: 6 }}>
          ترتيب المرحلة (0 = الأولى):{" "}
          <select
            value={stageIndex}
            onChange={(e) => setStageIndex(Number(e.target.value))}
          >
            <option value={0}>0 — المرحلة الأولى</option>
            <option value={1}>1 — المرحلة الثانية</option>
            <option value={2}>2 — المرحلة الثالثة</option>
          </select>
        </label>
        <label style={{ display: "block", marginBlock: 6 }}>
          رقم الأسبوع:{" "}
          <select
            value={weekNumber}
            onChange={(e) => setWeekNumber(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "block", marginBlock: 6 }}>
          تاريخ الاثنين:{" "}
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
          />
        </label>
      </section>

      <section style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBlock: 12 }}>
        <h2>العدادات</h2>
        <ul>
          <li>حصص استعمال الزمن (بعد الرصد): {bridgeSessions}</li>
          <li>حصص المذكرة المولّدة: {lessonsTotal}</li>
          <li>عدد الأيام: {daysCount}</li>
        </ul>
        <p>
          <strong>تطابق العدد: {match ? "نعم" : "لا"}</strong>
        </p>
      </section>

      <section style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBlock: 12 }}>
        <h2>التحذيرات ({result ? result.warnings.length : 0})</h2>
        {result && result.warnings.length > 0 ? (
          <ul>
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        ) : (
          <p>لا تحذيرات.</p>
        )}
      </section>

      <section style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBlock: 12 }}>
        <h2>حصص الأسبوع</h2>
        {result
          ? result.week.days.map((d) => (
              <div key={d.date} style={{ marginBlock: 10 }}>
                <h3>
                  {d.date} — {d.dayId}
                  {d.skip ? " (مُخطَّى)" : ""}
                </h3>
                {d.lessons.length === 0 ? (
                  <p>لا حصص.</p>
                ) : (
                  <table border={1} cellPadding={4} style={{ borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th>التوقيت</th>
                        <th>المادة</th>
                        <th>المستوى</th>
                        <th>الفوج</th>
                        <th>رقم الحصة</th>
                        <th>الموضوع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.lessons.map((l) => (
                        <tr key={l.id}>
                          <td>
                            {l.timeFrom} — {l.timeTo}
                          </td>
                          <td>{l.component}</td>
                          <td>{l.levelLabel}</td>
                          <td>{l.groupLabel || "—"}</td>
                          <td>{l.sessionNumber}</td>
                          <td>{truncateTopic(l.topic)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))
          : "لا بيانات."}
      </section>
    </main>
  );
}
