'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Calculator,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Clock,
  FileText,
  FlaskConical,
  FolderOpen,
  Globe2,
  GraduationCap,
  Info,
  Languages,
  Layers,
  Moon,
  NotebookPen,
  PencilRuler,
  Printer,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import MemoPreview from './MemoPreview';
import {
  DAYS,
  LEVELS,
  LEVEL_OPTIONS,
  SUBJECT,
  VARIANT_LABELS,
  WEEK_KIND_LABELS,
  WEEK_LABELS,
  buildMemo,
  countLessons,
  getEtape,
  getNiveau,
  languageLabel,
  lessonForChoice,
  levelLabel,
  variantForChoice,
  type DayNumber,
  type Draft,
  type GeneralSettings,
  type Language,
  type LevelId,
  type LocalizedText,
  type MemoDoc,
  type MemoFields,
  type PartialSelection,
  type Selection,
} from '../lib/memo';
import { draftTimestamp, loadDrafts, loadSettings, saveDrafts, saveSettings } from '../lib/storage';

/* ------------------------------------------------------------------ */
/*  ثوابت الواجهة                                                      */
/* ------------------------------------------------------------------ */

type Screen = 'settings' | 'wizard' | 'result';
type WizardStep = 'subject' | 'level' | 'stage' | 'week' | 'day';
type WizardChoice = PartialSelection & { subject?: 'math' };
type Notice = { tone: 'success' | 'info' | 'warning'; text: string };
type HeaderKey = 'academy' | 'directorate' | 'school' | 'season' | 'teacher' | 'inspector' | 'director' | 'groups';
type LocalizedKey =
  | 'objective'
  | 'competency'
  | 'prerequisites'
  | 'materials'
  | 'assessment'
  | 'remediation'
  | 'homework'
  | 'notes';

const STEPS: Array<{ key: WizardStep; label: string }> = [
  { key: 'subject', label: 'المادة' },
  { key: 'level', label: 'المستوى' },
  { key: 'stage', label: 'المرحلة' },
  { key: 'week', label: 'الأسبوع' },
  { key: 'day', label: 'اليوم' },
];

const HEADER_INPUTS: Array<{
  key: HeaderKey;
  label: string;
  placeholder: string;
  full?: boolean;
}> = [
  { key: 'academy', label: 'الأكاديمية الجهوية للتربية والتكوين', placeholder: 'مثال: أكاديمية جهة الرباط سلا القنيطرة' },
  { key: 'directorate', label: 'المديرية الإقليمية', placeholder: 'مثال: المديرية الإقليمية بالرباط' },
  { key: 'school', label: 'المؤسسة', placeholder: 'مثال: المدرسة الرائدة', full: true },
  { key: 'season', label: 'الموسم الدراسي', placeholder: '2026/2027' },
  { key: 'teacher', label: 'اسم الأستاذ(ة)', placeholder: 'الاسم الكامل' },
  { key: 'inspector', label: 'اسم المفتش(ة)', placeholder: 'الاسم الكامل' },
  { key: 'director', label: 'اسم المدير(ة)', placeholder: 'الاسم الكامل' },
  { key: 'groups', label: 'الأفواج', placeholder: 'مثال: الفوج أ — الفوج ب', full: true },
];

const LANGUAGE_OPTIONS: Array<{ value: Language; ar: string; fr: string; hint: string }> = [
  { value: 'ar', ar: 'العربية', fr: 'Arabe', hint: 'مذكرة عربية كاملة باتجاه RTL.' },
  { value: 'fr', ar: 'الفرنسية', fr: 'Français', hint: 'مذكرة فرنسية LTR مع العنوان الرسمي.' },
  { value: 'bilingual', ar: 'مشترك', fr: 'Bilingue', hint: 'العربية والفرنسية في نفس الوثيقة.' },
];

const FUTURE_SUBJECTS: Array<{ ar: string; fr: string; icon: LucideIcon }> = [
  { ar: 'النشاط العلمي', fr: 'Activités scientifiques', icon: FlaskConical },
  { ar: 'اللغة العربية', fr: 'Langue arabe', icon: BookOpen },
  { ar: 'اللغة الفرنسية', fr: 'Langue française', icon: Languages },
  { ar: 'التربية الإسلامية', fr: 'Éducation islamique', icon: Moon },
  { ar: 'الاجتماعيات', fr: 'Sciences sociales', icon: Globe2 },
];

const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-40';

const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-extrabold text-text transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40';

const inputClass =
  'w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-text outline-none transition placeholder:font-normal placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/15';

const textareaClass =
  'w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-xs leading-6 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';

const subscribeToNothing = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/* ------------------------------------------------------------------ */
/*  مكوّنات صغيرة                                                       */
/* ------------------------------------------------------------------ */

function NoticeBar({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  const tone =
    notice.tone === 'success'
      ? 'border-secondary/40 bg-secondary/5 text-secondary'
      : notice.tone === 'warning'
        ? 'border-accent/50 bg-accent/10 text-text'
        : 'border-border bg-surface text-text';

  return (
    <div role="status" aria-live="polite" className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-xs font-bold leading-6 ${tone}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{notice.text}</p>
      <button type="button" onClick={onClose} aria-label="إغلاق التنبيه" className="rounded-lg p-1 hover:bg-background">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ChoiceCard({
  active,
  disabled,
  onClick,
  children,
  className = '',
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`relative rounded-2xl border p-4 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
        active
          ? 'border-primary bg-primary/[0.04] ring-2 ring-primary/15'
          : 'border-border bg-surface hover:border-primary/40 hover:bg-background'
      } ${disabled ? 'cursor-not-allowed opacity-55' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({ children, tone = 'muted' }: { children: ReactNode; tone?: 'primary' | 'secondary' | 'muted' }) {
  const styles =
    tone === 'primary'
      ? 'bg-primary/10 text-primary'
      : tone === 'secondary'
        ? 'bg-secondary/10 text-secondary'
        : 'bg-background text-muted';
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${styles}`}>{children}</span>;
}

function EditorField({
  label,
  value,
  onChange,
  rows = 2,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  type?: 'text' | 'number';
}) {
  if (type === 'number') {
    return (
      <label className="block">
        <span className="mb-1 block text-[10.5px] font-extrabold text-muted">{label}</span>
        <input
          type="number"
          min={1}
          max={240}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      </label>
    );
  }
  return (
    <label className="block">
      <span className="mb-1 block text-[10.5px] font-extrabold text-muted">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={textareaClass}
      />
    </label>
  );
}

function LocalizedEditor({
  label,
  value,
  showFrench,
  onChange,
  rows = 3,
}: {
  label: string;
  value: LocalizedText;
  showFrench: boolean;
  onChange: (lang: keyof LocalizedText, value: string) => void;
  rows?: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <p className="mb-2 text-[10.5px] font-extrabold text-text">{label}</p>
      <div className={showFrench ? 'grid gap-2 sm:grid-cols-2' : ''}>
        <label className="block">
          <span className="mb-1 block text-[9px] font-bold text-muted">العربية</span>
          <textarea
            rows={rows}
            dir="rtl"
            value={value.ar}
            onChange={(event) => onChange('ar', event.target.value)}
            className={textareaClass}
          />
        </label>
        {showFrench ? (
          <label className="block">
            <span className="mb-1 block text-[9px] font-bold text-muted">Français</span>
            <textarea
              rows={rows}
              dir="ltr"
              value={value.fr}
              onChange={(event) => onChange('fr', event.target.value)}
              className={`${textareaClass} text-left`}
            />
          </label>
        ) : null}
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div>
          <h2 className="text-base font-extrabold text-text">{title}</h2>
          {hint ? <p className="mt-0.5 text-xs leading-5 text-muted">{hint}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  المكوّن الرئيسي                                                     */
/* ------------------------------------------------------------------ */

export default function ExplicitTeachingWorkspace() {
  const [screen, setScreen] = useState<Screen>('settings');
  const [step, setStep] = useState<WizardStep>('subject');
  const [settings, setSettings] = useState<GeneralSettings>(() => loadSettings());
  const [choice, setChoice] = useState<WizardChoice>({});
  const [memo, setMemo] = useState<MemoDoc | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>(() => loadDrafts());
  const [notice, setNotice] = useState<Notice | null>(null);
  const [afterSettings, setAfterSettings] = useState<Screen>('wizard');
  const isClient = useSyncExternalStore(subscribeToNothing, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [screen, step]);

  const levelChoices = useMemo(() => LEVELS.filter((level) => settings.levels.includes(level.id)), [settings.levels]);

  const selection = useMemo<Selection | null>(() => {
    if (!choice.levelId || !choice.etape || !choice.week || !choice.day) return null;
    return { levelId: choice.levelId, etape: choice.etape, week: choice.week, day: choice.day };
  }, [choice]);

  if (!isClient) {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <div className="h-60 bg-primary" />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-7 w-56 rounded-lg bg-surface" />
          <div className="mt-3 h-4 w-80 max-w-full rounded bg-surface" />
          <div className="mt-6 h-56 rounded-2xl border border-border bg-surface" />
          <div className="mt-4 h-56 rounded-2xl border border-border bg-surface" />
        </div>
      </div>
    );
  }

  const activeLevel = choice.levelId ? getNiveau(choice.levelId) : null;
  const activeEtape = choice.levelId && choice.etape ? getEtape(choice.levelId, choice.etape) : null;
  const currentStepIndex = STEPS.findIndex((item) => item.key === step);
  const showFrench = settings.language !== 'ar';

  /* ------------------------- الإعدادات ------------------------- */

  function toggleLevel(id: LevelId) {
    setSettings((previous) => {
      const exists = previous.levels.includes(id);
      return {
        ...previous,
        levels: exists ? previous.levels.filter((level) => level !== id) : [...previous.levels, id],
      };
    });
  }

  function applySettings() {
    saveSettings(settings);
    setMemo((previous) => (previous ? { ...previous, settings } : previous));
    if (choice.levelId && !settings.levels.includes(choice.levelId)) {
      setChoice({ subject: 'math' });
      setStep('level');
    }
    setNotice({
      tone: 'success',
      text: 'تم حفظ الإعدادات على هذا الجهاز. ستُستعاد تلقائياً في زيارتك القادمة.',
    });
    setScreen(afterSettings === 'result' && memo ? 'result' : 'wizard');
    setAfterSettings('wizard');
  }

  function openSettings(from: Screen) {
    setAfterSettings(from);
    setScreen('settings');
    setNotice(null);
  }

  /* ------------------------- المعالج --------------------------- */

  function selectSubject() {
    setChoice({ subject: 'math' });
  }

  function selectLevel(levelId: LevelId) {
    setChoice((previous) => ({ subject: previous.subject ?? 'math', levelId }));
  }

  function selectEtape(etape: Selection['etape']) {
    setChoice((previous) => ({ ...previous, etape }));
  }

  function selectWeek(week: Selection['week']) {
    setChoice((previous) => ({ ...previous, week }));
  }

  function selectDay(day: DayNumber) {
    setChoice((previous) => ({ ...previous, day }));
  }

  function canOpenStep(index: number): boolean {
    if (index === 0) return true;
    if (index === 1) return choice.subject === 'math';
    if (index === 2) return Boolean(choice.levelId);
    if (index === 3) return Boolean(choice.etape);
    return Boolean(choice.week);
  }

  function canContinue(): boolean {
    if (step === 'subject') return choice.subject === 'math';
    if (step === 'level') return Boolean(choice.levelId);
    if (step === 'stage') return Boolean(choice.etape);
    if (step === 'week') return Boolean(choice.week);
    return Boolean(choice.day);
  }

  function nextStep() {
    const index = currentStepIndex;
    if (index < STEPS.length - 1 && canContinue()) setStep(STEPS[index + 1].key);
  }

  function previousStep() {
    const index = currentStepIndex;
    if (index > 0) setStep(STEPS[index - 1].key);
  }

  function generateMemo() {
    if (!selection) {
      setNotice({ tone: 'warning', text: 'أكمل اختيار المستوى والمرحلة والأسبوع واليوم أولاً.' });
      return;
    }
    const built = buildMemo(settings, selection);
    if (!built) {
      setNotice({ tone: 'warning', text: 'تعذر العثور على بيانات هذه الحصة. أعد اختيار المرحلة والأسبوع.' });
      return;
    }
    setMemo(built);
    setDraftId(null);
    setScreen('result');
    setNotice(null);
  }

  function backToWizard() {
    setScreen('wizard');
    setStep(
      choice.day
        ? 'day'
        : choice.week
          ? 'day'
          : choice.etape
            ? 'week'
            : choice.levelId
              ? 'stage'
              : choice.subject
                ? 'level'
                : 'subject',
    );
    setNotice(null);
  }

  function startNew() {
    setMemo(null);
    setDraftId(null);
    setChoice({ subject: 'math' });
    setStep('level');
    setScreen('wizard');
    setNotice(null);
  }

  /* ------------------------- التحرير --------------------------- */

  function updateField<K extends keyof MemoFields>(key: K, value: MemoFields[K]) {
    setMemo((previous) => (previous ? { ...previous, fields: { ...previous.fields, [key]: value } } : previous));
  }

  function updateLocalized(key: LocalizedKey, lang: keyof LocalizedText, value: string) {
    setMemo((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        fields: {
          ...previous.fields,
          [key]: { ...previous.fields[key], [lang]: value },
        },
      };
    });
  }

  function updatePhaseText(index: number, lang: keyof LocalizedText, value: string) {
    setMemo((previous) => {
      if (!previous) return previous;
      const phases = previous.fields.phases.map((phase, phaseIndex) =>
        phaseIndex === index ? { ...phase, text: { ...phase.text, [lang]: value } } : phase,
      );
      return { ...previous, fields: { ...previous.fields, phases } };
    });
  }

  function updatePhaseMinutes(index: number, value: string) {
    const minutes = Math.max(1, Math.min(240, Number(value) || 1));
    setMemo((previous) => {
      if (!previous) return previous;
      const phases = previous.fields.phases.map((phase, phaseIndex) =>
        phaseIndex === index ? { ...phase, minutes } : phase,
      );
      return { ...previous, fields: { ...previous.fields, phases } };
    });
  }

  /* ------------------------- المسودات -------------------------- */

  function saveDraft() {
    if (!memo) return;
    const savedAt = new Date().toISOString();
    const id = draftId ?? memo.id;
    const saved: MemoDoc = { ...memo, id, savedAt, title: memo.title };
    const record: Draft = { id, title: memo.title, savedAt, doc: saved };
    const next = [record, ...drafts.filter((draft) => draft.id !== id)].slice(0, 40);
    setMemo(saved);
    setDraftId(id);
    setDrafts(next);
    saveDrafts(next);
    setNotice({ tone: 'success', text: 'تم حفظ المسودة على هذا الجهاز. افتحها لاحقاً من الشاشة الأولى.' });
  }

  function openDraft(draft: Draft) {
    setMemo(draft.doc);
    setDraftId(draft.id);
    setSettings(draft.doc.settings);
    setChoice({ ...draft.doc.selection, subject: 'math' });
    setScreen('result');
    setNotice(null);
  }

  function removeDraft(id: string) {
    if (typeof window !== 'undefined' && !window.confirm('هل تريد حذف هذه المسودة نهائياً من هذا الجهاز؟')) return;
    const next = drafts.filter((draft) => draft.id !== id);
    setDrafts(next);
    saveDrafts(next);
    if (draftId === id) {
      setMemo(null);
      setDraftId(null);
      setScreen('settings');
    }
    setNotice({ tone: 'info', text: 'تم حذف المسودة.' });
  }

  function printMemo() {
    if (!memo) return;
    window.print();
  }

  /* ------------------------- العرض ----------------------------- */

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      {screen !== 'result' ? (
        <section className="relative overflow-hidden bg-primary text-white">
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/30 px-3 py-1 text-[11px] font-extrabold ring-1 ring-white/20">
                <Sparkles className="h-3.5 w-3.5" /> التعليم الصريح
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold ring-1 ring-white/20">
                الرياضيات · المستويان الأول والثاني
              </span>
            </div>
            <h1 className="mt-4 max-w-3xl text-2xl font-extrabold leading-tight sm:text-4xl">
              المذكرة اليومية الاحترافية — التعليم الصريح
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85 sm:text-base">
              ولّد مذكرة يومية كاملة وفق مراحل التعليم الصريح الخمس، انطلاقاً من التوازيع المرحلية
              الرسمية للمدرسة الرائدة. اختر المستوى والمرحلة والأسبوع واليوم، ثم عدّل واطبع بصيغة A4.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold">
              {[
                'التوازيع المرحلية الرسمية',
                'عربية · فرنسية · مشترك',
                'طباعة A4 جاهزة',
                'إعداداتك تُحفظ على جهازك',
              ].map((label) => (
                <span key={label} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 ring-1 ring-white/15">
                  <Check className="h-3 w-3" /> {label}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {screen === 'settings' ? (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold text-secondary">الخطوة الأولى</p>
              <h2 className="mt-1 text-xl font-extrabold text-text sm:text-2xl">الإعدادات العامة</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                هذه المعطيات تُستعمل في ترويسة كل مذكرة. تُحفظ محلياً في متصفحك ولا تُرسل إلى أي خادم.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/5 px-3 py-1 text-[11px] font-extrabold text-secondary">
              <CheckCircle2 className="h-3.5 w-3.5" /> تُحفظ تلقائياً
            </span>
          </div>

          {notice ? (
            <div className="mt-5">
              <NoticeBar notice={notice} onClose={() => setNotice(null)} />
            </div>
          ) : null}

          <div className="mt-6 space-y-5">
            <SectionCard
              icon={GraduationCap}
              title="المستويات المُدرَّسة"
              hint="حدّد المستويات التي تُدرّسها. يمكن اختيار أكثر من مستوى واحد (قسم متعدد المستويات)."
            >
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {LEVEL_OPTIONS.map((level) => {
                  const checked = settings.levels.includes(level.id as LevelId);
                  const disabled = !level.supported;
                  return (
                    <label
                      key={level.id}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 transition ${
                        disabled
                          ? 'cursor-not-allowed border-border bg-background/60 opacity-70'
                          : checked
                            ? 'cursor-pointer border-primary bg-primary/[0.04]'
                            : 'cursor-pointer border-border bg-surface hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-primary"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleLevel(level.id as LevelId)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-extrabold text-text">{level.ar}</span>
                          <span dir="ltr" className="text-[10px] font-bold text-muted">{level.fr}</span>
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted">
                          {disabled ? 'التوازيع الرسمية غير متوفرة بعد' : 'الرياضيات · 5 مراحل'}
                        </span>
                      </span>
                      {disabled ? <Badge tone="muted">قريباً</Badge> : null}
                    </label>
                  );
                })}
              </div>
              {settings.levels.length === 0 ? (
                <p className="mt-3 rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-xs font-bold text-text">
                  اختر مستوى واحداً على الأقل للمتابعة.
                </p>
              ) : null}
            </SectionCard>

            <SectionCard
              icon={Languages}
              title="لغة المذكرة"
              hint="الواجهة تبقى بالعربية. هذا الاختيار يحدد لغة الوثيقة المطبوعة فقط."
            >
              <div className="grid gap-2.5 sm:grid-cols-3">
                {LANGUAGE_OPTIONS.map((option) => {
                  const active = settings.language === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                        active ? 'border-primary bg-primary/[0.04]' : 'border-border bg-surface hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="memo-language"
                        className="mt-1 h-4 w-4 accent-primary"
                        checked={active}
                        onChange={() => setSettings((previous) => ({ ...previous, language: option.value }))}
                      />
                      <span>
                        <span className="flex flex-wrap items-baseline gap-2">
                          <span className="text-sm font-extrabold text-text">{option.ar}</span>
                          <span dir="ltr" className="text-[10px] font-bold text-muted">{option.fr}</span>
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-5 text-muted">{option.hint}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {settings.language !== 'ar' ? (
                <p className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[11px] font-semibold leading-5 text-muted">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
                  عند غياب العنوان الفرنسي الرسمي في التوازيع، يُعرض العنوان العربي كما هو دون ترجمة
                  مُختلقة، مع تنبيه ظاهر في الوثيقة.
                </p>
              ) : null}
            </SectionCard>

            <SectionCard
              icon={FileText}
              title="بيانات الترويسة"
              hint="تُطبع هذه البيانات في أعلى المذكرة. اترك ما لا ترغب في إظهاره فارغاً."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {HEADER_INPUTS.map((field) => (
                  <label key={field.key} className={`block ${field.full ? 'sm:col-span-2' : ''}`}>
                    <span className="mb-1 block text-[11px] font-extrabold text-text">{field.label}</span>
                    <input
                      type="text"
                      value={settings[field.key]}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        setSettings((previous) => ({ ...previous, [field.key]: event.target.value }))
                      }
                      className={inputClass}
                    />
                  </label>
                ))}
              </div>
            </SectionCard>

            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-xs font-bold text-muted">
                <Info className="h-4 w-4 text-secondary" />
                خطوتك التالية: اختيار المادة والمستوى والمرحلة والأسبوع واليوم.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {memo ? (
                  <button type="button" onClick={() => setScreen('result')} className={btnSecondary}>
                    <FileText className="h-4 w-4" /> العودة إلى المذكرة
                  </button>
                ) : null}
                <button type="button" onClick={applySettings} disabled={settings.levels.length === 0} className={btnPrimary}>
                  حفظ ومتابعة <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
            </div>

            <section className="pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-base font-extrabold text-text">
                  <FolderOpen className="h-4.5 w-4.5 text-secondary" /> المسودات المحفوظة
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                    {drafts.length}
                  </span>
                </h2>
                {drafts.length === 0 ? <p className="text-xs text-muted">لا توجد مسودات بعد.</p> : null}
              </div>

              {drafts.length > 0 ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {drafts.map((draft) => (
                    <article key={draft.id} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                      <p className="text-sm font-extrabold text-text">{draft.title}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10.5px] font-bold text-muted">
                        <span>{levelLabel(draft.doc.selection.levelId, 'ar')}</span>
                        <span aria-hidden>·</span>
                        <span>{languageLabel(draft.doc.settings.language)}</span>
                        <span aria-hidden>·</span>
                        <span>{draftTimestamp(draft.savedAt)}</span>
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button type="button" onClick={() => openDraft(draft)} className={`${btnSecondary} flex-1 py-2 text-xs`}>
                          <FolderOpen className="h-3.5 w-3.5" /> فتح
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDraft(draft.id)}
                          aria-label={`حذف مسودة ${draft.title}`}
                          className="rounded-xl border border-border p-2 text-muted transition hover:bg-background hover:text-text"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        </div>
      ) : null}

      {screen === 'wizard' ? (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted">
              <Badge tone="primary">{levelChoices.map((level) => level.ar.replace('المستوى ', '')).join(' · ') || 'لا مستوى'}</Badge>
              <Badge tone="secondary">{languageLabel(settings.language)}</Badge>
              <span className="hidden sm:inline">{settings.school || 'بدون مؤسسة'}</span>
              <span className="hidden sm:inline" aria-hidden>·</span>
              <span className="hidden sm:inline">{settings.teacher || 'بدون اسم أستاذ(ة)'}</span>
            </div>
            <button type="button" onClick={() => openSettings('wizard')} className={`${btnSecondary} px-3 py-1.5 text-[11px]`}>
              <Settings className="h-3.5 w-3.5" /> تعديل الإعدادات
            </button>
          </div>

          {notice ? (
            <div className="mt-4">
              <NoticeBar notice={notice} onClose={() => setNotice(null)} />
            </div>
          ) : null}

          <nav aria-label="خطوات إعداد المذكرة" className="mt-5 overflow-x-auto pb-1">
            <ol className="flex min-w-max items-center gap-1">
              {STEPS.map((item, index) => {
                const active = item.key === step;
                const done = index < currentStepIndex;
                const open = canOpenStep(index);
                return (
                  <li key={item.key} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => open && setStep(item.key)}
                      disabled={!open}
                      aria-current={active ? 'step' : undefined}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold transition ${
                        active
                          ? 'bg-primary text-white'
                          : done
                            ? 'bg-secondary/10 text-secondary'
                            : open
                              ? 'bg-surface text-text hover:bg-background border border-border'
                              : 'cursor-not-allowed border border-border bg-background text-muted opacity-60'
                      }`}
                    >
                      <span
                        className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${
                          active ? 'bg-white/20' : done ? 'bg-secondary text-white' : 'bg-background'
                        }`}
                      >
                        {done ? <Check className="h-3 w-3" /> : index + 1}
                      </span>
                      {item.label}
                    </button>
                    {index < STEPS.length - 1 ? <ChevronLeft className="h-4 w-4 shrink-0 text-muted" aria-hidden /> : null}
                  </li>
                );
              })}
            </ol>
          </nav>

          <section className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            {step === 'subject' ? (
              <div>
                <div className="mb-4">
                  <p className="text-[11px] font-extrabold text-secondary">الخطوة 1 من 5</p>
                  <h2 className="mt-1 text-lg font-extrabold text-text sm:text-xl">اختر المادة</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    مادة الرياضيات متاحة الآن للمستويين الأول والثاني. بقية المواد ستُضاف تدريجياً بنفس البنية.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <ChoiceCard active={choice.subject === 'math'} onClick={selectSubject}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-white">
                        <Calculator className="h-5 w-5" />
                      </span>
                      <Badge tone="secondary">متاح الآن</Badge>
                    </div>
                    <p className="mt-3 text-base font-extrabold text-text">{SUBJECT.ar}</p>
                    <p dir="ltr" className="text-[10px] font-bold text-muted">{SUBJECT.fr}</p>
                    <p className="mt-2 text-xs leading-5 text-muted">5 مراحل · 20 درساً في كل مرحلة · توازيع رسمية.</p>
                  </ChoiceCard>

                  {FUTURE_SUBJECTS.map((subject) => (
                    <ChoiceCard key={subject.ar} active={false} disabled onClick={() => undefined}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-background text-muted">
                          <subject.icon className="h-5 w-5" />
                        </span>
                        <Badge tone="muted">قريباً</Badge>
                      </div>
                      <p className="mt-3 text-base font-extrabold text-text">{subject.ar}</p>
                      <p dir="ltr" className="text-[10px] font-bold text-muted">{subject.fr}</p>
                      <p className="mt-2 text-xs leading-5 text-muted">التوازيع الرسمية قيد الإعداد.</p>
                    </ChoiceCard>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 'level' ? (
              <div>
                <div className="mb-4">
                  <p className="text-[11px] font-extrabold text-secondary">الخطوة 2 من 5</p>
                  <h2 className="mt-1 text-lg font-extrabold text-text sm:text-xl">اختر المستوى</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    تظهر هنا فقط المستويات المختارة في الإعدادات العامة.
                  </p>
                </div>
                {levelChoices.length === 0 ? (
                  <div className="rounded-xl border border-accent/50 bg-accent/10 px-4 py-4 text-sm font-bold text-text">
                    لا يوجد مستوى محدد.
                    <button type="button" onClick={() => openSettings('wizard')} className="mr-2 underline">
                      اختر مستوى من الإعدادات
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {levelChoices.map((level) => (
                      <ChoiceCard
                        key={level.id}
                        active={choice.levelId === level.id}
                        onClick={() => selectLevel(level.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                            <GraduationCap className="h-5 w-5" />
                          </span>
                          <span dir="ltr" className="text-[10px] font-extrabold text-muted">{level.fr}</span>
                        </div>
                        <p className="mt-3 text-base font-extrabold text-text">{level.ar}</p>
                        <p className="mt-1 text-xs leading-5 text-muted">الرياضيات · 5 مراحل · 20 درساً في المراحل الأربع الأولى.</p>
                      </ChoiceCard>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {step === 'stage' ? (
              <div>
                <div className="mb-4">
                  <p className="text-[11px] font-extrabold text-secondary">الخطوة 3 من 5</p>
                  <h2 className="mt-1 text-lg font-extrabold text-text sm:text-xl">اختر المرحلة</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {activeLevel ? `${activeLevel.label} — ` : ''}خمس مراحل، لكل مرحلة أسابيعها وتقويمها الذاتي.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(activeLevel?.etapes ?? []).map((etape) => {
                    const lessons = etape.weeks.reduce((total, week) => total + countLessons(week), 0);
                    const hasReview = etape.weeks.some((week) => week.kind === 'general-review');
                    return (
                      <ChoiceCard
                        key={etape.n}
                        active={choice.etape === etape.n}
                        onClick={() => selectEtape(etape.n)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                            <Layers className="h-5 w-5" />
                          </span>
                          <Badge tone="muted">{etape.weeks.length} أسابيع</Badge>
                        </div>
                        <p className="mt-3 text-base font-extrabold text-text">المرحلة {etape.n}</p>
                        <p className="mt-1 text-xs font-bold text-secondary">{lessons} درساً</p>
                        <p className="mt-1 text-xs leading-5 text-muted">
                          {hasReview ? 'أسبوعان بدروس ثم مراجعة عامة وتقويم ذاتي.' : 'أربعة أسابيع بدروس + أسبوع خامس + تقويم ذاتي.'}
                        </p>
                      </ChoiceCard>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 'week' ? (
              <div>
                <div className="mb-4">
                  <p className="text-[11px] font-extrabold text-secondary">الخطوة 4 من 5</p>
                  <h2 className="mt-1 text-lg font-extrabold text-text sm:text-xl">اختر الأسبوع</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    الأسبوع السادس مخصص للتقويم الذاتي. في المرحلة الخامسة: الأسبوعان 1 و2 دروس،
                    والأسبوع 3 تقويم ذاتي، والأسبوعان 4 و5 مراجعة عامة.
                  </p>
                </div>
                {activeEtape ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {activeEtape.weeks.map((week) => {
                      const isNormal = week.kind === 'normal';
                      return (
                        <ChoiceCard
                          key={week.n}
                          active={choice.week === week.n}
                          onClick={() => selectWeek(week.n)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-extrabold text-text">
                              {WEEK_LABELS.find((item) => item.n === week.n)?.ar ?? `الأسبوع ${week.n}`}
                            </p>
                            <Badge tone={isNormal ? 'primary' : 'secondary'}>
                              {WEEK_KIND_LABELS[week.kind].ar}
                            </Badge>
                          </div>
                          {isNormal ? (
                            <ul className="mt-2 space-y-1">
                              {week.lessons.map((lesson) => (
                                <li key={`${week.n}-${lesson.n}`} className="flex gap-1.5 text-[11px] leading-5 text-muted">
                                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/10 text-[9px] font-extrabold text-primary">
                                    {lesson.n}
                                  </span>
                                  <span className="line-clamp-2">{lesson.title}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="mt-3 rounded-lg border border-border bg-background px-2.5 py-2">
                              <p className="text-[11px] font-bold leading-5 text-text">{week.lessons[0]?.title}</p>
                            </div>
                          )}
                          {week.n === 6 ? (
                            <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-secondary">
                              <ClipboardCheck className="h-3 w-3" /> قالب تقويم ذاتي خاص
                            </p>
                          ) : null}
                        </ChoiceCard>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted">اختر المرحلة أولاً.</p>
                )}
              </div>
            ) : null}

            {step === 'day' ? (
              <div>
                <div className="mb-4">
                  <p className="text-[11px] font-extrabold text-secondary">الخطوة 5 من 5</p>
                  <h2 className="mt-1 text-lg font-extrabold text-text sm:text-xl">اختر اليوم</h2>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    يُجلب عنوان الدرس تلقائياً من التوازيع: الاثنين → الدرس 1، الثلاثاء → 2، الأربعاء → 3،
                    الخميس → 4، والجمعة → حصة دعم ومراجعة بقالب مبسط.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {DAYS.map((day) => {
                    const dayChoice = { ...choice, day: day.n };
                    const lesson = lessonForChoice(dayChoice);
                    const variant = variantForChoice(dayChoice);
                    const isSupport = day.n === 5;
                    return (
                      <ChoiceCard
                        key={day.n}
                        active={choice.day === day.n}
                        onClick={() => selectDay(day.n)}
                        className="p-3.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-extrabold text-text">{day.ar}</p>
                            <p dir="ltr" className="text-[10px] font-bold text-muted">{day.fr}</p>
                          </div>
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-[11px] font-extrabold text-primary">
                            {day.n}
                          </span>
                        </div>
                        {isSupport ? (
                          <div className="mt-3">
                            <Badge tone="secondary">دعم</Badge>
                            <p className="mt-1.5 text-[11px] font-bold leading-5 text-text">حصة دعم ومراجعة أسبوعية</p>
                            <p className="mt-1 text-[10px] leading-4 text-muted">قالب مبسط</p>
                          </div>
                        ) : variant === 'lesson' && lesson ? (
                          <div className="mt-3">
                            <p className="text-[10px] font-extrabold text-secondary">الدرس {lesson.n}</p>
                            <p className="mt-1 text-[11px] font-bold leading-5 text-text line-clamp-3">{lesson.title}</p>
                          </div>
                        ) : (
                          <div className="mt-3">
                            <Badge tone="secondary">{variant ? VARIANT_LABELS[variant].ar : 'مراجعة'}</Badge>
                            <p className="mt-1.5 text-[11px] font-bold leading-5 text-text line-clamp-3">
                              {lesson?.title ?? 'مراجعة عامة'}
                            </p>
                          </div>
                        )}
                      </ChoiceCard>
                    );
                  })}
                </div>

                {choice.day && selection ? (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/30 bg-secondary/[0.04] px-4 py-3">
                    <div>
                      <p className="text-[10px] font-extrabold text-secondary">المذكرة التي ستُولَّد</p>
                      <p className="mt-0.5 text-sm font-extrabold text-text">
                        {levelLabel(selection.levelId, settings.language)} · المرحلة {selection.etape} · الأسبوع{' '}
                        {selection.week} · {DAYS.find((day) => day.n === selection.day)?.ar}
                      </p>
                    </div>
                    <button type="button" onClick={generateMemo} className={btnPrimary}>
                      <Sparkles className="h-4 w-4" /> توليد المذكرة
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={previousStep}
                disabled={currentStepIndex === 0}
                className={btnSecondary}
              >
                <ArrowRight className="h-4 w-4" /> السابق
              </button>

              {step === 'day' ? (
                <button type="button" onClick={generateMemo} disabled={!selection} className={btnPrimary}>
                  <Sparkles className="h-4 w-4" /> توليد المذكرة
                </button>
              ) : (
                <button type="button" onClick={nextStep} disabled={!canContinue()} className={btnPrimary}>
                  التالي <ArrowLeft className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {screen === 'result' && memo ? (
        <div className="planner-print-page">
          <section className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
            <div className="print-hide sticky top-16 z-40 -mx-4 mb-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10.5px] font-extrabold text-secondary">
                    {memo.meta.variantAr} · {memo.meta.levelAr} · المرحلة {memo.meta.etape} · الأسبوع{' '}
                    {memo.meta.week} · {memo.meta.dayAr}
                  </p>
                  <h2 className="mt-0.5 truncate text-base font-extrabold text-text sm:text-lg">{memo.title}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={printMemo} className={btnPrimary}>
                    <Printer className="h-4 w-4" /> طباعة / PDF
                  </button>
                  <button type="button" onClick={saveDraft} className={btnSecondary}>
                    <Save className="h-4 w-4" /> حفظ مسودة
                  </button>
                  <button type="button" onClick={startNew} className={btnSecondary}>
                    <RotateCcw className="h-4 w-4" /> جديدة
                  </button>
                  <button type="button" onClick={backToWizard} className={btnSecondary}>
                    <ArrowRight className="h-4 w-4" /> رجوع
                  </button>
                </div>
              </div>
            </div>

            {notice ? (
              <div className="print-hide mb-4">
                <NoticeBar notice={notice} onClose={() => setNotice(null)} />
              </div>
            ) : null}

            {settings.language !== 'ar' &&
            memo.meta.frenchFallback &&
            memo.fields.titleFr === memo.fields.titleAr ? (
              <div className="print-hide mb-4 flex items-start gap-2 rounded-xl border border-secondary/40 bg-secondary/5 px-4 py-3 text-[11px] font-bold leading-5 text-secondary">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  العنوان الفرنسي الرسمي لهذا الدرس غير متوفر في التوازيع. عُرض العنوان العربي كما هو دون
                  ترجمة مُختلقة. يمكنك تحرير حقل «الموضوع بالفرنسية» يدوياً قبل الطباعة.
                </p>
              </div>
            ) : null}

            <div className="grid gap-5 xl:grid-cols-[400px_minmax(0,1fr)]">
              <aside className="print-hide space-y-4">
                <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-extrabold text-text">
                        <PencilRuler className="h-4 w-4 text-secondary" /> تحرير المذكرة
                      </h3>
                      <p className="mt-1 text-[10.5px] leading-5 text-muted">
                        كل تعديل يظهر فوراً في المعاينة. الحقول محفوظة مع المسودة.
                      </p>
                    </div>
                    <button type="button" onClick={() => openSettings('result')} className={`${btnSecondary} px-2.5 py-1.5 text-[10px]`}>
                      <Settings className="h-3.5 w-3.5" /> الإعدادات
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl border border-border bg-background/60 p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-extrabold text-text">
                        <CalendarDays className="h-3.5 w-3.5 text-secondary" /> بيانات الحصة
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                        <EditorField label="التاريخ" value={memo.fields.date} onChange={(value) => updateField('date', value)} />
                        <EditorField
                          label="المدة (دقيقة)"
                          type="number"
                          value={String(memo.fields.duration)}
                          onChange={(value) => updateField('duration', Math.max(1, Math.min(240, Number(value) || 1)))}
                        />
                        <EditorField label="الفوج" value={memo.fields.group} onChange={(value) => updateField('group', value)} />
                        <EditorField
                          label="رقم الدرس"
                          value={memo.fields.lessonNumber}
                          onChange={(value) => updateField('lessonNumber', value)}
                        />
                      </div>
                      <div className="mt-2 space-y-2">
                        <EditorField
                          label="الموضوع بالعربية"
                          rows={2}
                          value={memo.fields.titleAr}
                          onChange={(value) => updateField('titleAr', value)}
                        />
                        {showFrench ? (
                          <EditorField
                            label="الموضوع بالفرنسية"
                            rows={2}
                            value={memo.fields.titleFr}
                            onChange={(value) => updateField('titleFr', value)}
                          />
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-text">
                        <FileText className="h-3.5 w-3.5 text-secondary" /> الأهداف والمكونات
                      </p>
                      <LocalizedEditor
                        label="الهدف العام"
                        value={memo.fields.objective}
                        showFrench={showFrench}
                        onChange={(lang, value) => updateLocalized('objective', lang, value)}
                      />
                      <LocalizedEditor
                        label="الكفاية المستهدفة"
                        value={memo.fields.competency}
                        showFrench={showFrench}
                        onChange={(lang, value) => updateLocalized('competency', lang, value)}
                      />
                      <LocalizedEditor
                        label="المكتسبات السابقة"
                        value={memo.fields.prerequisites}
                        showFrench={showFrench}
                        onChange={(lang, value) => updateLocalized('prerequisites', lang, value)}
                      />
                      <LocalizedEditor
                        label="الوسائل والوسائط"
                        value={memo.fields.materials}
                        showFrench={showFrench}
                        onChange={(lang, value) => updateLocalized('materials', lang, value)}
                      />
                      <LocalizedEditor
                        label="التقويم"
                        value={memo.fields.assessment}
                        showFrench={showFrench}
                        onChange={(lang, value) => updateLocalized('assessment', lang, value)}
                      />
                      <LocalizedEditor
                        label="المعالجة والدعم"
                        value={memo.fields.remediation}
                        showFrench={showFrench}
                        onChange={(lang, value) => updateLocalized('remediation', lang, value)}
                      />
                      <LocalizedEditor
                        label="العمل المنزلي"
                        value={memo.fields.homework}
                        showFrench={showFrench}
                        onChange={(lang, value) => updateLocalized('homework', lang, value)}
                      />
                      <LocalizedEditor
                        label="ملاحظات الأستاذ(ة)"
                        value={memo.fields.notes}
                        showFrench={showFrench}
                        onChange={(lang, value) => updateLocalized('notes', lang, value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-text">
                        <Clock className="h-3.5 w-3.5 text-secondary" /> مراحل الحصة
                      </p>
                      {memo.fields.phases.map((phase, index) => (
                        <div key={phase.key} className="rounded-xl border border-border bg-background/60 p-3">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-[10.5px] font-extrabold text-text">
                              {index + 1}. {phase.labelAr}
                            </p>
                            <label className="flex items-center gap-1 text-[9px] font-bold text-muted">
                              <input
                                type="number"
                                min={1}
                                max={240}
                                value={phase.minutes}
                                onChange={(event) => updatePhaseMinutes(index, event.target.value)}
                                className="w-14 rounded-lg border border-border bg-surface px-1.5 py-1 text-center text-[10px] font-extrabold text-text outline-none focus:border-primary"
                              />
                              د
                            </label>
                          </div>
                          <div className={showFrench ? 'grid gap-2 sm:grid-cols-2 xl:grid-cols-1' : ''}>
                            <textarea
                              rows={3}
                              dir="rtl"
                              value={phase.text.ar}
                              onChange={(event) => updatePhaseText(index, 'ar', event.target.value)}
                              className={textareaClass}
                              aria-label={`${phase.labelAr} — العربية`}
                            />
                            {showFrench ? (
                              <textarea
                                rows={3}
                                dir="ltr"
                                value={phase.text.fr}
                                onChange={(event) => updatePhaseText(index, 'fr', event.target.value)}
                                className={`${textareaClass} text-left`}
                                aria-label={`${phase.labelFr} — Français`}
                              />
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-surface px-4 py-3 text-[10.5px] font-semibold leading-5 text-muted">
                  <span className="font-extrabold text-text">نصيحة:</span> استعمل زر «طباعة / PDF» ثم اختر
                  «حفظ بصيغة PDF» في نافذة الطباعة للحصول على نسخة A4 مطابقة للمعاينة.
                </div>
              </aside>

              <div className="min-w-0">
                <div className="print-hide mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
                  <h3 className="text-xs font-extrabold text-muted">معاينة حية — A4</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted">
                    <Clock className="h-3 w-3" />
                    {memo.fields.phases.reduce((total, phase) => total + phase.minutes, 0)} دقيقة
                  </span>
                </div>
                <div className="overflow-x-auto pb-2">
                  <MemoPreview doc={memo} />
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {screen === 'result' && !memo ? (
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <NotebookPen className="mx-auto h-10 w-10 text-muted" />
          <h2 className="mt-3 text-lg font-extrabold text-text">لا توجد مذكرة معروضة</h2>
          <p className="mt-1 text-sm text-muted">ابدأ باختيار الحصة أو افتح مسودة محفوظة من الشاشة الأولى.</p>
          <button type="button" onClick={() => setScreen('settings')} className={`${btnPrimary} mt-4`}>
            العودة إلى الإعدادات
          </button>
        </div>
      ) : null}
    </div>
  );
}
