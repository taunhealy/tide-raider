import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const isProduction = process.env.NODE_ENV === 'production';

async function saveLocalFile(file: File, id: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  
  const fileName = `${id}-${file.name}`;
  await writeFile(path.join(uploadDir, fileName), buffer);
  return `/uploads/${fileName}`;
}

export async function POST(req: Request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const id = crypto.randomUUID();
    const file = formData.get('adImage') as File;
    let imageUrl = '';

    if (file) {
      try {
        if (isProduction && process.env.BLOB_READ_WRITE_TOKEN) {
          const blob = await put(`ads/${id}-${file.name}`, file, {
            access: 'public',
            addRandomSuffix: true
          });
          imageUrl = blob.url;
        } else {
          imageUrl = await saveLocalFile(file, id);
        }
      } catch (error) {
        console.error('File upload error:', error);
        if (!imageUrl) {
          imageUrl = await saveLocalFile(file, id);
        }
      }
    }

    // Create ad request with user ID
    const adRequest = await prisma.adRequest.create({
      data: {
        id,
        beachName: formData.get('beachName') as string,
        companyName: formData.get('companyName') as string,
        contactEmail: formData.get('email') as string,
        imageUrl,
        linkUrl: formData.get('linkUrl') as string,
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        status: 'draft',
        userId: user.id // Link the ad to the user
      }
    });

    return NextResponse.json({ 
      success: true, 
      id: adRequest.id 
    });
  } catch (error) {
    console.error('Ad submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit request' }, 
      { status: 500 }
    );
  }
}