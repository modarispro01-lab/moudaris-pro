import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // منع فهرسة لوحة التحكم والـ API
    },
    sitemap: 'https://modarispro.com/sitemap.xml',
  };
}