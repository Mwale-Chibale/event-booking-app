import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';  

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';  

export async function POST(request: Request) {
try {
const body = await request.json();
const { email, password } = body;  

if (!email || !password) {
  return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
}

const user = await prisma.user.findUnique({ where: { email } });
if (!user) {
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}

const isPasswordValid = await bcrypt.compare(password, user.password);
if (!isPasswordValid) {
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}

const token = jwt.sign(
  { userId: user.id, role: user.role },
  JWT_SECRET,
  { expiresIn: '1d' }
);

return NextResponse.json({ token, role: user.role }, { status: 200 });
} catch (error) {
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
}