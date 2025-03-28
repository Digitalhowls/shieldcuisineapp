import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

// Inicializar el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint para generar contenido con OpenAI
router.post('/generate', async (req, res) => {
  try {
    const { prompt, max_tokens = 1000, temperature = 0.2, format = 'text' } = req.body;

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

    // El modelo más reciente es "gpt-4o" que fue lanzado el 13 de mayo de 2024
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
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
      ...(format === 'json' && { response_format: { type: "json_object" } })
    });

    res.json(response);
  } catch (error: any) {
    console.error('Error al llamar a OpenAI:', error);
    res.status(500).json({ 
      message: 'Error al generar contenido', 
      error: error.message || 'Error desconocido'
    });
  }
});

// Endpoint para analizar imágenes
router.post('/analyze-image', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'La imagen es requerida' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analiza la siguiente imagen y proporciona una descripción detallada, etiquetas relevantes y un texto alternativo conciso."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe esta imagen en detalle. Proporciona una descripción completa, sugiere 5-8 etiquetas relevantes y un texto alternativo breve."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`
              }
            }
          ]
        }
      ],
      max_tokens: 800,
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    // Extraer y formatear la respuesta
    const messageContent = response.choices[0].message.content;
    if (!messageContent) {
      throw new Error('La respuesta de OpenAI no contiene contenido');
    }
    
    const content = JSON.parse(messageContent);
    
    res.json({
      description: content.description || '',
      tags: content.tags || [],
      altText: content.altText || ''
    });
  } catch (error: any) {
    console.error('Error al analizar la imagen:', error);
    res.status(500).json({ 
      message: 'Error al analizar la imagen', 
      error: error.message || 'Error desconocido'
    });
  }
});

export default router;