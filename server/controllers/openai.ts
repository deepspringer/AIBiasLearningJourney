import type { Request, Response } from "express";
import OpenAI from "openai";
import { storage } from "../storage";
import fs from "fs";

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
      console.log("[Phase 1] Starting paragraph processing for paragraph:", paragraph);
      const moduleId = parseInt(req.body.moduleId, 10);
      console.log("[Phase 1] Using module ID:", moduleId);
      const module = await storage.getModule(moduleId);
      if (module && module.text) {
        console.log("[Phase 1] Retrieved module text, length:", module.text.length);
        console.log("[Phase 1] Module section indexes:", module.sectionIndexes);

        // Format the full text
        const fullText = Array.isArray(module.text) ?
          module.text.map(item => {
            if (typeof item === 'string') return item;
            if (item.type === 'text') return item.content;
            if (item.type === 'image') return '[Image content]';
            if (item.type === 'html') return '[Interactive HTML content]';
            return `[Unknown content type: ${item.type}]`;
          }).join("\n\n") : '';

        // Determine which section the current paragraph belongs to
        const sectionIndexes = Array.isArray(module.sectionIndexes) ? module.sectionIndexes : [0];
        console.log("[Phase 1] Section indexes:", sectionIndexes);

        // Find the section that contains the current paragraph
        let sectionStartIndex = 0;
        let sectionEndIndex = module.text.length;

        for (let i = 0; i < sectionIndexes.length; i++) {
          if (paragraph >= sectionIndexes[i]) {
            sectionStartIndex = sectionIndexes[i];
            sectionEndIndex = sectionIndexes[i + 1] || module.text.length;
            if (paragraph < sectionEndIndex) break;
          }
        }

        console.log(`[Phase 1] Current paragraph ${paragraph} is in section from index ${sectionStartIndex} to ${sectionEndIndex}`);

        // Extract the current section text
        const sectionContent = module.text.slice(sectionStartIndex, sectionEndIndex);
        const sectionText = sectionContent.map(item => {
          if (typeof item === 'string') return item;
          if (item.type === 'text') return item.content;
          if (item.type === 'image') return '[Image content]';
          if (item.type === 'html') return '[Interactive HTML content]';
          return `[Unknown content type: ${item.type}]`;
        }).join("\n\n");

        console.log("[Phase 1] Current section length:", sectionText.length);

        // Create the system prompt with the entire section context
        finalSystemPrompt = `You are helping to guide a student through the following text, section by section: ${fullText}. ${systemPrompt} This is the section you are discussing now:\n\n${sectionText}`;
        console.log("[Phase 1] Generated final system prompt, length:", finalSystemPrompt.length);
      }
    }

    // Store the user's message in the database
    try {
      const parsedUserId = parseInt(userId.toString(), 10);
      if (isNaN(parsedUserId)) {
        throw new Error("Invalid user ID");
      }
      
      const messageToSave = {
        userId: parsedUserId,
        role: "user",
        content: userMessage,
        phase,
        paragraph,
      };
      
      const savedMessage = await storage.saveMessage(messageToSave);

      // If this is a survey submission, just save it without generating an AI response
      if (phase === 3 && userMessage.startsWith('Survey Results:')) {
        return res.json({ message: "" });
      }
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

interface TranscribeRequestBody {
  audio: string; // Base64 encoded audio
  userId?: string | null;
}

export async function handleTranscribe(req: Request, res: Response) {
  try {
    const { audio, userId: requestUserId } = req.body as TranscribeRequestBody;

    if (!audio) {
      return res.status(400).json({ error: "No audio data provided" });
    }

    // Convert base64 to Buffer
    const audioBuffer = Buffer.from(audio, 'base64');

    // Log the size of the audio
    console.log(`[Server] Received audio size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)}MB`);

    // Create a temporary file with the audio data
    const tempFilePath = `/tmp/audio-${Date.now()}.webm`;
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Send to OpenAI's Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "en",
      // Force whisper to use a lower quality but smaller model
      response_format: "text",
    });

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    // Log success (without the full audio data) and handle different response formats
    console.log("[Server] Audio transcription successful:", {
      transcription,
      audio_size_kb: Math.round(audioBuffer.length / 1024)
    });

    // When response_format is "text", the API returns a string directly
    // instead of an object with a text property
    const transcriptionText = typeof transcription === 'string'
      ? transcription
      : transcription.text || "";

    // Return the transcription with a consistent format
    res.json({ text: transcriptionText });

  } catch (error: any) {
    console.error("Error in transcribe endpoint:", error);

    // Provide more detailed error info for debugging
    const errorMessage = error.message || "Unknown error";
    const errorStatus = error.status || 500;

    res.status(errorStatus).json({
      error: "Failed to transcribe audio",
      details: errorMessage
    });
  }
}