// AI-assisted: route structure aided by Claude (Anthropic)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

// DELETE /api/bookings/:id — only the user who made the booking
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params
  const bookingId = parseInt(id, 10)
  if (isNaN(bookingId)) {
    return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 })
  }

  const auth = getAuthUser(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.userId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.booking.delete({ where: { id: bookingId } })

    return NextResponse.json({ message: 'Booking cancelled successfully' })
  } catch (error) {
    console.error('[DELETE /api/bookings/:id]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}