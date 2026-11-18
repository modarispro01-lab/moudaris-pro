import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WorkspaceDiag from "./WorkspaceDiag";

export const metadata: Metadata = {
  title: "تشخيص مساحة العمل",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <WorkspaceDiag />;
}
