'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createArticle(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const category = formData.get('category') as string;
  const content = formData.get('content') as string;

  if (!title || !slug || !category || !content) {
    console.error('Validation failed: Missing fields');
    return; // تم التعديل هنا
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
    console.error('Error creating article:', error);
    return; // تم التعديل هنا
  }
}

export async function deleteArticle(formData: FormData) {
  const id = formData.get('id') as string;
  await prisma.article.delete({ where: { id } });
  revalidatePath('/admin/articles');
}