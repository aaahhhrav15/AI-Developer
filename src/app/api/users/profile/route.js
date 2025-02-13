import { NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/authMiddleware.js';

export async function GET(req) {
  const user = await authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({ user });
}
