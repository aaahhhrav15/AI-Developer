import { getAllProjectsByUserId } from '@/services/projectService.js';
import { authMiddleware } from '@/middleware/authMiddleware.js';
import User from '@/models/userModel.js';
import dbConnect from '@/lib/db.js';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const user = await authMiddleware(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const loggedInUser = await User.findOne({ email: user.email });

        if (!loggedInUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const projects = await getAllProjectsByUserId({ userId: loggedInUser._id });

        return NextResponse.json({ projects }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
