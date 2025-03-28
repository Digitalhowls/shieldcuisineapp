import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import aiRoutes from "./routes/ai";
import elearningRoutes from "./routes/elearning-api";
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
  
  // Endpoint público para verificar los endpoints disponibles en el módulo de formación
  app.get("/api/elearning/info", (req, res) => {
    res.json({
      status: "ok",
      module: "E-Learning",
      endpoints: [
        { path: "/api/elearning/courses", method: "GET", auth: true, description: "Obtener todos los cursos" },
        { path: "/api/elearning/courses/:id", method: "GET", auth: true, description: "Obtener detalles de un curso" },
        { path: "/api/elearning/courses", method: "POST", auth: true, description: "Crear un nuevo curso" },
        { path: "/api/elearning/courses/:id", method: "PUT", auth: true, description: "Actualizar un curso existente" },
        { path: "/api/elearning/courses/:id", method: "DELETE", auth: true, description: "Eliminar un curso" },
        { path: "/api/elearning/courses/:courseId/modules", method: "GET", auth: true, description: "Obtener módulos de un curso" },
        { path: "/api/elearning/courses/:courseId/lessons", method: "GET", auth: true, description: "Obtener lecciones de un curso" },
        { path: "/api/elearning/courses/:courseId/quizzes", method: "GET", auth: true, description: "Obtener evaluaciones de un curso" },
        { path: "/api/elearning/my-enrollments", method: "GET", auth: true, description: "Obtener cursos en los que estoy inscrito" },
        { path: "/api/elearning/my-certificates", method: "GET", auth: true, description: "Obtener mis certificados" }
      ]
    });
  });

  // Rutas de inteligencia artificial
  app.use("/api/ai", aiRoutes);

  // Rutas para el módulo de formación (E-Learning)
  app.use("/api/elearning", elearningRoutes);

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