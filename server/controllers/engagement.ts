
import type { Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function handleEngagementCheck(req: Request, res: Response) {
  try {
    console.log("Received engagement check request");
    const { paragraphText, messages } = req.body;
    console.log("Request body:", {
      paragraphLength: paragraphText?.length,
      messagesLength: messages?.length
    });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Your job is to determine whether the student has made a good faith effort to engage with some concepts in the following paragraph: ${paragraphText}. A good faith response will include some attempt to articulate an idea. It can be a summary. It can be a new question. It can be vague. But it should not be a one-word response, a verbatim copying of part of the original text, or a zero-effort answer.

You should respond with a JSON object in the format:
{
"engaged": true, // or false
"engagement_score": 7, // on a scale of 1-10
"reason": "string" // a few words explaining the score
}`
        },
        {
          role: "user",
          content: `Here is the paragraph text:\n${paragraphText}\n\nHere is the conversation the student has had about this text:\n${messages}`
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const result = response.choices[0].message.content;
    const parsedResult = JSON.parse(result || "{}");
    console.log("Engagement check:", parsedResult);
    res.json(parsedResult);
  } catch (error) {
    console.error("Error in engagement check:", error);
    res.status(500).json({ error: "Failed to check engagement" });
  }
}
