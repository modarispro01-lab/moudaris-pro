import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // منع أخطاء البناء

const baseUrl = 'https://modarispro.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ===== الصفحات الثابتة والقانونية =====
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/tools/daily-lesson-plan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${baseUrl}/resources`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/actualites`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    // الصفحات القانونية (شرط أدسنس)
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // ===== الصفحات الديناميكية من قاعدة البيانات (محمية بـ try/catch) =====
  let dynamicPages: MetadataRoute.Sitemap = [];
  try {
    const resources = await prisma.resource.findMany({
      select: { slug: true, updatedAt: true },
    });
    const articles = await prisma.article.findMany({
      select: { slug: true, updatedAt: true },
    });

    const resourcePages = resources.map((r) => ({
      url: `${baseUrl}/resources/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const articlePages = articles.map((a) => ({
      url: `${baseUrl}/actualites/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    dynamicPages = [...resourcePages, ...articlePages];
  } catch (error) {
    console.warn('⚠️ Sitemap: failed to fetch DB pages, skipping:', error);
    // إن فشل الاتصال بقاعدة البيانات، نُرجع فقط الصفحات الثابتة (لا نفشل البناء كاملاً)
  }

  return [...staticPages, ...dynamicPages];
}