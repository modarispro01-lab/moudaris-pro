import type { Metadata } from "next";
import TimetableGenerator from "@/components/timetable/TimetableGenerator";

export const metadata: Metadata = {
  title: "مولّد استعمال الزمن — التعليم الصريح 2026/2027",
  description:
    "أنشئ استعمال الزمن الأسبوعي لفترة التعليم الصريح: اختر أيام العمل، واضبط توقيت الحصص بحرّية، ووزّع المواد، واختر القالب، ثم حمّل الوثيقة جاهزة للطباعة PDF — مجانًا وبدون تسجيل.",
  keywords: [
    "استعمال الزمن",
    "التعليم الصريح",
    "استعمال الزمن الأسبوعي",
    "مولّد استعمال الزمن",
    "المذكرة اليومية",
    "التعليم الابتدائي المغرب",
    "أدوات الأستاذ",
    "emploi du temps",
    "timetable maroc",
  ],
  alternates: { canonical: "/tools/timetable-generator" },
  openGraph: {
    title: "مولّد استعمال الزمن — التعليم الصريح | Modaris Pro",
    description:
      "استعمال الزمن الأسبوعي للتعليم الصريح: توقيت حرّ، توزيع المواد، قوالب متعدّدة، وطباعة A4.",
    url: "https://modarispro.com/tools/timetable-generator",
    type: "website",
    locale: "ar_MA",
  },
};

export default function TimetableGeneratorPage() {
  return <TimetableGenerator />;
}
