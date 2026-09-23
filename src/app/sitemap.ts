import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://moudarispro.vercel.app'; // سنغيرها بعد النشر

  // جلب كل الموارد والأخبار من قاعدة البيانات
  const resources = await prisma.resource.findMany({
    select: { slug: true, updatedAt: true },
  });

  const articles = await prisma.article.findMany({
    select: { slug: true, updatedAt: true },
  });

  // الصفحات الثابتة
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/resources`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/actualites`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
  ];

  // صفحات الموارد
  const resourcePages = resources.map((resource) => ({
    url: `${baseUrl}/resources/${resource.slug}`,
    lastModified: resource.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // صفحات الأخبار
  const articlePages = articles.map((article) => ({
    url: `${baseUrl}/actualites/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...resourcePages, ...articlePages];
}