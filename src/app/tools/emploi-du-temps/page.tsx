import ToolFrame from "@/components/ToolFrame";

export const metadata = {
  title: 'استعمال الزمن — فترة الدعم المكثف 2026/2027',
  description: 'أداة استعمال الزمن الخاصة بفترة الدعم المكثف: أفواج، مستويات، مسارات، وطباعة A4 أفقية جاهزة للتوقيع.',
};

export default function EmploiDuTempsPage() {
  return (
    <ToolFrame
      src="/apps/emploi-du-temps.html"
      title="استعمال الزمن — فترة الدعم المكثف"
    />
  );
}
