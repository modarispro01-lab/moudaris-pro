"use client";

/* ============================================================
   مخزن الحالة — Context + Reducer + سجلّ التعديلات + الحفظ المحلي

   المبدأ: لكل يوم plans[day] مستقل تمامًا (توقيت + مواد).
   ما يُبرمجه الأستاذ في الاثنين لا يؤثر إطلاقًا على الثلاثاء.
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
  DayId,
  Design,
  Info,
  LevelEntry,
  Orientation,
  Period,
  Subject,
  TimetableState,
} from "./types";
import {
  DEFAULT_INFO,
  defaultPeriods,
  emptyPlans,
  makeInitialState,
  uid,
} from "./defaults";

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
  /* ===== يوم واحد ===== */
  | { type: "ADD_PERIOD"; day: DayId; isBreak?: boolean; afterId?: string }
  | { type: "UPDATE_PERIOD"; day: DayId; id: string; patch: Partial<Period> }
  | { type: "REMOVE_PERIOD"; day: DayId; id: string }
  | { type: "MOVE_PERIOD"; day: DayId; id: string; dir: -1 | 1 }
  | { type: "CLEAR_DAY"; day: DayId }
  | { type: "SEED_DAY"; day: DayId }
  /* ===== نسخ بين الأيام ===== */
  | { type: "COPY_DAY"; from: DayId; to: DayId } // توقيت + مواد
  | { type: "COPY_TIMES"; from: DayId; to: DayId } // توقيت فقط (مواد فارغة)
  | { type: "APPLY_DAY_TO_ALL"; day: DayId }
  | { type: "RESET_ALL_PERIODS" }
  | { type: "UNDO" }
  | { type: "REDO" };

/* ============================ أدوات ============================ */

function clonePeriods(list: Period[], keepSubjects: boolean): Period[] {
  return list.map((p) => ({
    ...p,
    id: uid(),
    subjectId: keepSubjects ? p.subjectId : null,
  }));
}

function withPeriods(
  state: TimetableState,
  day: DayId,
  fn: (list: Period[]) => Period[]
): TimetableState {
  const current = state.plans?.[day] ?? [];
  return { ...state, plans: { ...state.plans, [day]: fn(current) } };
}

/** "HH:MM" + دقائق -> "HH:MM" */
function addMinutes(time: string, mins: number): string {
  const [h, m] = (time || "00:00").split(":").map(Number);
  const t = Math.max(0, (h || 0) * 60 + (m || 0) + mins);
  const hh = Math.floor(t / 60) % 24;
  const mm = t % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** توقيت مقترح للحصة التالية = نهاية آخر حصة + 5 د */
function suggestNextSlot(list: Period[]): { start: string; end: string } {
  const ends = list
    .map((p) => p.end)
    .filter(Boolean)
    .sort();
  const last = ends[ends.length - 1];
  if (!last) return { start: "08:00", end: "09:00" };
  const start = addMinutes(last, 5);
  return { start, end: addMinutes(start, 60) };
}

/* ============================ المخفض ============================ */

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

    case "SET_DAYS": {
      // نحافظ على جداول الأيام الموجودة حتى لو أُزيل اليوم مؤقتًا
      return { ...state, days: action.days, plans: { ...emptyPlans(), ...state.plans } };
    }

    case "ADD_PERIOD": {
      const list = state.plans?.[action.day] ?? [];
      const slot = suggestNextSlot(list);
      const base: Period = action.isBreak
        ? {
            id: uid(),
            start: slot.start,
            end: addMinutes(slot.start, 15),
            label: "استراحة",
            isBreak: true,
            subjectId: null,
          }
        : {
            id: uid(),
            start: slot.start,
            end: slot.end,
            label: "",
            isBreak: false,
            subjectId: null,
          };
      const next = [...list];
      if (action.afterId) {
        const idx = next.findIndex((p) => p.id === action.afterId);
        next.splice(idx + 1, 0, base);
      } else {
        next.push(base);
      }
      return withPeriods(state, action.day, () => next);
    }

    case "UPDATE_PERIOD":
      return withPeriods(state, action.day, (list) =>
        list.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p))
      );

    case "REMOVE_PERIOD":
      return withPeriods(state, action.day, (list) =>
        list.filter((p) => p.id !== action.id)
      );

    case "MOVE_PERIOD":
      return withPeriods(state, action.day, (list) => {
        const i = list.findIndex((p) => p.id === action.id);
        const j = i + action.dir;
        if (i < 0 || j < 0 || j >= list.length) return list;
        const next = [...list];
        [next[i], next[j]] = [next[j], next[i]];
        return next;
      });

    case "CLEAR_DAY":
      return withPeriods(state, action.day, () => []);

    case "SEED_DAY":
      return withPeriods(state, action.day, (list) =>
        list.length ? list : defaultPeriods()
      );

    case "COPY_DAY": {
      const src = state.plans?.[action.from] ?? [];
      if (!src.length) return state;
      return withPeriods(state, action.to, () => clonePeriods(src, true));
    }

    case "COPY_TIMES": {
      const src = state.plans?.[action.from] ?? [];
      if (!src.length) return state;
      return withPeriods(state, action.to, () => clonePeriods(src, false));
    }

    case "APPLY_DAY_TO_ALL": {
      const src = state.plans?.[action.day] ?? [];
      if (!src.length) return state;
      const plans = { ...state.plans };
      for (const d of state.days) {
        if (d === action.day) continue;
        plans[d] = clonePeriods(src, d === action.day ? true : false);
      }
      return { ...state, plans };
    }

    case "RESET_ALL_PERIODS":
      return {
        ...state,
        plans: { ...emptyPlans(), ...Object.fromEntries(state.days.map((d) => [d, defaultPeriods()])) },
      };

    default:
      return state;
  }
}

