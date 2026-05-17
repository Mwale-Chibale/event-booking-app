// AI-assisted: Prisma transaction pattern for overbooking prevention aided by Claude (Anthropic)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

// POST /api/events/:id/bookings — attendee only
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const eventId = parseInt(id, 10)
  if (isNaN(eventId)) {
    return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 })
  }

  const auth = getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'ATTENDEE') {
    return NextResponse.json({ error: 'Only attendees can book tickets' }, { status: 403 })
  }

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } })
      if (!event) throw new Error('EVENT_NOT_FOUND')

      const bookingCount = await tx.booking.count({ where: { eventId } })
      if (bookingCount >= event.capacity) throw new Error('EVENT_FULL')

      const existing = await tx.booking.findUnique({
        where: { userId_eventId: { userId: auth.userId, eventId } },
      })
      if (existing) throw new Error('ALREADY_BOOKED')

      return tx.booking.create({
        data: { userId: auth.userId, eventId },
        include: {
          event: { select: { id: true, title: true, date: true } },
          user:  { select: { id: true, name: true } },
        },
      })
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'EVENT_NOT_FOUND') return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      if (error.message === 'EVENT_FULL')      return NextResponse.json({ error: 'Event is fully booked' }, { status: 409 })
      if (error.message === 'ALREADY_BOOKED')  return NextResponse.json({ error: 'You have already booked this event' }, { status: 409 })
    }
    console.error('[POST /api/events/:id/bookings]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}