import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    console.log("AI Route: Using Groq?", !!groqKey, "Using Gemini?", !!geminiKey);

    // 1. Try Groq (Server-side)
    if (groqKey) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are Sanctuary, a mindful eating coach. Be gentle, empathetic, and non-judgmental. Keep it to 2-3 sentences." },
              { role: "user", content: prompt }
            ],
            temperature: 0.7,
          }),
        });

        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return NextResponse.json({ text: data.choices[0].message.content });
        }
      } catch (e) {
        console.error("Groq API failed:", e);
      }
    }

    // 2. Try Gemini (Server-side fallback)
    if (geminiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: geminiKey, apiVersion: 'v1' });
        const result = await ai.models.generateContent({
          model: "gemini-2.0-flash-lite",
          contents: [{ parts: [{ text: prompt }] }]
        });
        if (result.text) {
          return NextResponse.json({ text: result.text });
        }
      } catch (e) {
        console.error("Gemini API failed:", e);
      }
    }

    return NextResponse.json({ error: "All AI providers failed" }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