/* ============================ السجلّ ============================ */

interface Env {
  past: TimetableState[];
  present: TimetableState;
  future: TimetableState[];
}

const NO_HISTORY: Action["type"][] = ["LOAD"];

function envelopeReducer(env: Env, action: Action): Env {
  if (action.type === "UNDO") {
    if (!env.past.length) return env;
    const prev = env.past[env.past.length - 1];
    return {
      past: env.past.slice(0, -1),
      present: prev,
      future: [env.present, ...env.future].slice(0, MAX_HISTORY),
    };
  }
  if (action.type === "REDO") {
    if (!env.future.length) return env;
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

type RawInfo = Partial<Info> & { level?: string; section?: string };

/** توحيد بنية المعلومات + ترحيل المشاريع القديمة */
export function normalizeInfo(raw: RawInfo | undefined | null): Info {
  const base: Info = { ...DEFAULT_INFO };
  if (!raw || typeof raw !== "object") return base;

  const legacyLevel = typeof raw.level === "string" ? raw.level.trim() : "";
  const legacySection = typeof raw.section === "string" ? raw.section.trim() : "";

  let levels: LevelEntry[] = [];
  if (Array.isArray(raw.levels)) {
    levels = raw.levels
      .filter((l): l is LevelEntry => !!l && typeof l === "object")
      .map((l) => ({
        id: l.id || uid(),
        name: typeof l.name === "string" ? l.name : "",
        groups: Array.isArray(l.groups)
          ? l.groups.filter((g): g is string => typeof g === "string")
          : [],
      }));
  }
  if (!levels.length && (legacyLevel || legacySection)) {
    levels = [{ id: uid(), name: legacyLevel, groups: legacySection ? [legacySection] : [] }];
  }

  return { ...base, ...raw, levels };
}

/* ---------- ترقية الصيغة القديمة: periods + grid  ->  plans ---------- */

interface LegacyPeriod {
  id: string;
  start: string;
  end: string;
  label?: string;
  isBreak?: boolean;
}

interface LegacyState {
  info?: RawInfo;
  days?: DayId[];
  periods?: LegacyPeriod[];
  grid?: Record<string, Record<string, { subjectId?: string | null; override?: { start?: string; end?: string }; note?: string } | undefined>>;
  subjects?: Subject[];
  design?: Partial<Design>;
  orientation?: Orientation;
}

function upgradePlans(legacy: LegacyState): Record<string, Period[]> {
  const plans: Record<string, Period[]> = { ...emptyPlans() };
  const basePeriods = legacy.periods ?? [];
  for (const day of legacy.days ?? []) {
    plans[day] = basePeriods.map((p) => {
      const cell = legacy.grid?.[day]?.[p.id];
      return {
        id: uid(),
        start: cell?.override?.start || p.start || "",
        end: cell?.override?.end || p.end || "",
        label: p.label ?? "",
        isBreak: !!p.isBreak,
        subjectId: cell?.subjectId ?? null,
        note: cell?.note,
      };
    });
  }
  return plans;
}

function normalizeState(v: unknown): TimetableState | null {
  if (!v || typeof v !== "object") return null;
  const s = v as LegacyState & Partial<TimetableState>;
  if (typeof s.info !== "object") return null;
  if (!Array.isArray(s.days) || !Array.isArray(s.subjects)) return null;
  if (typeof s.design !== "object") return null;

  const base = makeInitialState();

  // صيغة جديدة (plans) أم قديمة (periods + grid)؟
  const isNew =
    !!s.plans && typeof s.plans === "object" && !Array.isArray(s.periods);
  const plans = isNew
    ? { ...emptyPlans(), ...(s.plans as Record<string, Period[]>) }
    : upgradePlans(s);

  return {
    info: normalizeInfo(s.info),
    days: s.days,
    plans,
    subjects: s.subjects.length ? s.subjects : base.subjects,
    design: { ...base.design, ...s.design },
    orientation: s.orientation === "portrait" ? "portrait" : "landscape",
  };
}

/* ============================ التحميل ============================ */

function loadInitial(): TimetableState {
  const base = makeInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const normalized = normalizeState(safeParse(raw));
    if (normalized) return normalized;
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
        year: prof.schoolYear || base.info.year,
        levels: prof.level ? [{ id: uid(), name: prof.level, groups: [] }] : base.info.levels,
      };
    }
  } catch {
    /* تجاهل */
  }
  return base;
}

/* ============================ التصدير ============================ */

export function serializeState(state: TimetableState): string {
  return JSON.stringify({ app: "modaris-timetable", version: 2, state }, null, 2);
}

export function parseImported(text: string): TimetableState | null {
  const v = safeParse(text) as { state?: unknown } | null;
  if (v && typeof v === "object" && "state" in v) {
    return normalizeState((v as { state: unknown }).state);
  }
  return normalizeState(v);
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

  useEffect(() => {
    dispatch({ type: "LOAD", state: loadInitial() });
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
      resetAll: () => dispatch({ type: "LOAD", state: makeInitialState() }),
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
    <TimetableContext.Provider value={value}>{children}</TimetableContext.Provider>
  );
}

export function useTimetable(): Ctx {
  const ctx = useContext(TimetableContext);
  if (!ctx) throw new Error("useTimetable must be used inside <TimetableProvider>");
  return ctx;
}