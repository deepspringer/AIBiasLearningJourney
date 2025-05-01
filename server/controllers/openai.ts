import type { Request, Response } from "express";
import OpenAI from "openai";
import { ALGORITHMIC_BIAS_TEXT } from "../../client/src/constants/text-content";
import { storage } from "../storage";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

interface ChatRequestBody {
  systemPrompt: string;
  userMessage: string;
  phase: number;
  paragraph?: number;
  chatHistory: Array<{ role: string; content: string }>;
  userId?: string | null;
}

interface BiasTestRequestBody {
  template: string;
  substitutions: string[];
  userId?: string | null;
}

interface SaveConclusionRequestBody {
  conclusion: string;
  userId?: string | null;
}

export async function handleChat(req: Request, res: Response) {
  try {
    const {
      systemPrompt,
      userMessage,
      phase,
      paragraph,
      chatHistory,
      userId: requestUserId,
    } = req.body as ChatRequestBody;

    // Use the user ID from the request if provided, otherwise use default
    const userId = requestUserId ? parseInt(requestUserId, 10) : 1;

    let finalSystemPrompt = systemPrompt;

    // Enhance the system prompt based on the phase
    if (phase === 1 && paragraph !== undefined) {
      const fullText = ALGORITHMIC_BIAS_TEXT.join("\n\n");
      const currentParagraph = ALGORITHMIC_BIAS_TEXT[paragraph - 1];

      finalSystemPrompt = `You are helping to guide a student through the following text paragraph by paragraph: ${fullText}. ${systemPrompt} This is the paragraph you are discussing: ${currentParagraph}`;
    }

    // Store the user's message in the database
    try {
      console.log("[Server] Received message payload:", req.body);
      await storage.saveMessage({
        userId,
        role: "user",
        content: userMessage,
        phase,
        paragraph,
      });
    } catch (saveMessageError) {
      console.error("[Server] Error saving message:", saveMessageError);
      throw saveMessageError;
    }

    // Convert chat history to OpenAI format
    const messages = [
      { role: "system" as const, content: finalSystemPrompt },
      ...chatHistory.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })),
      { role: "user" as const, content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const message = response.choices[0].message.content || "";

    // Store the assistant's response in the database
    await storage.saveMessage({
      userId,
      role: "assistant",
      content: message || "",
      phase,
      paragraph,
    });

    // Also store the system prompt if this is the first message in the conversation
    if (chatHistory.length === 0) {
      await storage.saveMessage({
        userId,
        role: "system",
        content: finalSystemPrompt,
        phase,
        paragraph,
      });
    }

    res.json({ message });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
}

export async function handleBiasTest(req: Request, res: Response) {
  try {
    const {
      template,
      substitutions,
      userId: requestUserId,
    } = req.body as BiasTestRequestBody;

    if (!template.includes("*")) {
      return res
        .status(400)
        .json({ error: "Template must include an asterisk (*) placeholder" });
    }

    if (!substitutions.length) {
      return res.status(400).json({ error: "No substitution words provided" });
    }

    const results = [];

    // Use the user ID from the request if provided, otherwise use default
    const userId = requestUserId ? parseInt(requestUserId, 10) : 1;

    for (const word of substitutions) {
      const sentence = template.replace("*", word);

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system" as const,
            content:
              "You are a completion model. The user will provide an incomplete sentence. Your job is to continue the sentence with the next word. Do not repeat the user's sentence. Just continue it.",
          },
          {
            role: "user" as const,
            content: sentence,
          },
        ],
        temperature: 0.0,
        logprobs: true,
        top_logprobs: 10,
        max_tokens: 50,
      });

      const message = response.choices[0].message.content || "";
      // Safely access logprobs with nullish coalescing to handle potential null/undefined
      const topLogprobs =
        response.choices[0].logprobs?.content?.[0]?.top_logprobs || [];

      // Store the result in the database
      await storage.saveBiasTestResult({
        userId,
        template,
        substitution: word,
        result: JSON.stringify({ message, topLogprobs }),
      });

      results.push({
        word,
        message,
        topLogprobs,
      });
    }

    res.json({ results });
  } catch (error) {
    console.error("Error in bias test endpoint:", error);
    res.status(500).json({ error: "Failed to run bias test" });
  }
}

export async function handleSaveConclusion(req: Request, res: Response) {
  try {
    console.log("[Server] Received request body:", req.body);
    const { conclusion, userId: requestUserId } =
      req.body as SaveConclusionRequestBody;

    if (!conclusion || conclusion.trim() === "") {
      return res.status(400).json({ error: "No conclusion provided" });
    }

    // Require user ID for saving conclusions
    if (!requestUserId) {
      console.log("[Server] No userId provided in request");
      return res.status(400).json({ error: "User ID is required" });
    }

    const userId = parseInt(requestUserId, 10);
    console.log("[Server] Parsed userId:", userId);

    console.log("[Server] Saving conclusion with userId:", userId);
    console.log("[Server] Conclusion payload:", { userId, content: conclusion }); // Added logging
    const savedConclusion = await storage.saveConclusion({
      userId,
      content: conclusion,
    });
    console.log("[Server] Conclusion saved successfully:", savedConclusion); //Added logging

    res.json({ success: true, id: savedConclusion.id });
  } catch (error) {
    console.error("Error in save conclusion endpoint:", error);
    res.status(500).json({ error: "Failed to save conclusion" });
  }
}