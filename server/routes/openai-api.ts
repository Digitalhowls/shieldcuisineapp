import { Request, Response, Express } from "express";
import OpenAI from "openai";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import dotenv from "dotenv";

dotenv.config();

// Middleware para verificar autenticación
const verifyAuth = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "No autenticado" });
  }
  next();
};

// Middleware para verificar la clave API de OpenAI
const verifyOpenAIKey = (req: Request, res: Response, next: Function) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ message: "API key de OpenAI no configurada" });
  }
  next();
};

// Esquema para validar solicitudes de generación de contenido
const generateContentSchema = z.object({
  prompt: z.string().min(1).max(4000),
  max_tokens: z.number().int().positive().max(4000).optional().default(1000),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  format: z.enum(["text", "html", "json"]).optional().default("text"),
});

/**
 * Registra las rutas para la API de OpenAI
 */
export function registerOpenAIApiRoutes(app: Express) {
  // Configuración de OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  /**
   * Endpoint para generar contenido con OpenAI
   */
  app.post("/api/ai/openai/generate", verifyAuth, verifyOpenAIKey, async (req: Request, res: Response) => {
    try {
      // Validar datos de entrada
      const validatedData = generateContentSchema.parse(req.body);
      
      // Preparar sistema de mensaje según el formato solicitado
      let systemMessage = "Eres un asistente experto en generación de contenido de alta calidad.";
      
      if (validatedData.format === "html") {
        systemMessage += " Genera respuestas en formato HTML limpio, usando etiquetas apropiadas (p, h1-h6, ul, li, etc.), sin incluir doctype, html, head o body.";
      } else if (validatedData.format === "json") {
        systemMessage += " Genera respuestas en formato JSON válido y bien estructurado.";
      }
      
      // Llamar a la API de OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: validatedData.prompt }
        ],
        max_tokens: validatedData.max_tokens,
        temperature: validatedData.temperature,
      });
      
      // Convertir la respuesta al formato esperado por el cliente 
      const transformedResponse = {
        id: response.id,
        model: response.model,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        choices: [
          {
            index: 0,
            finish_reason: response.choices[0]?.finish_reason || "stop",
            message: {
              role: "assistant",
              content: response.choices[0]?.message?.content || ""
            }
          }
        ],
        usage: response.usage
      };
      
      res.json(transformedResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error en OpenAI API:", error);
      res.status(500).json({ message: "Error al generar contenido con OpenAI" });
    }
  });

  /**
   * Endpoint para analizar imágenes con OpenAI
   */
  app.post("/api/ai/openai/analyze-image", verifyAuth, async (req: Request, res: Response) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ message: "API key de OpenAI no configurada" });
      }

      const imageSchema = z.object({
        image: z.string(),
      });

      // Validar la entrada
      const validatedData = imageSchema.parse(req.body);

      // Llamar a la API de OpenAI con Vision
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { 
            role: "system", 
            content: "Eres un experto en análisis de imágenes para CMS. Analiza la imagen y proporciona una descripción detallada, sugerencias de texto alternativo (alt text) conciso, y etiquetas relevantes para categorizar la imagen. Responde en formato JSON con los campos 'description', 'altText', y 'tags'."
          },
          { 
            role: "user", 
            content: [
              { 
                type: "text", 
                text: "Analiza esta imagen y proporciona información detallada sobre ella."
              },
              { 
                type: "image_url", 
                image_url: {
                  url: `data:image/jpeg;base64,${validatedData.image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
      });

      // Transformar la respuesta a JSON
      const content = JSON.parse(response.choices[0].message.content);
      
      res.json({
        description: content.description || "",
        altText: content.altText || "",
        tags: content.tags || []
      });
    } catch (error) {
      console.error("Error al analizar imagen con OpenAI:", error);
      
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Error al analizar imagen con OpenAI" });
    }
  });

  /**
   * Endpoint para verificar el estado del servicio de OpenAI
   */
  app.get("/api/ai/openai/status", verifyAuth, async (_req: Request, res: Response) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(200).json({ status: "not_configured", message: "API key de OpenAI no configurada" });
      }
      
      // No hacemos una llamada real a la API para no gastar tokens
      // Solo verificamos que la clave esté configurada
      res.json({ status: "ready", message: "Servicio de OpenAI disponible" });
    } catch (error) {
      console.error("Error al verificar estado de OpenAI:", error);
      res.status(500).json({ status: "error", message: "Error al verificar estado de OpenAI" });
    }
  });
}