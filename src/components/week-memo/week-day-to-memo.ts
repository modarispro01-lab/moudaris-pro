import type { DayDoc, TeacherProfile } from "@/components/workspace/types";
import type { MemoLesson, MemoState } from "@/components/daily-memo/types";

/** الأسماء الترتيبية لأيام الدراسة */
const ORDINALS = ["اليوم الأول","اليوم الثاني","اليوم الثالث","اليوم الرابع","اليوم الخامس","اليوم السادس"];

export interface WeekSheet {
  key: string;
  memo: MemoState;
}

interface Options {
  profile: TeacherProfile;
  weekNumber: number;
  stageIndex: number;
  subjectNames: Record<string, string>;
  dayOrdinal: number;
}

/** يحوّل يوماً واحداً إلى ورقة رسمية لكل فترة (صباحية/مسائية) فيه */
export function dayToMemoSheets(day: DayDoc, opts: Options): WeekSheet[] {
  const blocks: Array<"morning" | "afternoon"> = ["morning", "afternoon"];
  const sheets: WeekSheet[] = [];
  for (const block of blocks) {
    const lessons = day.lessons.filter((l) => l.block === block);
    if (lessons.length === 0) continue;

    const levels = Array.from(new Set(lessons.map((l) => l.levelLabel).filter(Boolean)));
    const subjects = Array.from(new Set(lessons.map((l) => opts.subjectNames[l.subjectId] || l.subjectCode || "").filter(Boolean)));
    const notes = lessons
      .filter((l) => (l.note ?? "").trim())
      .map((l) => `${l.timeFrom} — ${l.note}`)
      .join("\n");

    const memoLessons: MemoLesson[] = lessons.map((l) => ({
      id: l.id,
      block: l.block,
      timeFrom: l.timeFrom,
      timeTo: l.timeTo,
      section: "",
      subjectCode: l.subjectCode ?? undefined,
      component: l.component,
      componentAxis: "",
      topic: l.topic,
      objectives: l.objectives,
      stages: l.stages,
      session: l.sessionNumber ? String(l.sessionNumber) : "",
      rj: "",
      sourceLessonNumber: l.sessionOrdinal,
      sourceDayKey: day.dayId,
      breakMinutes: l.breakMinutes,
      levelNumber: l.levelNumber,
      levelLabel: l.levelLabel,
      groupLabel: l.groupLabel,
      sessionNumber: l.sessionNumber,
    }));

    sheets.push({
      key: `${day.date}-${block}`,
      memo: {
        institution: opts.profile.institution,
        teacher: opts.profile.teacher,
        director: opts.profile.director,
        inspector: opts.profile.inspector,
        academicYear: opts.profile.academicYear,
        level: levels.join(" · "),
        stage: `المرحلة رقم ${opts.stageIndex + 1}`,
        subject: subjects.join(" · "),
        date: day.date,
        unit: "",
        week: String(opts.weekNumber),
        day: ORDINALS[opts.dayOrdinal] ?? "",
        section: "",
        notes,
        period: block,
        showNotes: notes.length > 0,
        showSignatures: true,
        showDismissal: false,
        lessons: memoLessons,
      },
    });
  }
  return sheets;
}
