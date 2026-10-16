"use client";

/* ============================================================
   مخزن الحالة — Context + Reducer + سجلّ التعديلات + الحفظ المحلي
   ============================================================ */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import type {
  CellEntry,
  DayId,
  Design,
  Grid,
  Info,
  Orientation,
  Period,
  Subject,
  TimetableState,
} from "./types";
import { makeInitialState, uid } from "./defaults";

const STORAGE_KEY = "mp_timetable_generator_v1";
const PROFILE_KEY = "mp_teacher_profile_v1";
const MAX_HISTORY = 60;

/* ============================ الأحداث ============================ */

export type Action =
  | { type: "LOAD"; state: TimetableState }
  | { type: "SET_INFO"; patch: Partial<Info> }
  | { type: "SET_DESIGN"; patch: Partial<Design> }
  | { type: "SET_SUBJECT"; id: string; patch: Partial<Subject> }
  | { type: "SET_ORIENTATION"; orientation: Orientation }
  | { type: "SET_DAYS"; days: DayId[] }
  | { type: "ADD_PERIOD"; afterId?: string; isBreak?: boolean }
  | { type: "UPDATE_PERIOD"; id: string; patch: Partial<Period> }
  | { type: "REMOVE_PERIOD"; id: string }
  | { type: "MOVE_PERIOD"; id: string; dir: -1 | 1 }
  | { type: "SET_CELL"; day: DayId; periodId: string; subjectId: string | null }
  | { type: "SET_CELL_TIME"; day: DayId; periodId: string; start?: string; end?: string }
  | { type: "CLEAR_CELL"; day: DayId; periodId: string }
  | { type: "CLEAR_DAY"; day: DayId }
  | { type: "CLEAR_ALL" }
  | { type: "COPY_CELL"; from: string; to: string }
  | { type: "COPY_DAY"; from: DayId; to: DayId }
  | { type: "REPEAT_CELL"; from: string; days: DayId[] }
  | { type: "APPLY_PERIOD_SUBJECT"; periodId: string; subjectId: string | null }
  | { type: "RESET_PERIODS" }
  | { type: "UNDO" }
  | { type: "REDO" };

type DayPeriodKey = string; // "dayId::periodId"

function splitKey(key: DayPeriodKey): [string, string] {
  const i = key.indexOf("::");
  return [key.slice(0, i), key.slice(i + 2)];
}

/* ============================ أدوات الشبكة ============================ */

function setCell(
  grid: Grid,
  day: string,
  periodId: string,
  entry: CellEntry | undefined
): Grid {
  const dayRow = { ...(grid[day] || {}) };
  if (entry === undefined) delete dayRow[periodId];
  else dayRow[periodId] = entry;
  return { ...grid, [day]: dayRow };
}

/* ============================ المخفض الأساسي ============================ */

