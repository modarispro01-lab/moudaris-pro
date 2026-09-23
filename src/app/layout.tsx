import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "MoudarisPro | كل أدوات الأستاذ المغربي في مكان واحد",
    template: "%s | MoudarisPro",
  },
  description:
    "منصة رقمية متكاملة للأستاذ المغربي: موارد تعليمية، أدوات رقمية، وثائق جاهزة، ومستجدات تربوية. جذاذات، مذكرات، توازيع، فروض والمزيد.",
  keywords: [
    "أستاذ مغربي",
    "موارد تعليمية",
    "جذاذات",
    "مذكرات دراسية",
    "توزيع سنوي",
    "فروض",
    "التعليم الابتدائي المغرب",
    "MoudarisPro",
    "منصة تعليمية",
  ],
  authors: [{ name: "MoudarisPro" }],
  creator: "MoudarisPro",
  publisher: "MoudarisPro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://moudarispro.vercel.app"), // سنغيرها لاحقاً
  openGraph: {
    type: "website",
    locale: "ar_MA",
    url: "https://moudarispro.vercel.app",
    siteName: "MoudarisPro",
    title: "MoudarisPro | كل أدوات الأستاذ المغربي في مكان واحد",
    description:
      "منصة رقمية متكاملة للأستاذ المغربي: موارد تعليمية، أدوات رقمية، وثائق جاهزة، ومستجدات تربوية.",
    images: [
      {
        url: "/og-image.png", // صورة افتراضية (سنضيفها لاحقاً)
        width: 1200,
        height: 630,
        alt: "MoudarisPro - منصة الأستاذ المغربي",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoudarisPro | كل أدوات الأستاذ المغربي في مكان واحد",
    description:
      "منصة رقمية متكاملة للأستاذ المغربي: موارد تعليمية، أدوات رقمية، وثائق جاهزة، ومستجدات تربوية.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}