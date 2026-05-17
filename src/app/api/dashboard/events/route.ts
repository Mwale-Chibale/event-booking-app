// AI-assisted: aggregation query pattern aided by Claude (Anthropic)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/dashboard/events — organiser only
export async function GET(request: NextRequest) {
  const auth = getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'ORGANISER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const events = await prisma.event.findMany({
      where: { organiserId: auth.userId },
      orderBy: { date: 'asc' },
      include: {
        _count: { select: { bookings: true } },
      },
    })

    const data = events.map((e) => ({
      id:          e.id,
      title:       e.title,
      date:        e.date,
      capacity:    e.capacity,
      ticketsSold: e._count.bookings,
      spotsLeft:   e.capacity - e._count.bookings,
      createdAt:   e.createdAt,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/dashboard/events]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}