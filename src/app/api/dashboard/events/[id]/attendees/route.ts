// AI-assisted: route structure aided by Claude (Anthropic)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

// GET /api/dashboard/events/:id/attendees — organiser (owner) only
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params
  const eventId = parseInt(id, 10)
  if (isNaN(eventId)) {
    return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 })
  }

  const auth = getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'ORGANISER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (event.organiserId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const bookings = await prisma.booking.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    const attendees = bookings.map((b) => ({
      bookingId: b.id,
      bookedAt:  b.createdAt,
      user:      b.user,
    }))

    return NextResponse.json({ event: { id: event.id, title: event.title }, attendees })
  } catch (error) {
    console.error('[GET /api/dashboard/events/:id/attendees]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}