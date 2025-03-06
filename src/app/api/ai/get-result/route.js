import { generateResult } from "@/services/aiService";
import { NextResponse } from "next/server";

export async function GET(req) {
    try 
    {
        const prompt = req.nextUrl.searchParams.get("prompt"); 
        if (!prompt) 
        {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }
        const result = await generateResult(prompt);
        return NextResponse.json({ result }, { status: 200 });
    } 
    catch (error) 
    {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
