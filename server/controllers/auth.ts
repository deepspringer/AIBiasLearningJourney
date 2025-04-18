import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { storage } from "../storage";
import { insertUserSchema } from "../../shared/schema";

interface LoginRequestBody {
  displayName: string;
}

/**
 * Handle user login/registration
 * This is a simplified auth flow that only requires a display name
 */
export async function handleLogin(req: Request, res: Response) {
  try {
    const { displayName } = req.body as LoginRequestBody;

    if (!displayName || displayName.trim().length < 2) {
      return res.status(400).json({
        error: "Display name must be at least 2 characters",
      });
    }

    // Generate a username based on display name (for uniqueness)
    const username = `${displayName.toLowerCase().replace(/\s+/g, "_")}_${uuidv4().substring(0, 8)}`;

    // Find or create user
    let user = await storage.getUserByUsername(username);

    if (!user) {
      // Create new user
      const userData = insertUserSchema.parse({
        username,
        displayName,
      });

      user = await storage.createUser(userData);
    }

    // Return user info
    return res.status(200).json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "An error occurred during login",
    });
  }
}