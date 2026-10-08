import { assistantResponseSchema } from './types';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function callGroqAPI(messages: { role: string; content: string }[]) {
  const systemPrompt = `You are an AI Nutrition Assistant. Answer general questions about Food, Nutrition, Nutrients, Cooking, Food preparation, Food storage, and Food safety.
Be clear, concise, practical, neutral, and easy for a general audience to understand. 
Preferably use 2–5 short paragraphs or concise bullet points depending on the question.
If evidence is uncertain, clearly acknowledge it.
You MUST output your response strictly as a JSON object matching this schema:
{
  "answer": "Your detailed answer goes here",
  "claims": [
    {
      "claim": "Extract a meaningful factual claim from your answer",
      "source": null
    }
  ]
}
ALL sources MUST be exactly null. Do not invent sources.`;

  const payload = {
    model: "llama3-8b-8192", // Sample model
    messages: [
      { role: "system", content: systemPrompt },
      ...messages
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Parse using Zod to ensure it matches the schema
  const parsed = assistantResponseSchema.parse(JSON.parse(content));
  
  // Enforce source = null for Milestone 1
  parsed.claims = parsed.claims.map(c => ({ ...c, source: null }));
  
  return parsed;
}
