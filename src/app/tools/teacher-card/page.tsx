import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = {
  title: "البطاقة الشخصية للأستاذ — عربية وفرنسية للطباعة",
  description:
    "أنشئ البطاقة الشخصية للأستاذ بالعربية والفرنسية: المعلومات الشخصية والإدارية والمهنية والشهادات، في ورقة A4 واحدة جاهزة للطباعة والتوقيع.",
  keywords: [
    "البطاقة الشخصية للأستاذ",
    "بطاقة الأستاذ",
    "fiche de l'enseignant",
    "وثائق الأستاذ المغربي",
    "بطاقة الأستاذ للطباعة",
  ],
  alternates: { canonical: "/tools/teacher-card" },
  openGraph: {
    title: "البطاقة الشخصية للأستاذ — عربية وفرنسية | Modaris Pro",
    description: "بطاقة الأستاذ الرسمية: شخصية وإدارية ومهنية وشهادات — جاهزة للطباعة.",
    url: "https://modarispro.com/tools/teacher-card",
    type: "website",
    locale: "ar_MA",
  },
};

export default function TeacherCardPage() {
  return (
    <>
      <div className="bg-white border-b border-border shadow-sm">
        <ShareButtons />
      </div>
      <iframe
        src="/apps/teacher-card.html"
        title="البطاقة الشخصية للأستاذ"
        style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
      />
    </>
  );
}
