import type { Request, Response } from "express";
import OpenAI from "openai";
import { ALGORITHMIC_BIAS_TEXT } from "../../client/src/constants/text-content";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

interface ChatRequestBody {
  systemPrompt: string;
  userMessage: string;
  phase: number;
  paragraph?: number;
  chatHistory: Array<{ role: string; content: string }>;
}

interface BiasTestRequestBody {
  template: string;
  substitutions: string[];
}

interface SaveConclusionRequestBody {
  conclusion: string;
}

export async function handleChat(req: Request, res: Response) {
  try {
    const { systemPrompt, userMessage, phase, paragraph, chatHistory } = req.body as ChatRequestBody;
    
    let finalSystemPrompt = systemPrompt;
    
    // Enhance the system prompt based on the phase
    if (phase === 1 && paragraph !== undefined) {
      const fullText = ALGORITHMIC_BIAS_TEXT.join("\n\n");
      const currentParagraph = ALGORITHMIC_BIAS_TEXT[paragraph - 1];
      
      finalSystemPrompt = `You are helping to guide a student through the following text paragraph by paragraph: ${fullText}. ${systemPrompt} This is the paragraph you are discussing: ${currentParagraph}`;
    }
    
    // Convert chat history to OpenAI format
    const messages = [
      { role: "system" as const, content: finalSystemPrompt },
      ...chatHistory.map(msg => ({ 
        role: msg.role as "user" | "assistant" | "system", 
        content: msg.content 
      })),
      { role: "user" as const, content: userMessage }
    ];
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });
    
    const message = response.choices[0].message.content;
    
    res.json({ message });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
}

export async function handleBiasTest(req: Request, res: Response) {
  try {
    const { template, substitutions } = req.body as BiasTestRequestBody;
    
    if (!template.includes("*")) {
      return res.status(400).json({ error: "Template must include an asterisk (*) placeholder" });
    }
    
    if (!substitutions.length) {
      return res.status(400).json({ error: "No substitution words provided" });
    }
    
    const results = [];
    
    // For this demo, we'll use a default user ID of 1
    // In a real application, you would get the user ID from the session
    const userId = 1;
    
    for (const word of substitutions) {
      const sentence = template.replace("*", word);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system" as const, 
            content: "You are a completion model. The user will provide an incomplete sentence. Your job is to continue the sentence with the next word. Do not repeat the user's sentence. Just continue it."
          },
          { 
            role: "user" as const, 
            content: sentence 
          }
        ],
        temperature: 0.0,
        logprobs: true,
        top_logprobs: 20,
        max_tokens: 5,
      });
      
      const message = response.choices[0].message.content || "";
      const topLogprobs = response.choices[0].logprobs?.content[0].top_logprobs || [];
      
      // Store the result in the database
      await storage.saveBiasTestResult({
        userId,
        template,
        substitution: word,
        result: JSON.stringify({ message, topLogprobs })
      });
      
      results.push({ 
        word, 
        message, 
        topLogprobs 
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
    const { conclusion } = req.body as SaveConclusionRequestBody;
    
    if (!conclusion || conclusion.trim() === "") {
      return res.status(400).json({ error: "No conclusion provided" });
    }
    
    // For this demo, we'll use a default user ID of 1
    // In a real application, you would get the user ID from the session
    const userId = 1;
    
    const savedConclusion = await storage.saveConclusion({
      userId,
      content: conclusion
    });
    
    res.json({ success: true, id: savedConclusion.id });
  } catch (error) {
    console.error("Error in save conclusion endpoint:", error);
    res.status(500).json({ error: "Failed to save conclusion" });
  }
}
