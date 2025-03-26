import { Express, Request, Response } from "express";
import {
  analyzeAPPCCControl,
  analyzeInventoryData,
  analyzePurchaseOrders,
  type APPCCAnalysisRequest,
  type InventoryAnalysisRequest,
  type PurchaseOrdersAnalysisRequest
} from "../services/openai-server";

/**
 * Middleware para verificar autenticación
 */
const verifyAuth = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "No autenticado" });
  }
  next();
};

/**
 * Registra las rutas para servicios de IA
 */
export function registerAIServicesRoutes(app: Express) {
  /**
   * Endpoint para análisis de APPCC
   */
  app.post("/api/ai/analyze/appcc", verifyAuth, async (req: Request, res: Response) => {
    try {
      const requestData: APPCCAnalysisRequest = req.body;
      
      if (!requestData.controlData || !requestData.requestType) {
        return res.status(400).json({ error: "Datos de solicitud incompletos" });
      }
      
      const analysisResult = await analyzeAPPCCControl(requestData);
      res.json(analysisResult);
    } catch (error: any) {
      console.error("Error en análisis APPCC:", error);
      res.status(500).json({ error: error.message || "Error en el análisis con IA" });
    }
  });

  /**
   * Endpoint para análisis de inventario
   */
  app.post("/api/ai/analyze/inventory", verifyAuth, async (req: Request, res: Response) => {
    try {
      const requestData: InventoryAnalysisRequest = req.body;
      
      if (!requestData.productData || !requestData.requestType) {
        return res.status(400).json({ error: "Datos de solicitud incompletos" });
      }
      
      const analysisResult = await analyzeInventoryData(requestData);
      res.json(analysisResult);
    } catch (error: any) {
      console.error("Error en análisis de inventario:", error);
      res.status(500).json({ error: error.message || "Error en el análisis con IA" });
    }
  });

  /**
   * Endpoint para análisis de órdenes de compra
   */
  app.post("/api/ai/analyze/purchases", verifyAuth, async (req: Request, res: Response) => {
    try {
      const requestData: PurchaseOrdersAnalysisRequest = req.body;
      
      if (!requestData.ordersData || !requestData.requestType) {
        return res.status(400).json({ error: "Datos de solicitud incompletos" });
      }
      
      const analysisResult = await analyzePurchaseOrders(requestData);
      res.json(analysisResult);
    } catch (error: any) {
      console.error("Error en análisis de compras:", error);
      res.status(500).json({ error: error.message || "Error en el análisis con IA" });
    }
  });

  /**
   * Endpoint para verificar estado del servicio de IA
   */
  app.get("/api/ai/status", verifyAuth, async (_req: Request, res: Response) => {
    try {
      // Comprobación simple de que la API está funcionando y configurada
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          status: "unavailable",
          error: "API key no configurada" 
        });
      }
      
      res.json({ 
        status: "available",
        model: "gpt-4o"
      });
    } catch (error: any) {
      console.error("Error verificando estado de IA:", error);
      res.status(500).json({ 
        status: "error",
        error: error.message 
      });
    }
  });
}