import { GoogleGenAI } from "@google/genai";
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export const getChatResponse = async (messages) => {
  const prompt = messages
    .map(({ role, content }) => `${role}: ${content}`)
    .join("\n");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are a helpful assistant that writes legal clauses.",
      },
    });

    return { reply: response.text };
  } catch (err) {
    console.error("Gemini API error:", err);
    throw new Error("Failed to get response from Gemini API");
  }
};
export const summarizeDocument = async (text) => {
  const prompt = `user: Summarize the following legal document:\n\n${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are a helpful assistant that summarizes legal documents clearly and concisely.",
      },
    });

    return response.text;
  } catch (err) {
    console.error("Gemini API error:", err);
    throw new Error("Failed to summarize document using Gemini API");
  }
};
export const getCaseOutcomePrediction = async (caseDescription) => {
  const prompt = `
You are a legal expert assistant.

Here is a case description:
${caseDescription}

Based on this, predict the most likely outcome of the case and provide a probability score (0-100%) for the prediction.
Just write a single percentage nothing else in response
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are a legal expert that predicts case outcomes.",
      },
    });

    const predictionText = response.text;

    return { prediction: predictionText };
  } catch (err) {
    console.error("Gemini API error:", err);
    throw new Error("Failed to get prediction from Gemini API");
  }
};
export const getEmbedding = async (text) => {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      taskType: "RETRIEVAL_DOCUMENT",
    });
    return response.embeddings;
  } catch (err) {
    console.error("Gemini Embedding error:", err);
    throw new Error("Failed to get embedding from Gemini API");
  }
};
export const queryEmbedding = async (text) => {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      taskType: "RETRIEVAL_DOCUMENT",
    });
    return response.embeddings;
  } catch (err) {
    console.error("Gemini Embedding error:", err);
    throw new Error("Failed to get embedding from Gemini API");
  }
};
