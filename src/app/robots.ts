import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'], // منع فهرسة لوحة التحكم والـ API
      },
      // زواحف إعلانات Google: يجب السماح لها حتى تظهر الإعلانات الملائمة
      { userAgent: 'Mediapartners-Google', allow: '/' },
      { userAgent: 'AdsBot-Google', allow: '/' },
    ],
    sitemap: 'https://modarispro.com/sitemap.xml',
  };
}