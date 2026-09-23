import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Download, Search, Filter } from 'lucide-react';
import type { Metadata } from "next";

// ===== Meta Tags للـ SEO =====
export const metadata: Metadata = {
  title: "مكتبة الموارد التعليمية",
  description:
    "تصفح وحمّل آلاف الموارد التعليمية للأستاذ المغربي: جذاذات، مذكرات، توازيع سنوية، فروض محروسة، ودروس حسب المستوى والمادة.",
  keywords: [
    "جذاذات",
    "مذكرات",
    "توزيع سنوي",
    "فروض",
    "موارد تعليمية",
    "ابتدائي",
    "المغرب",
  ],
};

// ===== المكون الرئيسي للصفحة =====
export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ levelId?: string; subjectId?: string; search?: string }>;
}) {
  // 1. انتظار معلمات البحث
  const params = await searchParams;
  const levelId = params.levelId ? parseInt(params.levelId) : undefined;
  const subjectId = params.subjectId ? parseInt(params.subjectId) : undefined;
  const searchQuery = params.search || '';

  // 2. بناء شرط البحث ديناميكياً
  const whereCondition: any = {};
  
  if (levelId) whereCondition.levelId = levelId;
  if (subjectId) whereCondition.subjectId = subjectId;
  if (searchQuery) {
    whereCondition.OR = [
      { title: { contains: searchQuery } },
      { description: { contains: searchQuery } },
    ];
  }

  // 3. جلب الموارد المطابقة للفلتر
  const resources = await prisma.resource.findMany({
    where: whereCondition,
    include: {
      level: true,
      subject: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // 4. جلب كل المستويات والمواد لملء القوائم المنسدلة
  const levels = await prisma.level.findMany({ orderBy: { id: 'asc' } });
  const subjects = await prisma.subject.findMany({ orderBy: { id: 'asc' } });

  return (
    <div className="min-h-screen bg-background">
      {/* ===== الهيدر ===== */}
      <section className="bg-primary py-12">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            مكتبة الموارد التعليمية
          </h1>
          <p className="text-white/80 text-base">
            {resources.length} مورد تعليمي متاح للتحميل
            {searchQuery || levelId || subjectId ? ' (نتائج مصفاة)' : ''}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* ===== نموذج الفلاتر والبحث ===== */}
        <form method="GET" action="/resources" className="bg-surface rounded-2xl border border-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-text">تصفية والبحث</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            {/* حقل البحث النصي */}
            <div className="md:col-span-4">
              <label className="block text-sm font-bold text-muted mb-1">بحث بالعنوان أو الوصف</label>
              <div className="relative">
                <Search className="absolute right-3 top-3 w-4 h-4 text-muted" />
                <input
                  type="text"
                  name="search"
                  defaultValue={searchQuery}
                  placeholder="مثال: جذاذة، توزيع، مذكرة..."
                  className="w-full rounded-lg border border-border bg-background pr-10 pl-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* فلتر المستوى */}
            <div>
              <label className="block text-sm font-bold text-muted mb-1">المستوى الدراسي</label>
              <select
                name="levelId"
                defaultValue={levelId || ''}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">كل المستويات</option>
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            {/* فلتر المادة */}
            <div>
              <label className="block text-sm font-bold text-muted mb-1">المادة الدراسية</label>
              <select
                name="subjectId"
                defaultValue={subjectId || ''}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">كل المواد</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* أزرار التحكم */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-bold text-white hover:bg-primary/90 transition-colors"
              >
                <Search className="w-4 h-4" />
                تطبيق الفلتر
              </button>
              
              {/* زر مسح الفلتر */}
              {(searchQuery || levelId || subjectId) && (
                <Link
                  href="/resources"
                  className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 font-bold text-muted hover:bg-background transition-colors"
                  title="مسح جميع الفلاتر"
                >
                  مسح
                </Link>
              )}
            </div>
          </div>
        </form>

        {/* ===== شبكة الموارد ===== */}
        {resources.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-border">
            <p className="text-muted text-lg mb-2">لا توجد موارد تطابق بحثك.</p>
            <Link href="/resources" className="text-primary font-bold hover:underline">
              عرض جميع الموارد
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <Link
                key={resource.id}
                href={`/resources/${resource.slug}`}
                className="group rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    {resource.level.name}
                  </span>
                  <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Download className="w-3 h-3" /> {resource.downloads}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-text mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {resource.title}
                </h3>

                <p className="text-sm text-muted line-clamp-2 mb-4">
                  {resource.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted pt-4 border-t border-border">
                  <span>{resource.subject.name}</span>
                  <span className="w-1 h-1 bg-muted rounded-full" />
                  <span className="font-mono text-xs bg-background px-2 py-1 rounded border border-border">
                    .{resource.fileType.toLowerCase()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}