import type { Metadata } from "next";
import "@/components/daily-memo/memo.css";
import DailyMemoApp from "@/components/daily-memo/DailyMemoApp";
import { loadCatalog } from "@/lib/enseignement-explicite";

export const metadata: Metadata = {
  title: "المذكرة اليومية الاحترافية — التعليم الصريح",
  description:
    "مذكرة يومية احترافية للتعليم الصريح في الرياضيات: موضوع الدرس من توزيع الوزارة للمستويين الأول والثاني، مع حقول قابلة للتعديل وطباعة A4 على صفحة واحدة.",
  keywords: [
    "المذكرة اليومية",
    "المذكرة اليومية الاحترافية",
    "التعليم الصريح",
    "توزيع الرياضيات",
    "المستوى الأول",
    "المستوى الثاني",
    "مذكرة الأستاذ",
    "الرياضيات الابتدائي",
    "fiche de préparation",
    "enseignement explicite",
  ],
  alternates: { canonical: "/tools/daily-memo-explicit" },
  openGraph: {
    title: "المذكرة اليومية الاحترافية — التعليم الصريح | Modaris Pro",
    description:
      "من توزيع الرياضيات الرسمي إلى مذكرة يومية منظمة وقابلة للتعديل، جاهزة للطباعة على صفحة A4 واحدة.",
    url: "https://modarispro.com/tools/daily-memo-explicit",
    type: "website",
    locale: "ar_MA",
  },
};

export default function DailyMemoExplicitPage() {
  const catalog = loadCatalog();
  return <DailyMemoApp catalog={catalog} />;
}
