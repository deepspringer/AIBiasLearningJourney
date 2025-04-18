import type { Request, Response } from "express";
import { storage } from "../storage";
import { v4 as uuidv4 } from "uuid";

interface LoginRequestBody {
  displayName: string;
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { displayName } = req.body as LoginRequestBody;
    
    if (!displayName || displayName.trim() === "") {
      return res.status(400).json({ error: "Display name is required" });
    }
    
    // Generate a unique username based on the display name + a unique identifier
    // This ensures uniqueness while still making the username somewhat readable
    const sanitizedName = displayName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const uniqueUsername = `${sanitizedName}_${uuidv4().substring(0, 8)}`;
    
    // Create a new user with the display name
    const user = await storage.createUser({
      username: uniqueUsername,
      displayName,
    });
    
    // In a real application with sessions, you would set the user in the session here
    // For simplicity, we'll just return the user ID
    
    res.json({ 
      id: user.id,
      username: user.username 
    });
  } catch (error) {
    console.error("Error in login endpoint:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
}