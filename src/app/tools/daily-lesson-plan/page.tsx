import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = {
  title: "المذكرة اليومية للدعم المكثف 2026/2027 | Modaris Pro",
  description:
    "أداة احترافية لتوليد وطباعة المذكرة اليومية للدعم المكثف وفق المصفوفات الرسمية 2026/2027 — عربية، فرنسية، رياضيات — لجميع المستويات والمسارات، مع طبعة أسبوعية كاملة.",
  alternates: { canonical: "/tools/daily-lesson-plan" },
  openGraph: {
    title: "المذكرة اليومية للدعم المكثف 2026/2027 | Modaris Pro",
    description:
      "ولّد مذكرتك في دقيقة واطبعها بصيغة A4 احترافية — مجانية 100%.",
    url: "https://modarispro.com/tools/daily-lesson-plan",
    type: "website",
    locale: "ar_MA",
  },
};

export default function DailyLessonPlanPage() {
  return (
    <>
      {/* ===== شريط المشاركة: يظهر فوراً فوق الأداة ===== */}
      <div className="bg-white border-b border-border shadow-sm">
        <ShareButtons />
      </div>

      {/* ===== الأداة (بدون أي تغيير عن نسختك) ===== */}
      <iframe
        src="/apps/moudhira.html?v=7.3"
        title="المذكرة اليومية الاحترافية"
        style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
        allow="clipboard-write"
      />
    </>
  );
}