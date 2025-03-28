import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import aiRoutes from "./routes/ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes
  setupAuth(app);

  // API básica
  app.get("/api/status", (req, res) => {
    res.json({ status: "ok", authenticated: req.isAuthenticated() });
  });

  // Rutas de inteligencia artificial
  app.use("/api/ai", aiRoutes);

  const httpServer = createServer(app);
  return httpServer;
}