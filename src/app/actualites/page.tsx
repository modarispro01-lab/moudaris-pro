import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';
import type { Metadata } from "next";

// ===== Meta Tags للـ SEO =====
export const metadata: Metadata = {
  title: "المستجدات التربوية والأخبار",
  description:
    "آخر المذكرات الوزارية، البلاغات، الإعلانات التعليمية، نتائج المباريات والحركات الانتقالية للأستاذ المغربي.",
  keywords: [
    "مذكرات وزارية",
    "بلاغات",
    "إعلانات تعليمية",
    "مباريات التوظيف",
    "حركة انتقالية",
    "مستجدات تربوية",
    "المغرب",
  ],
};

// ===== المكون الرئيسي للصفحة =====
export default async function ActualitesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* ===== الهيدر ===== */}
      <section className="bg-primary py-12">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            المستجدات التربوية
          </h1>
          <p className="text-white/80 text-base">
            آخر المذكرات والبلاغات والإعلانات التعليمية
          </p>
        </div>
      </section>

      {/* ===== شبكة الأخبار ===== */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        {articles.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-border">
            <p className="text-muted text-lg">لا توجد أخبار منشورة حالياً.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article
                key={article.id}
                className="group bg-surface rounded-2xl border border-border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
              >
                {/* شريط التصنيف الملون */}
                <div className="bg-gradient-to-l from-primary to-secondary px-4 py-2">
                  <span className="text-white text-xs font-bold flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {article.category}
                  </span>
                </div>

                <div className="p-6">
                  <h2 className="text-lg font-extrabold text-text mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h2>

                  <p className="text-sm text-muted mb-4 line-clamp-3 leading-relaxed">
                    {article.content}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.publishedAt).toLocaleDateString('ar-MA')}
                    </span>
                    <Link
                      href={`/actualites/${article.slug}`}
                      className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      اقرأ المزيد <ArrowLeft className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}