import { NextResponse } from 'next/server';
import { getProjectById } from '@/services/projectService.js';
import { authMiddleware } from '@/middleware/authMiddleware.js';
import dbConnect from '@/lib/db.js';

export async function GET(req, context) {
    try {
        await dbConnect();

        console.log("Hello");

        const user = await authMiddleware(req);
        console.log("Hello1");
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await context.params;
        const projectId = params?.projectId; 
        console.log("Hello2");
        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }
        console.log("Hello2.1");
        const project = await getProjectById({ projectId });
        console.log("Hello3");

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({ project }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
