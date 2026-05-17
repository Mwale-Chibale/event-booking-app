// AI-assisted: structure and data generation aided by Claude (Anthropic)
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data in dependency order
  await prisma.booking.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()

  // --- Users ---
  const passwordHash = await bcrypt.hash('password123', 10)

  const [org1, org2, att1, att2, att3] = await Promise.all([
    prisma.user.create({ data: { name: 'Alice Organiser', email: 'alice@test.com', password: passwordHash, role: 'ORGANISER' } }),
    prisma.user.create({ data: { name: 'Bob Organiser',   email: 'bob@test.com',   password: passwordHash, role: 'ORGANISER' } }),
    prisma.user.create({ data: { name: 'Carol Attendee',  email: 'carol@test.com', password: passwordHash, role: 'ATTENDEE'  } }),
    prisma.user.create({ data: { name: 'Dave Attendee',   email: 'dave@test.com',  password: passwordHash, role: 'ATTENDEE'  } }),
    prisma.user.create({ data: { name: 'Eve Attendee',    email: 'eve@test.com',   password: passwordHash, role: 'ATTENDEE'  } }),
  ])
  console.log('✅ Created 5 users (2 organisers, 3 attendees)')

  // --- Events ---
  const [e1, e2, e3, e4, e5] = await Promise.all([
    prisma.event.create({ data: { title: 'Jazz Night',           description: 'A relaxing evening of live jazz music.', date: new Date('2026-07-10T19:00:00Z'), capacity: 50,  organiserId: org1.id } }),
    prisma.event.create({ data: { title: 'React Summit',         description: 'Deep dives into React and Next.js.',     date: new Date('2026-07-15T09:00:00Z'), capacity: 200, organiserId: org1.id } }),
    prisma.event.create({ data: { title: 'City Half Marathon',   description: 'Annual 21km city run.',                  date: new Date('2026-07-20T07:00:00Z'), capacity: 500, organiserId: org2.id } }),
    prisma.event.create({ data: { title: 'Watercolour Workshop', description: 'Beginner-friendly painting class.',       date: new Date('2026-08-01T14:00:00Z'), capacity: 20,  organiserId: org2.id } }),
    prisma.event.create({ data: { title: 'Indie Rock Festival',  description: 'Three stages, twelve bands.',             date: new Date('2026-08-10T15:00:00Z'), capacity: 300, organiserId: org1.id } }),
  ])
  console.log('✅ Created 5 events')

  // --- Bookings ---
  await Promise.all([
    prisma.booking.create({ data: { userId: att1.id, eventId: e1.id } }),
    prisma.booking.create({ data: { userId: att1.id, eventId: e2.id } }),
    prisma.booking.create({ data: { userId: att2.id, eventId: e2.id } }),
    prisma.booking.create({ data: { userId: att2.id, eventId: e3.id } }),
    prisma.booking.create({ data: { userId: att3.id, eventId: e1.id } }),
    prisma.booking.create({ data: { userId: att3.id, eventId: e3.id } }),
    prisma.booking.create({ data: { userId: att3.id, eventId: e5.id } }),
    prisma.booking.create({ data: { userId: att1.id, eventId: e4.id } }),
  ])
  console.log('✅ Created 8 bookings')
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })