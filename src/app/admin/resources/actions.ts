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
  const file = formData.get('file') as File;

  if (!title || !slug || !levelId || !subjectId || !file) {
    console.error('Validation failed: Missing fields or file');
    return; // تم التعديل هنا
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = file.name.split('.').pop();
    const newFileName = `${uniqueSuffix}.${fileExtension}`;
    const filePath = path.join(uploadDir, newFileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${newFileName}`;

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
    redirect('/admin/resources');
  } catch (error) {
    console.error('Error uploading file:', error);
    return; // تم التعديل هنا
  }
}

export async function deleteResource(formData: FormData) {
  const id = formData.get('id') as string;
  await prisma.resource.delete({ where: { id } });
  revalidatePath('/admin/resources');
}