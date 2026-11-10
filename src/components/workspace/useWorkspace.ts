"use client";

/* ============================================================
   طبقة مساحة عمل الأستاذ — قراءة / ترحيل / كتابة (النسخة ١)

   القواعد الصارمة:
   - الترحيل يقرأ المفاتيح القديمة للقراءة فقط (قراءة/نسخ).
   - لا يحذف ولا يعدّل أي مفتاح قديم في localStorage إطلاقًا.
   - يكتب مفتاحًا واحدًا جديدًا فقط: modaris:workspace:v1.
   - readWorkspace يعيد Workspace صالحًا دائمًا ولا يرمي أخطاء أبدًا.
   ============================================================ */

import { useCallback, useEffect, useState } from "react";
import {
  STORAGE_KEY,
  parseImported,
} from "@/components/timetable/store";
import { makeInitialState } from "@/components/timetable/defaults";
import type { TimetableState } from "@/components/timetable/types";
import {
  WORKSPACE_KEY,
  emptyProfile,
  emptyWorkspace,
} from "./types";
import type { Workspace, TeacherProfile } from "./types";

/**
 * مفتاح ملف الأستاذ القديم — قيمته مطابقة للثابت الخاص PROFILE_KEY
 * في src/components/timetable/store.tsx (سطر 41) لكنه غير مُصدَّر من هناك،
 * لذا نُكرر القيمة النصية هنا حرفيًا مع الإبقاء على المفتاح القديم للقراءة فقط.
 */
const LEGACY_PROFILE_KEY = "mp_teacher_profile_v1";

/* شكل ملف الأستاذ القديم كما تكتبه أدوات public/apps (mp-toolkit.js) */
interface LegacyProfile {
  fullName?: string;
  establishment?: string;
  academy?: string;
  direction?: string;
  schoolYear?: string;
}

export interface MigrationResult {
  ok: boolean;
  /** المفاتيح القديمة التي وُجدت في localStorage (للعرض في صفحة التشخيص) */
  legacyKeysFound: string[];
  error?: string;
}

/* قراءة JSON آمنة من localStorage — لا ترمي أبدًا */
function safeRead(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/* هل الكائن Workspace نسخة ١ صالح الشكل بشكل تقريبي؟ */
function isWorkspaceV1(value: unknown): value is Workspace {
  if (!value || typeof value !== "object") return false;
  const ws = value as { version?: unknown; timetable?: unknown; profile?: unknown };
  return ws.version === 1 && !!ws.timetable && !!ws.profile;
}

/* ملف أستاذ موحّد من بيانات جدول الزمن + الملف القديم (الأقدموية للمصدر القديم) */
function buildProfile(tt: TimetableState, legacy: LegacyProfile | null): TeacherProfile {
  const info = tt?.info;
  const from = (legacyValue: string | undefined, infoValue: string | undefined) => {
    const a = (legacyValue || "").trim();
    if (a) return a;
    return (infoValue || "").trim();
  };
  return {
    institution: from(legacy?.establishment, info?.school),
    teacher: from(legacy?.fullName, info?.teacher),
    director: from(legacy?.direction, info?.direction),
    inspector: from("", info?.employeeId),
    academicYear: from(legacy?.schoolYear, info?.year),
  };
}

/* المفاتيح القديمة المعروفة التي يبحث عنها الترحيل */
function findLegacyKeys(): string[] {
  const known = [
    STORAGE_KEY,
    LEGACY_PROFILE_KEY,
    "mp_mind-map",
    "mp_mind-map-phases",
  ];
  const found: string[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && known.includes(k)) found.push(k);
    }
  } catch {
    /* localStorage غير متاح — لا مفاتيح قديمة */
  }
  return found;
}

/**
 * الترحيل: يبني Workspace نسخة ١ من بيانات استعمال الزمن + ملف الأستاذ.
 * يقرأ المفاتيح القديمة للقراءة فقط — لا حذف ولا تعديل لأي مفتاح قديم.
 */
