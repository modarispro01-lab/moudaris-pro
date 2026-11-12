"use client";

/* ============================================================
   لوحة الرزمة الدراسية — إدارة العطل التي تُخفي أيامها من المذكرة
   كل تعديل يُحفظ فوراً في Workspace.calendar عبر useWeekMemo
   ============================================================ */

import { useMemo, useState } from "react";
import type { CalendarDay, CalendarOverrides, SkipReason } from "@/components/workspace/types";
import { FIXED_HOLIDAYS } from "@/lib/moroccan-calendar";

const KIND_LABELS: Record<CalendarDay["kind"], string> = {
  "official-holiday": "عطلة رسمية",
  "religious-holiday": "عطلة دينية",
  "school-vacation": "عطلة مدرسية",
  exam: "امتحان",
};

interface Props {
  calendar: CalendarOverrides;
  nonSchoolDays: Record<string, SkipReason>;
  weekStart: string;
  onAdd: (day: CalendarDay) => void;
  onRemove: (date: string) => void;
}

export default function HolidayPanel({ calendar, nonSchoolDays, weekStart, onAdd, onRemove }: Props) {
  const [date, setDate] = useState("");
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<CalendarDay["kind"]>("official-holiday");
  const [confirmed, setConfirmed] = useState(true);

  const active = useMemo(() => Object.keys(nonSchoolDays).sort(), [nonSchoolDays]);

  const submit = () => {
    if (!date) return;
    onAdd({
      date,
      label_ar: label.trim() || KIND_LABELS[kind],
      kind,
      confirmed: kind === "religious-holiday" ? confirmed : true,
      source: "يدوي",
    });
    setDate("");
    setLabel("");
  };

  return (
    <details className="wm-holidays">
      <summary>
        لائحة العطل ({calendar.added.length} مضافة · {active.length} فعّالة في أسبوع {weekStart})
      </summary>

      <div className="wm-holiday-form">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="تاريخ العطلة"
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="اسم العطلة (اختياري)"
          aria-label="اسم العطلة"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as CalendarDay["kind"])}
          aria-label="نوع العطلة"
        >
          {(Object.keys(KIND_LABELS) as CalendarDay["kind"][]).map((k) => (
            <option key={k} value={k}>{KIND_LABELS[k]}</option>
          ))}
        </select>
        {kind === "religious-holiday" ? (
          <label className="wm-confirm">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            مؤكَّدة بالرؤية
          </label>
        ) : null}
        <button type="button" className="wm-primary" disabled={!date} onClick={submit}>
          أضف عطلة
        </button>
      </div>

      {kind === "religious-holiday" && !confirmed ? (
        <p className="wm-hint">
          العطلة الدينية غير المؤكَّدة لا تُخفي يومها من المذكرة — أكّدها بعد إعلان الرؤية.
        </p>
      ) : null}

      {calendar.added.length === 0 ? (
        <p className="wm-hint">
          لا عطل مضافة. العطل الرسمية الثابتة ({FIXED_HOLIDAYS.length}) تُطبَّق تلقائياً.
        </p>
      ) : (
        <ul className="wm-holiday-list">
          {calendar.added.map((h) => (
            <li key={h.date}>
              <span className="wm-h-date">{h.date}</span>
              <span className="wm-h-label">{h.label_ar}</span>
              <span className="wm-h-kind">{KIND_LABELS[h.kind]}</span>
              {h.kind === "religious-holiday" ? (
                <span className={h.confirmed ? "wm-ok" : "wm-pending"}>
                  {h.confirmed ? "مؤكَّدة" : "بانتظار التأكيد"}
                </span>
              ) : null}
              <button type="button" onClick={() => onRemove(h.date)}>حذف</button>
            </li>
          ))}
        </ul>
      )}

      {active.length > 0 ? (
        <p className="wm-hint">أيام غير دراسية هذا الأسبوع: {active.join(" · ")}</p>
      ) : null}

      <details className="wm-fixed">
        <summary>العطل الرسمية الثابتة ({FIXED_HOLIDAYS.length})</summary>
        <ul>
          {FIXED_HOLIDAYS.map((h) => (
            <li key={h.month + "-" + h.day}>
              {String(h.day).padStart(2, "0")}/{String(h.month).padStart(2, "0")} — {h.label_ar}
            </li>
          ))}
        </ul>
      </details>
    </details>
  );
}
