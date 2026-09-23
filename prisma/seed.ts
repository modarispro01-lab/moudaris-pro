import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء إضافة البيانات المغربية...');

  // 1. إضافة المستويات الدراسية
  const levels = [
    'الأول ابتدائي', 'الثاني ابتدائي', 'الثالث ابتدائي',
    'الرابع ابتدائي', 'الخامس ابتدائي', 'السادس ابتدائي',
  ];

  for (const name of levels) {
    await prisma.level.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('✅ تمت إضافة المستويات الدراسية');

  // 2. إضافة المواد الدراسية
  const subjects = [
    'اللغة العربية', 'اللغة الفرنسية', 'الرياضيات', 
    'النشاط العلمي', 'التربية الإسلامية', 'الاجتماعيات',
  ];

  for (const name of subjects) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('✅ تمت إضافة المواد الدراسية');

  // 3. إضافة موارد تجريبية
  const level4 = await prisma.level.findUnique({ where: { name: 'الرابع ابتدائي' } });
  const math = await prisma.subject.findUnique({ where: { name: 'الرياضيات' } });
  const arabic = await prisma.subject.findUnique({ where: { name: 'اللغة العربية' } });

  if (level4 && math) {
    await prisma.resource.create({
      data: {
        title: 'جذاذة نموذجية: الأعداد من 0 إلى 99',
        slug: 'jadhada-riyadiyat-rabea-0-99',
        description: 'جذاذة جاهزة للطباعة والتعديل وفق منهجية التدريس الصريح.',
        fileType: 'Word',
        levelId: level4.id,
        subjectId: math.id,
      },
    });

    await prisma.resource.create({
      data: {
        title: 'توزيع سنوي لمادة الرياضيات - المستوى الرابع',
        slug: 'tawzi3-riyadiyat-rabea',
        description: 'توزيع سنوي شامل لدروس الرياضيات حسب المقرر الوزاري.',
        fileType: 'PDF',
        levelId: level4.id,
        subjectId: math.id,
      },
    });
  }

  if (level4 && arabic) {
    await prisma.resource.create({
      data: {
        title: 'مذكرة درس: أقرأ وأكتشف - الوحدة الأولى',
        slug: 'mudhakara-arabiya-rabea-w1',
        description: 'مذكرة درس في اللغة العربية للوحدة الأولى.',
        fileType: 'Word',
        levelId: level4.id,
        subjectId: arabic.id,
      },
    });
  }

  console.log('✅ تمت إضافة الموارد التجريبية');
  console.log('🎉 اكتملت عملية البذر بنجاح!');
}

main()
  .catch((e) => {
    console.error('❌ حدث خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });