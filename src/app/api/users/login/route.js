import { z } from 'zod';
import { NextResponse } from 'next/server';
import userModel from '@/models/userModel.js';
import connectDB from '@/lib/db';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    loginSchema.parse(body); 

    const { email, password } = body;
    const user = await userModel.findOne({ email }).select('+password');

    if (!user || !(await user.isValidPassword(password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await user.generateJWT();
    delete user._doc.password;

    return NextResponse.json({ user, token }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
