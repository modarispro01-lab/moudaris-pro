import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, Printer, ShieldCheck } from "lucide-react";

import { HUROOFI, HUROOFI_TOTAL_PAGES } from "@/lib/products";

export const metadata: Metadata = {
  title: `${HUROOFI.name} — ${HUROOFI.tagline}`,
  description:
    "حزمة ملفّات PDF جاهزة للطباعة لتعلّم الحروف العربية (٣–٧ سنوات): ٢٨ بوسترًا، ٢٨ ورقة عمل، بطاقات، ألعاب بمفاتيح إجابات، لوحة مكافآت ودليل — بمقاسَي A4 و US Letter. وصف دقيق وصور حقيقية.",
  keywords: [
    "حروفي",
    "الحروف العربية",
    "بوسترات الحروف",
    "أوراق عمل للطباعة",
    "تعليم ابتدائي المغرب",
    "ملفات PDF للأساتذة",
    "الروض",
    "المستوى الأول",
  ],
  alternates: { canonical: "/products/huroofi" },
  openGraph: {
    title: `${HUROOFI.name} — ${HUROOFI.latinName}`,
    description:
      "١٠٢ صفحة لكل مقاس: بوسترات وأوراق عمل وبطاقات وألعاب لتعلّم الحروف العربية. جاهزة للطباعة.",
    url: "https://modarispro.com/products/huroofi",
    images: [{ url: HUROOFI.ogImage, width: 1200, height: 630, alt: "حروفي — حزمة الحروف العربية" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${HUROOFI.name} — ${HUROOFI.latinName}`,
    images: [HUROOFI.ogImage],
  },
};

export default function HuroofiProductPage() {
  const purchasable = HUROOFI.purchase.enabled && HUROOFI.purchase.checkoutUrl.startsWith("http");

  // بيانات منظّمة دقيقة: لا نضيف «عرضًا» (offers) قبل توفّر نظام دفع حقيقي.
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: `${HUROOFI.name} — ${HUROOFI.latinName}`,
        description: HUROOFI.summary,
        image: [HUROOFI.ogImage, HUROOFI.hero.src],
        brand: { "@type": "Brand", name: "Modaris Pro" },
        category: "EducationalResource",
        audience: { "@type": "EducationalAudience", educationalRole: "teacher" },
        inLanguage: "ar",
        ...(purchasable
          ? {
              offers: {
                "@type": "Offer",
                priceCurrency: "MAD",
                price: HUROOFI.price.mad,
                url: HUROOFI.purchase.checkoutUrl,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: "https://modarispro.com/" },
          { "@type": "ListItem", position: 2, name: "المنتجات الرقمية", item: "https://modarispro.com/products" },
          { "@type": "ListItem", position: 3, name: HUROOFI.name, item: "https://modarispro.com/products/huroofi" },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ===== الهيرو ===== */}
      <section className="relative overflow-hidden bg-primary py-14 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary via-primary to-secondary" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-2">
          <div>
            <nav className="mb-4 text-xs font-bold text-white/60" aria-label="مسار التنقل">
              <Link href="/products" className="hover:text-white">
                المنتجات الرقمية
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white/90">{HUROOFI.name}</span>
            </nav>
            <h1 className="text-3xl font-extrabold text-white md:text-5xl">{HUROOFI.name}</h1>
            <p className="mt-2 text-lg font-bold text-accent">{HUROOFI.latinName}</p>
            <p className="mt-4 max-w-xl leading-relaxed text-white/80">{HUROOFI.summary}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-white">
              <span className="rounded-full bg-white/10 px-4 py-1.5">{HUROOFI.ageLabel}</span>
              <span className="rounded-full bg-white/10 px-4 py-1.5">
                {HUROOFI_TOTAL_PAGES} صفحة لكل مقاس
              </span>
              <span className="rounded-full bg-white/10 px-4 py-1.5">A4 + US Letter</span>
              <span className="rounded-full bg-white/10 px-4 py-1.5">{HUROOFI.audience}</span>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border-4 border-white/10 shadow-2xl">
            <Image
              src={HUROOFI.hero.src}
              alt="حروفي — بوسترات وأوراق عمل وبطاقات الحروف العربية"
              width={HUROOFI.hero.width}
              height={HUROOFI.hero.height}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* ===== العمود الرئيسي ===== */}
          <div className="space-y-10">
            {/* ما هو؟ */}
            <section>
              <h2 className="mb-4 text-2xl font-extrabold text-primary">ما هي هذه الحزمة؟</h2>
              <div className="rounded-2xl border border-border bg-surface p-6">
                <p className="leading-relaxed text-text">{HUROOFI.teacherNote}</p>
                <div className="mt-4 flex gap-3 rounded-xl border border-accent/30 bg-accent/5 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="text-sm font-bold leading-relaxed text-text">{HUROOFI.notAnApp}</p>
                </div>
              </div>
            </section>

            {/* المحتوى */}
            <section>
              <h2 className="mb-4 text-2xl font-extrabold text-primary">
                ماذا يوجد داخل الحزمة؟
                <span className="ms-2 text-base font-bold text-muted">
                  ({HUROOFI_TOTAL_PAGES} صفحة لكل مقاس)
                </span>
              </h2>
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <table className="w-full text-right text-sm">
                  <thead className="bg-background text-muted">
                    <tr>
                      <th className="px-4 py-3 font-bold">الملف</th>
                      <th className="px-4 py-3 font-bold">المحتوى</th>
                      <th className="px-4 py-3 font-bold whitespace-nowrap">الصفحات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HUROOFI.contents.map((doc) => (
                      <tr key={doc.file} className="border-t border-border">
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2 font-extrabold text-text">
                            <FileText className="h-4 w-4 text-secondary" />
                            {doc.title}
                          </span>
                          <span dir="ltr" className="mt-1 block font-mono text-xs text-muted">
                            {doc.file}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted">{doc.detail}</td>
                        <td className="px-4 py-3 font-bold text-primary">{doc.pages}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* الصور */}
            <section>
              <h2 className="mb-2 text-2xl font-extrabold text-primary">صور حقيقية من الملفّات</h2>
              <p className="mb-4 text-sm text-muted">
                ليست صورًا تجارية — هذه صفحات فعلية من الحزمة النهائية.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {HUROOFI.gallery.map((img) => (
                  <figure key={img.src} className="overflow-hidden rounded-2xl border border-border bg-surface">
                    <Image
                      src={img.src}
                      alt={img.caption}
                      width={img.width}
                      height={img.height}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="h-auto w-full"
                    />
                    <figcaption className="px-3 py-2.5 text-center text-xs font-bold text-muted">
                      {img.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>

            {/* المقاسان */}
            <section>
              <h2 className="mb-4 text-2xl font-extrabold text-primary">مقاسان: A4 و US Letter</h2>
              <div className="overflow-hidden rounded-2xl border border-border bg-surface p-4">
                <Image
                  src={HUROOFI.sizesImage.src}
                  alt="مقارنة بين مقاس A4 ومقاس US Letter"
                  width={HUROOFI.sizesImage.width}
                  height={HUROOFI.sizesImage.height}
                  className="h-auto w-full rounded-xl"
                />
              </div>
            </section>

            {/* الأسئلة */}
            <section>
              <h2 className="mb-4 text-2xl font-extrabold text-primary">أسئلة شائعة</h2>
              <div className="space-y-3">
                {HUROOFI.faq.map((item) => (
                  <details key={item.q} className="group rounded-2xl border border-border bg-surface p-5 open:bg-background">
                    <summary className="cursor-pointer font-extrabold text-text">{item.q}</summary>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* ===== الشريط الجانبي ===== */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-primary">{HUROOFI.price.mad}</span>
                <span className="text-lg font-bold text-text">درهم</span>
                <span className="text-sm text-muted">≈ {HUROOFI.price.eur} يورو</span>
              </div>
              <p className="mt-1 text-xs text-muted">{HUROOFI.price.note}</p>

              {purchasable ? (
                <a
                  href={HUROOFI.purchase.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-white transition-colors hover:bg-accent/90"
                >
                  اشترِ الآن{HUROOFI.purchase.providerLabel ? ` عبر ${HUROOFI.purchase.providerLabel}` : ""}
                </a>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-border bg-background p-4">
                  <p className="text-sm font-extrabold text-text">🕓 الشراء قيد التجهيز</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    لم نُفعّل أي دفع بعد، ولن نضع زرّ شراء وهميًّا. سيظهر هنا الرابط الحقيقي بعد ربط
                    بوابة دفع، ثم تُسلَّم الملفّات فورًا.
                  </p>
                </div>
              )}

              <ul className="mt-5 space-y-2 text-sm">
                {HUROOFI.delivery.map((step) => (
                  <li key={step} className="flex gap-2 text-muted">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-t border-border pt-4">
                <p className="flex items-center gap-2 text-sm font-extrabold text-text">
                  <ShieldCheck className="h-4 w-4 text-secondary" />
                  الترخيص
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{HUROOFI.license}</p>
              </div>

              <div className="mt-5 border-t border-border pt-4">
                <p className="flex items-center gap-2 text-sm font-extrabold text-text">
                  <Printer className="h-4 w-4 text-secondary" />
                  جاهز للطباعة
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  ملفّات PDF بمقاسَي A4 و US Letter، تعمل دون إنترنت بعد التنزيل.
                </p>
              </div>
            </div>

            <Link
              href="/products"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold text-primary hover:bg-background"
            >
              <ArrowRight className="h-4 w-4" />
              كل المنتجات
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
