import { NextResponse } from 'next/server';
import redisClient from '@/services/redisService';
import { authMiddleware } from '@/middleware/authMiddleware.js';

export async function GET(req) {
  const user = await authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'No token provided' }, { status: 400 });

    await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24); 
    return NextResponse.json({ message: 'Logged out successfully' });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
