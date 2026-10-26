"use client";

/* ============================================================
   الوثيقة المطبوعة — A4 أفقي أو عمودي، نصوص متجهية بالعربية

   الجدول مبنيّ على أعمدة الأيام بدل سطور التوقيت:
   كل يوم يعرض حصصه متتابعة، وكل حصة تأخذ من الارتفاع بحسب
   مدّتها، فتمتلئ الخانة كاملة ولا تظهر خانات فارغة.
   ============================================================ */
import React from "react";
import { DAYS } from "./defaults";
import { resolveTheme } from "./theme";
import { dayPeriods, durationOf, weekTotals } from "./schedule";
import { formatDuration, hexToRgba, readableTextOn } from "./utils";
import InstitutionLogo from "./InstitutionLogo";
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
  const cellFill = state.design.cellFill || theme.template.cellFill;

  /* كل يوم عمود مستقلّ: نُخفي الاستراحات إن اختار الأستاذ ذلك */
  const dayColumns = dayList.map((day) => {
    const all = dayPeriods(state, day.id);
    const periods = state.design.showBreaks
      ? all
      : all.filter((p) => !p.isBreak);
    return { day, periods };
  });
  const hasVisiblePeriods = dayColumns.some((c) => c.periods.length > 0);

  const docStyle: React.CSSProperties = {
    width: docWidth,
    minHeight: isLandscape ? "185mm" : "272mm",
    background: theme.pageBg,
    color: theme.cellText,
    fontFamily: theme.fontFamily,
    padding: "6mm",
    boxSizing: "border-box",
    display: "grid",
    gridTemplateRows: "auto minmax(0, 1fr) auto",
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

  // الموسم يظهر تحت الشعار، فلا نكرّره في البيانات إلا عند إخفاء الشعار
  const showLogo = state.design.showLogo !== false;
  if (state.info.year && !showLogo)
    metaItems.push(["الموسم الدراسي", state.info.year]);
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
  const radius = Math.min(
    state.design.headerShape === "pill" ? 16 : theme.radius,
    16
  );

  /* ---------- عبارات التوقيع حسب الجنس / التخصيص ---------- */
  const sign = (kind: "teacher" | "manager" | "inspector") => {
    const custom = (state.design.signLabels?.[kind] ?? "").trim();
    if (custom) return custom;
    const f = state.design.feminine !== false;
    return {
      teacher: f ? "توقيع الأستاذ(ة)" : "توقيع الأستاذ",
      inspector: f ? "توقيع المفتش(ة)" : "توقيع المفتش",
      manager: f ? "طابع وتوقيع المدير(ة)" : "طابع وتوقيع المدير",
    }[kind];
  };

  const showNames = state.design.showSubjectNames !== false;
  const showDuration = state.design.showDuration !== false;

  return (
    <div style={docStyle} dir="rtl">
      {/* ===== الترويسة والعنوان والبيانات ===== */}
      <div>
        {/* ===== ترويسة ===== */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "5mm",
          fontSize: "8.5pt",
          color: "#475569",
          lineHeight: 1.5,
          paddingBottom: "2mm",
          borderBottom: `1.4pt solid ${theme.headerBg}`,
          marginBottom: "2.5mm",
        }}
      >
        <div style={{ flex: "0 0 auto" }}>
          <div style={{ fontWeight: 700, color: theme.heading, fontSize: "10pt" }}>
            المملكة المغربية
          </div>
          <div>وزارة التربية الوطنية والتعليم الأولي والرياضة</div>
        </div>

        {showLogo && (
          <div style={{ flex: "0 0 auto", textAlign: "center" }}>
            <InstitutionLogo
              size={68}
              src={state.design.logoDataUrl}
              color={theme.headerBg}
            />
            {state.info.year && (
              <div
                style={{
                  fontSize: "8.5pt",
                  fontWeight: 700,
                  color: theme.heading,
                  marginTop: "1mm",
                  whiteSpace: "nowrap",
                }}
              >
                {state.info.year}
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "left", flex: "1 1 auto" }}>
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

      </div>

      {/* ===== الجدول: عمود لكل يوم، وكل حصة تتمدّد حسب مدّتها ===== */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      {!hasVisiblePeriods ? (
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
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            border: `0.6pt solid ${theme.cellBorder}`,
            borderRadius: radius ? `${radius}px` : 0,
            overflow: "hidden",
            breakInside: "avoid",
          }}
        >
          {/* رؤوس الأيام */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${dayColumns.length}, minmax(0, 1fr))`,
              background: theme.headerBg,
            }}
          >
            {dayColumns.map(({ day }, i) => (
              <div
                key={day.id}
                style={{
                  ...thBase,
                  background: "transparent",
                  border: "none",
                  borderInlineStart:
                    i > 0
                      ? `0.6pt solid ${hexToRgba(theme.headerText, 0.35)}`
                      : undefined,
                  padding: "2mm 1.2mm",
                  fontSize: "10.5pt",
                }}
              >
                {day.name}
              </div>
            ))}
          </div>

          {/* أعمدة الأيام */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${dayColumns.length}, minmax(0, 1fr))`,
              flex: 1,
              minHeight: 0,
            }}
          >
            {dayColumns.map(({ day, periods }, colIndex) => (
              <div
                key={day.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  minHeight: 0,
                  background: "#FFFFFF",
                  borderInlineStart:
                    colIndex > 0 ? `0.6pt solid ${theme.cellBorder}` : undefined,
                }}
              >
                {periods.length === 0 ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "2mm",
                      color: "#94A3B8",
                      fontSize: "8pt",
                      textAlign: "center",
                    }}
                  >
                    لم تُبرمج حصص
                  </div>
                ) : (
                  periods.map((p, periodIndex) => {
                    const subj = subjectOf(p.subjectId);
                    const dur = durationOf(p);
                    // توزيع الارتفاع على الحصص بحسب مدّتها؛ نمنح الاستراحة
                    // حدًّا أدنى حتى يبقى نصّها مقروءًا في الأيام المزدحمة.
                    const weight = p.isBreak
                      ? Math.max(dur, 25)
                      : Math.max(dur > 0 ? dur : 30, 10);
                    const isLast = periodIndex === periods.length - 1;

                    let bg = "#F8FAFC";
                    let fg = "#64748B";
                    let sideBar: string | undefined;

                    if (p.isBreak) {
                      bg = theme.zebraBg;
                      fg = "#64748B";
                    } else if (subj) {
                      if (cellFill === "subject") {
                        bg = subj.color;
                        fg = readableTextOn(subj.color);
                      } else if (cellFill === "soft") {
                        bg = hexToRgba(subj.color, 0.14);
                        fg = theme.cellText;
                      } else {
                        bg = "#FFFFFF";
                        fg = theme.cellText;
                        sideBar = `3pt solid ${subj.color}`;
                      }
                    }

                    const badgeBg =
                      cellFill === "subject" && subj
                        ? "rgba(255,255,255,0.24)"
                        : subj
                          ? hexToRgba(subj.color, 0.16)
                          : "rgba(148,163,184,0.16)";
                    const badgeFg =
                      cellFill === "subject" && subj ? fg : subj?.color || fg;

                    return (
                      <div
                        key={p.id}
                        style={{
                          flexGrow: weight,
                          flexShrink: 1,
                          flexBasis: 0,
                          minHeight: 0,
                          background: bg,
                          color: fg,
                          padding: "0.6mm 1mm",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.3mm",
                          textAlign: "center",
                          lineHeight: 1.2,
                          overflow: "hidden",
                          borderInlineStart: sideBar,
                          borderBottom: isLast
                            ? undefined
                            : `0.6pt solid ${theme.cellBorder}`,
                        }}
                      >
                        {p.isBreak ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexWrap: "wrap",
                              gap: "1.2mm",
                            }}
                          >
                            <span style={{ fontSize: "8.5pt", fontWeight: 700 }}>
                              {p.label || "استراحة"}
                            </span>
                            {showDuration && dur > 0 && (
                              <span
                                style={{
                                  fontSize: "7pt",
                                  fontWeight: 700,
                                  padding: "0.2mm 1.1mm",
                                  borderRadius: "2mm",
                                  background: "rgba(100,116,139,0.12)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatDuration(dur)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexWrap: "wrap",
                                gap: "1.2mm",
                                maxWidth: "100%",
                              }}
                            >
                              {subj ? (
                                showNames ? (
                                  <span
                                    style={{
                                      fontSize: "10pt",
                                      fontWeight: 800,
                                      overflowWrap: "break-word",
                                    }}
                                  >
                                    {subj.name}
                                  </span>
                                ) : null
                              ) : (
                                <span style={{ fontSize: "9.5pt", fontWeight: 700 }}>
                                  {p.label || "حصة"}
                                </span>
                              )}
                              {showDuration && dur > 0 && (
                                <span
                                  style={{
                                    fontSize: "7.5pt",
                                    fontWeight: 700,
                                    padding: "0.3mm 1.2mm",
                                    borderRadius: "2mm",
                                    background: badgeBg,
                                    color: badgeFg,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {formatDuration(dur)}
                                </span>
                              )}
                            </div>
                            {/* نتجنّب تكرار المدّة حين تُعرض شارةً وبجانبها */}
                            {!(showDuration && state.design.periodDisplay === "duration") && (
                              <div style={{ fontSize: "7.5pt", opacity: 0.85 }}>
                                {timeLabel(state, p)}
                              </div>
                            )}
                            {p.note && (
                              <div style={{ fontSize: "7pt", opacity: 0.75 }}>
                                {p.note}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* ===== أسفل الوثيقة: الملخّص والتوقيعات والتذييل ===== */}
      <div>
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

      {/* ===== التوقيعات: الأستاذ + المفتش + المدير ===== */}
      {state.design.showSign && (
        <div
          style={{
            marginTop: "auto",
            paddingTop: "4mm",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "3mm",
            fontSize: "9.5pt",
            fontWeight: 700,
            color: theme.heading,
            breakInside: "avoid",
          }}
        >
          {(["teacher", "inspector", "manager"] as const).map((k) => (
            <div key={k} style={{ flex: "1 1 28%", minWidth: "26mm" }}>
              {sign(k)}: ..............................
            </div>
          ))}
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
    </div>
  );
}

/** تسمية الوقت داخل الحصة */
function timeLabel(state: TimetableState, src: Period): string {
  const dur = formatDuration(durationOf(src));
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
