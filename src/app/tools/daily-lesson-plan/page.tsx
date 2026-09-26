// src/app/tools/daily-lesson-plan/page.tsx
export const metadata = {
  title: 'المذكرة اليومية الاحترافية — الدعم المكثف 2026/2027',
};

export default function DailyLessonPlanPage() {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="/apps/moudhira.html"
        title="المذكرة اليومية الاحترافية"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  );
}