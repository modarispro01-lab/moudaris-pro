import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = {
  title: "مولّد شواهد التقدير والتشجيع للتلاميذ",
  description:
    "أنشئ شواهد التقدير والتشجيع لتلاميذك: شهادة تفوّق، تقدير، مشاركة، مواظبة وتشجيعية. تصميم أنيق بإطار مزخرف وخاتم، ورقة A4 لكل تلميذ، جاهزة للطباعة.",
  keywords: [
    "شواهد التقدير",
    "شهادة تفوّق",
    "شواهد التشجيع",
    "شهادة تقدير للتلميذ",
    "شواهد مدرسية جاهزة للطباعة",
    "جوائز التلاميذ",
  ],
  alternates: { canonical: "/tools/certificates" },
  openGraph: {
    title: "مولّد شواهد التقدير والتشجيع | Modaris Pro",
    description: "شهادة أنيقة لكل تلميذ: تفوّق، تقدير، مشاركة، مواظبة — جاهزة للطباعة.",
    url: "https://modarispro.com/tools/certificates",
    type: "website",
    locale: "ar_MA",
  },
};

export default function CertificatesPage() {
  return (
    <>
      <div className="bg-white border-b border-border shadow-sm">
        <ShareButtons />
      </div>
      <iframe
        src="/apps/certificates.html"
        title="مولّد شواهد التقدير والتشجيع"
        style={{ width: "100%", height: "100vh", border: "none", display: "block" }}
      />
    </>
  );
}
