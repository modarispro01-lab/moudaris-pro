import type { Language, LocalizedText, MemoDoc } from '../lib/memo';

const HEADER_FIELDS = [
  { key: 'academy', ar: 'الأكاديمية الجهوية للتربية والتكوين', fr: 'Académie régionale' },
  { key: 'directorate', ar: 'المديرية الإقليمية', fr: 'Direction provinciale' },
  { key: 'school', ar: 'المؤسسة', fr: 'Établissement' },
] as const;

const IDENTITY_FIELDS = [
  { key: 'teacher', ar: 'الأستاذ(ة)', fr: 'Enseignant(e)' },
  { key: 'inspector', ar: 'المفتش(ة)', fr: 'Inspecteur(trice)' },
  { key: 'director', ar: 'المدير(ة)', fr: 'Directeur(trice)' },
  { key: 'groups', ar: 'الأفواج', fr: 'Groupes' },
] as const;

function Label({
  ar,
  fr,
  lang,
  className = '',
}: {
  ar: string;
  fr: string;
  lang: Language;
  className?: string;
}) {
  if (lang === 'ar') return <span className={className}>{ar}</span>;
  if (lang === 'fr') return <span className={className}>{fr}</span>;
  return (
    <span className={className}>
      {ar}
      <span dir="ltr" className="block text-[7.5px] font-semibold text-muted">
        {fr}
      </span>
    </span>
  );
}

function RichText({
  value,
  lang,
  className = '',
}: {
  value: LocalizedText;
  lang: Language;
  className?: string;
}) {
  if (lang === 'ar') {
    return (
      <p dir="rtl" className={`text-[10px] leading-[1.85] ${className}`}>
        {value.ar}
      </p>
    );
  }
  if (lang === 'fr') {
    return (
      <p dir="ltr" className={`text-left text-[9.5px] leading-[1.7] ${className}`}>
        {value.fr}
      </p>
    );
  }
  return (
    <div className={className}>
      <p dir="rtl" className="text-[10px] leading-[1.85]">
        {value.ar}
      </p>
      <p
        dir="ltr"
        className="mt-1 border-t border-dashed border-border pt-1 text-left text-[8.5px] leading-[1.6] text-muted"
      >
        {value.fr}
      </p>
    </div>
  );
}

function HeaderLine({
  label,
  value,
  lang,
  align = 'start',
}: {
  label: { ar: string; fr: string };
  value: string;
  lang: Language;
  align?: 'start' | 'end';
}) {
  return (
    <div className={align === 'end' ? 'text-end' : 'text-start'}>
      <span className="block text-[7.5px] font-bold leading-4 text-muted">
        <Label ar={label.ar} fr={label.fr} lang={lang} />
      </span>
      <span className="block text-[9px] font-extrabold leading-5 text-text">{value || '—'}</span>
    </div>
  );
}

function MetaBox({
  label,
  value,
  lang,
}: {
  label: { ar: string; fr: string };
  value: string;
  lang: Language;
}) {
  return (
    <div className="min-w-0 border border-border bg-background px-2 py-1.5">
      <p className="text-[7.5px] font-bold text-muted">
        <Label ar={label.ar} fr={label.fr} lang={lang} />
      </p>
      <p className="mt-0.5 truncate text-[9px] font-extrabold text-text">{value || '—'}</p>
    </div>
  );
}

function SectionTitle({ ar, fr, lang }: { ar: string; fr: string; lang: Language }) {
  return (
    <h3 className="mb-2 flex items-center gap-2 text-[10.5px] font-extrabold text-primary">
      <span className="h-3 w-1 rounded-full bg-secondary" aria-hidden />
      <Label ar={ar} fr={fr} lang={lang} />
    </h3>
  );
}

