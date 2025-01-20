import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/authOptions';
import { createPayfastPayment } from '@/app/lib/payfast';
import { prisma } from '@/app/lib/prisma';
import { AD_CATEGORIES } from '@/app/lib/constants';

export async function POST(request: Request) {
  try {
    const { adId } = await request.json();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adRequest = await prisma.adRequest.findUnique({
      where: { id: adId },
    });

    if (!adRequest) {
      return NextResponse.json({ error: 'Ad request not found' }, { status: 404 });
    }

    const category = AD_CATEGORIES[adRequest.category as keyof typeof AD_CATEGORIES];
    
    const payfastPayload = createPayfastPayment({
      amount: category.monthlyPrice,
      item_name: `${category.label} Advertisement`,
      email_address: session.user.email,
      adId: adId,
    });

    // PayFast sandbox URL for testing, use https://www.payfast.co.za/eng/process for production
    const payfastUrl = process.env.NODE_ENV === 'production'
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';

    return NextResponse.json({ 
      url: payfastUrl,
      payload: payfastPayload 
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout" },
      { status: 500 }
    );
  }
}