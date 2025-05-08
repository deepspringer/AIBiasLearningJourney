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
    
    try {
      const newModule = await storage.createModule(req.body);
      res.json(newModule);
    } catch (error) {
      console.error('Error creating module:', error);
      res.status(500).json({ error: 'Failed to create module' });
    }
  });

  app.get("/api/modules", async (req, res) => {
    try {
      const modules = await storage.getModules();
      res.json(modules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      res.status(500).json({ error: 'Failed to fetch modules' });
    }
  });

  app.get("/api/modules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const module = await storage.getModule(parseInt(id, 10));
      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }
      res.json(module);
    } catch (error) {
      console.error('Error fetching module:', error);
      res.status(500).json({ error: 'Failed to fetch module' });
    }
  });

  app.put("/api/modules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log("[Routes] Updating module", id, "with body:", req.body);
      
      // Map request body fields to database column names
      const mappedData = {
        name: req.body.name,
        description: req.body.description,
        text: req.body.text,
        systemPromptRead: req.body.system_prompt_read,
        experimentHtml: req.body.experiment_html,
        systemPromptExperiment: req.body.system_prompt_experiment,
        concludeText: req.body.conclude_text,
        systemPromptConclude: req.body.system_prompt_conclude
      };
      
      const result = await storage.updateModule(parseInt(id, 10), mappedData);
      console.log("[Routes] Module updated successfully:", result);
      res.json(result);
    } catch (error) {
      console.error('[Routes] Error updating module:', error);
      res.status(500).json({ 
        error: 'Failed to update module',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}