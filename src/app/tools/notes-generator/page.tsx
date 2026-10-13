import type { Metadata } from "next";
import ToolFrame from "@/components/ToolFrame";

export const metadata: Metadata = {
  title: "مولّد الملاحظات التقديرية للتلاميذ",
  description:
    "ولّد الملاحظات التقديرية للتلاميذ تلقائياً حسب المعدّل، بثلاث نبرات (تشجيعية، متوازنة، واضحة)، وقابلة للتعديل قبل الطباعة. جدول أو لائحة، جاهز للنسخ في البطاقة.",
  keywords: [
    "الملاحظات التقديرية",
    "ملاحظات الأستاذ",
    "ملاحظات التلاميذ",
    "تقييم التلاميذ",
    "البطاقة المدرسية",
    "ملاحظات حسب المعدل",
  ],
  alternates: { canonical: "/tools/notes-generator" },
  openGraph: {
    title: "مولّد الملاحظات التقديرية للتلاميذ | Modaris Pro",
    description: "ملاحظات جاهزة لكل تلميذ حسب معدّله — قابلة للتعديل والطباعة.",
    url: "https://modarispro.com/tools/notes-generator",
    type: "website",
    locale: "ar_MA",
  },
};

export default function NotesGeneratorPage() {
  return <ToolFrame src="/apps/notes-generator.html" title="مولّد الملاحظات التقديرية" />;
}
