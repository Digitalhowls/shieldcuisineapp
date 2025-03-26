import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertControlTemplateSchema, insertControlRecordSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { registerClientAuthRoutes } from "./routes/client-auth";
import { registerClientDataRoutes } from "./routes/client-data";
import { registerAIAnalysisRoutes } from "./routes/ai-analysis";
import { registerAIServicesRoutes } from "./routes/ai-services";
import { registerWooCommerceRoutes } from "./routes/woocommerce";
import { registerBankingRoutes } from "./routes/banking";
import { registerELearningRoutes } from "./routes/e-learning";
import { registerNotificationRoutes } from "./routes/notifications";
import { registerPurchasingRoutes } from "./routes/purchasing";
import { registerCmsRoutes } from "./routes/cms";
import { registerCmsApiRoutes } from "./routes/cms-api";
import { registerPerplexityApiRoutes } from "./routes/perplexity-api";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes
  setupAuth(app);

  // APPCC Control Templates
  app.get("/api/control-templates", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const companyId = req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }
      
      const templates = await storage.getControlTemplates(companyId);
      res.json(templates);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/control-templates/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const id = parseInt(req.params.id);
      const template = await storage.getControlTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      if (template.companyId !== req.user?.companyId) {
        return res.status(403).json({ message: "Not authorized to access this template" });
      }
      
      res.json(template);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/control-templates", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Validate request body
      const data = insertControlTemplateSchema.parse({
        ...req.body,
        companyId: req.user.companyId,
      });
      
      const template = await storage.createControlTemplate(data);
      res.status(201).json(template);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      next(err);
    }
  });

  // APPCC Control Records
  app.get("/api/control-records", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const locationId = req.user?.locationId;
      if (!locationId) {
        return res.status(400).json({ message: "No location associated with user" });
      }
      
      const records = await storage.getControlRecords(locationId);
      res.json(records);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/control-records/today", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const locationId = req.user?.locationId;
      if (!locationId) {
        return res.status(400).json({ message: "No location associated with user" });
      }
      
      const records = await storage.getTodayControlRecords(locationId);
      res.json(records);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/control-records/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const id = parseInt(req.params.id);
      const record = await storage.getControlRecord(id);
      
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
      
      if (record.locationId !== req.user?.locationId) {
        return res.status(403).json({ message: "Not authorized to access this record" });
      }
      
      res.json(record);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/control-records", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Validate request body
      const data = insertControlRecordSchema.parse({
        ...req.body,
        locationId: req.user.locationId,
      });
      
      const record = await storage.createControlRecord(data);
      res.status(201).json(record);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      next(err);
    }
  });

  app.patch("/api/control-records/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const id = parseInt(req.params.id);
      const record = await storage.getControlRecord(id);
      
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
      
      if (record.locationId !== req.user?.locationId) {
        return res.status(403).json({ message: "Not authorized to update this record" });
      }
      
      // If completing a record, add the user ID and timestamp
      if (req.body.status === 'completed' && record.status !== 'completed') {
        req.body.completedBy = req.user.id;
        req.body.completedAt = new Date().toISOString();
      }
      
      const updatedRecord = await storage.updateControlRecord(id, req.body);
      res.json(updatedRecord);
    } catch (err) {
      next(err);
    }
  });

  // Registrar rutas de autenticación y datos para cliente
  registerClientAuthRoutes(app);
  registerClientDataRoutes(app);
  
  // Registrar rutas para análisis con IA
  registerAIAnalysisRoutes(app);
  registerAIServicesRoutes(app);
  
  // Registrar rutas para integración con WooCommerce
  registerWooCommerceRoutes(app);
  
  // Registrar rutas para integración bancaria PSD2/Open Banking
  registerBankingRoutes(app);
  
  // Registrar rutas para la plataforma e-learning
  registerELearningRoutes(app);
  
  // Registrar rutas para el sistema de notificaciones
  registerNotificationRoutes(app);
  
  // Registrar rutas para el módulo de compras
  registerPurchasingRoutes(app);
  
  // Registrar rutas para el módulo CMS
  registerCmsRoutes(app);
  
  // Registrar rutas de API para el CMS
  registerCmsApiRoutes(app);
  
  // Registrar rutas para la API de Perplexity AI
  registerPerplexityApiRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