function applyAction(state: TimetableState, action: Action): TimetableState {
  switch (action.type) {
    case "LOAD":
      return action.state;

    case "SET_INFO":
      return { ...state, info: { ...state.info, ...action.patch } };

    case "SET_DESIGN":
      return { ...state, design: { ...state.design, ...action.patch } };

    case "SET_SUBJECT":
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.id ? { ...s, ...action.patch } : s
        ),
      };

    case "SET_ORIENTATION":
      return { ...state, orientation: action.orientation };

    case "SET_DAYS":
      return { ...state, days: action.days };

    case "ADD_PERIOD": {
      const base: Period = {
        id: uid(),
        start: "",
        end: "",
        label: action.isBreak ? "استراحة" : "",
        isBreak: !!action.isBreak,
      };
      const periods = [...state.periods];
      if (action.afterId) {
        const idx = periods.findIndex((p) => p.id === action.afterId);
        periods.splice(idx + 1, 0, base);
      } else {
        periods.push(base);
      }
      return { ...state, periods };
    }

    case "UPDATE_PERIOD":
      return {
        ...state,
        periods: state.periods.map((p) =>
          p.id === action.id ? { ...p, ...action.patch } : p
        ),
      };

    case "REMOVE_PERIOD": {
      const periods = state.periods.filter((p) => p.id !== action.id);
      const grid: Grid = {};
      for (const d of Object.keys(state.grid)) {
        const row = { ...state.grid[d] };
        delete row[action.id];
        grid[d] = row;
      }
      return { ...state, periods, grid };
    }

    case "MOVE_PERIOD": {
      const periods = [...state.periods];
      const idx = periods.findIndex((p) => p.id === action.id);
      const target = idx + action.dir;
      if (idx < 0 || target < 0 || target >= periods.length) return state;
      [periods[idx], periods[target]] = [periods[target], periods[idx]];
      return { ...state, periods };
    }

    case "SET_CELL":
      return {
        ...state,
        grid: setCell(state.grid, action.day, action.periodId, {
          ...(state.grid[action.day]?.[action.periodId] || {}),
          subjectId: action.subjectId,
        }),
      };

    case "SET_CELL_TIME": {
      const current = state.grid[action.day]?.[action.periodId] || {
        subjectId: null,
      };
      const override = {
        ...(current.override || {}),
        ...(action.start !== undefined ? { start: action.start } : {}),
        ...(action.end !== undefined ? { end: action.end } : {}),
      };
      return {
        ...state,
        grid: setCell(state.grid, action.day, action.periodId, {
          ...current,
          override,
        }),
      };
    }

    case "CLEAR_CELL":
      return {
        ...state,
        grid: setCell(state.grid, action.day, action.periodId, undefined),
      };

    case "CLEAR_DAY": {
      const grid = { ...state.grid };
      delete grid[action.day];
      return { ...state, grid };
    }

    case "CLEAR_ALL":
      return { ...state, grid: {} };

    case "COPY_CELL": {
      const [fd, fp] = splitKey(action.from);
      const [, tp] = splitKey(action.to);
      const toDay = splitKey(action.to)[0];
      const entry = state.grid[fd]?.[fp];
      if (!entry) return state;
      return { ...state, grid: setCell(state.grid, toDay, tp, { ...entry }) };
    }

    case "COPY_DAY": {
      const src = state.grid[action.from];
      if (!src) return state;
      const copy: Record<string, CellEntry> = {};
      for (const k of Object.keys(src)) {
        const e = src[k];
        if (e) copy[k] = { ...e, override: e.override ? { ...e.override } : undefined };
      }
      return { ...state, grid: { ...state.grid, [action.to]: copy } };
    }

    case "REPEAT_CELL": {
      const [fd, fp] = splitKey(action.from);
      const entry = state.grid[fd]?.[fp];
      if (!entry) return state;
      let grid = state.grid;
      for (const d of action.days) {
        grid = setCell(grid, d, fp, { ...entry });
      }
      return { ...state, grid };
    }

    case "APPLY_PERIOD_SUBJECT": {
      let grid = state.grid;
      for (const d of state.days) {
        const current = grid[d]?.[action.periodId] || { subjectId: null };
        grid = setCell(grid, d, action.periodId, {
          ...current,
          subjectId: action.subjectId,
        });
      }
      return { ...state, grid };
    }

    case "RESET_PERIODS":
      return {
        ...state,
        periods: [
          { id: uid(), start: "08:00", end: "09:00", label: "", isBreak: false },
          { id: uid(), start: "09:00", end: "10:00", label: "", isBreak: false },
          { id: uid(), start: "10:00", end: "10:15", label: "استراحة", isBreak: true },
          { id: uid(), start: "10:15", end: "11:15", label: "", isBreak: false },
          { id: uid(), start: "11:15", end: "12:15", label: "", isBreak: false },
        ],
      };

    default:
      return state;
  }
}

/* ============================ الغلاف (سجلّ) ============================ */

interface Envelope {
  past: TimetableState[];
  present: TimetableState;
  future: TimetableState[];
}

const NO_HISTORY: Action["type"][] = ["LOAD", "UNDO", "REDO"];

function envelopeReducer(env: Envelope, action: Action): Envelope {
  if (action.type === "UNDO") {
    if (env.past.length === 0) return env;
    const prev = env.past[env.past.length - 1];
    return {
      past: env.past.slice(0, -1),
      present: prev,
      future: [env.present, ...env.future].slice(0, MAX_HISTORY),
    };
  }
  if (action.type === "REDO") {
    if (env.future.length === 0) return env;
    const next = env.future[0];
    return {
      past: [...env.past, env.present].slice(-MAX_HISTORY),
      present: next,
      future: env.future.slice(1),
    };
  }

  const next = applyAction(env.present, action);
  if (next === env.present) return env;
  if (NO_HISTORY.includes(action.type)) {
    return { past: [], present: next, future: [] };
  }
  return {
    past: [...env.past, env.present].slice(-MAX_HISTORY),
    present: next,
    future: [],
  };
}

