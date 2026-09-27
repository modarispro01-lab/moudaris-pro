export const metadata = {
  title: 'استعمال الزمن — فترة الدعم المكثف 2026/2027',
  description: 'أداة استعمال الزمن الخاصة بفترة الدعم المكثف: أفواج، مستويات، مسارات، وطباعة A4 أفقية جاهزة للتوقيع.',
};

export default function EmploiDuTempsPage() {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="/apps/emploi-du-temps.html"
        title="استعمال الزمن — فترة الدعم المكثف"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  );
}