import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { handleChat, handleBiasTest, handleSaveConclusion, handleTranscribe } from "./controllers/openai";
import { handleLogin, handleLogout } from "./controllers/auth";
import { handleEngagementCheck } from "./controllers/engagement";
import { uploadMiddleware, handleImageUpload } from "./controllers/images"; // Added import for image handling


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

  // Image upload endpoint
  app.post("/api/upload-image", uploadMiddleware, handleImageUpload);

  // Audio transcription endpoint
  app.post("/api/transcribe", handleTranscribe);

  // Module endpoints
  app.post("/api/modules", async (req, res) => {
    try {
      console.log("[Routes] Creating module with data:", req.body);
      console.log("[Routes] Section indexes for new module:", req.body.section_indexes);

      // Ensure section_indexes is properly passed
      if (req.body.section_indexes === undefined) {
        req.body.section_indexes = [0];
      }

      const newModule = await storage.createModule(req.body);
      res.json(newModule);
    } catch (error) {
      console.error('Error creating module:', error);
      res.status(500).json({
        error: 'Failed to create module',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/modules", async (req, res) => {
    try {
      console.log("GET /api/modules called");
      const modules = await storage.getModules();
      console.log("Modules retrieved:", modules);
      res.json(modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
      console.error(error instanceof Error ? error.stack : 'Unknown error type');
      res.status(500).json({
        error: 'Failed to fetch modules',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/modules/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`[Routes] Getting module with ID: ${id}`);

      if (!id || isNaN(parseInt(id, 10))) {
        return res.status(400).json({ error: 'Invalid module ID' });
      }

      const module = await storage.getModule(parseInt(id, 10));
      console.log(`[Routes] Module found:`, module ? "Yes" : "No");

      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }

      // Ensure section indexes is an array
      if (module.sectionIndexes === undefined || module.sectionIndexes === null) {
        module.sectionIndexes = [0];
      }

      console.log(`[Routes] Module data:`, {
        id: module.id,
        name: module.name,
        sectionIndexes: module.sectionIndexes
      });

      res.json(module);
    } catch (error) {
      console.error('[Routes] Error fetching module:', error);
      res.status(500).json({
        error: 'Failed to fetch module',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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
        sectionIndexes: req.body.section_indexes || [0], // Add section indexes mapping
        systemPromptRead: req.body.system_prompt_read,
        experimentHtml: req.body.experiment_html,
        systemPromptExperiment: req.body.system_prompt_experiment,
        concludeText: req.body.conclude_text,
        systemPromptConclude: req.body.system_prompt_conclude
      };

      console.log("[Routes] Section indexes to save:", req.body.section_indexes);
      
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