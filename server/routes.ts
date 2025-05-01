import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { handleChat, handleBiasTest, handleSaveConclusion } from "./controllers/openai";
import { handleLogin } from "./controllers/auth";
import { handleEngagementCheck } from "./controllers/engagement";
import { handleValidateConclusion } from "./controllers/conclusion";


export async function registerRoutes(app: Express): Promise<Server> {
  // Auth endpoint
  app.post("/api/auth/login", handleLogin);

  // Chat endpoint for handling AI conversations
  app.post("/api/chat", handleChat);

  // Bias testing tool endpoint
  app.post("/api/bias-test", handleBiasTest);

  // Save conclusion endpoint
  app.post("/api/save-conclusion", handleSaveConclusion);

  // Engagement check endpoint
  app.post("/api/check-engagement", handleEngagementCheck);

  // Conclusion validation endpoint
  app.post("/api/validate-conclusion", handleValidateConclusion);

  const httpServer = createServer(app);

  return httpServer;
}