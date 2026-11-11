import type { WeekDoc, TeacherProfile } from "@/components/workspace/types";
import type { TemplateConfig } from "@/components/daily-memo/types";
import MemoSheet from "@/components/daily-memo/MemoSheet";
import { dayToMemoSheets } from "./week-day-to-memo";

const DAY_ORDER = ["mon","tue","wed","thu","fri","sat"];

export interface WeekPrintSheetProps {
  week: WeekDoc;
  profile: TeacherProfile;
  stageIndex: number;
  subjectNames: Record<string, string>;
  template: TemplateConfig;
}

export default function WeekPrintSheet({ week, profile, stageIndex, subjectNames, template }: WeekPrintSheetProps) {
  const sheets = week.days
    .filter((d) => !d.skip)
    .flatMap((day) =>
      dayToMemoSheets(day, {
        profile,
        weekNumber: week.weekNumber,
        stageIndex,
        subjectNames,
        dayOrdinal: DAY_ORDER.indexOf(day.dayId),
      })
    );

  return (
    <div className="wm-print" dir="rtl">
      {sheets.map((s) => (
        <div className="wm-print-page" key={s.key}>
          <MemoSheet memo={s.memo} template={template} />
        </div>
      ))}
    </div>
  );
}
