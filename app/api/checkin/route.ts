import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { userId, emotions, hungerScale, reflection } = await req.json();

    // Server-side logging or additional processing (if needed)
    console.log(`User ${userId} logged a check-in.`);
    
    return NextResponse.json({ 
      status: 'success',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Check-in route error:", error);
    return NextResponse.json({ error: 'Failed to process check-in' }, { status: 500 });
  }
}
