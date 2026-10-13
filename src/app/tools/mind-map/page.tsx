import type { Metadata } from "next";
import ToolFrame from "@/components/ToolFrame";

export const metadata: Metadata = {
  title: "الخريطة الذهنية للحصة — المذكرة اليومية | Modaris Pro",
  description:
    "صمّم المذكرة اليومية على شكل خريطة ذهنية حسب المادة (عربية، فرنسية، رياضيات) والمستوى، وفق مراحل التعليم الصريح الرسمية، مع تعديل مباشر وطباعة A4 بلا علامة مائية.",
  keywords: [
    "الخريطة الذهنية للحصة",
    "المذكرة اليومية",
    "خطاطة ذهنية",
    "التعليم الصريح",
    "مذكرة الأستاذ",
    "مدارس الريادة",
    "carte mentale",
    "fiche journalière",
  ],
  alternates: { canonical: "/tools/mind-map" },
  openGraph: {
    title: "الخريطة الذهنية للحصة — المذكرة اليومية | Modaris Pro",
    description:
      "المذكرة اليومية في شكل خريطة ذهنية — عربية · فرنسية · رياضيات، جاهزة للطباعة A4.",
    url: "https://modarispro.com/tools/mind-map",
    type: "website",
    locale: "ar_MA",
  },
};

export default function MindMapPage() {
  return (
    <ToolFrame
      src="/apps/mind-map.html?v=1.0"
      title="الخريطة الذهنية للحصة — المذكرة اليومية"
      allow="clipboard-write"
    />
  );
}
