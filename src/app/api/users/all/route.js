import { NextResponse } from 'next/server';
import userModel from '@/models/userModel';
import { getAllUsers } from '@/services/userService';
import { authMiddleware } from '@/middleware/authMiddleware';
import connectDB from '@/lib/db';

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
