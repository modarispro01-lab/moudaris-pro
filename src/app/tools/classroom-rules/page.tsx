import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = {
  title: "ميثاق وقوانين القسم — ملصق جاهز للطباعة",
  description:
    "أنشئ ميثاق القسم الخاص بك: عنوان، قواعد قابلة للتعديل، ترقيم أو علامات، اتجاه عمودي أو أفقي، وملصق ملوّن جاهز للطباعة وتعليقه داخل القسم.",
  keywords: [
    "ميثاق القسم",
    "قوانين القسم",
    "قواعد القسم",
    "ملصق القسم",
    "انضباط القسم",
    "لوحة حائط للقسم",
  ],
  alternates: { canonical: "/tools/classroom-rules" },
  openGraph: {
    title: "ميثاق وقوانين القسم — ملصق للطباعة | Modaris Pro",
    description: "ميثاق قسم ملوّن بقواعد قابلة للتعديل — جاهز للطباعة والتعليق.",
    url: "https://modarispro.com/tools/classroom-rules",
    type: "website",
    locale: "ar_MA",
  },
};

export default function ClassroomRulesPage() {
  return (
    <>
      <div className="bg-white border-b border-border shadow-sm">
        <ShareButtons />
      </div>
      <iframe
        src="/apps/classroom-rules.html"
        title="ميثاق وقوانين القسم"
        style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
      />
    </>
  );
}