function migrate(): { workspace: Workspace; migration: MigrationResult } {
  const legacyKeysFound = findLegacyKeys();
  try {
    /* ١) جدول الزمن: نص محفوظ → parseImported → TimetableState مُطبَّع */
    const rawTt = safeRead(STORAGE_KEY);
    let timetable: TimetableState | null = null;
    if (rawTt) timetable = parseImported(rawTt);
    if (!timetable) timetable = makeInitialState();

    /* ٢) ملف الأستاذ القديم (قراءة فقط) */
    let legacy: LegacyProfile | null = null;
    const rawProfile = safeRead(LEGACY_PROFILE_KEY);
    if (rawProfile) {
      try {
        const parsed = JSON.parse(rawProfile) as LegacyProfile;
        if (parsed && typeof parsed === "object") legacy = parsed;
      } catch {
        /* ملف تالف — نتجاهله ونكمل من بيانات الجدول */
      }
    }
    const profile: TeacherProfile = buildProfile(timetable, legacy);

    /* ٣) بناء مساحة العمل — weeks وmindMaps وclasses فارغة، والرزمة من سنة الجدول */
    const workspace: Workspace = {
      ...emptyWorkspace(),
      timetable,
      profile,
      calendar: {
        schoolYear: profile.academicYear,
        added: [],
        removed: [],
      },
    };
    return {
      workspace,
      migration: { ok: true, legacyKeysFound },
    };
  } catch (e) {
    /* فشل الترحيل: مساحة عمل فارغة + رسالة، بلا كسر الصفحة وبلا مسّ للمفاتيح القديمة */
    return {
      workspace: { ...emptyWorkspace(), profile: emptyProfile() },
      migration: {
        ok: false,
        legacyKeysFound,
        error: e instanceof Error ? e.message : String(e),
      },
    };
  }
}

/* القراءة: مفتاح جديد موجود وصالح → استعماله مباشرة؛ غير ذلك → ترحيل ثم كتابة */
export function readWorkspace(): { workspace: Workspace; migration: MigrationResult } {
  const raw = safeRead(WORKSPACE_KEY);
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isWorkspaceV1(parsed)) {
        return {
          workspace: parsed,
          migration: { ok: true, legacyKeysFound: findLegacyKeys() },
        };
      }
    } catch {
      /* JSON تالف → ترحيل من جديد */
    }
  }
  const migrated = migrate();
  writeWorkspace(migrated.workspace);
  return migrated;
}

/* الكتابة: مفتاح واحد جديد فقط، داخل try/catch (وضع التصفح الخاص مثلًا) */
export function writeWorkspace(value: Workspace): void {
  try {
    window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(value));
  } catch {
    /* الحفظ ممنوع بيئيًا — الحالة تبقى في الذاكرة لهذه الجلسة */
  }
}

/** مسح مفتاح مساحة العمل فقط — يُستعمل من صفحة التشخيص (لا يلمس أي مفتاح آخر) */
export function clearWorkspaceKey(): void {
  try {
    window.localStorage.removeItem(WORKSPACE_KEY);
  } catch {
    /* تجاهل */
  }
}

export interface UseWorkspaceResult {
  workspace: Workspace;
  update: (mutate: (ws: Workspace) => Workspace) => void;
  reload: () => void;
  migration: MigrationResult;
}

/** Hook مساحة العمل: قراءة أولية + تحديث مُغطّى بالكتابة + إعادة تحميل */
export function useWorkspace(): UseWorkspaceResult {
  const [workspace, setWorkspace] = useState<Workspace>(() => emptyWorkspace());
  const [migration, setMigration] = useState<MigrationResult>({
    ok: false,
    legacyKeysFound: [],
  });

  /* التهيئة بعد التركيب (localStorage غير متاح أثناء التصيير الخادمي) */
  useEffect(() => {
    const { workspace: ws, migration: m } = readWorkspace();
    setWorkspace(ws);
    setMigration(m);
  }, []);

  /* تحديث: يعدّل نسخة في الذاكرة ثم يكتبها في المفتاح الجديد */
  const update = useCallback((mutate: (ws: Workspace) => Workspace) => {
    setWorkspace((current) => {
      const next = mutate({
        ...current,
        updatedAt: new Date().toISOString(),
      });
      writeWorkspace(next);
      return next;
    });
  }, []);

  /* إعادة تحميل من التخزين (مفيد بعد مسح المفتاح من صفحة التشخيص) */
  const reload = useCallback(() => {
    const { workspace: ws, migration: m } = readWorkspace();
    setWorkspace(ws);
    setMigration(m);
  }, []);

  return { workspace, update, reload, migration };
}
