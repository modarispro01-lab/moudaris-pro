import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Calendar, Tag, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

// دالة جلب الخبر من قاعدة البيانات
async function getArticle(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) {
    return null;
  }

  return article;
}

// المكون الرئيسي للصفحة
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  // جلب أخبار أخرى ذات صلة (من نفس التصنيف)
  const relatedArticles = await prisma.article.findMany({
    where: {
      category: article.category,
      NOT: { id: article.id },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* ===== شريط التنقل (Breadcrumbs) ===== */}
      <div className="bg-surface border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <ArrowRight className="w-3 h-3 rotate-180" />
          <Link href="/actualites" className="hover:text-primary transition-colors">
            المستجدات
          </Link>
          <ArrowRight className="w-3 h-3 rotate-180" />
          <span className="text-text font-bold truncate">
            {article.title}
          </span>
        </div>
      </div>

      {/* ===== محتوى الخبر ===== */}
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* رأس الخبر */}
        <article className="bg-surface rounded-2xl border border-border p-8 md:p-12">
          {/* التصنيف والتاريخ */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {article.category}
            </span>
            <span className="text-muted text-sm flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(article.publishedAt).toLocaleDateString('ar-MA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* العنوان الرئيسي */}
          <h1 className="text-2xl md:text-4xl font-extrabold text-text mb-8 leading-tight">
            {article.title}
          </h1>

          {/* المحتوى الكامل */}
          <div className="prose prose-lg max-w-none text-text leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>

          {/* تذييل الخبر */}
          <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
            <Link
              href="/actualites"
              className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              العودة للمستجدات
            </Link>
            <div className="text-xs text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" />
              آخر تحديث: {new Date(article.updatedAt).toLocaleDateString('ar-MA')}
            </div>
          </div>
        </article>

        {/* ===== قسم أخبار أخرى ذات صلة ===== */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-extrabold text-text mb-6 flex items-center gap-2">
              <Tag className="w-5 h-5 text-accent" />
              أخبار أخرى في نفس التصنيف
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/actualites/${related.slug}`}
                  className="group bg-surface rounded-xl border border-border p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
                >
                  <span className="text-xs font-bold text-primary mb-2 block">
                    {related.category}
                  </span>
                  <h3 className="text-sm font-bold text-text group-hover:text-primary line-clamp-2 leading-relaxed">
                    {related.title}
                  </h3>
                  <div className="text-xs text-muted mt-3 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(related.publishedAt).toLocaleDateString('ar-MA')}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}