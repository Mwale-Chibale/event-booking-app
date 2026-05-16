import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
try {
const body = await request.json();
const { name, email, password, role } = body;

if (!name || !email || !password) {
  return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
}

const existingUser = await prisma.user.findUnique({ where: { email } });
if (existingUser) {
  return NextResponse.json({ error: 'User already exists' }, { status: 400 });
}

const hashedPassword = await bcrypt.hash(password, 10);

const user = await prisma.user.create({
  data: {
    name,
    email,
    password: hashedPassword,
    role: role || 'ATTENDEE',
  },
});

return NextResponse.json({ message: 'User created', userId: user.id }, { status: 201 });
} catch (error) {
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
}