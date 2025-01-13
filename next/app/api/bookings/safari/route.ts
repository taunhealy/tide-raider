import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/app/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { safariId, date, skillLevel, bringingBoard, requiresRental, notes } = body

    const booking = await prisma.safariBooking.create({
      data: {
        safariId,
        userId: session.user.id,
        date: new Date(date),
        skillLevel,
        bringingBoard,
        requiresRental,
        notes
      }
    })

    return NextResponse.json(booking)
    
  } catch (error) {
    console.error('Failed to create safari booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}