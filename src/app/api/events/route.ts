// AI-assisted: route structure and validation aided by Claude (Anthropic)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/events — public, paginated
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '12'))
    const skip  = (page - 1) * limit

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { date: 'asc' },
        include: {
          organiser: { select: { id: true, name: true } },
          _count:    { select: { bookings: true } },
        },
      }),
      prisma.event.count(),
    ])

    const data = events.map((e) => ({
      ...e,
      spotsLeft: e.capacity - e._count.bookings,
    }))

    return NextResponse.json({ data, total, page, limit })
  } catch (error) {
    console.error('[GET /api/events]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/events — organiser only
export async function POST(request: NextRequest) {
  const auth = getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'ORGANISER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await request.json()
    const { title, description, date, capacity } = body

    if (!title || !description || !date || capacity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (typeof capacity !== 'number' || !Number.isInteger(capacity) || capacity < 1) {
      return NextResponse.json({ error: 'Capacity must be a positive integer' }, { status: 400 })
    }

    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title:       title.trim(),
        description: description.trim(),
        date:        parsedDate,
        capacity,
        organiserId: auth.userId,
      },
      include: {
        organiser: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('[POST /api/events]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}