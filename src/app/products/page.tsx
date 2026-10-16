import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Gem, Layers, Printer, ShieldCheck } from "lucide-react";

import { PRODUCTS } from "@/lib/products";

export const metadata: Metadata = {
  title: "المنتجات الرقمية",
  description:
    "منتجات رقمية جاهزة للطباعة للأستاذ المغربي: حزم ملفّات PDF للقسم والدعم. كل منتج موصوف بدقّة مع صور حقيقية من الملفّات.",
  keywords: ["منتجات رقمية", "ملفات جاهزة للطباعة", "أستاذ مغربي", "حروفي", "Modaris Pro"],
  alternates: { canonical: "/products" },
  openGraph: {
    title: "المنتجات الرقمية | Modaris Pro",
    description: "حزم ملفّات PDF جاهزة للطباعة للأستاذ المغربي — بوصف دقيق وصور حقيقية.",
    url: "https://modarispro.com/products",
  },
};

const ASSURANCES = [
  { icon: Printer, title: "جاهز للطباعة", desc: "ملفّات PDF بمقاسَي A4 و US Letter، بلا حاجة لتعديل." },
  { icon: Layers, title: "منظَّم بالحرف", desc: "كل حرف في صفحة واحدة واضحة، لطبع ما تحتاجه فقط." },
  { icon: ShieldCheck, title: "وصف صادق", desc: "نقول بالضبط ما في الحزمة وما ليس فيها — بلا مبالغة." },
];

export default function ProductsPage() {
  return (
    <>
      {/* ===== الهيرو ===== */}
      <section className="relative overflow-hidden bg-primary py-14 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary via-primary to-secondary" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-accent">
            <Gem className="w-4 h-4" />
            المنتجات الرقمية
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-white md:text-5xl">
            حزم جاهزة توفر عليك وقت التحضير
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80 md:text-lg">
            ملفّات PDF مدروسة للطباعة المباشرة في القسم. تُعرض هنا بوصف دقيق وصور حقيقية من الملفّات
            نفسها — لا صور دعائية.
          </p>
        </div>
      </section>

      {/* ===== قائمة المنتجات ===== */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-background">
                  <Image
                    src={product.hero.src}
                    alt={`${product.name} — ${product.latinName}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-extrabold text-text">
                      {product.name} <span className="text-sm font-bold text-muted">| {product.latinName}</span>
                    </h2>
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                      {product.ageLabel}
                    </span>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{product.tagline}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-sm font-bold text-secondary">
                      {product.pagesPerSize} صفحة لكل مقاس
                    </span>
                    <span className="text-sm font-extrabold text-primary group-hover:underline">
                      التفاصيل ←
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* بطاقة «قريبًا» */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background p-8 text-center">
              <span className="text-3xl" aria-hidden="true">🧩</span>
              <h2 className="mt-3 text-lg font-extrabold text-text">منتجات قادمة</h2>
              <p className="mt-2 text-sm text-muted">
                نضيف منتجات جديدة تدريجيًّا. كل منتج يُنشر هنا بوصف دقيق وصور حقيقية.
              </p>
            </div>
          </div>

          {/* ===== ضمانات ===== */}
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {ASSURANCES.map((a) => (
              <div key={a.title} className="rounded-2xl border border-border bg-surface p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <a.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-extrabold text-text">{a.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
