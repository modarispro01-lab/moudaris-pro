import type { CalendarOverrides, WeekDoc, TeacherProfile, MindMapBranch, MindMapDoc } from "@/components/workspace/types";
import { mindMapKey } from "@/lib/mind-map";
import type { TemplateConfig } from "@/components/daily-memo/types";
import MemoSheet from "@/components/daily-memo/MemoSheet";
import { nextHolidayAfter } from "@/lib/moroccan-calendar";
import { dayToMemoSheets } from "./week-day-to-memo";

const DAY_ORDER = ["mon","tue","wed","thu","fri","sat"];

export interface WeekPrintSheetProps {
  weeks: WeekDoc[];
  /** طباعة المرحلة كاملة: بلا خرائط ذهنية */
  includeMindMaps?: boolean;
  profile: TeacherProfile;
  stageIndex: number;
  subjectNames: Record<string, string>;
  template: TemplateConfig;
  mindMaps: Record<string, MindMapDoc>;
  /** الرزمة الدراسية — لحساب إشعار العطلة وقت الطباعة */
  calendar: CalendarOverrides;
}

interface MindMapPage {
  key: string;
  date: string;
  topic: string;
  subject: string;
  level: string;
  group: string;
  branches: MindMapBranch[];
}

export default function WeekPrintSheet({ weeks, profile, stageIndex, subjectNames, template, mindMaps, calendar, includeMindMaps = true }: WeekPrintSheetProps) {
  const sheets = weeks.flatMap((week) =>
    week.days
      .filter((d) => !d.skip)
      .flatMap((day) =>
        dayToMemoSheets(day, {
          profile,
          weekNumber: day.weekNumber ?? week.weekNumber,
          stageIndex,
          subjectNames,
          dayOrdinal: (day.cycleDay ?? DAY_ORDER.indexOf(day.dayId) + 1) - 1,
          nextHoliday: nextHolidayAfter(day.date, calendar) ?? undefined,
        })
      )
  );

  /* صفحات الخريطة: حصة واحدة = صفحة واحدة.
     لا تُطبع إلا الخرائط المحفوظة فعلاً وفيها نص — الحصة بلا خريطة = بلا صفحة. */
  const mindMapPages: MindMapPage[] = [];
  /* الخرائط في طباعة الأسبوع فقط — لا تُطبع في طباعة المرحلة كاملة */
  const mmDays = includeMindMaps
    ? weeks.flatMap((w) => w.days).filter((day) => !day.skip)
    : [];
  for (const day of mmDays) {
    for (const lesson of day.lessons) {
      const doc = mindMaps[mindMapKey(day.date, lesson)];
      if (!doc) continue;
      const filled = doc.branches.filter((b) => b.text.trim());
      if (filled.length === 0) continue;
      mindMapPages.push({
        key: "mm-" + day.date + "-" + lesson.id,
        date: day.date,
        topic: lesson.topic,
        subject: subjectNames[lesson.subjectId] || lesson.subjectCode || "",
        level: lesson.levelLabel,
        group: lesson.groupLabel,
        branches: filled,
      });
    }
  }

  return (
    <div className="wm-print" dir="rtl">
      {sheets.map((s) => (
        <div className="wm-print-page" key={s.key}>
          <MemoSheet memo={s.memo} template={template} />
        </div>
      ))}

      {mindMapPages.map((p) => (
        <div className="wm-print-page" key={p.key}>
          <section className="wm-mm-sheet" dir="rtl">
            <h2 className="wm-mm-sheet-title">الخريطة الذهنية — {p.subject}</h2>
            <div className="wm-mm-sheet-meta">
              {p.date} · {p.level}
              {p.group ? " · " + p.group : ""}
            </div>
            <div className="wm-mm-sheet-center">{p.topic || "بدون موضوع"}</div>
            <div className="wm-mm-sheet-grid">
              {p.branches.map((b) => (
                <div className="wm-mm-sheet-node" key={b.id}>
                  <h3>{b.label}</h3>
                  <p>{b.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ))}
    </div>
  );
}