export default function MemoPreview({ doc }: { doc: MemoDoc }) {
  const lang = doc.settings.language;
  const dir = lang === 'fr' ? 'ltr' : 'rtl';
  const { fields, meta, settings } = doc;

  const stageLabel = {
    ar: `المرحلة ${meta.etape}`,
    fr: `Étape ${meta.etape}`,
  };
  const weekLabel = { ar: `الأسبوع ${meta.week}`, fr: `Semaine ${meta.week}` };
  const durationLabel =
    lang === 'fr' ? `${fields.duration} min` : `${fields.duration} دقيقة`;

  return (
    <article
      dir={dir}
      className="print-sheet mx-auto w-full max-w-[210mm] border border-border bg-surface px-4 py-5 text-text shadow-sm sm:px-[10mm] sm:py-[9mm]"
      lang={lang === 'fr' ? 'fr' : 'ar'}
    >
      <header className="border-b-2 border-primary pb-3">
        <div className="grid grid-cols-[1fr_1.25fr_1fr] items-start gap-2 sm:gap-4">
          <div className="space-y-1">
            {HEADER_FIELDS.map((field) => (
              <HeaderLine
                key={field.key}
                label={field}
                value={settings[field.key]}
                lang={lang}
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-[7.5px] font-bold uppercase tracking-[0.18em] text-secondary">
              <Label ar="المملكة المغربية" fr="Royaume du Maroc" lang={lang} />
            </p>
            <h1 className="mt-1 text-[17px] font-extrabold leading-tight text-primary sm:text-[19px]">
              <Label ar="المذكرة اليومية" fr="Fiche de préparation" lang={lang} />
            </h1>
            <p className="mt-0.5 text-[8px] font-bold text-text">
              <Label
                ar="وفق منهج التعليم الصريح — Enseignement Explicite"
                fr="Enseignement explicite — التعليم الصريح"
                lang={lang}
              />
            </p>
            <p className="mt-1.5 inline-block rounded-full border border-border bg-background px-2.5 py-0.5 text-[8px] font-extrabold text-secondary">
              <Label ar="الموسم الدراسي" fr="Année scolaire" lang={lang} />: {settings.season || '—'}
            </p>
          </div>

          <div className="space-y-1">
            {IDENTITY_FIELDS.map((field) => (
              <HeaderLine
                key={field.key}
                label={field}
                value={settings[field.key]}
                lang={lang}
                align="end"
              />
            ))}
          </div>
        </div>
      </header>

      <section className="mt-3 rounded-xl border border-border bg-primary/[0.04] px-3 py-2.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-extrabold uppercase tracking-wide text-secondary">
              <Label ar={meta.variantAr} fr={meta.variantFr} lang={lang} />
              <span className="mx-1.5 text-muted">·</span>
              <Label
                ar={`${meta.subjectAr} — ${meta.levelAr}`}
                fr={`${meta.subjectFr} — ${meta.levelFr}`}
                lang={lang}
              />
            </p>
            <h2 className="mt-1 text-[13px] font-extrabold leading-snug text-primary sm:text-[14px]">
              {lang === 'fr' ? fields.titleFr : fields.titleAr}
            </h2>
            {lang !== 'ar' && fields.titleFr !== fields.titleAr ? (
              <p className="mt-0.5 text-[8.5px] font-bold text-muted" dir={lang === 'fr' ? 'ltr' : 'rtl'}>
                {lang === 'fr' ? fields.titleAr : `FR: ${fields.titleFr}`}
              </p>
            ) : null}
            {meta.frenchFallback && lang !== 'ar' && fields.titleFr === fields.titleAr ? (
              <p
                dir="ltr"
                className="mt-1.5 rounded-md border border-secondary/30 bg-surface px-2 py-1 text-left text-[7.5px] font-semibold leading-4 text-secondary"
              >
                Titre officiel en français non disponible dans la répartition : le titre arabe est
                conservé tel quel, sans traduction inventée.
              </p>
            ) : null}
          </div>

          <div className="shrink-0 rounded-lg border border-border bg-surface px-3 py-1.5 text-center">
            <p className="text-[7px] font-bold text-muted">
              <Label ar="رقم الدرس" fr="N° leçon" lang={lang} />
            </p>
            <p className="text-[15px] font-extrabold leading-tight text-primary">{fields.lessonNumber || '—'}</p>
          </div>
        </div>
      </section>

      <section className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-5">
        <MetaBox label={{ ar: 'المادة', fr: 'Matière' }} value={lang === 'fr' ? meta.subjectFr : meta.subjectAr} lang={lang} />
        <MetaBox label={{ ar: 'المستوى', fr: 'Niveau' }} value={lang === 'fr' ? meta.levelFr : meta.levelAr} lang={lang} />
        <MetaBox label={{ ar: 'المرحلة', fr: 'Étape' }} value={stageLabel[lang === 'fr' ? 'fr' : 'ar']} lang={lang} />
        <MetaBox label={{ ar: 'الأسبوع', fr: 'Semaine' }} value={weekLabel[lang === 'fr' ? 'fr' : 'ar']} lang={lang} />
        <MetaBox label={{ ar: 'اليوم', fr: 'Jour' }} value={lang === 'fr' ? meta.dayFr : meta.dayAr} lang={lang} />
        <MetaBox label={{ ar: 'التاريخ', fr: 'Date' }} value={fields.date} lang={lang} />
        <MetaBox label={{ ar: 'المدة', fr: 'Durée' }} value={durationLabel} lang={lang} />
        <MetaBox label={{ ar: 'الفوج', fr: 'Groupe' }} value={fields.group} lang={lang} />
        <MetaBox
          label={{ ar: 'نوع الأسبوع', fr: 'Type de semaine' }}
          value={lang === 'fr' ? (meta.weekKind === 'normal' ? 'Semaine normale' : meta.weekKind === 'self-assessment' ? 'Auto-évaluation' : 'Révision générale') : meta.weekKind === 'normal' ? 'أسبوع عادي' : meta.weekKind === 'self-assessment' ? 'تقويم ذاتي' : 'مراجعة عامة'}
          lang={lang}
        />
        <MetaBox label={{ ar: 'القالب', fr: 'Modèle' }} value={lang === 'fr' ? meta.variantFr : meta.variantAr} lang={lang} />
      </section>

      <section className="mt-3 break-inside-avoid">
        <SectionTitle ar="الأهداف والكفايات" fr="Objectifs et compétences" lang={lang} />
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-border px-2.5 py-2 sm:col-span-2">
            <p className="mb-1 text-[7.5px] font-extrabold text-secondary">
              <Label ar="الهدف العام" fr="Objectif général" lang={lang} />
            </p>
            <RichText value={fields.objective} lang={lang} />
          </div>
          <div className="rounded-lg border border-border px-2.5 py-2 sm:col-span-2">
            <p className="mb-1 text-[7.5px] font-extrabold text-secondary">
              <Label ar="الكفاية المستهدفة" fr="Compétence visée" lang={lang} />
            </p>
            <RichText value={fields.competency} lang={lang} />
          </div>
          <div className="rounded-lg border border-border px-2.5 py-2">
            <p className="mb-1 text-[7.5px] font-extrabold text-secondary">
              <Label ar="المكتسبات السابقة" fr="Prérequis" lang={lang} />
            </p>
            <RichText value={fields.prerequisites} lang={lang} />
          </div>
          <div className="rounded-lg border border-border px-2.5 py-2">
            <p className="mb-1 text-[7.5px] font-extrabold text-secondary">
              <Label ar="الوسائل والوسائط" fr="Matériel et supports" lang={lang} />
            </p>
            <RichText value={fields.materials} lang={lang} />
          </div>
        </div>
      </section>

      <section className="mt-3">
        <SectionTitle ar="مراحل الحصة" fr="Déroulement de la séance" lang={lang} />
        <table className="w-full table-fixed border-collapse border border-border text-text">
          <thead>
            <tr className="bg-primary text-white">
              <th className="w-[24%] border border-border px-2 py-1.5 text-start text-[8px] font-extrabold">
                <Label ar="المرحلة" fr="Phase" lang={lang} />
              </th>
              <th className="w-[9%] border border-border px-1 py-1.5 text-center text-[8px] font-extrabold">
                <Label ar="المدة" fr="Durée" lang={lang} />
              </th>
              <th className="border border-border px-2 py-1.5 text-start text-[8px] font-extrabold">
                <Label ar="الأنشطة والمؤشرات" fr="Activités et indicateurs" lang={lang} />
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.phases.map((phase) => (
              <tr key={phase.key} className="break-inside-avoid border-t border-border align-top">
                <td className="border border-border bg-primary/[0.03] px-2 py-1.5">
                  <p className="text-[9px] font-extrabold leading-4 text-primary">
                    <Label ar={phase.labelAr} fr={phase.labelFr} lang={lang} />
                  </p>
                </td>
                <td className="border border-border px-1 py-1.5 text-center text-[9px] font-extrabold text-secondary">
                  {phase.minutes}′
                </td>
                <td className="border border-border px-2 py-1.5">
                  <RichText value={phase.text} lang={lang} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border px-2.5 py-2">
          <p className="mb-1 text-[7.5px] font-extrabold text-secondary">
            <Label ar="التقويم" fr="Évaluation" lang={lang} />
          </p>
          <RichText value={fields.assessment} lang={lang} />
        </div>
        <div className="rounded-lg border border-border px-2.5 py-2">
          <p className="mb-1 text-[7.5px] font-extrabold text-secondary">
            <Label ar="المعالجة والدعم" fr="Remédiation et soutien" lang={lang} />
          </p>
          <RichText value={fields.remediation} lang={lang} />
        </div>
        <div className="rounded-lg border border-border px-2.5 py-2">
          <p className="mb-1 text-[7.5px] font-extrabold text-secondary">
            <Label ar="العمل المنزلي" fr="Travail à la maison" lang={lang} />
          </p>
          <RichText value={fields.homework} lang={lang} />
        </div>
        <div className="rounded-lg border border-border px-2.5 py-2">
          <p className="mb-1 text-[7.5px] font-extrabold text-secondary">
            <Label ar="ملاحظات الأستاذ(ة)" fr="Observations" lang={lang} />
          </p>
          <RichText value={fields.notes} lang={lang} />
        </div>
      </section>

      <section className="mt-4 break-inside-avoid">
        <div className="grid grid-cols-3 gap-3">
          {[
            { ar: 'الأستاذ(ة)', fr: 'Enseignant(e)', value: settings.teacher },
            { ar: 'المدير(ة)', fr: 'Directeur(trice)', value: settings.director },
            { ar: 'المفتش(ة)', fr: 'Inspecteur(trice)', value: settings.inspector },
          ].map((signature) => (
            <div key={signature.ar} className="rounded-lg border border-border px-2.5 py-2 text-center">
              <p className="text-[7.5px] font-extrabold text-muted">
                <Label ar={signature.ar} fr={signature.fr} lang={lang} />
              </p>
              <p className="mt-0.5 min-h-[14px] text-[9px] font-extrabold text-text">{signature.value || '—'}</p>
              <div className="mt-5 border-t border-dashed border-border pt-1 text-[7px] font-bold text-muted">
                <Label ar="التوقيع والتاريخ" fr="Signature et date" lang={lang} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-3 flex flex-wrap items-center justify-between gap-1 border-t border-border pt-1.5 text-[7px] font-semibold leading-4 text-muted">
        <span>
          <Label
            ar="المصدر: التوازيع المرحلية الرسمية للمدرسة الرائدة — مادة الرياضيات."
            fr="Source : répartitions officielles de l'école pionnière — mathématiques."
            lang={lang}
          />
        </span>
        <span className="font-extrabold text-secondary">Modaris Pro · modarispro.com</span>
      </footer>
    </article>
  );
}
