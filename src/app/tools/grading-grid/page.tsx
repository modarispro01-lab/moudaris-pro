import type { Metadata } from "next";
import ToolFrame from "@/components/ToolFrame";

export const metadata: Metadata = {
  title: "شبكات التنقيط والتفريغ — مع حساب المعدل والرتبة",
  description:
    "أنشئ شبكة التنقيط والتفريغ لقسمك: لائحة التلاميذ، أعمدة النقط، حساب تلقائي للمجموع والمعدل والرتبة والملاحظة، وطباعة A4 عربية جاهزة للتوقيع.",
  keywords: [
    "شبكات التنقيط",
    "شبكة التفريغ",
    "نقط التلاميذ",
    "معدل التلميذ",
    "المراقبة المستمرة",
    "دفتر التنقيط",
  ],
  alternates: { canonical: "/tools/grading-grid" },
  openGraph: {
    title: "شبكات التنقيط والتفريغ مع حساب المعدل | Modaris Pro",
    description: "شبكة نقاط جاهزة للطباعة مع حساب تلقائي للمجموع والمعدل والرتبة — مجاناً.",
    url: "https://modarispro.com/tools/grading-grid",
    type: "website",
    locale: "ar_MA",
  },
};

export default function GradingGridPage() {
  return <ToolFrame src="/apps/grading-grid.html" title="شبكات التنقيط والتفريغ" />;
}
