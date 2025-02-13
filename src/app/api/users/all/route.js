import { NextResponse } from 'next/server';
import userModel from '@/models/user.model';
import userService from '@/services/user.service';
import { authMiddleware } from '@/middleware/auth.middleware';

export async function GET(req) {
  const user = await authMiddleware(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const loggedInUser = await userModel.findOne({ email: user.email });
    const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

    return NextResponse.json({ users: allUsers });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
