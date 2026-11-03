"use client";

/* ============================================================
   الوثيقة المطبوعة — A4 أفقي أو عمودي، نصوص متجهية بالعربية

   الجدول مبنيّ على أعمدة الأيام: كل يوم يعرض حصصه متتابعة،
   وكل حصة تأخذ من الارتفاع بحسب مدّتها مع حدّ أدنى يضمن
   ظهور المادة والمستوى والفوج والتوقيت كاملة.

   الاستراحة المشتركة بين كل الأيام تُعرض مرّة واحدة في شريط
   أفقي وسط الجدول، داخل إطار واضح، بدل تكرارها في كل عمود.
   ============================================================ */
import React from "react";
import { Coffee } from "lucide-react";
import { DAYS, DEFAULT_TIMING } from "./defaults";
import { resolveTheme } from "./theme";
import {
  dayPeriods,
  durationOf,
  periodBlock,
  weekTotals,
  withAutoBreaks,
} from "./schedule";
import {
  formatDuration,
  hexToRgba,
  readableTextOn,
  audienceLabel,
  timeToMin,
} from "./utils";
import InstitutionLogo from "./InstitutionLogo";
import type { DayDef, Period, TimetableState } from "./types";

interface Props {
  state: TimetableState;
}

interface SharedBreak {
  start: string;
  end: string;
  label: string;
  duration: number;
}

interface Band {
  /** الاستراحة التي تسبق هذه الحزمة (إن وُجدت) */
  breakInfo?: SharedBreak;
  /** حصص كل يوم داخل هذه الحزمة */
  columns: Period[][];
}

interface DayColumn {
  day: DayDef;
  periods: Period[];
}

