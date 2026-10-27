import {
  mathematics,
  type Etape,
  type Lesson,
  type Niveau,
  type Week,
} from '../data/mathematics';

/* ------------------------------------------------------------------ */
/*  الأنواع الأساسية                                                    */
/* ------------------------------------------------------------------ */

export type Language = 'ar' | 'fr' | 'bilingual';

export type LevelId = Niveau['id'];

export type DayNumber = 1 | 2 | 3 | 4 | 5;

export type Selection = {
  levelId: LevelId;
  etape: Etape['n'];
  week: Week['n'];
  day: DayNumber;
};

export type PartialSelection = {
  levelId?: LevelId;
  etape?: Etape['n'];
  week?: Week['n'];
  day?: DayNumber;
};

export type GeneralSettings = {
  levels: LevelId[];
  language: Language;
  academy: string;
  directorate: string;
  school: string;
  season: string;
  teacher: string;
  inspector: string;
  director: string;
  groups: string;
};

export type LocalizedText = {
  ar: string;
  fr: string;
};

export type MemoPhase = {
  key: string;
  labelAr: string;
  labelFr: string;
  minutes: number;
  text: LocalizedText;
};

export type MemoVariant = 'lesson' | 'support' | 'self-assessment' | 'general-review';

export type MemoFields = {
  date: string;
  duration: number;
  group: string;
  titleAr: string;
  titleFr: string;
  lessonNumber: string;
  objective: LocalizedText;
  competency: LocalizedText;
  prerequisites: LocalizedText;
  materials: LocalizedText;
  assessment: LocalizedText;
  remediation: LocalizedText;
  homework: LocalizedText;
  notes: LocalizedText;
  phases: MemoPhase[];
};

export type MemoMeta = {
  subjectAr: string;
  subjectFr: string;
  levelAr: string;
  levelFr: string;
  etape: number;
  week: number;
  weekKind: Week['kind'];
  dayAr: string;
  dayFr: string;
  variant: MemoVariant;
  variantAr: string;
  variantFr: string;
  weekLessonsAr: string[];
  weekLessonsFr: string[];
  frenchFallback: boolean;
};

export type MemoDoc = {
  id: string;
  title: string;
  savedAt: string | null;
  settings: GeneralSettings;
  selection: Selection;
  meta: MemoMeta;
  fields: MemoFields;
};

export type Draft = {
  id: string;
  title: string;
  savedAt: string;
  doc: MemoDoc;
};

/* ------------------------------------------------------------------ */
/*  ثوابت العرض                                                         */
/* ------------------------------------------------------------------ */

export const SUBJECT = { id: 'math', ar: 'الرياضيات', fr: 'Mathématiques' } as const;

export const LEVEL_OPTIONS: Array<{
  id: string;
  ar: string;
  fr: string;
  supported: boolean;
}> = [
  { id: 'n1', ar: 'المستوى الأول', fr: '1ère année', supported: true },
  { id: 'n2', ar: 'المستوى الثاني', fr: '2ème année', supported: true },
  { id: 'n3', ar: 'المستوى الثالث', fr: '3ème année', supported: false },
  { id: 'n4', ar: 'المستوى الرابع', fr: '4ème année', supported: false },
  { id: 'n5', ar: 'المستوى الخامس', fr: '5ème année', supported: false },
  { id: 'n6', ar: 'المستوى السادس', fr: '6ème année', supported: false },
];

export const LEVELS: Array<{ id: LevelId; ar: string; fr: string }> = [
  { id: 'n1', ar: 'المستوى الأول', fr: '1ère année' },
  { id: 'n2', ar: 'المستوى الثاني', fr: '2ème année' },
];

export const DAYS: Array<{ n: DayNumber; ar: string; fr: string }> = [
  { n: 1, ar: 'الاثنين', fr: 'Lundi' },
  { n: 2, ar: 'الثلاثاء', fr: 'Mardi' },
  { n: 3, ar: 'الأربعاء', fr: 'Mercredi' },
  { n: 4, ar: 'الخميس', fr: 'Jeudi' },
  { n: 5, ar: 'الجمعة', fr: 'Vendredi' },
];

