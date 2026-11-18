import type { Metadata } from "next";
import "@/components/daily-memo/memo.css";
import "@/components/week-memo/week-memo.css";
import { loadCatalog } from "@/lib/enseignement-explicite";
import WeekMemoApp from "@/components/week-memo/WeekMemoApp";

export const metadata: Metadata = {
  title: "مذكرة الأسبوع — Modaris Pro",
  description:
    "من استعمال الزمن إلى مذكرة أسبوع كاملة قابلة للتعديل والطباعة A4، مع موضوع كل حصة من التوزيع الرسمي.",
  alternates: { canonical: "/tools/week-memo" },
};

export default function Page() {
  const catalog = loadCatalog();
  return <WeekMemoApp catalog={catalog} />;
}
