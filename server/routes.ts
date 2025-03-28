import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import aiRoutes from "./routes/ai";
import * as fs from 'fs';
import * as path from 'path';
import { registerMediaApiRoutes } from "./routes/media-api";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes
  setupAuth(app);

  // API básica
  app.get("/api/status", (req, res) => {
    res.json({ status: "ok", authenticated: req.isAuthenticated() });
  });

  // Rutas de inteligencia artificial
  app.use("/api/ai", aiRoutes);

  // Registrar rutas para el Media Manager
  registerMediaApiRoutes(app);

  // Servir archivos estáticos desde la carpeta uploads
  const uploadsDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadsDir, req.path);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  // Crear servidor HTTP
  const httpServer = createServer(app);
  return httpServer;
}