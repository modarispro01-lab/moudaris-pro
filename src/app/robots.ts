import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/gate', '/tools/daily-memo-explicit', '/tools/timetable-generator', '/tools/week-memo'], // منع فهرسة لوحة التحكم والـ API
      },
      // زواحف إعلانات Google: يجب السماح لها حتى تظهر الإعلانات الملائمة
      { userAgent: 'Mediapartners-Google', allow: '/' },
      { userAgent: 'AdsBot-Google', allow: '/' },
    ],
    sitemap: 'https://modarispro.com/sitemap.xml',
  };
}