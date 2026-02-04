import OpenAI from "openai";
import { NextApiRequest, NextApiResponse } from "next";

interface InvoiceItem {
  day: string;
  hours: number;
  rate: number;
  description: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ items: InvoiceItem[] } | { error: string }>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }

  try {
    const completion = await openai.completions.create({
      model: "gpt-3.5-turbo",
      prompt: `You are an invoice assistant for Australian contractors. Parse the user's message (which may be in Spanish or English) into invoice items for an ABN-compliant invoice. 

Rules:
- Extract hours worked per day (e.g., Lun 7.5 = Monday 7.5 hours).
- If hours are grouped by week (e.g., "40 hours this week"), distribute intelligently across Mon-Fri (e.g., 8 hours each).
- Extract rate per hour (e.g., "a 35 la hora" = $35/hour).
- Handle additional items like equipment costs or expenses (e.g., "plus $100 for tools").
- Days: Mon, Tue, Wed, Thu, Fri, Sat, Sun (or Spanish equivalents: Lun, Mar, Mie, Jue, Vie, Sab, Dom).
- Output only valid JSON: { items: [{ day: "Mon", hours: 7.5, rate: 35, description: "" }] }. No extra text.

User message: ${message}`,
      max_tokens: 500,
      temperature: 0,
    });

    const response = completion.choices[0].text?.trim();
    if (!response) {
      throw new Error("No response from AI");
    }
    const data: { items: InvoiceItem[] } = JSON.parse(response);

    if (!data.items || !Array.isArray(data.items)) {
      return res.status(400).json({ error: "Invalid response from AI" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    // Fallback: simple parsing without AI
    const items: InvoiceItem[] = [];
    const dayMap: { [key: string]: string } = {
      lun: "Mon",
      mar: "Tue",
      mie: "Wed",
      jue: "Thu",
      vie: "Fri",
      sab: "Sat",
      dom: "Sun",
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
    };
    const rateMatch = message.match(/(\d+) la hora|a (\d+)/i);
    const rate = rateMatch ? parseFloat(rateMatch[1]) : 0;
    const dayMatches = message.match(/(\w+)\s+(\d+(?:\.\d+)?)/gi);
    if (dayMatches) {
      dayMatches.forEach((match) => {
        const [dayStr, hoursStr] = match.split(/\s+/);
        const day = dayMap[dayStr.toLowerCase()] || dayStr;
        const hours = parseFloat(hoursStr);
        if (hours) items.push({ day, hours, rate, description: "" });
      });
    }
    if (items.length === 0) {
      return res
        .status(400)
        .json({ error: "Could not parse hours from message" });
    }
    res.status(200).json({ items });
  }
}
