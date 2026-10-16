"use client";

/* ============================================================
   الوثيقة المطبوعة — A4 أفقي أو عمودي، نصوص متجهية بالعربية
   ============================================================ */
import React from "react";
import { DAYS } from "./defaults";
import { resolveTheme } from "./theme";
import {
  buildRows,
  cellAt,
  dayPeriods,
  durationOf,
  rowSpansAllDays,
  weekTotals,
} from "./schedule";
import { formatDuration, hexToRgba, readableTextOn } from "./utils";
import type { Period, TimetableState } from "./types";

interface Props {
  state: TimetableState;
}

export default function TimetablePreview({ state }: Props) {
  const theme = resolveTheme(state.design);
  const isLandscape = state.orientation === "landscape";
  const docWidth = isLandscape ? "277mm" : "190mm";
  const subjectOf = (id: string | null | undefined) =>
    state.subjects.find((s) => s.id === id);

  const dayList = DAYS.filter((d) => state.days.includes(d.id));
  const rows = buildRows(state);
  const cellFill = state.design.cellFill || theme.template.cellFill;

  const docStyle: React.CSSProperties = {
    width: docWidth,
    minHeight: isLandscape ? "185mm" : "272mm",
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

  // المستويات والأفواج في سطر واحد مضغوط: "المستوى الرابع (فوج أ، فوج ب) · ..."
const levelParts = (state.info.levels || [])
    .map((l) => {
      const g = (l.groups || []).map((x) => x.trim()).filter(Boolean);
      const n = (l.name || "").trim();
      if (n && g.length) return `${n} (${g.join("، ")})`;
      return n || g.join("، ");
    })
    .filter(Boolean);
  if (levelParts.length) metaItems.push(["المستويات والأفواج", levelParts.join("  ·  ")]);

  if (state.info.year) metaItems.push(["الموسم الدراسي", state.info.year]);
  if (state.info.employeeId) metaItems.push(["رقم التأجير", state.info.employeeId]);

  /* ---------- الإحصاءات ---------- */
  const { totalMin, totalLessons, perSubject, perDay } = weekTotals(state);

  const thBase: React.CSSProperties = {
    background: theme.headerBg,
    color: theme.headerText,
    border: `0.6pt solid ${hexToRgba(theme.headerText, 0.35)}`,
    padding: "1.5mm 1.2mm",
    fontSize: "10pt",
    fontWeight: 700,
    textAlign: "center",
  };
  const radius = state.design.headerShape === "pill" ? 6 : theme.radius;

  const showBreaks = state.design.showBreaks;

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
          paddingBottom: "2mm",
          borderBottom: `1.4pt solid ${theme.headerBg}`,
          marginBottom: "2.5mm",
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

      {/* ===== عنوان ===== */}
      <div style={{ textAlign: "center", marginBottom: "2mm" }}>
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
            gap: "2mm 6mm",
            marginBottom: "2.5mm",
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
      {rows.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94A3B8",
            fontSize: "11pt",
            border: `1pt dashed ${theme.cellBorder}`,
            borderRadius: "3mm",
          }}
        >
          لم تُبرمج أي حصة بعد
        </div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            tableLayout: "fixed",
            breakInside: "auto",
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
            {rows.map((row) => {
              const span = showBreaks && rowSpansAllDays(state, row);
              const anyPeriod = dayList.some((d) => cellAt(state, d.id, row));
              if (!anyPeriod && !span) return null;

              /* ---- سطر استراحة يشاركه كل الأيام ---- */
              if (span) {
                const p = cellAt(state, dayList[0].id, row);
                const dur = p ? formatDuration(durationOf(p)) : "";
                return (
                  <tr key={row.key}>
                    <td
                      colSpan={1 + dayList.length}
                      style={{
                        background: theme.zebraBg,
                        border: `0.6pt solid ${theme.cellBorder}`,
                        padding: "1mm",
                        textAlign: "center",
                        fontSize: "8.5pt",
                        fontWeight: 700,
                        color: "#475569",
                        letterSpacing: "1pt",
                      }}
                    >
                      {p?.label || "استراحة"} — {row.start} / {row.end}
                      {dur ? ` (${dur})` : ""}
                    </td>
                  </tr>
                );
              }

              /* ---- سطر حصة عادي ---- */
              const labelP = cellAt(state, dayList[0].id, row);
              return (
                <tr key={row.key}>
                  <th
                    style={{
                      background: hexToRgba(theme.headerBg, 0.08),
                      border: `0.6pt solid ${theme.cellBorder}`,
                      padding: "1.1mm 0.8mm",
                      fontSize: "8.5pt",
                      fontWeight: 700,
                      color: theme.heading,
                      textAlign: "center",
                      lineHeight: 1.35,
                    }}
                  >
                    <div>{timeLabel(state, labelP ?? row)}</div>
                  </th>
                  {dayList.map((d) => {
                    const p = cellAt(state, d.id, row);
                    if (!p || (p.isBreak && !showBreaks)) {
                      return (
                        <td
                          key={d.id}
                          style={{
                            background: "#FFFFFF",
                            border: `0.6pt solid ${theme.cellBorder}`,
                            padding: "1.1mm 0.8mm",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          <span style={{ color: "#CBD5E1" }}>—</span>
                        </td>
                      );
                    }
                    if (p.isBreak) {
                      return (
                        <td
                          key={d.id}
                          style={{
                            background: theme.zebraBg,
                            color: "#64748B",
                            border: `0.6pt solid ${theme.cellBorder}`,
                            padding: "1.1mm 0.8mm",
                            fontSize: "8.5pt",
                            fontWeight: 700,
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          {p.label || "استراحة"}
                        </td>
                      );
                    }

                    const subj = subjectOf(p.subjectId);
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
                      }
                    }
                    // توقيت مختلف عن السطر (يوم برمجه الأستاذ بتوقيت خاص)
                    const diffTime = p.end !== row.end;

                    return (
                      <td
                        key={d.id}
                        style={{
                          background: bg,
                          color: fg,
                          border,
                          padding: "1.1mm 0.8mm",
                          fontSize: "9.5pt",
                          fontWeight: subj ? 700 : 400,
                          textAlign: "center",
                          verticalAlign: "middle",
                          lineHeight: 1.3,
                          borderInlineStart:
                            subj && cellFill === "none"
                              ? `2.4pt solid ${subj.color}`
                              : border,
                        }}
                      >
                        {subj ? (
                          <span>
                            {state.design.showSubjectNames !== false ? subj.name : "•"}
                            {diffTime && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "7pt",
                                  fontWeight: 400,
                                  opacity: 0.85,
                                }}
                              >
                                {p.start} - {p.end}
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
      )}

      {/* ===== الملخّص ===== */}
      {state.design.showTotals && totalLessons > 0 && (
        <div style={{ marginTop: "2.5mm", fontSize: "8pt", breakInside: "avoid" }}>
          <div
            style={{ fontWeight: 700, color: theme.heading, marginBottom: "1.5mm" }}
          >
            ملخّص: {totalLessons} حصة أسبوعيًا — المجموع{" "}
            {formatDuration(totalMin) || "0 د"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.4mm 3mm" }}>
            {state.subjects
              .filter((s) => perSubject[s.id])
              .map((s) => (
                <span
                  key={s.id}
                  style={{
                    border: `0.6pt solid ${hexToRgba(s.color, 0.6)}`,
                    background: hexToRgba(s.color, 0.12),
                    borderRadius: "2mm",
                    padding: "0.4mm 1.6mm",
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
          <div style={{ marginTop: "1mm", color: "#64748B" }}>
            {dayList.map((d) => `${d.name}: ${perDay[d.id]} حصة`).join("  ·  ")}
          </div>
        </div>
      )}

      {/* ===== التوقيع ===== */}
      {state.design.showSign && (
        <div
          style={{
            marginTop: "auto",
            paddingTop: "4mm",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10pt",
            fontWeight: 700,
            color: theme.heading,
            breakInside: "avoid",
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
            marginTop: "2mm",
            paddingTop: "1.5mm",
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

/** تسمية الوقت في عمود الحصة */
function timeLabel(
  state: TimetableState,
  src: Period | { start: string; end: string }
): string {
  const dur = formatDuration(durationOf(src as Period));
  switch (state.design.periodDisplay) {
    case "start":
      return src.start;
    case "duration":
      return dur;
    case "range-duration":
      return `${src.start} - ${src.end}${dur ? ` (${dur})` : ""}`;
    default:
      return `${src.start} - ${src.end}`;
  }
}