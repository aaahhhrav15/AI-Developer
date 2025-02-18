import { NextResponse } from 'next/server';
import { createProject } from '@/services/projectService';
import { authMiddleware } from '@/middleware/authMiddleware';
import dbConnect from '@/lib/db';
import User from '@/models/userModel';

export async function POST(req) {
    try {
        await dbConnect(); 


        const user = await authMiddleware(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json(); 

        const loggedInUser = await User.findOne({ email: user.email });
        if (!loggedInUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        const newProject = await createProject({ name, userId: loggedInUser._id });

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
