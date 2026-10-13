import type { Metadata } from "next";
import ToolFrame from "@/components/ToolFrame";

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
  return <ToolFrame src="/apps/teacher-card.html" title="البطاقة الشخصية للأستاذ" />;
}
