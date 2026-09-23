'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// دالة إضافة مقال جديد
export async function createArticle(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const category = formData.get('category') as string;
  const content = formData.get('content') as string;

  if (!title || !slug || !category || !content) {
    return { error: 'يرجى ملء جميع الحقول المطلوبة' };
  }

  try {
    await prisma.article.create({
      data: {
        title,
        slug,
        category,
        content,
      },
    });

    revalidatePath('/admin/articles');
    redirect('/admin/articles');
  } catch (error) {
    console.error('خطأ في إضافة المقال:', error);
    return { error: 'فشل في إضافة المقال. تأكد أن الرابط (Slug) غير مستخدم.' };
  }
}

// دالة حذف مقال
export async function deleteArticle(formData: FormData) {
  const id = formData.get('id') as string;
  
  await prisma.article.delete({
    where: { id },
  });

  revalidatePath('/admin/articles');
}