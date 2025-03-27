import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes
  setupAuth(app);

  // API básica
  app.get("/api/status", (req, res) => {
    res.json({ status: "ok", authenticated: req.isAuthenticated() });
  });

  const httpServer = createServer(app);
  return httpServer;
}