export const WEEK_LABELS = [
  { n: 1, ar: 'الأسبوع 1', fr: 'Semaine 1' },
  { n: 2, ar: 'الأسبوع 2', fr: 'Semaine 2' },
  { n: 3, ar: 'الأسبوع 3', fr: 'Semaine 3' },
  { n: 4, ar: 'الأسبوع 4', fr: 'Semaine 4' },
  { n: 5, ar: 'الأسبوع 5', fr: 'Semaine 5' },
  { n: 6, ar: 'الأسبوع 6', fr: 'Semaine 6' },
] as const;

export const VARIANT_LABELS: Record<MemoVariant, { ar: string; fr: string }> = {
  lesson: { ar: 'حصة درس', fr: 'Séance de leçon' },
  support: { ar: 'حصة دعم ومراجعة', fr: 'Séance de soutien' },
  'self-assessment': { ar: 'تقويم ذاتي', fr: 'Auto-évaluation' },
  'general-review': { ar: 'مراجعة عامة', fr: 'Révision générale' },
};

export const WEEK_KIND_LABELS: Record<Week['kind'], { ar: string; fr: string }> = {
  normal: { ar: 'أسبوع عادي', fr: 'Semaine normale' },
  'self-assessment': { ar: 'تقويم ذاتي', fr: 'Auto-évaluation' },
  'general-review': { ar: 'مراجعة عامة', fr: 'Révision générale' },
};

export function defaultSettings(): GeneralSettings {
  return {
    levels: ['n1'],
    language: 'ar',
    academy: '',
    directorate: '',
    school: 'المدرسة الرائدة',
    season: '2026/2027',
    teacher: '',
    inspector: '',
    director: '',
    groups: '',
  };
}

/* ------------------------------------------------------------------ */
/*  استخراج البيانات                                                     */
/* ------------------------------------------------------------------ */

export function getNiveau(id: LevelId): Niveau | null {
  return mathematics.find((niveau) => niveau.id === id) ?? null;
}

export function getEtape(id: LevelId, etape: number): Etape | null {
  return getNiveau(id)?.etapes.find((item) => item.n === etape) ?? null;
}

export function getWeek(id: LevelId, etape: number, week: number): Week | null {
  return getEtape(id, etape)?.weeks.find((item) => item.n === week) ?? null;
}

export function levelLabel(id: LevelId, language: Language): string {
  const level = LEVELS.find((item) => item.id === id);
  if (!level) return id;
  return language === 'fr' ? level.fr : level.ar;
}

export function countLessons(week: Week): number {
  return week.lessons.filter((lesson) => lesson.n > 0).length;
}

function previousLesson(niveau: Niveau, etapeNumber: number, lessonNumber: number): Lesson | null {
  const current = niveau.etapes.find((etape) => etape.n === etapeNumber);
  if (!current) return null;

  const numeric = current.weeks
    .flatMap((week) => week.lessons)
    .filter((lesson) => lesson.n > 0)
    .sort((a, b) => a.n - b.n);

  if (lessonNumber > 1) {
    return numeric.find((lesson) => lesson.n === lessonNumber - 1) ?? null;
  }

  const previousEtape = niveau.etapes.find((etape) => etape.n === etapeNumber - 1);
  if (!previousEtape) return null;
  const previousNumeric = previousEtape.weeks
    .flatMap((week) => week.lessons)
    .filter((lesson) => lesson.n > 0)
    .sort((a, b) => a.n - b.n);
  return previousNumeric[previousNumeric.length - 1] ?? null;
}

function joinTitles(lessons: Lesson[], language: 'ar' | 'fr'): string {
  return lessons
    .map((lesson) => {
      const title = language === 'fr' ? (lesson.titleFr ?? lesson.title) : lesson.title;
      return lesson.n > 0 ? `${lesson.n}. ${title}` : title;
    })
    .join(language === 'fr' ? ' ; ' : '؛ ');
}

function resolveVariant(week: Week, day: DayNumber): MemoVariant {
  if (day === 5) return 'support';
  if (week.kind === 'self-assessment') return 'self-assessment';
  if (week.kind === 'general-review') return 'general-review';
  return 'lesson';
}

