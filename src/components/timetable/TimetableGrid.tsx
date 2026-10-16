"use client";

/* ============================================================
   شبكة تحرير استعمال الزمن: فترات (صفوف) × أيام (أعمدة)
   ============================================================ */
import React, { useMemo, useState } from "react";
import {
  Clock,
  Copy,
  Eraser,
  MoreVertical,
  Plus,
  Repeat,
  Undo2,
  Redo2,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { DAYS } from "./defaults";
import { cellKey, useTimetable } from "./store";
import { resolveTheme } from "./theme";
import SubjectPicker from "./SubjectPicker";
import FloatingCard, { type Anchor } from "./FloatingCard";
import { useConfirm } from "./ConfirmDialog";
import type { Period } from "./types";
import {
  cx,
  detectOverlaps,
  durationMin,
  formatDuration,
  hexToRgba,
  readableTextOn,
} from "./utils";

interface OpenState {
  key: string;
  anchor: Anchor;
}

export default function TimetableGrid() {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useTimetable();
  const theme = resolveTheme(state.design);
  const cellFill = state.design.cellFill || theme.template.cellFill;
  const confirm = useConfirm();

  const [picker, setPicker] = useState<OpenState | null>(null);
  const [menu, setMenu] = useState<OpenState | null>(null);
  const [over, setOver] = useState<OpenState | null>(null);

  const dayList = DAYS.filter((d) => state.days.includes(d.id));
  const workPeriods = state.periods.filter((p) => !p.isBreak);

  const overlaps = useMemo(() => detectOverlaps(state.periods), [state.periods]);

  const stats = useMemo(() => {
    const total = dayList.length * workPeriods.length;
    let filled = 0;
    for (const d of dayList)
      for (const p of workPeriods)
        if (state.grid[d.id]?.[p.id]?.subjectId) filled += 1;
    return { total, filled, empty: total - filled };
  }, [dayList, workPeriods, state.grid]);

  const openFromEvent = (
    e: React.MouseEvent,
    setter: (v: OpenState | null) => void,
    key: string
  ) => {
    e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setter({ key, anchor: { x: r.left, y: r.bottom } });
  };

  const parsed = (k: string) => {
    const [day, periodId] = k.split("::");
    return { day, periodId };
  };

  const timeLabel = (p: Period) => {
    const dur = formatDuration(durationMin(p.start, p.end));
    return state.design.periodDisplay === "start"
      ? p.start
      : state.design.periodDisplay === "duration"
        ? dur
        : `${p.start} - ${p.end}`;
  };

  /* ================= عمليات ================= */
  const copyDay = async (from: string) => {
    const others = dayList.filter((d) => d.id !== from);
    if (!others.length) return;
    const target = others[0];
    const ok = await confirm(
      `سيتم استبدال حصص يوم «${DAYS.find((d) => d.id === target.id)?.name}» بحصص اليوم المحدّد.`,
      { title: "نسخ يوم كامل", confirmLabel: "نسخ" }
    );
    if (ok) dispatch({ type: "COPY_DAY", from: from as never, to: target.id as never });
  };

  const clearDay = async (day: string) => {
    const name = DAYS.find((d) => d.id === day)?.name || day;
    const n = workPeriods.filter((p) => state.grid[day]?.[p.id]?.subjectId).length;
    if (n === 0) {
      dispatch({ type: "CLEAR_DAY", day: day as never });
      return;
    }
    const ok = await confirm(
      `يحتوي يوم «${name}» على ${n} حصة. هل تريد مسحها كلها؟`,
      { title: "مسح اليوم", confirmLabel: "مسح", danger: true }
    );
    if (ok) dispatch({ type: "CLEAR_DAY", day: day as never });
  };

  const clearAll = async () => {
    const ok = await confirm("سيتم تفريغ الجدول كاملًا مع الاحتفاظ بالفترات والإعدادات.", {
      title: "تفريغ الجدول",
      confirmLabel: "تفريغ الكل",
      danger: true,
    });
    if (ok) dispatch({ type: "CLEAR_ALL" });
  };

  return (
    <div className="space-y-4">
      {/* ===== شريط الأدوات ===== */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-text transition-colors hover:bg-background disabled:opacity-40"
        >
          <Undo2 className="h-4 w-4" /> تراجع
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-text transition-colors hover:bg-background disabled:opacity-40"
        >
          <Redo2 className="h-4 w-4" /> إعادة
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_PERIOD" })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-text transition-colors hover:bg-background"
        >
          <Plus className="h-4 w-4" /> حصة جديدة
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_PERIOD", isBreak: true })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-text transition-colors hover:bg-background"
        >
          <Plus className="h-4 w-4" /> استراحة
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" /> تفريغ الجدول
        </button>

        {/* مؤشر الإنجاز */}
        <div className="ms-auto flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2">
          <div className="flex items-center gap-1.5 text-sm font-bold text-secondary">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-secondary" />
            مكتملة: {stats.filled}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-muted">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-border" />
            فارغة: {stats.empty}
          </div>
        </div>
      </div>

      {/* ===== تنبيهات ===== */}
      {Object.keys(overlaps).length > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            توجد فترات متداخلة زمنيًا. يمكنك تعديلها من الخطوة الثانية (إعداد الحصص).
          </span>
        </div>
      )}
      {stats.filled > 0 && stats.empty > 0 && (
        <div className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-muted">
          تذكير: تبقّى {stats.empty} خانة فارغة. يمكنك الطباعة حتى قبل إكمالها كلها.
        </div>
      )}

      {/* ===== الجدول ===== */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full border-collapse" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th className="sticky start-0 z-10 w-36 border border-border bg-background p-2 text-xs font-extrabold text-text">
                الحصة / اليوم
              </th>
              {dayList.map((d) => (
                <th
                  key={d.id}
                  className="border border-border bg-background p-2 text-center text-sm font-extrabold text-text"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{d.name}</span>
                    <button
                      type="button"
                      onClick={(e) => openFromEvent(e, setMenu, `day::${d.id}`)}
                      className="rounded p-0.5 text-muted hover:bg-surface hover:text-text"
                      title="خيارات اليوم"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.periods.map((p) => {
              if (p.isBreak) {
                return (
                  <tr key={p.id}>
                    <td
                      colSpan={1 + dayList.length}
                      className="border border-border bg-background px-3 py-1.5 text-center text-xs font-bold tracking-wider text-muted"
                    >
                      {p.label || "استراحة"} — {p.start} / {p.end}
                      {formatDuration(durationMin(p.start, p.end))
                        ? ` (${formatDuration(durationMin(p.start, p.end))})`
                        : ""}
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={p.id}>
                  <th className="sticky start-0 z-10 border border-border bg-surface p-2 text-center text-xs font-bold text-text">
                    <div>{timeLabel(p)}</div>
                    {durationMin(p.start, p.end) ? (
                      <div className="text-[10px] font-normal text-muted">
                        {formatDuration(durationMin(p.start, p.end))}
                      </div>
                    ) : null}
                  </th>
                  {dayList.map((d) => {
                    const e = state.grid[d.id]?.[p.id];
                    const subj = state.subjects.find((s) => s.id === e?.subjectId);
                    const key = cellKey(d.id, p.id);
                    const hasOverride = !!(e?.override?.start || e?.override?.end);
                    let bg = "#FFFFFF";
                    let fg = "#94A3B8";
                    if (subj) {
                      if (cellFill === "subject") {
                        bg = subj.color;
                        fg = readableTextOn(subj.color);
                      } else if (cellFill === "soft") {
                        bg = hexToRgba(subj.color, 0.16);
                        fg = theme.cellText;
                      } else {
                        bg = "#FFFFFF";
                        fg = subj.color;
                      }
                    }
                    return (
                      <td key={d.id} className="border border-border p-0 align-middle">
                        <div className="group relative">
                          <button
                            type="button"
                            onClick={(ev) => openFromEvent(ev, setPicker, key)}
                            className={cx(
                              "flex min-h-[46px] w-full items-center justify-center gap-1 px-2 py-1.5 text-center text-[13px] font-bold transition-opacity hover:opacity-90"
                            )}
                            style={{ background: bg, color: fg }}
                          >
                            {subj ? (
                              <span className="flex items-center gap-1">
                                {hasOverride && <Clock className="h-3 w-3 opacity-70" />}
                                <span className="truncate">{subj.name}</span>
                              </span>
                            ) : (
                              <Plus className="h-4 w-4 opacity-40" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(ev) => openFromEvent(ev, setMenu, key)}
                            className="absolute end-0.5 top-0.5 hidden rounded p-0.5 text-white/90 mix-blend-luminosity group-hover:block"
                            style={{ color: subj ? readableTextOn(bg) : "#64748B" }}
                            title="خيارات الخانة"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= النوافذ العائمة ================= */}
      {picker && (
        <SubjectPicker
          anchor={picker.anchor}
          subjects={state.subjects}
          value={state.grid[parsed(picker.key).day]?.[parsed(picker.key).periodId]?.subjectId || null}
          onPick={(id) => {
            const { day, periodId } = parsed(picker.key);
            dispatch({ type: "SET_CELL", day: day as never, periodId, subjectId: id });
          }}
          onClear={() => {
            const { day, periodId } = parsed(picker.key);
            dispatch({ type: "CLEAR_CELL", day: day as never, periodId });
          }}
          onClose={() => setPicker(null)}
        />
      )}

      {menu && menu.key.startsWith("day::") && (
        <FloatingCard anchor={menu.anchor} onClose={() => setMenu(null)} width={230}>
          <div className="p-1.5">
            <div className="px-2 py-1.5 text-xs font-bold text-muted">
              خيارات اليوم
            </div>
            <button
              type="button"
              onClick={() => {
                copyDay(menu.key.slice(5));
                setMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-text hover:bg-background"
            >
              <Copy className="h-4 w-4 text-muted" /> نسخ اليوم إلى اليوم الموالي
            </button>
            <button
              type="button"
              onClick={() => {
                clearDay(menu.key.slice(5));
                setMenu(null);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <Eraser className="h-4 w-4" /> مسح هذا اليوم
            </button>
          </div>
        </FloatingCard>
      )}

      {menu && !menu.key.startsWith("day::") && (
        <CellMenu
          anchor={menu.anchor}
          onClose={() => setMenu(null)}
          onOverride={() => {
            setOver(menu);
            setMenu(null);
          }}
          onClear={() => {
            const { day, periodId } = parsed(menu.key);
            dispatch({ type: "CLEAR_CELL", day: day as never, periodId });
            setMenu(null);
          }}
          onCopyToDay={(target) => {
            dispatch({ type: "COPY_CELL", from: menu.key, to: `${target}::${parsed(menu.key).periodId}` });
            setMenu(null);
          }}
          onRepeatAll={() => {
            const { periodId } = parsed(menu.key);
            dispatch({ type: "REPEAT_CELL", from: menu.key, days: dayList.map((d) => d.id) });
            setMenu(null);
          }}
          days={dayList.map((d) => d.id)}
          currentDay={parsed(menu.key).day}
        />
      )}

      {over && (
        <OverrideEditor
          anchor={over.anchor}
          day={parsed(over.key).day}
          periodId={parsed(over.key).periodId}
          onClose={() => setOver(null)}
        />
      )}
    </div>
  );
}

/* ================= قائمة الخانة ================= */

function CellMenu({
  anchor,
  onClose,
  onClear,
  onOverride,
  onCopyToDay,
  onRepeatAll,
  days,
  currentDay,
}: {
  anchor: Anchor;
  onClose: () => void;
  onClear: () => void;
  onOverride: () => void;
  onCopyToDay: (day: string) => void;
  onRepeatAll: () => void;
  days: string[];
  currentDay: string;
}) {
  const [showDays, setShowDays] = useState(false);
  return (
    <FloatingCard anchor={anchor} onClose={onClose} width={250}>
      <div className="p-1.5">
        <button
          type="button"
          onClick={onOverride}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-text hover:bg-background"
        >
          <Clock className="h-4 w-4 text-muted" /> تعديل توقيت هذه الحصة
        </button>
        {!showDays ? (
          <button
            type="button"
            onClick={() => setShowDays(true)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-text hover:bg-background"
          >
            <Copy className="h-4 w-4 text-muted" /> نسخ الخانة إلى يوم…
          </button>
        ) : (
          <div className="rounded-lg border border-border p-2">
            <div className="mb-1 px-1 text-xs font-bold text-muted">إلى أي يوم؟</div>
            <div className="grid grid-cols-2 gap-1">
              {days
                .filter((d) => d !== currentDay)
                .map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onCopyToDay(d)}
                    className="rounded border border-border px-2 py-1.5 text-xs font-semibold hover:bg-background"
                  >
                    {DAYS.find((x) => x.id === d)?.name}
                  </button>
                ))}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onRepeatAll}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-text hover:bg-background"
        >
          <Repeat className="h-4 w-4 text-muted" /> تكرار على كل الأيام
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          <Eraser className="h-4 w-4" /> تفريغ الخانة
        </button>
      </div>
    </FloatingCard>
  );
}

/* ================= محرّر التوقيت الخاص ================= */

function OverrideEditor({
  anchor,
  day,
  periodId,
  onClose,
}: {
  anchor: Anchor;
  day: string;
  periodId: string;
  onClose: () => void;
}) {
  const { state, dispatch } = useTimetable();
  const period = state.periods.find((p) => p.id === periodId);
  const cell = state.grid[day]?.[periodId];
  const [start, setStart] = useState(cell?.override?.start || period?.start || "");
  const [end, setEnd] = useState(cell?.override?.end || period?.end || "");
  const dayName = DAYS.find((d) => d.id === day)?.name;

  return (
    <FloatingCard anchor={anchor} onClose={onClose} width={270}>
      <div className="space-y-3 p-3">
        <div className="text-sm font-extrabold text-text">
          توقيت خاص — {dayName}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-bold text-muted">
            البداية
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs font-bold text-muted">
            النهاية
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-sm"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "SET_CELL_TIME", day: day as never, periodId, start, end });
              onClose();
            }}
            className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            حفظ
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "SET_CELL_TIME", day: day as never, periodId, start: "", end: "" });
              onClose();
            }}
            className="rounded-lg border border-border px-3 py-2 text-sm font-bold text-text hover:bg-background"
          >
            إرجاع للتوقيت العام
          </button>
        </div>
      </div>
    </FloatingCard>
  );
}
