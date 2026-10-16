"use client";

/* ============================================================
   المعاينة النهائية — وثيقة A4 قابلة للطباعة
   تُصمَّم بوحدات mm/pt لضمان مطابقة تامة عند الطباعة.
   ============================================================ */
import React from "react";
import { DAYS } from "./defaults";
import { resolveTheme } from "./theme";
import type { Period, TimetableState } from "./types";
import {
  durationMin,
  formatDuration,
  hexToRgba,
  readableTextOn,
} from "./utils";

interface Props {
  state: TimetableState;
}

function periodFacts(p: Period) {
  return durationMin(p.start, p.end);
}

export default function TimetablePreview({ state }: Props) {
  const theme = resolveTheme(state.design);
  const isLandscape = state.orientation === "landscape";
  const docWidth = isLandscape ? "277mm" : "190mm";
  const subjectOf = (id: string | null | undefined) =>
    state.subjects.find((s) => s.id === id);

  const dayList = DAYS.filter((d) => state.days.includes(d.id));
  const periods = state.periods.filter(
    (p) => state.design.showBreaks || !p.isBreak
  );

  const cellFill = state.design.cellFill || theme.template.cellFill;

  const docStyle: React.CSSProperties = {
    width: docWidth,
    minHeight: isLandscape ? "190mm" : "277mm",
    background: theme.pageBg,
    color: theme.cellText,
    fontFamily: theme.fontFamily,
    padding: "6mm",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  } as React.CSSProperties;

  /* ---------- بيانات الرأس ---------- */
  const instLeft: Array<[string, string]> = [];
  if (state.info.academy) instLeft.push(["الأكاديمية الجهوية", state.info.academy]);
  if (state.info.direction) instLeft.push(["المديرية الإقليمية", state.info.direction]);
  if (state.info.school) instLeft.push(["المؤسسة", state.info.school]);

  const metaItems: Array<[string, string]> = [];
  if (state.info.teacher) metaItems.push(["الأستاذ(ة)", state.info.teacher]);
  if (state.info.level) metaItems.push(["المستوى", state.info.level]);
  if (state.info.section) metaItems.push(["القسم", state.info.section]);
  if (state.info.year) metaItems.push(["الموسم الدراسي", state.info.year]);
  if (state.info.employeeId) metaItems.push(["رقم التأجير", state.info.employeeId]);

  /* ---------- حساب الملخص ---------- */
  let totalMin = 0;
  let totalLessons = 0;
  const perDay: Record<string, number> = {};
  const perSubject: Record<string, number> = {};
  for (const d of dayList) {
    let n = 0;
    for (const p of state.periods) {
      if (p.isBreak) continue;
      const e = state.grid[d.id]?.[p.id];
      if (!e?.subjectId) continue;
      const s = e.override?.start || p.start;
      const en = e.override?.end || p.end;
      const dur = durationMin(s, en) || 0;
      totalMin += dur;
      totalLessons += 1;
      n += 1;
      perSubject[e.subjectId] = (perSubject[e.subjectId] || 0) + dur;
    }
    perDay[d.id] = n;
  }

  const thBase: React.CSSProperties = {
    background: theme.headerBg,
    color: theme.headerText,
    border: `0.6pt solid ${hexToRgba(theme.headerText, 0.35)}`,
    padding: "2mm 1.5mm",
    fontSize: "10.5pt",
    fontWeight: 700,
    textAlign: "center",
  };
  const radius = state.design.headerShape === "pill" ? 6 : theme.radius;

  return (
    <div style={docStyle} dir="rtl">
      {/* ===== ترويسة ===== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "6mm",
          fontSize: "8.5pt",
          color: "#475569",
          lineHeight: 1.5,
          paddingBottom: "3mm",
          borderBottom: `1.4pt solid ${theme.headerBg}`,
          marginBottom: "4mm",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, color: theme.heading, fontSize: "10pt" }}>
            المملكة المغربية
          </div>
          <div>وزارة التربية الوطنية والتعليم الأولي والرياضة</div>
        </div>
        <div style={{ textAlign: "left" }}>
          {instLeft.map(([k, v]) => (
            <div key={k}>
              <span style={{ color: "#94A3B8" }}>{k}: </span>
              {v}
            </div>
          ))}
        </div>
      </div>

      {/* ===== عنوان الوثيقة ===== */}
      <div style={{ textAlign: "center", marginBottom: "3mm" }}>
        <div
          style={{
            fontSize: "17pt",
            fontWeight: 800,
            color: theme.heading,
            letterSpacing: "0.2pt",
          }}
        >
          {state.info.docTitle || "استعمال الزمن الأسبوعي"}
        </div>
      </div>

      {/* ===== بيانات الأستاذ ===== */}
      {metaItems.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "3mm 8mm",
            marginBottom: "3.5mm",
            fontSize: "9.5pt",
          }}
        >
          {metaItems.map(([k, v]) => (
            <div key={k}>
              <span style={{ color: "#64748B" }}>{k}: </span>
              <span style={{ fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* ===== الجدول ===== */}
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                ...thBase,
                width: isLandscape ? "30mm" : "26mm",
                borderTopRightRadius: radius,
              }}
            >
              الحصة / اليوم
            </th>
            {dayList.map((d, i) => (
              <th
                key={d.id}
                style={{
                  ...thBase,
                  borderTopLeftRadius: i === dayList.length - 1 ? radius : 0,
                }}
              >
                {d.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((p, pi) => {
            if (p.isBreak) {
              const dur = formatDuration(periodFacts(p));
              return (
                <tr key={p.id}>
                  <td
                    colSpan={1 + dayList.length}
                    style={{
                      background: theme.zebraBg,
                      border: `0.6pt solid ${theme.cellBorder}`,
                      padding: "1.4mm",
                      textAlign: "center",
                      fontSize: "9pt",
                      fontWeight: 700,
                      color: "#475569",
                      letterSpacing: "1pt",
                    }}
                  >
                    {p.label || "استراحة"} — {p.start} / {p.end}
                    {dur ? ` (${dur})` : ""}
                  </td>
                </tr>
              );
            }
            return (
              <tr key={p.id}>
                <th
                  style={{
                    background: hexToRgba(theme.headerBg, 0.08),
                    border: `0.6pt solid ${theme.cellBorder}`,
                    padding: "1.6mm 1mm",
                    fontSize: "9pt",
                    fontWeight: 700,
                    color: theme.heading,
                    textAlign: "center",
                    lineHeight: 1.35,
                  }}
                >
                  <div>{timeLabel(state, p)}</div>
                </th>
                {dayList.map((d) => {
                  const e = state.grid[d.id]?.[p.id];
                  const subj = subjectOf(e?.subjectId);
                  const ov = e?.override;
                  const hasOverride = !!ov?.start || !!ov?.end;
                  let bg = "#FFFFFF";
                  let fg = theme.cellText;
                  let border = `0.6pt solid ${theme.cellBorder}`;
                  if (subj) {
                    if (cellFill === "subject") {
                      bg = subj.color;
                      fg = readableTextOn(subj.color);
                    } else if (cellFill === "soft") {
                      bg = hexToRgba(subj.color, 0.16);
                      fg = theme.cellText;
                      border = `0.6pt solid ${hexToRgba(subj.color, 0.5)}`;
                    } else {
                      bg = "#FFFFFF";
                      fg = subj.color;
                      border = `0.6pt solid ${theme.cellBorder}`;
                    }
                  }
                  return (
                    <td
                      key={d.id}
                      style={{
                        background: bg,
                        color: fg,
                        border,
                        padding: "1.6mm 1mm",
                        fontSize: "10pt",
                        fontWeight: subj ? 700 : 400,
                        textAlign: "center",
                        verticalAlign: "middle",
                        lineHeight: 1.3,
                        minHeight: "9mm",
                        borderInlineStart:
                          subj && cellFill === "none"
                            ? `2.4pt solid ${subj.color}`
                            : border,
                      }}
                    >
                      {subj ? (
                        <span>
                          {state.design.showSubjectNames !== false ? subj.name : "•"}
                          {hasOverride && (
                            <span
                              style={{
                                display: "block",
                                fontSize: "7pt",
                                fontWeight: 400,
                                opacity: 0.85,
                              }}
                            >
                              {ov?.start || p.start} - {ov?.end || p.end}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: "#CBD5E1" }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ===== الملخص (اختياري) ===== */}
      {state.design.showTotals && (
        <div style={{ marginTop: "4mm", fontSize: "9pt" }}>
          <div
            style={{
              fontWeight: 700,
              color: theme.heading,
              marginBottom: "1.5mm",
            }}
          >
            ملخّص: {totalLessons} حصة أسبوعيًا — المجموع {formatDuration(totalMin) || "0 د"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2mm 4mm" }}>
            {state.subjects
              .filter((s) => perSubject[s.id])
              .map((s) => (
                <span
                  key={s.id}
                  style={{
                    border: `0.6pt solid ${hexToRgba(s.color, 0.6)}`,
                    background: hexToRgba(s.color, 0.12),
                    borderRadius: "2mm",
                    padding: "0.6mm 2mm",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "2.5mm",
                      height: "2.5mm",
                      borderRadius: "50%",
                      background: s.color,
                      marginInlineEnd: "1.5mm",
                      verticalAlign: "middle",
                    }}
                  />
                  {s.name}: {formatDuration(perSubject[s.id])}
                </span>
              ))}
          </div>
          <div style={{ marginTop: "1.5mm", color: "#64748B" }}>
            {dayList.map((d) => `${d.name}: ${perDay[d.id]} حصة`).join("  ·  ")}
          </div>
        </div>
      )}

      {/* ===== التوقيع ===== */}
      {state.design.showSign && (
        <div
          style={{
            marginTop: "auto",
            paddingTop: "6mm",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10pt",
            fontWeight: 700,
            color: theme.heading,
          }}
        >
          <div>توقيع الأستاذ(ة): ..............................</div>
          <div>طابع وتوقيع المدير(ة): ..............................</div>
        </div>
      )}

      {/* ===== تذييل ===== */}
      {state.design.showFooter && (
        <div
          style={{
            marginTop: "3mm",
            paddingTop: "2mm",
            borderTop: `0.6pt solid ${theme.cellBorder}`,
            fontSize: "7.5pt",
            color: "#94A3B8",
            textAlign: "center",
          }}
        >
          أُنجز بواسطة مولّد استعمال الزمن — Modaris Pro · modarispro.com
        </div>
      )}
    </div>
  );
}

function timeLabel(state: TimetableState, p: Period): string {
  const dur = formatDuration(periodFacts(p));
  switch (state.design.periodDisplay) {
    case "start":
      return p.start;
    case "duration":
      return dur;
    case "range-duration":
      return `${p.start} - ${p.end}${dur ? ` (${dur})` : ""}`;
    default:
      return `${p.start} - ${p.end}`;
  }
}
