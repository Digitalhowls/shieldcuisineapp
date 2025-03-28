import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Endpoint para generar contenido con Perplexity
router.post('/generate', async (req, res) => {
  try {
    const { prompt, max_tokens = 1000, temperature = 0.2, format = 'text' } = req.body;
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: 'La clave API de Perplexity no está configurada' });
    }

    if (!prompt) {
      return res.status(400).json({ message: 'El prompt es requerido' });
    }

    // Crear un sistema adecuado según el formato solicitado
    let systemMessage = "Eres un asistente experto en la creación de contenido para restaurantes y empresas alimentarias.";
    
    if (format === 'html') {
      systemMessage += " Responde usando HTML bien formado con etiquetas semánticas adecuadas.";
    } else if (format === 'json') {
      systemMessage += " Responde con JSON válido exclusivamente.";
    }

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: max_tokens,
        temperature: temperature,
        search_recency_filter: "month",
      })
    });

    const data = await response.json() as any;
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Error al llamar a la API de Perplexity');
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error al llamar a Perplexity:', error);
    res.status(500).json({ 
      message: 'Error al generar contenido', 
      error: error.message || 'Error desconocido'
    });
  }
});

export default router;