export function variantForChoice(selection: PartialSelection): MemoVariant | null {
  if (!selection.levelId || !selection.etape || !selection.week || !selection.day) return null;
  const week = getWeek(selection.levelId, selection.etape, selection.week);
  if (!week) return null;
  return resolveVariant(week, selection.day);
}

export function lessonForChoice(selection: PartialSelection): Lesson | null {
  if (!selection.levelId || !selection.etape || !selection.week || !selection.day) return null;
  const week = getWeek(selection.levelId, selection.etape, selection.week);
  if (!week) return null;
  if (selection.day === 5) return null;
  if (week.kind === 'normal') return week.lessons[selection.day - 1] ?? null;
  return week.lessons[0] ?? null;
}

/* ------------------------------------------------------------------ */
/*  صياغة محتوى المذكرة                                                 */
/* ------------------------------------------------------------------ */

const COMPETENCY: LocalizedText = {
  ar: 'حل وضعيات-مسائل دالة، والتواصل شفوياً وكتابياً باستعمال اللغة الرياضية، وتوظيف المكتسبات في وضعيات جديدة.',
  fr: "Résoudre des situations-problèmes, communiquer oralement et par écrit en langage mathématique et mobiliser les acquis dans des situations nouvelles.",
};

const MATERIALS: LocalizedText = {
  ar: 'الكتاب المدرسي للرياضيات، السبورة والطباشير الملون، الألواح الفردية، بطاقات وشبكات، وسائل محسوسة (أعداد، أشكال هندسية، مسطرة).',
  fr: 'Manuel de mathématiques, tableau et craies de couleur, ardoises individuelles, cartes et grilles, matériel concret (nombres, figures géométriques, règle).',
};

