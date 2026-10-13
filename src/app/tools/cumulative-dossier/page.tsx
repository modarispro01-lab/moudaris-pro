import type { Metadata } from "next";
import ToolFrame from "@/components/ToolFrame";

export const metadata: Metadata = {
  title: "الملف التراكمي للأستاذ — فواصل ومكوّنات جاهزة للطباعة",
  description:
    "أنشئ فواصل ومكوّنات الملف التراكمي للأستاذ: الوثائق الإدارية، الشهادات، التقارير، المذكرات، شبكات التقويم، أنشطة الدعم. غلاف وفهرس وفواصل مرقّمة، جاهزة للطباعة A4.",
  keywords: [
    "الملف التراكمي للأستاذ",
    "فواصل الملف التراكمي",
    "مكونات الملف التراكمي",
    "وثائق الأستاذ",
    "ملف الأستاذ الابتدائي",
  ],
  alternates: { canonical: "/tools/cumulative-dossier" },
  openGraph: {
    title: "الملف التراكمي للأستاذ — فواصل جاهزة للطباعة | Modaris Pro",
    description: "غلاف + فهرس + فواصل مرقّمة لكل أقسام الملف التراكمي — مجاناً.",
    url: "https://modarispro.com/tools/cumulative-dossier",
    type: "website",
    locale: "ar_MA",
  },
};

export default function CumulativeDossierPage() {
  return <ToolFrame src="/apps/cumulative-dossier.html" title="الملف التراكمي للأستاذ" />;
}
