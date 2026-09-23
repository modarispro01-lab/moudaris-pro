import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Download,
  Eye,
  Calendar,
  FileText,
  BookOpen,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

// ===== توليد Meta Tags ديناميكية لكل مورد =====
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = await prisma.resource.findUnique({
    where: { slug },
    include: { level: true, subject: true },
  });

  if (!resource) {
    return { title: "المورد غير موجود" };
  }

  return {
    title: resource.title,
    description: resource.description || `مورد تعليمي: ${resource.title}`,
    keywords: [
      resource.title,
      resource.level.name,
      resource.subject.name,
      resource.fileType,
      "MoudarisPro",
      "موارد تعليمية",
      "المغرب",
    ],
    openGraph: {
      title: resource.title,
      description: resource.description,
      type: "article",
      locale: "ar_MA",
    },
  };
}

// ===== دالة جلب بيانات المورد من قاعدة البيانات =====
async function getResource(slug: string) {
  const resource = await prisma.resource.findUnique({
    where: { slug },
    include: {
      level: true,
      subject: true,
    },
  });

  if (!resource) {
    return null;
  }

  return resource;
}

// ===== المكون الرئيسي للصفحة =====
export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await getResource(slug);

  if (!resource) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ===== شريط التنقل (Breadcrumbs) ===== */}
      <div className="bg-surface border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <ArrowRight className="w-3 h-3 rotate-180" />
          <Link href="/resources" className="hover:text-primary transition-colors">
            الموارد
          </Link>
          <ArrowRight className="w-3 h-3 rotate-180" />
          <span className="text-text font-bold truncate">
            {resource.title}
          </span>
        </div>
      </div>

      {/* ===== محتوى المورد ===== */}
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* العنوان والمعلومات الأساسية */}
        <div className="bg-surface rounded-2xl border border-border p-8 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              {resource.level.name}
            </span>
            <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {resource.subject.name}
            </span>
            <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <FileText className="w-3 h-3" />
              .{resource.fileType.toLowerCase()}
            </span>
            {resource.isPremium && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                ⭐ مميز
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-text mb-4 leading-snug">
            {resource.title}
          </h1>

          <p className="text-muted leading-relaxed text-base mb-6">
            {resource.description}
          </p>

          {/* معلومات إضافية */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Calendar className="w-4 h-4 text-primary" />
              <div>
                <div className="text-xs">تاريخ الإضافة</div>
                <div className="font-bold text-text">
                  {new Date(resource.createdAt).toLocaleDateString('ar-MA')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Download className="w-4 h-4 text-primary" />
              <div>
                <div className="text-xs">التحميلات</div>
                <div className="font-bold text-text">{resource.downloads}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Eye className="w-4 h-4 text-primary" />
              <div>
                <div className="text-xs">المشاهدات</div>
                <div className="font-bold text-text">{resource.views}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <FileText className="w-4 h-4 text-primary" />
              <div>
                <div className="text-xs">الصيغة</div>
                <div className="font-bold text-text">{resource.fileType}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== أزرار التحميل والمعاينة ===== */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          
          {/* زر فتح / تحميل الملف */}
          {resource.fileUrl ? (
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-bold text-white transition-all hover:bg-primary/90 hover:shadow-lg text-center"
            >
              <Download className="w-5 h-5" />
              فتح / تحميل الملف ({resource.fileType})
            </a>
          ) : (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-300 px-6 py-4 font-bold text-gray-500 cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              الملف غير متاح حالياً
            </button>
          )}

          {/* زر المعاينة */}
          <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-surface border-2 border-primary px-6 py-4 font-bold text-primary transition-all hover:bg-primary/5">
            <Eye className="w-5 h-5" />
            معاينة المورد
          </button>
        </div>

        {/* ===== قسم "موارد مشابهة" ===== */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-lg font-extrabold text-text mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            موارد أخرى في نفس المستوى
          </h2>
          <SimilarResources
            levelId={resource.levelId}
            currentSlug={resource.slug}
          />
        </div>
      </div>
    </div>
  );
}

// ===== مكون فرعي لعرض الموارد المشابهة =====
async function SimilarResources({
  levelId,
  currentSlug,
}: {
  levelId: number;
  currentSlug: string;
}) {
  const similar = await prisma.resource.findMany({
    where: {
      levelId,
      NOT: { slug: currentSlug },
    },
    take: 3,
    include: { subject: true },
    orderBy: { createdAt: 'desc' },
  });

  if (similar.length === 0) {
    return <p className="text-muted text-sm">لا توجد موارد مشابهة حالياً.</p>;
  }

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {similar.map((res) => (
        <Link
          key={res.id}
          href={`/resources/${res.slug}`}
          className="group rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-md transition-all"
        >
          <div className="text-xs text-muted mb-1">{res.subject.name}</div>
          <div className="text-sm font-bold text-text group-hover:text-primary line-clamp-2">
            {res.title}
          </div>
        </Link>
      ))}
    </div>
  );
}