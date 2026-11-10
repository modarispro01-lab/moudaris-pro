import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadCatalog } from "@/lib/enseignement-explicite";
import WeekDiag from "./WeekDiag";

export const metadata: Metadata = {
  title: "تشخيص مذكرة الأسبوع",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  const catalog = loadCatalog();
  return <WeekDiag catalog={catalog} />;
}
