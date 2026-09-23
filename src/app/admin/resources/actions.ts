'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function createResource(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const fileType = formData.get('fileType') as string;
  const levelId = parseInt(formData.get('levelId') as string);
  const subjectId = parseInt(formData.get('subjectId') as string);
  
  // 1. استخراج الملف من النموذج
  const file = formData.get('file') as File;

  if (!title || !slug || !levelId || !subjectId || !file) {
    return { error: 'يرجى ملء جميع الحقول ورفع الملف' };
  }

  try {
    // 2. التأكد من وجود مجلد uploads (احتياطياً)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // 3. إنشاء اسم فريد للملف لتجنب الكتابة فوق ملفات أخرى (مثال: 1715000000-riyadiyat.pdf)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = file.name.split('.').pop();
    const newFileName = `${uniqueSuffix}.${fileExtension}`;
    const filePath = path.join(uploadDir, newFileName);

    // 4. قراءة محتوى الملف وكتابته في المجلد
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 5. حفظ "رابط" الملف في قاعدة البيانات (مثال: /uploads/1715000000-riyadiyat.pdf)
    const fileUrl = `/uploads/${newFileName}`;

    // 6. إنشاء المورد في قاعدة البيانات
    await prisma.resource.create({
      data: {
        title,
        slug,
        description,
        fileType,
        fileUrl, // <-- الرابط الجديد
        levelId,
        subjectId,
      },
    });

    revalidatePath('/admin/resources');
    redirect('/admin/resources');
  } catch (error) {
    console.error('خطأ في رفع الملف:', error);
    return { error: 'فشل في رفع الملف. تأكد من حجمه ونوعه.' };
  }
}

export async function deleteResource(formData: FormData) {
  const id = formData.get('id') as string;
  // ملاحظة: في التطبيق الحقيقي، يجب حذف الملف من المجلد أيضاً قبل حذف السجل
  await prisma.resource.delete({ where: { id } });
  revalidatePath('/admin/resources');
}