function todayLabel(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${now.getFullYear()}`;
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `memo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

type PhaseDraft = Omit<MemoPhase, 'minutes'>;

function lessonPhases(
  titleAr: string,
  titleFr: string,
  prevAr: string,
  prevFr: string,
): PhaseDraft[] {
  return [
    {
      key: 'preparation',
      labelAr: 'التهيئة واستحضار المكتسبات',
      labelFr: 'Mise en situation et rappel des acquis',
      text: {
        ar: `أستقبل المتعلمين وأتأكد من جاهزيتهم. أستحضر معهم التعلمات السابقة (${prevAr}) من خلال أسئلة شفوية قصيرة، ثم أعلن هدف الحصة: «${titleAr}».`,
        fr: `J'accueille les élèves et je vérifie leur disponibilité. Je rappelle les acquis précédents (${prevFr}) par un questionnement oral court, puis j'annonce l'objectif de la séance : « ${titleFr} ».`,
      },
    },
    {
      key: 'modeling',
      labelAr: 'النمذجة — أنا أفعل',
      labelFr: 'Modélisation — je fais',
      text: {
        ar: `أعرض النموذج أمام المتعلمين بخطوات واضحة ومتسلسلة، وأفكر بصوت مرتفع أثناء الإنجاز: أشرح ما أفعله ولماذا أفعله، وأستعمل الوسائل المحسوسة والسبورة. أتحقق من الفهم بأسئلة موجهة.`,
        fr: `Je présente le modèle devant les élèves avec des étapes claires et ordonnées, en réfléchissant à voix haute : j'explique ce que je fais et pourquoi, en utilisant le matériel concret et le tableau. Je vérifie la compréhension par des questions ciblées.`,
      },
    },
    {
      key: 'guided',
      labelAr: 'الممارسة الموجهة — نحن نفعل',
      labelFr: 'Pratique guidée — nous faisons',
      text: {
        ar: `ننجز معاً أنشطة تطبيقية حول «${titleAr}». أوزع الأدوار، وأدعو المتعلمين إلى شرح خطواتهم، وأقدم التغذية الراجعة الفورية، وأصحح الأخطاء الشائعة.`,
        fr: `Nous réalisons ensemble des activités d'application sur « ${titleFr} ». Je répartis les rôles, j'invite les élèves à expliciter leurs étapes, je donne une rétroaction immédiate et je corrige les erreurs fréquentes.`,
      },
    },
    {
      key: 'independent',
      labelAr: 'الممارسة المستقلة — أنت تفعل',
      labelFr: 'Pratique autonome — tu fais',
      text: {
        ar: `يشتغل كل متعلم(ة) على تمارين الكتاب المدرسي أو بطاقة عمل فردية حول «${titleAr}». ألاحظ وأسجل الصعوبات، وأدعم المتعثرين دون تقديم الحل.`,
        fr: `Chaque élève travaille sur les exercices du manuel ou une fiche individuelle portant sur « ${titleFr} ». J'observe, je note les difficultés et je soutiens les élèves en difficulté sans donner la solution.`,
      },
    },
    {
      key: 'assessment',
      labelAr: 'التقويم والمعالجة',
      labelFr: 'Évaluation et remédiation',
      text: {
        ar: `أقوم مكتسبات المتعلمين بوضعية قصيرة، وأستثمر النتائج في تحديد المتعثرين وبرمجة أنشطة الدعم في الحصة الموالية.`,
        fr: `J'évalue les acquis des élèves par une courte situation et j'exploite les résultats pour identifier les élèves en difficulté et programmer les activités de soutien de la séance suivante.`,
      },
    },
  ];
}

function supportPhases(weekListAr: string, weekListFr: string): PhaseDraft[] {
  return [
    {
      key: 'preparation',
      labelAr: 'التهيئة',
      labelFr: 'Mise en situation',
      text: {
        ar: `أستحضر مع المتعلمين أهم تعلمات الأسبوع: ${weekListAr}. أعلن هدف حصة الدعم وأربطه بالصعوبات المرصودة.`,
        fr: `Je rappelle avec les élèves les principaux apprentissages de la semaine : ${weekListFr}. J'annonce l'objectif de la séance de soutien en lien avec les difficultés observées.`,
      },
    },
    {
      key: 'modeling',
      labelAr: 'التذكير والنمذجة',
      labelFr: 'Rappel et modélisation',
      text: {
        ar: `أعيد شرح النقط التي سجلت فيها صعوبات، بنماذج مختصرة وأمثلة إضافية، مع إشراك المتعلمين في التعليل.`,
        fr: `Je réexplique les points où des difficultés ont été relevées, à l'aide de modèles courts et d'exemples supplémentaires, en impliquant les élèves dans la justification.`,
      },
    },
    {
      key: 'guided',
      labelAr: 'الممارسة الموجهة',
      labelFr: 'Pratique guidée',
      text: {
        ar: `أنجز مع المتعلمين أنشطة دعم متدرجة من البسيط إلى المركب، وأقدم توجيهاً فردياً حسب الحاجة.`,
        fr: `Je réalise avec les élèves des activités de soutien progressives, du simple au complexe, avec un étayage individuel selon les besoins.`,
      },
    },
    {
      key: 'independent',
      labelAr: 'الممارسة المستقلة',
      labelFr: 'Pratique autonome',
      text: {
        ar: `ينجز كل متعلم بطاقة دعم فردية قصيرة. أراقب الإنجاز وأسجل التطورات.`,
        fr: `Chaque élève réalise une courte fiche de soutien individuelle. J'observe le travail et je note les progrès.`,
      },
    },
    {
      key: 'assessment',
      labelAr: 'التقويم',
      labelFr: 'Évaluation',
      text: {
        ar: `أقوم مدى تجاوز الصعوبات وأحدد حالات الدعم المكثف اللاحقة.`,
        fr: `J'évalue le degré de dépassement des difficultés et j'identifie les cas de soutien intensif à venir.`,
      },
    },
  ];
}

function selfAssessmentPhases(stage: number): PhaseDraft[] {
  const stageAr = String(stage);
  return [
    {
      key: 'preparation',
      labelAr: 'التهيئة',
      labelFr: 'Mise en situation',
      text: {
        ar: `أذكّر المتعلمين بأهداف المرحلة ${stageAr} ومعايير التقويم الذاتي، وأوضح كيفية استعمال بطاقة التقويم.`,
        fr: `Je rappelle aux élèves les objectifs de l'étape ${stageAr} et les critères de l'auto-évaluation, et j'explique l'utilisation de la fiche.`,
      },
    },
    {
      key: 'recall',
      labelAr: 'التذكير المنظم',
      labelFr: 'Rappel structuré',
      text: {
        ar: `أستعرض مع المتعلمين أهم التعلمات والمهارات المستهدفة في المرحلة، وأربطها بالأنشطة المنجزة.`,
        fr: `Je passe en revue avec les élèves les principaux apprentissages et compétences visés par l'étape, en lien avec les activités réalisées.`,
      },
    },
    {
      key: 'independent',
      labelAr: 'الإنجاز الذاتي',
      labelFr: 'Travail autonome',
      text: {
        ar: `ينجز كل متعلم(ة) بطاقة التقويم الذاتي: يقارن إجاباته بالمعايير، ويحدد ما أتقنه وما يحتاج إلى مراجعة.`,
        fr: `Chaque élève complète sa fiche d'auto-évaluation : il compare ses réponses aux critères et identifie ce qu'il maîtrise et ce qu'il doit revoir.`,
      },
    },
    {
      key: 'correction',
      labelAr: 'التصحيح الجماعي',
      labelFr: 'Correction collective',
      text: {
        ar: `نصحح معاً، ويشرح المتعلمون اختياراتهم، وأقدم التوضيحات اللازمة.`,
        fr: `Nous corrigeons ensemble, les élèves explicitent leurs choix et j'apporte les clarifications nécessaires.`,
      },
    },
    {
      key: 'assessment',
      labelAr: 'المعالجة',
      labelFr: 'Remédiation',
      text: {
        ar: `أسجل الصعوبات المتكررة وأبرمج أنشطة المراجعة والدعم.`,
        fr: `Je note les difficultés récurrentes et je programme les activités de révision et de soutien.`,
      },
    },
  ];
}

function reviewPhases(stage: number): PhaseDraft[] {
  const stageAr = String(stage);
  return [
    {
      key: 'preparation',
      labelAr: 'التهيئة',
      labelFr: 'Mise en situation',
      text: {
        ar: `أعلن هدف حصة المراجعة العامة وأربطه بمكتسبات المرحلة ${stageAr}.`,
        fr: `J'annonce l'objectif de la séance de révision générale en lien avec les acquis de l'étape ${stageAr}.`,
      },
    },
    {
      key: 'recall',
      labelAr: 'الاستحضار المنظم',
      labelFr: 'Rappel structuré',
      text: {
        ar: `أستعرض مع المتعلمين خريطة تعلمات المرحلة: المفاهيم، التقنيات، وطرق حل المسائل.`,
        fr: `Je présente avec les élèves la carte des apprentissages de l'étape : concepts, techniques et méthodes de résolution de problèmes.`,
      },
    },
    {
      key: 'guided',
      labelAr: 'تمارين مركبة',
      labelFr: 'Exercices de synthèse',
      text: {
        ar: `ننجز تمارين مركبة تجمع بين مكتسبات المرحلة، مع تبرير الخطوات.`,
        fr: `Nous réalisons des exercices de synthèse mobilisant les acquis de l'étape, avec justification des étapes.`,
      },
    },
    {
      key: 'independent',
      labelAr: 'العمل المستقل',
      labelFr: 'Travail autonome',
      text: {
        ar: `ينجز المتعلمون وضعية تقويمية شاملة، وأراقب وأسجل النتائج.`,
        fr: `Les élèves réalisent une situation d'évaluation globale ; j'observe et je note les résultats.`,
      },
    },
    {
      key: 'assessment',
      labelAr: 'التقويم والمعالجة',
      labelFr: 'Évaluation et remédiation',
      text: {
        ar: `أحلل النتائج، وأحدد التعثرات، وأقترح أنشطة دعم مكثفة.`,
        fr: `J'analyse les résultats, j'identifie les obstacles et je propose des activités de soutien intensif.`,
      },
    },
  ];
}

const PHASE_MINUTES = [5, 10, 15, 10, 5];

function phasesWithMinutes(drafts: PhaseDraft[]): MemoPhase[] {
  return drafts.map((phase, index) => ({
    ...phase,
    minutes: PHASE_MINUTES[index] ?? 5,
  }));
}

function buildObjective(variant: MemoVariant, titleAr: string, titleFr: string, stage: number): LocalizedText {
  switch (variant) {
    case 'support':
      return {
        ar: `في نهاية حصة الدعم، يكون المتعلم(ة) قادراً على تجاوز الصعوبات المرصودة في تعلمات الأسبوع وتوظيفها في وضعيات بسيطة.`,
        fr: `À la fin de la séance de soutien, l'élève sera capable de dépasser les difficultés relevées durant la semaine et de les mobiliser dans des situations simples.`,
      };
    case 'self-assessment':
      return {
        ar: `في نهاية الحصة، يكون المتعلم(ة) قادراً على تقويم مكتسباته في المرحلة ${stage} ذاتياً، وتحديد ما أتقنه وما يحتاج إلى مراجعة.`,
        fr: `À la fin de la séance, l'élève sera capable d'auto-évaluer ses acquis de l'étape ${stage} et d'identifier ce qu'il maîtrise et ce qu'il doit revoir.`,
      };
    case 'general-review':
      return {
        ar: `في نهاية الحصة، يكون المتعلم(ة) قادراً على مراجعة مكتسبات المرحلة ${stage} وتوظيفها في وضعيات مركبة.`,
        fr: `À la fin de la séance, l'élève sera capable de réviser les acquis de l'étape ${stage} et de les mobiliser dans des situations complexes.`,
      };
    default:
      return {
        ar: `في نهاية الحصة، يكون المتعلم(ة) قادراً على إنجاز أنشطة تتعلق بـ«${titleAr}» وتوظيفها في وضعيات مألوفة.`,
        fr: `À la fin de la séance, l'élève sera capable de réaliser des activités relatives à « ${titleFr} » et de les mobiliser dans des situations familières.`,
      };
  }
}

function buildAssessment(variant: MemoVariant): LocalizedText {
  if (variant === 'self-assessment') {
    return {
      ar: 'تقويم ذاتي بواسطة بطاقة معايير، مع ملاحظة الأستاذ(ة) وتصحيح جماعي. معايير النجاح: دقة التقويم الذاتي وصدق تحديد مواطن القوة والتعثر.',
      fr: "Auto-évaluation à l'aide d'une fiche critériée, complétée par l'observation de l'enseignant(e) et une correction collective. Critères de réussite : exactitude de l'auto-évaluation et identification honnête des points forts et des difficultés.",
    };
  }
  if (variant === 'general-review') {
    return {
      ar: 'تقويم ختامي شامل عبر وضعية مركبة، مع تحليل النتائج وتحديد التعثرات. معايير النجاح: توظيف المكتسبات وإنجاز الخطوات وتبريرها.',
      fr: "Évaluation finale globale par une situation complexe, avec analyse des résultats et identification des obstacles. Critères de réussite : mobilisation des acquis, exécution et justification des étapes.",
    };
  }
  if (variant === 'support') {
    return {
      ar: 'تقويم تكويني لحصة الدعم عبر الملاحظة وبطاقة دعم قصيرة. معايير النجاح: تجاوز الصعوبات المرصودة وإنجاز المطلوب بدقة.',
      fr: "Évaluation formative de la séance de soutien par l'observation et une courte fiche. Critères de réussite : dépassement des difficultés relevées et réalisation correcte de la tâche.",
    };
  }
  return {
    ar: 'تقويم تكويني مستمر عبر الملاحظة، الأسئلة الشفوية، وإنجاز تمارين قصيرة. معايير النجاح: إنجاز المطلوب بدقة مع تبرير الخطوات.',
    fr: "Évaluation formative continue par l'observation, le questionnement oral et de courts exercices. Critères de réussite : réalisation correcte de la tâche avec justification des étapes.",
  };
}

function buildRemediation(variant: MemoVariant): LocalizedText {
  if (variant === 'self-assessment') {
    return {
      ar: 'تحديد مواطن التعثر انطلاقاً من نتائج التقويم الذاتي، وبرمجة أنشطة مراجعة فردية وجماعية.',
      fr: "Identification des points de blocage à partir des résultats de l'auto-évaluation, puis programmation d'activités de révision individuelles et collectives.",
    };
  }
  if (variant === 'general-review') {
    return {
      ar: 'دعم مكثف للمتعثرين في المفاهيم الأساسية للمرحلة، مع إعادة بناء الأنشطة غير المتمكن منها.',
      fr: "Soutien intensif des élèves en difficulté sur les concepts essentiels de l'étape, avec reprise des activités non maîtrisées.",
    };
  }
  return {
    ar: 'دعم فوري للمتعثرين داخل الحصة، ثم نشاط دعم مكثف في حصة الجمعة، مع تسجيل الحالات في دفتر المتابعة.',
    fr: "Remédiation immédiate en classe, puis activité de soutien renforcé le vendredi, avec consignation des cas dans le carnet de suivi.",
  };
}

function buildHomework(variant: MemoVariant, titleAr: string, titleFr: string): LocalizedText {
  if (variant === 'self-assessment') {
    return {
      ar: 'استكمال بطاقة التقويم الذاتي بمساعدة الأسرة، واختيار نشاط مراجعة واحد من الأنشطة المقترحة.',
      fr: "Compléter la fiche d'auto-évaluation avec l'aide de la famille et choisir une activité de révision parmi celles proposées.",
    };
  }
  if (variant === 'general-review') {
    return {
      ar: 'مراجعة ملخص المرحلة وإنجاز تمرينين شاملين من الكتاب المدرسي.',
      fr: "Réviser le résumé de l'étape et réaliser deux exercices de synthèse du manuel.",
    };
  }
  if (variant === 'support') {
    return {
      ar: 'مراجعة قصيرة في البيت حول النقط المعالجة، مع تمرين تطبيقي بسيط.',
      fr: 'Une courte révision à la maison sur les points traités, avec un exercice d’application simple.',
    };
  }
  return {
    ar: `تمرين قصير من الكتاب المدرسي حول «${titleAr}»، مع تذكير الأسر بمرافقة المتعلم.`,
    fr: `Un court exercice du manuel portant sur « ${titleFr} », avec rappel aux familles d'accompagner l'élève.`,
  };
}

function buildNotes(variant: MemoVariant): LocalizedText {
  if (variant === 'support') {
    return {
      ar: 'ملاحظات حول تطور المتعلمين بعد الدعم، والحالات التي تحتاج إلى متابعة فردية.',
      fr: "Observations sur l'évolution des élèves après le soutien et les cas nécessitant un suivi individuel.",
    };
  }
  if (variant === 'self-assessment') {
    return {
      ar: 'ملاحظات حول صدق التقويم الذاتي، والمهارات التي تحتاج إلى مراجعة جماعية.',
      fr: "Observations sur la fiabilité de l'auto-évaluation et les compétences nécessitant une révision collective.",
    };
  }
  return {
    ar: 'ملاحظات حول تدبير الزمن، المشاركة، والصعوبات المرصودة.',
    fr: "Observations sur la gestion du temps, la participation et les difficultés relevées.",
  };
}

export function buildMemo(settings: GeneralSettings, selection: Selection): MemoDoc | null {
  const niveau = getNiveau(selection.levelId);
  const etape = getEtape(selection.levelId, selection.etape);
  const week = getWeek(selection.levelId, selection.etape, selection.week);
  const day = DAYS.find((item) => item.n === selection.day);
  if (!niveau || !etape || !week || !day) return null;

  const variant = resolveVariant(week, selection.day);
  const lesson = lessonForChoice(selection);
  const lessonNumber = lesson?.n ?? 0;
  const previous = lessonNumber > 0 ? previousLesson(niveau, selection.etape, lessonNumber) : null;

  const titleAr =
    variant === 'lesson' && lesson
      ? lesson.title
      : variant === 'support'
        ? week.kind === 'normal'
          ? 'حصة الدعم والمراجعة الأسبوعية'
          : 'دعم المراجعة العامة'
        : (lesson?.title ?? (week.kind === 'general-review' ? 'مراجعة عامة' : 'تقويم ذاتي'));

  const titleFrRaw =
    variant === 'lesson' && lesson
      ? lesson.titleFr
      : variant === 'support'
        ? week.kind === 'normal'
          ? 'Séance de soutien et de révision hebdomadaire'
          : 'Soutien de la révision générale'
        : (lesson?.titleFr ?? (week.kind === 'general-review' ? 'Révision générale' : 'Auto-évaluation'));

  const frenchFallback = !titleFrRaw;
  const titleFr = titleFrRaw ?? titleAr;

  const prevAr = previous ? previous.title : 'المكتسبات السابقة للمستوى';
  const prevFr = previous ? (previous.titleFr ?? previous.title) : 'les acquis antérieurs';

  const weekLessonsAr = week.lessons.map((item) => (item.n > 0 ? `${item.n}. ${item.title}` : item.title));
  const weekLessonsFr = week.lessons.map((item) =>
    item.n > 0 ? `${item.n}. ${item.titleFr ?? item.title}` : item.titleFr ?? item.title,
  );
  const weekListAr = joinTitles(week.lessons, 'ar');
  const weekListFr = joinTitles(week.lessons, 'fr');

  const phases =
    variant === 'lesson'
      ? lessonPhases(titleAr, titleFr, prevAr, prevFr)
      : variant === 'support'
        ? supportPhases(weekListAr, weekListFr)
        : variant === 'self-assessment'
          ? selfAssessmentPhases(selection.etape)
          : reviewPhases(selection.etape);

  const lessonNumberLabel =
    variant === 'lesson' && lessonNumber > 0 ? String(lessonNumber) : '—';

  const fields: MemoFields = {
    date: todayLabel(),
    duration: 45,
    group: settings.groups,
    titleAr,
    titleFr,
    lessonNumber: lessonNumberLabel,
    objective: buildObjective(variant, titleAr, titleFr, selection.etape),
    competency: COMPETENCY,
    prerequisites:
      variant === 'lesson'
        ? {
            ar: previous
              ? `التعلمات السابقة: «${previous.title}».`
              : 'مكتسبات المستوى السابق والتعلمات الأولى من المرحلة.',
            fr: previous
              ? `Les acquis précédents : « ${previous.titleFr ?? previous.title} ».`
              : "Les acquis du niveau précédent et les premiers apprentissages de l'étape.",
          }
        : variant === 'support'
          ? {
              ar: `تعلمات الأسبوع: ${weekListAr}.`,
              fr: `Les apprentissages de la semaine : ${weekListFr}.`,
            }
          : {
              ar: `مكتسبات المرحلة ${selection.etape} كاملة.`,
              fr: `L'ensemble des acquis de l'étape ${selection.etape}.`,
            },
    materials: MATERIALS,
    assessment: buildAssessment(variant),
    remediation: buildRemediation(variant),
    homework: buildHomework(variant, titleAr, titleFr),
    notes: buildNotes(variant),
    phases: phasesWithMinutes(phases),
  };

  const variantLabel = VARIANT_LABELS[variant];
  const meta: MemoMeta = {
    subjectAr: SUBJECT.ar,
    subjectFr: SUBJECT.fr,
    levelAr: niveau.label,
    levelFr: niveau.labelFr,
    etape: selection.etape,
    week: selection.week,
    weekKind: week.kind,
    dayAr: day.ar,
    dayFr: day.fr,
    variant,
    variantAr: variantLabel.ar,
    variantFr: variantLabel.fr,
    weekLessonsAr,
    weekLessonsFr,
    frenchFallback,
  };

  const title = `${niveau.label} · المرحلة ${selection.etape} · الأسبوع ${selection.week} · ${day.ar}`;

  return {
    id: newId(),
    title,
    savedAt: null,
    settings,
    selection,
    meta,
    fields,
  };
}

/* ------------------------------------------------------------------ */
/*  أدوات مساعدة للعرض                                                  */
/* ------------------------------------------------------------------ */

export function languageLabel(language: Language): string {
  if (language === 'fr') return 'Français';
  if (language === 'bilingual') return 'عربية / Français';
  return 'العربية';
}

export function weekdayFromDate(value: string): string {
  // Not used for generation; kept for print footers that show a reference day.
  return value;
}
