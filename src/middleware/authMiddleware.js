import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import redisClient from "@/services/redisService.js";

export async function authMiddleware(req) {
    try {
        const cookieStore = await cookies();  
        const token = cookieStore.get("token")?.value || req.headers.get("authorization")?.split(" ")[1];

        if (!token) {
            return NextResponse.json({ error: "Invalid or expired token", status: 401 });
        }

        if (await redisClient.get(token)) {
            return NextResponse.json({ error: "Invalid or expired token", status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;  

    } catch (error) {
        return NextResponse.json({ error: "Invalid or expired token", status: 401 });
    }
}
