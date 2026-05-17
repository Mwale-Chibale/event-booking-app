// AI-assisted: route structure aided by Claude (Anthropic)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/bookings — authenticated user's own bookings
export async function GET(request: NextRequest) {
  const auth = getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          include: {
            organiser: { select: { id: true, name: true } },
          },
        },
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('[GET /api/bookings]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}