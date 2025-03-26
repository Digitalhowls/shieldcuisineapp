/**
 * Rutas de API para la integración con Perplexity AI
 * Permite generar contenido basado en prompts usando la API de Perplexity
 */

import { Request, Response, NextFunction } from "express";
import type { Express } from "express";
import { log } from "../vite";

// Verificar autenticación
const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "No autenticado" });
  }
  next();
};

// La API de Perplexity
export function registerPerplexityApiRoutes(app: Express) {
  /**
   * Endpoint para generar contenido usando Perplexity AI
   */
  app.post("/api/ai/perplexity/generate", verifyAuth, async (req: Request, res: Response) => {
    try {
      const { prompt, max_tokens = 1000, temperature = 0.2, format = "text" } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Se requiere un prompt" });
      }
      
      // Verificar si la clave API está disponible
      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          message: "Clave API de Perplexity no configurada. Contacta al administrador." 
        });
      }
      
      // Seleccionar el modelo apropiado
      const model = "llama-3.1-sonar-small-128k-online";
      
      // Preparar un prompt de sistema según el formato solicitado
      let systemPrompt = "Eres un asistente experto en creación de contenido para marketing digital y sitios web.";
      
      if (format === "html") {
        systemPrompt += " Genera respuestas en formato HTML limpio y semántico sin incluir etiquetas DOCTYPE, html, head o body.";
      } else if (format === "json") {
        systemPrompt += " Genera respuestas únicamente en formato JSON válido y bien estructurado, sin explicaciones adicionales.";
      }
      
      // Llamada a la API de Perplexity
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens,
          temperature,
          search_domain_filter: ["perplexity.ai"],
          return_images: false,
          return_related_questions: false,
          search_recency_filter: "month",
          top_k: 0,
          stream: false,
          presence_penalty: 0,
          frequency_penalty: 1
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        log(`Error API Perplexity: ${JSON.stringify(errorData)}`, "perplexity");
        return res.status(response.status).json({
          message: "Error en la API de Perplexity",
          details: errorData
        });
      }
      
      const data = await response.json();
      log(`Respuesta Perplexity generada con ${data.usage?.completion_tokens || 'N/A'} tokens`, "perplexity");
      
      return res.status(200).json(data);
    } catch (error) {
      log(`Error generando contenido con Perplexity: ${error.message}`, "perplexity");
      return res.status(500).json({
        message: "Error procesando la solicitud",
        error: error.message
      });
    }
  });
  
  /**
   * Endpoint para verificar el estado del servicio Perplexity
   */
  app.get("/api/ai/perplexity/status", verifyAuth, async (_req: Request, res: Response) => {
    // Verificar si la clave API está disponible
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      return res.status(200).json({ 
        available: false, 
        message: "Clave API de Perplexity no configurada" 
      });
    }
    
    return res.status(200).json({ 
      available: true, 
      message: "Servicio Perplexity disponible" 
    });
  });
}