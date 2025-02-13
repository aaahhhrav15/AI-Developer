import { z } from 'zod';
import { NextResponse } from 'next/server';
import {createUser} from '@/services/userService.js';
import connectDB from '@/lib/db';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    userSchema.parse(body); 

    const { email, password } = body;

    const {user,token} = await createUser({email,password});

    delete user._doc.password; 
    return NextResponse.json({ user, token }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
