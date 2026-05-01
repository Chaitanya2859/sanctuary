export async function getAIResponse(prompt: string) {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    return data.text || null;
  } catch (e) {
    console.error("Internal AI API failed:", e);
    return null;
  }
}
