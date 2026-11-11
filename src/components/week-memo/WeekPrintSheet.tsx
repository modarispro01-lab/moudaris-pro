/* ============================================================
   ورقة طباعة مذكرة الأسبوع — عرض فقط (بلا حالة وبلا أحداث)
   - تُخفى في الشاشة وتظهر في الطباعة (قواعد week-memo.css).
   - الأيام المتخطّاة لا تُطبع إطلاقاً.
   - اليوم الدراسي يُكتب بالترتيب: «اليوم الأول» … «اليوم السادس».
   ============================================================ */

import type { WeekDoc } from "@/components/workspace/types";
import type { TeacherProfile } from "@/components/workspace/types";

/** ترتيب أيام العمل من الاثنين — يحدد الرقم الترتيبي لليوم الدراسي */
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat"];

/** الأسماء الترتيبية لأيام الدراسة */
const ORDINALS = [
  "اليوم الأول",
  "اليوم الثاني",
  "اليوم الثالث",
  "اليوم الرابع",
  "اليوم الخامس",
  "اليوم السادس",
];

/** تحويل ISO "YYYY-MM-DD" إلى "dd/mm/yyyy" */
function toDisplayDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

export interface WeekPrintSheetProps {
  week: WeekDoc;
  profile: TeacherProfile;
  /** ترتيب المرحلة (0 = الأولى) — يُعرض «المرحلة رقم stageIndex+1» */
  stageIndex: number;
  /** خريطة معرّف المادة ← اسمها (مشتقة من state.subjects في استعمال الزمن) */
  subjectNames: Record<string, string>;
}

export default function WeekPrintSheet({
  week,
  profile,
  stageIndex,
  subjectNames,
}: WeekPrintSheetProps) {
  return (
    <div className="wm-print" dir="rtl">
      {week.days
        .filter((d) => !d.skip)
        .map((day) => {
          /* الرقم الترتيبي ليوم الدراسة: موقعه في ترتيب أيام الأسبوع */
          const orderIndex = DAY_ORDER.indexOf(day.dayId);
          const ordinal = ORDINALS[orderIndex] ?? `اليوم ${orderIndex + 1}`;
          return (
            <section className="wm-print-day" key={day.date}>
              {/* ترويسة الوثيقة */}
              <div className="wm-print-head">
                <span>المؤسسة: {profile.institution || "—"}</span>
                <span>الأستاذ(ة): {profile.teacher || "—"}</span>
                <span>السنة الدراسية: {profile.academicYear || "—"}</span>
              </div>

              <div className="wm-print-titlebar">
                <h1>مذكرة الأسبوع</h1>
                <p>
                  اليوم الدراسي: {ordinal} — التاريخ: {toDisplayDate(day.date)} —
                  الأسبوع رقم {week.weekNumber} — المرحلة رقم {stageIndex + 1}
                </p>
              </div>

              {/* جدول الحصص */}
              <table>
                <thead>
                  <tr>
                    <th>التوقيت</th>
                    <th>المادة</th>
                    <th>المحور</th>
                    <th>الموضوع</th>
                    <th>الأهداف</th>
                    <th>المراحل</th>
                    <th>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {day.lessons.length === 0 ? (
                    <tr>
                      <td colSpan={7}>لا حصص.</td>
                    </tr>
                  ) : (
                    day.lessons.map((l) => (
                      <tr key={l.id}>
                        <td className="wm-print-row">
                          {l.timeFrom} — {l.timeTo}
                        </td>
                        <td className="wm-print-row">{subjectNames[l.subjectId] || l.subjectCode || ""}</td>
                        <td className="wm-print-row">{l.component || ""}</td>
                        <td className="wm-print-row">{l.topic || ""}</td>
                        <td className="wm-print-row">{l.objectives || ""}</td>
                        <td className="wm-print-row">{l.stages || ""}</td>
                        <td className="wm-print-row">{l.note || ""}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          );
        })}
    </div>
  );
}
