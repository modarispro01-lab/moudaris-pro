import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = {
  title: "بطاقات أسماء التلاميذ (Affichettes) للطباعة",
  description:
    "أنشئ بطاقات أسماء التلاميذ لطاولات القسم (Affichettes): من 2 إلى 12 بطاقة في الورقة، خط تلقائي حسب الحجم، جاهزة للقصّ والطباعة على ورق مقوّى.",
  keywords: [
    "بطاقات أسماء التلاميذ",
    "affichettes",
    "بطاقات الطاولات",
    "أسماء التلاميذ للطباعة",
    "تنظيم القسم",
    "ديكور القسم",
  ],
  alternates: { canonical: "/tools/name-tags" },
  openGraph: {
    title: "بطاقات أسماء التلاميذ للطباعة | Modaris Pro",
    description: "بطاقات أسماء أنيقة لطاولات القسم — جاهزة للقصّ والطباعة.",
    url: "https://modarispro.com/tools/name-tags",
    type: "website",
    locale: "ar_MA",
  },
};

export default function NameTagsPage() {
  return (
    <>
      <div className="bg-white border-b border-border shadow-sm">
        <ShareButtons />
      </div>
      <iframe
        src="/apps/name-tags.html"
        title="بطاقات أسماء التلاميذ"
        style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
      />
    </>
  );
}
