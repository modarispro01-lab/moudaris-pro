import CookieBanner from "@/components/CookieBanner";
import JsonLd from "@/components/JsonLd";
import AdSense from "@/components/AdSense";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Modaris Pro | كل أدوات الأستاذ المغربي في مكان واحد",
    template: "%s | Modaris Pro",
  },
  description:
    "منصة Modaris Pro الرقمية للأستاذ المغربي: موارد تعليمية، أدوات رقمية (المذكرة اليومية للدعم المكثف)، وثائق جاهزة، ومستجدات تربوية. جذاذات، مذكرات، توازيع، فروض والمزيد.",
  keywords: [
    "أستاذ مغربي",
    "موارد تعليمية",
    "جذاذات",
    "مذكرات دراسية",
    "توزيع سنوي",
    "فروض",
    "الدعم المكثف",
    "المذكرة اليومية",
    "التعليم الابتدائي المغرب",
    "Modaris Pro",
    "منصة تعليمية",
  ],
  authors: [{ name: "Modaris Pro" }],
  creator: "Modaris Pro",
  publisher: "Modaris Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://modarispro.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_MA",
    url: "https://modarispro.com",
    siteName: "Modaris Pro",
    title: "Modaris Pro | كل أدوات الأستاذ المغربي في مكان واحد",
    description:
      "منصة رقمية متكاملة للأستاذ المغربي: موارد تعليمية، أدوات رقمية، وثائق جاهزة، ومستجدات تربوية.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Modaris Pro - منصة الأستاذ المغربي",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Modaris Pro | كل أدوات الأستاذ المغربي في مكان واحد",
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
  other: {
    "color-scheme": "light dark",
  },
};

/* سكربت الثيم المانع للوميض: يُنفَّذ قبل أول رسم ويضع data-theme على
   <html> (اختيار محفوظ في localStorage، وإلا يتبع prefers-color-scheme).
   يوضع في <head> يدويًا: قياسًا فعليًا، قبلInteractive في Next 16/Turbopack
   يؤجل التنفيذ إلى طابور __next_s بعد أول رسم (وميض)، بينما السكربت
   المضمّن في <head> حاجب ويُنفَّذ قبل أول رسم. */
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme")}catch(e){}if(t!=="dark"&&t!=="light"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      {/* suppressHydrationWarning على <head> والسكربت: امتدادات المتصفح
          (مثل popups-script.js) تحقن عقدًا في <head> قبل التميؤ فيظهر
          اختلاف خادم/عميل لا علاقة له بالتطبيق */}
      <head suppressHydrationWarning>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        {/* سكربت منع الوميض انتقل إلى <head> أعلاه */}
        {/* ===== البيانات المنظمة JSON-LD (تُقرأ في كل الصفحات) ===== */}
        <JsonLd />

        {/* ===== Google Consent Mode v2 (سياسة الموافقة) ===== */}
        {/* افتراضياً: مرفوض لدى الاتحاد الأوروبي/المملكة المتحدة/سويسرا، ممنوح في باقي العالم (منه المغرب). */}
        <Script id="google-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              region: ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH']
            });
            gtag('consent', 'default', {
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
              analytics_storage: 'granted'
            });
          `}
        </Script>

        {/* ===== Google AdSense ===== */}
        <AdSense />

        {/* ===== Google Analytics 4 ===== */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-151Z26Z7NZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-151Z26Z7NZ');
          `}
        </Script>
        {/* =============================== */}

        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />

        {/* ===== لافتة الكوكيز (تطفو فوقكل شيء) ===== */}
        <CookieBanner />
      </body>
    </html>
  );
}