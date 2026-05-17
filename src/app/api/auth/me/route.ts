// AI-assisted: route structure aided by Claude (Anthropic)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = getAuthUser(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('[GET /api/auth/me]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}