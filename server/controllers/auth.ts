import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { storage } from "../storage";

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

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
    const user = await storage.getUserByUsername(username);

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Set session
    req.session.userId = user.id;

    return res.status(200).json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "An error occurred during login",
    });
  }
}

export async function handleLogout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
}