/* ============================ التخزين ============================ */

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** التحقق من بنية الحالة المستوردة */
export function isValidState(v: unknown): v is TimetableState {
  if (!v || typeof v !== "object") return false;
  const s = v as Partial<TimetableState>;
  return (
    typeof s.info === "object" &&
    Array.isArray(s.days) &&
    Array.isArray(s.periods) &&
    Array.isArray(s.subjects) &&
    typeof s.design === "object" &&
    typeof s.grid === "object"
  );
}

function loadInitial(): TimetableState {
  const base = makeInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = safeParse(raw);
    if (isValidState(parsed)) {
      // دمج مع الافتراضيات لتفادي الحقول الناقصة
      return {
        ...base,
        ...parsed,
        info: { ...base.info, ...parsed.info },
        design: { ...base.design, ...parsed.design },
        subjects: parsed.subjects.length ? parsed.subjects : base.subjects,
      };
    }
  } catch {
    /* تجاهل */
  }
  // تعبئة من الملف المشترك للأستاذ إن وُجد
  try {
    const prof = safeParse(localStorage.getItem(PROFILE_KEY)) as
      | Record<string, string>
      | null;
    if (prof) {
      base.info = {
        ...base.info,
        academy: prof.academy || "",
        direction: prof.direction || "",
        school: prof.establishment || "",
        teacher: prof.fullName || "",
        level: prof.level || "",
        year: prof.schoolYear || base.info.year,
      };
    }
  } catch {
    /* تجاهل */
  }
  return base;
}

export function serializeState(state: TimetableState): string {
  return JSON.stringify({ app: "modaris-timetable", version: 1, state }, null, 2);
}

export function parseImported(text: string): TimetableState | null {
  const v = safeParse(text) as { state?: unknown } | null;
  if (v && isValidState((v as { state?: unknown }).state)) {
    return (v as { state: TimetableState }).state;
  }
  if (isValidState(v)) return v as TimetableState;
  return null;
}

/* ============================ السياق ============================ */

interface Ctx {
  state: TimetableState;
  dispatch: React.Dispatch<Action>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetAll: () => void;
  clearStorage: () => void;
  hydrated: boolean;
}

const TimetableContext = createContext<Ctx | null>(null);

export function TimetableProvider({ children }: { children: React.ReactNode }) {
  const [env, dispatch] = useReducer(envelopeReducer, undefined, () => ({
    past: [],
    present: makeInitialState(),
    future: [],
  }));
  const hydratedRef = useRef(false);
  const [hydrated, setHydrated] = React.useState(false);
  const saveTimer = useRef<number | null>(null);

  // تحميل الحالة المحفوظة
  useEffect(() => {
    const loaded = loadInitial();
    dispatch({ type: "LOAD", state: loaded });
    hydratedRef.current = true;
    setHydrated(true);
  }, []);

  // حفظ تلقائي (مُخمَّد)
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(env.present));
      } catch {
        /* تجاهل */
      }
    }, 350);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [env.present]);

  const value = useMemo<Ctx>(
    () => ({
      state: env.present,
      dispatch,
      undo: () => dispatch({ type: "UNDO" }),
      redo: () => dispatch({ type: "REDO" }),
      canUndo: env.past.length > 0,
      canRedo: env.future.length > 0,
      resetAll: () => {
        dispatch({ type: "LOAD", state: makeInitialState() });
      },
      clearStorage: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* تجاهل */
        }
      },
      hydrated,
    }),
    [env, hydrated]
  );

  return (
    <TimetableContext.Provider value={value}>
      {children}
    </TimetableContext.Provider>
  );
}

export function useTimetable(): Ctx {
  const ctx = useContext(TimetableContext);
  if (!ctx) throw new Error("useTimetable must be used within TimetableProvider");
  return ctx;
}

/** مفتاح خلية */
export function cellKey(day: string, periodId: string): string {
  return `${day}::${periodId}`;
}