export default function TimetablePreview({ state }: Props) {
  const theme = resolveTheme(state.design);
  const isLandscape = state.orientation === "landscape";
  const docWidth = isLandscape ? "277mm" : "190mm";
  const subjectOf = (id: string | null | undefined) =>
    state.subjects.find((s) => s.id === id);
  const levelOf = (id: string | undefined) =>
    (state.info.levels || []).find((l) => l.id === id)?.name;

  const dayList = DAYS.filter((d) => state.days.includes(d.id));
  const cellFill = state.design.cellFill || theme.template.cellFill;

  /* حجم خط الجدول: يتحكّم فيه الأستاذ من خطوة التصميم */
  const fontScale = Math.min(1.1, Math.max(0.8, state.design.fontScale ?? 1));
  const subjectFontScale = Math.min(
    1.5,
    Math.max(0.8, state.design.subjectFontScale ?? 1)
  );
  const metaFontScale = Math.min(
    1.5,
    Math.max(0.8, state.design.metaFontScale ?? 1)
  );
  const timeFontScale = Math.min(
    1.5,
    Math.max(0.8, state.design.timeFontScale ?? 1)
  );
  const fs = (pt: number) => `${(pt * fontScale).toFixed(2)}pt`;
  const fsSubject = (pt: number) => fs(pt * subjectFontScale);
  const fsMeta = (pt: number) => fs(pt * metaFontScale);
  const fsTime = (pt: number) => fs(pt * timeFontScale);
  /** خطوط الترويسة والتذييل تبقى ثابتة حتى يبقى حجم الوثيقة مضبوطًا */
  const fsDoc = (pt: number) => `${pt}pt`;
  /* ارتفاع أدنى يحمي النص من الفيض حين يكبر خط المادة أو المستوى أو التوقيت */
  const rowBoost = Math.max(
    1,
    subjectFontScale,
    metaFontScale,
    timeFontScale
  );
  const cellMin = (p: Period) =>
    `${((p.isBreak ? 8.5 : 12) * fontScale * rowBoost).toFixed(2)}mm`;

  const timing = state.timing ?? DEFAULT_TIMING;

  /* كل يوم عمود مستقلّ: نُخفي الاستراحات إن اختار الأستاذ ذلك */
  const dayColumns: DayColumn[] = dayList.map((day) => {
    const all = dayPeriods(state, day.id);
    const periods = state.design.showBreaks
      ? all
      : all.filter((p) => !p.isBreak);
    return { day, periods };
  });
  const hasVisiblePeriods = dayColumns.some((c) => c.periods.length > 0);

  /* الفترتان ثابتتان: تُعرضان دائمًا ولو كانت إحداهما بلا حصص */
  const blockDefs = [
    {
      id: "morning" as const,
      label: "الفترة الصباحية",
      emoji: "☀️",
      start: timing.morningStart,
      end: timing.morningEnd,
    },
    {
      id: "afternoon" as const,
      label: "الفترة المسائية",
      emoji: "🌙",
      start: timing.afternoonStart,
      end: timing.afternoonEnd,
    },
  ];

  const blocks = blockDefs.map((block) => {
    const columns: DayColumn[] = dayColumns.map(({ day, periods }) => ({
      day,
      periods: withAutoBreaks(
        periods.filter((p) => periodBlock(timing, p) === block.id),
        state.design.showBreaks ? 10 : 0
      ),
    }));
    const hasSessions = columns.some((c) => c.periods.length > 0);
    return {
      ...block,
      columns,
      hasSessions,
      bands: hasSessions ? computeBands(columns) : [],
    };
  });

  const transitionGap = Math.max(
    0,
    (timeToMin(timing.afternoonStart) ?? 0) -
      (timeToMin(timing.morningEnd) ?? 0)
  );

  const docStyle: React.CSSProperties = {
    width: docWidth,
    minHeight: isLandscape ? "185mm" : "272mm",
    background: theme.pageBg,
    color: theme.cellText,
    fontFamily: theme.fontFamily,
    padding: "5mm",
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
    padding: "1mm 1.2mm",
    fontSize: fs(10),
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
  const showLevelGroup = state.design.showLevelGroup !== false;

  /* لون الخط الفاصل بين المواد */
  const sepColor = (isSubjectFill: boolean, fg: string) =>
    isSubjectFill ? hexToRgba(fg, 0.55) : hexToRgba(theme.headerBg, 0.45);

  return (
    <div
      className="tt-doc"
      data-orientation={isLandscape ? "landscape" : "portrait"}
      style={docStyle}
      dir="rtl"
    >
      {/* ===== الترويسة والعنوان والبيانات ===== */}
      <div>
        {/* ===== ترويسة ===== */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "4mm",
            fontSize: fsDoc(8.2),
            color: "#475569",
            lineHeight: 1.35,
            paddingBottom: "1.2mm",
            borderBottom: `1.4pt solid ${theme.headerBg}`,
            marginBottom: "1.4mm",
          }}
        >
          <div style={{ flex: "0 0 auto" }}>
            <div
              style={{
                fontWeight: 700,
                color: theme.heading,
                fontSize: fsDoc(9.6),
              }}
            >
              المملكة المغربية
            </div>
            <div>وزارة التربية الوطنية والتعليم الأولي والرياضة</div>
          </div>

          {showLogo && (
            <div style={{ flex: "0 0 auto", textAlign: "center" }}>
              <InstitutionLogo
                size={52}
                src={state.design.logoDataUrl}
                color={theme.headerBg}
              />
              {state.info.year && (
                <div
                  style={{
                    fontSize: fsDoc(8.2),
                    fontWeight: 700,
                    color: theme.heading,
                    marginTop: "0.7mm",
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
        <div style={{ textAlign: "center", marginBottom: "1.5mm" }}>
          <div
            style={{
              fontSize: fsDoc(16),
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
              gap: "1.4mm 6mm",
              marginBottom: "1.4mm",
              fontSize: fsDoc(9),
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

      {/* ===== الجدول: عمود لكل يوم ===== */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        {!hasVisiblePeriods ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94A3B8",
              fontSize: fs(11),
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
              border: `0.9pt solid ${theme.cellBorder}`,
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
                flexShrink: 0,
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
                    padding: "1.1mm 1.2mm",
                    fontSize: fs(10.5),
                  }}
                >
                  {day.name}
                </div>
              ))}
            </div>

            {/* ===== كتلتا الفترتين: صباحية ومسائية ===== */}
            {blocks.map((block, blockIndex) => (
              <React.Fragment key={block.id}>
                {/* رأس الفترة */}
                <div
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "2mm",
                    padding: "0.6mm 2mm",
                    background: hexToRgba(theme.headerBg, 0.08),
                    color: theme.heading,
                    borderTop: `0.7pt solid ${hexToRgba(theme.headerBg, 0.3)}`,
                    borderBottom: `0.7pt solid ${hexToRgba(
                      theme.headerBg,
                      0.3
                    )}`,
                    fontSize: fs(8.8),
                    fontWeight: 800,
                    breakInside: "avoid",
                  }}
                >
                  <span>
                    {block.emoji} {block.label}
                  </span>
                  <span
                    dir="ltr"
                    style={{ fontSize: fsTime(8.4), fontWeight: 700 }}
                  >
                    {block.start} — {block.end}
                  </span>
                </div>

                {/* فترة فارغة: تبقى مرئية حتى يمكن إضافة حصة لاحقًا */}
                {!block.hasSessions && (
                  <div
                    style={{
                      flexShrink: 0,
                      minHeight: "12mm",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "1.6mm",
                      color: "#94A3B8",
                      background: hexToRgba(theme.headerBg, 0.025),
                      borderBottom: `0.6pt dashed ${hexToRgba(
                        theme.headerBg,
                        0.25
                      )}`,
                      fontSize: fsMeta(8),
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    لا توجد حصص في هذه الفترة — يمكن إضافتها لاحقًا
                  </div>
                )}

                {block.hasSessions &&
                  block.bands.map((band, bandIndex) => {
              const maxMin = Math.max(
                8 * fontScale,
                ...band.columns.map((periods) =>
                  periods.reduce(
                    (sum, p) =>
                      sum +
                      (p.isBreak ? 8.5 : 12) * fontScale * rowBoost,
                    0
                  )
                )
              );
              const periodCount = Math.max(
                0,
                ...band.columns.map((p) => p.length)
              );

              return (
                <React.Fragment key={`band-${block.id}-${bandIndex}`}>
                  {/* ===== شريط الاستراحة: مرّة واحدة في الوسط ===== */}
                  {band.breakInfo && (
                    <div
                      style={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0.7mm 2mm",
                        background: hexToRgba(theme.headerBg, 0.055),
                        borderTop: `0.8pt solid ${hexToRgba(
                          theme.headerBg,
                          0.35
                        )}`,
                        borderBottom: `0.8pt solid ${hexToRgba(
                          theme.headerBg,
                          0.35
                        )}`,
                        breakInside: "avoid",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "2.4mm",
                          minWidth: "58mm",
                          padding: `${0.7 * fontScale}mm 5mm`,
                          background: theme.pageBg,
                          color: theme.heading,
                          border: `1.2pt solid ${theme.headerBg}`,
                          borderRadius: "2.5mm",
                          boxShadow: `0 0 0 1mm ${hexToRgba(
                            theme.headerBg,
                            0.08
                          )}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Coffee
                          aria-hidden="true"
                          style={{
                            width: `${3.4 * fontScale}mm`,
                            height: `${3.4 * fontScale}mm`,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: fsMeta(9.8),
                            fontWeight: 800,
                            letterSpacing: "0.2pt",
                          }}
                        >
                          {band.breakInfo.label || "استراحة"}
                        </span>
                        <span
                          style={{
                            width: "0.7pt",
                            height: `${3.6 * fontScale}mm`,
                            background: hexToRgba(theme.headerBg, 0.35),
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: fsTime(8.4),
                            fontWeight: 700,
                            direction: "ltr",
                            unicodeBidi: "isolate",
                          }}
                        >
                          {band.breakInfo.start} — {band.breakInfo.end}
                        </span>
                        {showDuration && band.breakInfo.duration > 0 && (
                          <span
                            style={{
                              fontSize: fsMeta(7.4),
                              fontWeight: 800,
                              padding: "0.25mm 1.6mm",
                              borderRadius: "1.6mm",
                              background: hexToRgba(theme.headerBg, 0.1),
                              color: theme.heading,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDuration(band.breakInfo.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===== حزمة حصص الأيام ===== */}
                  {periodCount > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${dayColumns.length}, minmax(0, 1fr))`,
                        flexGrow: Math.max(maxMin, 1),
                        flexShrink: 1,
                        flexBasis: 0,
                        minHeight: `${maxMin.toFixed(2)}mm`,
                      }}
                    >
                      {band.columns.map((periods, colIndex) => {
                        const dayHasAny =
                          dayColumns[colIndex].periods.length > 0;
                        return (
                          <div
                            key={dayColumns[colIndex].day.id}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              minWidth: 0,
                              minHeight: 0,
                              background: "#FFFFFF",
                              borderInlineStart:
                                colIndex > 0
                                  ? `0.8pt solid ${theme.cellBorder}`
                                  : undefined,
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
                                  fontSize: fs(8),
                                  textAlign: "center",
                                }}
                              >
                                {!dayHasAny && bandIndex === 0
                                  ? "لم تُبرمج حصص"
                                  : ""}
                              </div>
                            ) : (
                              periods.map((p, periodIndex) => {
                                const subj = subjectOf(p.subjectId);
                                const dur = durationOf(p);
                                const audience =
                                  showLevelGroup && subj && showNames
                                    ? audienceLabel(
                                        levelOf(p.levelId),
                                        p.group
                                      )
                                    : "";
                                const weight = Math.max(
                                  dur > 0 ? dur : 30,
                                  10
                                );
                                const isLast =
                                  periodIndex === periods.length - 1;

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
                                    sideBar = `2.4pt solid ${subj.color}`;
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
                                  cellFill === "subject" && subj
                                    ? fg
                                    : subj?.color || fg;
                                const isSubjectFill =
                                  cellFill === "subject" && !!subj;

                                return (
                                  <div
                                    key={p.id}
                                    data-period-id={p.id}
                                    data-is-break={p.isBreak ? "1" : "0"}
                                    style={{
                                      flexGrow: weight,
                                      flexShrink: 1,
                                      flexBasis: "auto",
                                      minHeight: cellMin(p),
                                      background: bg,
                                      color: fg,
                                      padding: `${0.6 * fontScale}mm 1.1mm`,
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "0.3mm",
                                      textAlign: "center",
                                      lineHeight: 1.18,
                                      overflow: "visible",
                                      borderInlineStart: sideBar,
                                      borderBottom: isLast
                                        ? undefined
                                        : `1.4pt solid ${sepColor(
                                            isSubjectFill,
                                            fg
                                          )}`,
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
                                        <span
                                          style={{
                                            fontSize: fsMeta(8.5),
                                            fontWeight: 700,
                                          }}
                                        >
                                          {p.label || "استراحة"}
                                        </span>
                                        {showDuration && dur > 0 && (
                                          <span
                                            style={{
                                              fontSize: fsMeta(7),
                                              fontWeight: 700,
                                              padding: "0.2mm 1.1mm",
                                              borderRadius: "2mm",
                                              background:
                                                "rgba(100,116,139,0.12)",
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
                                            alignItems: "baseline",
                                            justifyContent: "center",
                                            flexWrap: "wrap",
                                            gap: "0.9mm",
                                            maxWidth: "100%",
                                          }}
                                        >
                                          {subj ? (
                                            showNames ? (
                                              <span
                                                style={{
                                                  fontSize: fsSubject(10.5),
                                                  fontWeight: 800,
                                                  lineHeight: 1.1,
                                                  overflowWrap: "anywhere",
                                                }}
                                              >
                                                {subj.name}
                                              </span>
                                            ) : null
                                          ) : (
                                            <span
                                              style={{
                                                fontSize: fsSubject(9.5),
                                                fontWeight: 700,
                                              }}
                                            >
                                              {p.label || "حصة"}
                                            </span>
                                          )}
                                          {showDuration && dur > 0 && (
                                            <span
                                              style={{
                                                fontSize: fsMeta(7.4),
                                                fontWeight: 700,
                                                padding: "0.25mm 1.2mm",
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
                                        {audience && (
                                          <div
                                            style={{
                                              fontSize: fsMeta(7.5),
                                              fontWeight: 700,
                                              lineHeight: 1.12,
                                              color: badgeFg,
                                              opacity: 0.92,
                                              maxWidth: "100%",
                                              overflowWrap: "anywhere",
                                            }}
                                          >
                                            {audience}
                                          </div>
                                        )}
                                        {/* نتجنّب تكرار المدّة حين تُعرض شارةً وبجانبها */}
                                        {!(
                                          showDuration &&
                                          state.design.periodDisplay ===
                                            "duration"
                                        ) && (
                                          <div
                                            style={{
                                              fontSize: fsTime(8),
                                              fontWeight: 600,
                                              opacity: 0.9,
                                              whiteSpace: "nowrap",
                                              direction: "ltr",
                                              unicodeBidi: "isolate",
                                            }}
                                          >
                                            {timeLabel(state, p)}
                                          </div>
                                        )}
                                        {p.note && (
                                          <div
                                            style={{
                                              fontSize: fsMeta(7),
                                              opacity: 0.75,
                                              overflowWrap: "anywhere",
                                            }}
                                          >
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
                        );
                      })}
                    </div>
                  )}
                </React.Fragment>
                  );
                  })}

                {/* شريط الانتقال بين الصباحية والمسائية */}
                {blockIndex === 0 && transitionGap > 0 && (
                  <div
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "2mm",
                      padding: "0.3mm 2mm",
                      background: hexToRgba(theme.headerBg, 0.03),
                      borderBottom: `0.6pt solid ${hexToRgba(
                        theme.headerBg,
                        0.18
                      )}`,
                      color: "#64748B",
                      fontSize: fsMeta(7.4),
                      fontWeight: 700,
                    }}
                  >
                    <span>⬅️ انتقال بين الفترتين</span>
                    <span dir="ltr">
                      {timing.morningEnd} → {timing.afternoonStart}
                    </span>
                    <span>({transitionGap} د)</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ===== أسفل الوثيقة: الملخّص والتوقيعات والتذييل ===== */}
      <div>
        {/* ===== الملخّص ===== */}
        {state.design.showTotals && totalLessons > 0 && (
          <div
            style={{
              marginTop: "1.2mm",
              fontSize: fsDoc(8),
              breakInside: "avoid",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: theme.heading,
                marginBottom: "0.8mm",
              }}
            >
              ملخّص: {totalLessons} حصة أسبوعيًا — المجموع{" "}
              {formatDuration(totalMin) || "0 د"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.2mm 3mm" }}>
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
            <div style={{ marginTop: "0.7mm", color: "#64748B" }}>
              {dayList
                .map((d) => `${d.name}: ${perDay[d.id]} حصة`)
                .join("  ·  ")}
            </div>
          </div>
        )}

        {/* ===== التوقيعات: الأستاذ + المفتش + المدير ===== */}
        {state.design.showSign && (
          <div
            className="tt-sign"
            style={{
              marginTop: "2.2mm",
              paddingTop: "2mm",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: "3mm 8mm",
              fontSize: fsDoc(9),
              fontWeight: 700,
              color: theme.heading,
              breakInside: "avoid",
              flexShrink: 0,
            }}
          >
            {(["teacher", "inspector", "manager"] as const).map((k) => (
              <div
                key={k}
                style={{
                  flex: "1 1 28%",
                  minWidth: "40mm",
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: "4.5mm" }}>{sign(k)}</div>
                <div
                  style={{
                    borderTop: `0.8pt dotted ${hexToRgba(
                      theme.headerBg,
                      0.5
                    )}`,
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ===== تذييل ===== */}
        {state.design.showFooter && (
          <div
            style={{
              marginTop: "1mm",
              paddingTop: "0.8mm",
              borderTop: `0.6pt solid ${theme.cellBorder}`,
              fontSize: fsDoc(7.5),
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

/**
 * بناء حزم يومية داخل فترة واحدة، تفصل بينها الاستراحات المشتركة.
 * نعتمد على ترتيب الاستراحة داخل اليوم (الأولى، الثانية...) بدل توقيتها
 * الدقيق، لأن التوقيت قد يختلف قليلًا من يوم لآخر.
 */
function computeBands(dayColumns: DayColumn[]): Band[] {
  const activeColumns = dayColumns.filter((c) => c.periods.length > 0);
  if (!activeColumns.length) return [];

  interface BreakAggregate {
    start: string;
    end: string;
    label: string;
    dayCount: number;
    startCounts: Map<string, number>;
    endCounts: Map<string, number>;
    labelCounts: Map<string, number>;
  }

  const breakAggregates: Array<BreakAggregate | undefined> = [];

  for (const col of activeColumns) {
    let ordinal = 0;
    for (const p of col.periods) {
      if (!p.isBreak) continue;
      if (p.start && p.end) {
        let agg = breakAggregates[ordinal];
        if (!agg) {
          agg = {
            start: p.start,
            end: p.end,
            label: (p.label || "").trim() || "استراحة",
            dayCount: 0,
            startCounts: new Map(),
            endCounts: new Map(),
            labelCounts: new Map(),
          };
          breakAggregates[ordinal] = agg;
        }
        agg.dayCount += 1;
        agg.startCounts.set(p.start, (agg.startCounts.get(p.start) ?? 0) + 1);
        agg.endCounts.set(p.end, (agg.endCounts.get(p.end) ?? 0) + 1);
        const lbl = (p.label || "").trim() || "استراحة";
        agg.labelCounts.set(lbl, (agg.labelCounts.get(lbl) ?? 0) + 1);
      }
      ordinal += 1;
    }
  }

  const modeOf = (counts: Map<string, number>, fallback: string) => {
    let best = fallback;
    let bestCount = 0;
    for (const [value, count] of counts) {
      if (count > bestCount) {
        best = value;
        bestCount = count;
      }
    }
    return best;
  };

  /* فرق التوقيت المسموح بين استراحات الأيام قبل اعتبارها استراحة واحدة */
  const spreadOf = (counts: Map<string, number>) => {
    let min = Infinity;
    let max = -Infinity;
    for (const value of counts.keys()) {
      const minutes = timeToMin(value);
      if (minutes === null) continue;
      min = Math.min(min, minutes);
      max = Math.max(max, minutes);
    }
    return min === Infinity ? 0 : max - min;
  };

  /* الاستراحة تُخرج إلى الشريط الوسطيّ إن تكرّرت في يومين على الأقل */
  const minDays = Math.min(2, activeColumns.length);
  const unifiedBreaks: Array<{ ordinal: number; info: SharedBreak }> = [];

  breakAggregates.forEach((agg, ordinal) => {
    if (!agg || agg.dayCount < minDays) return;
    /* لا ندمج استراحتين متباعدتين زمنيًا (مثل استراحة الصباح واستراحة الغداء) */
    if (spreadOf(agg.startCounts) > 90 || spreadOf(agg.endCounts) > 90) return;
    const start = modeOf(agg.startCounts, agg.start);
    const end = modeOf(agg.endCounts, agg.end);
    unifiedBreaks.push({
      ordinal,
      info: {
        start,
        end,
        label: modeOf(agg.labelCounts, agg.label || "استراحة"),
        duration:
          Math.max(0, (timeToMin(end) ?? 0) - (timeToMin(start) ?? 0)) || 0,
      },
    });
  });

  /* تقسيم الأيام إلى حزم تفصل بينها الاستراحات المشتركة.
     اليوم الذي لا يملك استراحة في هذا الترتيب يُقسَّم حسب توقيت الشريط
     الوسطيّ حتى يبقى الارتفاع متوازنًا ولا يخرج الجدول عن صفحة واحدة. */
  const dayBands = dayColumns.map(({ periods }) => {
    const ownBreaks = periods.filter((p) => p.isBreak);
    const cuts = unifiedBreaks.map(({ ordinal, info }) => {
      const own = ownBreaks[ordinal];
      return {
        at: timeToMin(own?.start || info.start),
        removeId: own?.id,
      };
    });

    const segments: Period[][] = [[]];
    let cutIndex = 0;
    let cut = cuts[cutIndex];

    for (const p of periods) {
      if (p.isBreak) {
        if (cut && cut.removeId === p.id) {
          cutIndex += 1;
          cut = cuts[cutIndex];
          segments.push([]);
        } else {
          segments[segments.length - 1].push(p);
        }
        continue;
      }

      const start = timeToMin(p.start);
      while (cut && cut.at !== null && start !== null && start >= cut.at) {
        cutIndex += 1;
        cut = cuts[cutIndex];
        segments.push([]);
      }

      segments[segments.length - 1].push(p);
    }

    return segments;
  });

  const bands: Band[] = [];
  for (let i = 0; i <= unifiedBreaks.length; i++) {
    bands.push({
      breakInfo: i > 0 ? unifiedBreaks[i - 1].info : undefined,
      columns: dayBands.map((segments) => segments[i] ?? []),
    });
  }
  return bands;
}

/** تسمية الوقت داخل الحصة */
function timeLabel(state: TimetableState, src: Period): string {  const dur = formatDuration(durationOf(src));
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
