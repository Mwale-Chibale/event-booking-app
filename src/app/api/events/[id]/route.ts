// AI-assisted: route structure aided by Claude (Anthropic)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

function parseId(raw: string): number | null {
  const n = parseInt(raw, 10)
  return isNaN(n) ? null : n
}

// GET /api/events/:id — public
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const eventId = parseId(id)
  if (!eventId) return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 })

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organiser: { select: { id: true, name: true } },
        _count:    { select: { bookings: true } },
      },
    })

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    return NextResponse.json({
      ...event,
      spotsLeft: event.capacity - event._count.bookings,
    })
  } catch (error) {
    console.error('[GET /api/events/:id]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/events/:id — organiser (owner) only
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  const eventId = parseId(id)
  if (!eventId) return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 })

  const auth = getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'ORGANISER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (event.organiserId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, date, capacity } = body

    // Prevent reducing capacity below existing booking count
    if (capacity !== undefined) {
      if (typeof capacity !== 'number' || !Number.isInteger(capacity) || capacity < 1) {
        return NextResponse.json({ error: 'Capacity must be a positive integer' }, { status: 400 })
      }
      const bookingCount = await prisma.booking.count({ where: { eventId } })
      if (capacity < bookingCount) {
        return NextResponse.json(
          { error: `Capacity cannot be less than existing bookings (${bookingCount})` },
          { status: 400 }
        )
      }
    }

    if (date !== undefined && isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(title       !== undefined && { title:       title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(date        !== undefined && { date:        new Date(date) }),
        ...(capacity    !== undefined && { capacity }),
      },
      include: {
        organiser: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PUT /api/events/:id]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/events/:id — organiser (owner) only
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params
  const eventId = parseId(id)
  if (!eventId) return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 })

  const auth = getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'ORGANISER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (event.organiserId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete bookings first due to FK constraint
    await prisma.booking.deleteMany({ where: { eventId } })
    await prisma.event.delete({ where: { id: eventId } })

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('[DELETE /api/events/:id]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}