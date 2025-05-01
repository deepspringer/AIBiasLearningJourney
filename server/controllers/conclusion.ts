
import type { Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function handleValidateConclusion(req: Request, res: Response) {
  try {
    const { conclusion } = req.body;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Validate if a student's conclusion addresses all required points. The conclusion should answer these questions:
1. What are LLMs?
2. How can they be biased?
3. What experiments did the student do?
4. What did they observe/see?
5. What do they think it means?
6. Why does it matter?

Respond with a JSON object containing:
{
  "complete": boolean,
  "missingPoints": string[],
  "feedback": string
}`
        },
        {
          role: "user",
          content: conclusion
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const result = response.choices[0].message.content;
    res.json(JSON.parse(result || "{}"));
  } catch (error) {
    console.error("Error validating conclusion:", error);
    res.status(500).json({ error: "Failed to validate conclusion" });
  }
}
