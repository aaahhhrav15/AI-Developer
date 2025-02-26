import { NextResponse } from 'next/server';
import userModel from '@/models/userModel.js';
import { getAllUsers } from '@/services/userService.js';
import { authMiddleware } from '@/middleware/authMiddleware.js';
import connectDB from '@/lib/db.js';

export async function GET(req) 
{
  await connectDB();
  const user = await authMiddleware(req);

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try 
  {

    const loggedInUser = await userModel.findOne({ email: user.email });
    if (!loggedInUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const allUsers = await getAllUsers({ userId: loggedInUser._id });

    return NextResponse.json({ users: allUsers });

  } 
  catch (error) 
  {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
