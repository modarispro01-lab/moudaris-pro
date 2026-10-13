import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = {
  title: "مولّد واجهات وأغلفة الملفات التربوية",
  description:
    "صمّم واجهة ملفّك التربوي في دقائق: أغلفة المذكرة اليومية، التوزيع السنوي، الجذاذات، الفروض والملف التراكمي. قوالب ألوان متعددة، مقاس A4، جاهزة للطباعة بلا علامة مائية.",
  keywords: [
    "واجهات الملفات التربوية",
    "غلاف المذكرة اليومية",
    "واجهة الملف التراكمي",
    "أغلفة جاهزة للطباعة",
    "وثائق الأستاذ المغربي",
  ],
  alternates: { canonical: "/tools/cover-generator" },
  openGraph: {
    title: "مولّد واجهات وأغلفة الملفات التربوية | Modaris Pro",
    description: "أنشئ واجهة ملفك التربوي واطبعها A4 بلا علامة مائية — مجاناً.",
    url: "https://modarispro.com/tools/cover-generator",
    type: "website",
    locale: "ar_MA",
  },
};

export default function CoverGeneratorPage() {
  return (
    <>
      <div className="bg-white border-b border-border shadow-sm">
        <ShareButtons />
      </div>
      <iframe
        src="/apps/cover-generator.html"
        title="مولّد واجهات وأغلفة الملفات"
        style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
      />
    </>
  );
}
