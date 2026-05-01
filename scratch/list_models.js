const { GoogleGenAI } = require("@google/genai");

async function listModels() {
  const apiKey = "AIzaSyB_H-pwrTu5Q6Prv6thpqcMbip-y15snZI";
  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });
  
  try {
    const response = await ai.models.list();
    console.log("Full Response:", JSON.stringify(response, null, 2));
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

listModels();
