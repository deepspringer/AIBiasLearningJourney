import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { handleChat, handleBiasTest, handleSaveConclusion } from "./controllers/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint for handling AI conversations
  app.post("/api/chat", handleChat);
  
  // Bias testing tool endpoint
  app.post("/api/bias-test", handleBiasTest);
  
  // Save conclusion endpoint
  app.post("/api/save-conclusion", handleSaveConclusion);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
