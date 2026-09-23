import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  Search, BookOpen, Newspaper, Wrench, Bot, FileText, Gem,
  FileDown, CalendarDays, ClipboardList, Download,
} from 'lucide-react';

const services = [
  { icon: BookOpen, title: 'الموارد التعليمية', desc: 'جذاذات، مذكرات، توازيع، فروض وموارد جاهزة.' },
  { icon: Newspaper, title: 'المستجدات', desc: 'آخر المذكرات والبلاغات والإعلانات التعليمية.' },
  { icon: Wrench, title: 'أدوات الأستاذ', desc: 'أدوات لإنشاء الوثائق والملفات التربوية.' },
  { icon: Bot, title: 'أدوات الذكاء الاصطناعي', desc: 'أدوات ذكية تساعد الأستاذ في التحضير والتنظيم.' },
  { icon: FileText, title: 'وثائق جاهزة', desc: 'ملفات قابلة للتحميل والطباعة والتعديل.' },
  { icon: Gem, title: 'المنتجات الرقمية', desc: 'موارد احترافية مدفوعة للأستاذ.' },
];

const quickActions = [
  { icon: ClipboardList, label: 'المذكرات' },
  { icon: BookOpen, label: 'الجذاذات' },
  { icon: CalendarDays, label: 'التوازيع' },
  { icon: FileDown, label: 'الفروض' },
  { icon: Wrench, label: 'الأدوات' },
];

// هذا المكون الآن غير متزامن (async) لأنه يجلب بيانات من الخادم
export default async function Home() {
  // جلب أحدث 6 موارد من قاعدة البيانات مع معلومات المستوى والمادة
  const latestResources = await prisma.resource.findMany({
    take: 6,
    include: {
      level: true,
      subject: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      {/* ===== قسم الهيرو ===== */}
      <section className="relative overflow-hidden bg-primary py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary via-primary to-secondary" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-snug mb-4">
            كل ما يحتاجه الأستاذ في <span className="text-accent">مكان واحد</span>
          </h1>
          <p className="text-white/80 text-base md:text-xl mb-8 leading-relaxed">
            موارد تعليمية، أدوات رقمية، وثائق جاهزة، ومستجدات تربوية تساعدك على توفير الوقت وتنظيم عملك.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-surface p-2 shadow-2xl">
            <input
              type="search"
              placeholder='ابحث عن: "جذاذة الرياضيات المستوى الرابع"'
              className="flex-1 rounded-xl bg-transparent px-4 py-3 text-text placeholder:text-muted focus:outline-none"
            />
            <button className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-white transition-colors hover:bg-accent/90">
              <Search className="w-5 h-5" />
              بحث
            </button>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {quickActions.map((a) => (
              <button
                key={a.label}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <a.icon className="w-4 h-4 text-accent" />
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== قسم الخدمات ===== */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-extrabold text-primary mb-8 text-center">
            منصة متكاملة تخدم الأستاذ يومياً
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.title}
                className="group rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
              >
                <div className="mb-4 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-text mb-2">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== قسم أحدث الموارد (ديناميكي من قاعدة البيانات) ===== */}
      <section className="py-14 bg-background">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-accent" />
              أحدث الموارد المضافة
            </h2>
            <Link href="/resources" className="text-sm font-bold text-secondary hover:underline">
              عرض الكل ←
            </Link>
          </div>

          {latestResources.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-2xl border border-border">
              <p className="text-muted">لا توجد موارد بعد.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latestResources.map((resource) => (
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

                  <div className="flex items-center gap-4 text-sm text-muted mt-4 pt-4 border-t border-border">
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
      </section>
    </>
  );
}