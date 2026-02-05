import OpenAI from "openai";
import { NextApiRequest, NextApiResponse } from "next";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing messages" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a conversational invoice assistant for Australian contractors. Help users create invoices by collecting necessary information: full name, to (company or person to whom the ABN is issued), ABN, client name, client email, invoice number, date, rate per hour, items (work hours per day or purchases), notes.

When you have all the information, respond ONLY with JSON: { "fullName": "...", "to": "...", "abn": "...", "clientName": "...", "clientEmail": "...", "invoiceNumber": "...", "date": "...", "rate": ..., "items": [{"type": "work", "day": "...", "hours": ..., "rate": ..., "description": "..."} or {"type": "purchase", "description": "...", "quantity": ..., "unitPrice": ...}], "note": "..." }.

If missing info, ask for it in a friendly way. Respond in Spanish if the user speaks Spanish. Keep responses short and conversational.`,
        },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0].message?.content?.trim();
    if (!response) {
      throw new Error("No response from AI");
    }

    // Try to parse as JSON
    try {
      const data = JSON.parse(response);
      res.status(200).json(data);
    } catch {
      // If not JSON, return as message
      res.status(200).json({ message: response });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing request" });
  }
}
