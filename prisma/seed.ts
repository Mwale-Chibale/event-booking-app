import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const organiser = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@test.com',
      password: 'password',
      role: 'ORGANISER',
    },
  })

  const attendee = await prisma.user.create({
    data: {
      name: 'User',
      email: 'user@test.com',
      password: 'password',
      role: 'ATTENDEE',
    },
  })

  const event = await prisma.event.create({
    data: {
      title: 'Event 1',
      description: 'First event',
      date: new Date('2026-06-01T10:00:00Z'),
      capacity: 100,
      organiserId: organiser.id,
    },
  })

  await prisma.booking.create({
    data: {
      userId: attendee.id,
      eventId: event.id,
    },
  })
}

main()
  .catch((e) => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })