import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { handleChat, handleBiasTest, handleSaveConclusion } from "./controllers/openai";
import { handleLogin, handleLogout } from "./controllers/auth";
import {handleEngagementCheck} from "./controllers/engagement"; // Added import


export async function registerRoutes(app: Express): Promise<Server> {
  // Auth endpoints
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);

  // Chat endpoint for handling AI conversations
  app.post("/api/chat", handleChat);

  // Bias testing tool endpoint
  app.post("/api/bias-test", handleBiasTest);

  // Save conclusion endpoint
  app.post("/api/save-conclusion", handleSaveConclusion);

  // Engagement check endpoint
  app.post("/api/check-engagement", handleEngagementCheck);

  // Module endpoints
  app.post("/api/modules", async (req, res) => {
    console.log("[4] API /modules POST endpoint called", req.body);
    try {
      const newModule = await storage.createModule(req.body);
      res.json(newModule);
    } catch (error) {
      console.error('Error creating module:', error);
      res.status(500).json({ error: 'Failed to create module' });
    }
  });

  app.get("/api/modules", async (req, res) => {
    console.log("[4] API /modules GET endpoint called");
    try {
      const modules = await storage.getModules();
      res.json(modules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      res.status(500).json({ error: 'Failed to fetch modules' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}