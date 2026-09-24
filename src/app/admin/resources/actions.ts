'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';

export async function createResource(formData: FormData) {
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const description = (formData.get('description') as string) || '';
  const fileType = (formData.get('fileType') as string) || 'PDF';
  const levelId = parseInt(formData.get('levelId') as string);
  const subjectId = parseInt(formData.get('subjectId') as string);
  const file = formData.get('file') as File | null;

  // التحقق من الحقول الإلزامية فقط (بدون الملف)
  if (!title || !slug || !levelId || !subjectId) {
    console.error('Validation failed: Missing required fields');
    return;
  }

  let fileUrl: string | null = null;

  try {
    // رفع الملف إلى Vercel Blob (تخزين سحابي دائم)
    if (file && file.size > 0) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExtension = file.name.split('.').pop();
      const newFileName = `${uniqueSuffix}.${fileExtension}`;

      const blob = await put(newFileName, file, {
        access: 'public',
      });

      fileUrl = blob.url; // رابط سحابي مثل: https://xxxx.blob.vercel-storage.com/....pdf
    }

    // إنشاء المورد في قاعدة البيانات
    await prisma.resource.create({
      data: {
        title,
        slug,
        description,
        fileType,
        fileUrl,
        levelId,
        subjectId,
      },
    });

    revalidatePath('/admin/resources');
    revalidatePath('/resources');
    redirect('/admin/resources');
  } catch (error) {
    console.error('Error creating resource:', error);
    return;
  }
}

export async function deleteResource(formData: FormData) {
  const id = formData.get('id') as string;
  await prisma.resource.delete({ where: { id } });
  revalidatePath('/admin/resources');
  revalidatePath('/resources');
}