import {
  defaultSettings,
  type Draft,
  type GeneralSettings,
  type Language,
  type LevelId,
  type MemoDoc,
} from './memo';

const SETTINGS_KEY = 'modaris:explicit-teaching:settings:v1';
const DRAFTS_KEY = 'modaris:explicit-teaching:drafts:v1';
const LANGUAGES: Language[] = ['ar', 'fr', 'bilingual'];
const LEVEL_IDS: LevelId[] = ['n1', 'n2'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(source: Record<string, unknown>, key: keyof GeneralSettings, fallback: string): string {
  const value = source[key];
  return typeof value === 'string' ? value : fallback;
}

export function loadSettings(): GeneralSettings {
  const fallback = defaultSettings();
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return fallback;

    const levels = Array.isArray(parsed.levels)
      ? parsed.levels.filter((level): level is LevelId => LEVEL_IDS.includes(level as LevelId))
      : fallback.levels;
    const language = LANGUAGES.includes(parsed.language as Language)
      ? (parsed.language as Language)
      : fallback.language;

    return {
      levels: levels.length > 0 ? levels : fallback.levels,
      language,
      academy: readString(parsed, 'academy', fallback.academy),
      directorate: readString(parsed, 'directorate', fallback.directorate),
      school: readString(parsed, 'school', fallback.school),
      season: readString(parsed, 'season', fallback.season),
      teacher: readString(parsed, 'teacher', fallback.teacher),
      inspector: readString(parsed, 'inspector', fallback.inspector),
      director: readString(parsed, 'director', fallback.director),
      groups: readString(parsed, 'groups', fallback.groups),
    };
  } catch {
    return fallback;
  }
}

export function saveSettings(settings: GeneralSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* التخزين المحلي قد يكون معطلاً — الأداة تبقى قابلة للاستعمال. */
  }
}

function isMemoDoc(value: unknown): value is MemoDoc {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    isRecord(value.settings) &&
    isRecord(value.selection) &&
    isRecord(value.meta) &&
    isRecord(value.fields)
  );
}

function isDraft(value: unknown): value is Draft {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.savedAt === 'string' &&
    isMemoDoc(value.doc)
  );
}

export function loadDrafts(): Draft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DRAFTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isDraft).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } catch {
    return [];
  }
}

export function saveDrafts(drafts: Draft[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts.slice(0, 40)));
  } catch {
    /* المتصفح قد يرفض التخزين عند امتلاء المساحة. */
  }
}

export function draftTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('ar-MA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
