import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
// Increase JSON payload size limit for audio transcription (50MB)
app.use(express.json({ limit: '50mb' }));
// Increase URL-encoded payload size limit
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
// Moved urlencoded configuration up with JSON configuration

app.use((req, res, next) => {
  // Simple request logging for API endpoints
  if (req.path.startsWith("/api")) {
    log(`${req.method} ${req.path}`);
  }

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT from environment or default to 3000
  // this serves both the API and the client
  const port = process.env.PORT || 3000;
  server.listen({
    port,
    host: "127.0.0.1", // Use localhost instead of 0.0.0.0
  }, () => {
    log(`serving on http://localhost:${port}`);
  });
})();
