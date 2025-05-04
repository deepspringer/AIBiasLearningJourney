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
    const { displayName, username, password } = req.body as LoginRequestBody;

    if (!displayName || displayName.trim().length < 2) {
      return res.status(400).json({
        error: "Display name must be at least 2 characters",
      });
    }

    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        error: "Username must be at least 3 characters",
      });
    }

    if (!password || password.trim().length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    // Find user
    let user = await storage.getUserByUsername(username);

    if (user) {
      // Verify password
      if (user.password !== password) { // In a real app, use proper password hashing
        return res.status(401).json({
          error: "Invalid password",
        });
      }
    } else {
      // Create new user
      const userData = insertUserSchema.parse({
        username,
        displayName,
        password,
        role: "student", // Default role
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