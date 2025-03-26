/**
 * Servicio para interactuar con la API de Perplexity AI
 * Permite generar contenido para usar en el CMS y el constructor web
 */

export interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations?: string[];
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface GenerateContentOptions {
  instruction: string;
  context?: string;
  format?: 'text' | 'html' | 'json';
  maxTokens?: number;
  temperature?: number;
  language?: 'es' | 'en';
}

/**
 * Genera contenido utilizando la API de Perplexity
 */
export async function generateContent(options: GenerateContentOptions): Promise<string> {
  const {
    instruction,
    context = "",
    format = "text",
    maxTokens = 1000,
    temperature = 0.2,
    language = "es"
  } = options;
  
  // Preparar el prompt según el formato solicitado
  let prompt = instruction;
  
  if (context) {
    prompt = `Contexto: ${context}\n\n${prompt}`;
  }
  
  // Añadir instrucciones específicas según el formato deseado
  if (format === 'html') {
    prompt += "\n\nPor favor, genera el contenido en formato HTML utilizando etiquetas adecuadas (p, h1-h6, ul, li, etc). No incluyas <!DOCTYPE>, <html>, <head> o <body>.";
  } else if (format === 'json') {
    prompt += "\n\nPor favor, genera el contenido en formato JSON válido.";
  }
  
  if (language === 'en') {
    prompt += "\n\nPlease respond in English.";
  }
  
  try {
    const response = await fetch('/api/ai/perplexity/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        max_tokens: maxTokens,
        temperature,
        format
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error generando contenido');
    }
    
    const data: PerplexityResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error llamando a la API de Perplexity:', error);
    throw error;
  }
}

/**
 * Genera sugerencias para mejorar el SEO en el CMS
 */
export async function generateSeoSuggestions(
  title: string,
  content: string
): Promise<{ title: string; description: string; keywords: string[] }> {
  const prompt = `Analiza el siguiente título y contenido de página web y genera sugerencias para mejorar el SEO:
  
  Título: ${title}
  
  Contenido: ${content.substring(0, 1000)}...
  
  Por favor, proporciona:
  1. Un título SEO mejorado (menos de 60 caracteres)
  2. Una meta descripción atractiva (menos de 160 caracteres)
  3. Una lista de keywords relevantes separadas por comas`;
  
  try {
    const response = await generateContent({
      instruction: prompt,
      format: 'json',
      maxTokens: 500,
    });
    
    const data = JSON.parse(response);
    return {
      title: data.title || title,
      description: data.description || "",
      keywords: data.keywords || [],
    };
  } catch (error) {
    console.error('Error generando sugerencias SEO:', error);
    return {
      title: title,
      description: "",
      keywords: [],
    };
  }
}

/**
 * Genera ideas de contenido para el CMS
 */
export async function generateContentIdeas(
  topic: string,
  industry: string
): Promise<{ title: string; description: string }[]> {
  const prompt = `Genera 5 ideas de contenido para blogs o páginas web sobre "${topic}" en la industria de "${industry}".
  
  Para cada idea, proporciona:
  1. Un título atractivo
  2. Una breve descripción/resumen del contenido (2-3 frases)`;
  
  try {
    const response = await generateContent({
      instruction: prompt,
      format: 'json',
      maxTokens: 800,
    });
    
    const data = JSON.parse(response);
    return data.ideas || [];
  } catch (error) {
    console.error('Error generando ideas de contenido:', error);
    return [];
  }
}

/**
 * Expande un párrafo o esquema en contenido completo
 */
export async function expandContent(
  content: string,
  tone: string = "profesional"
): Promise<string> {
  const prompt = `Expande el siguiente esquema o párrafo en un contenido más completo utilizando un tono ${tone}:
  
  ${content}
  
  Desarrolla las ideas, añade ejemplos y crea un contenido completo.`;
  
  try {
    return await generateContent({
      instruction: prompt,
      format: 'html',
      maxTokens: 1500,
    });
  } catch (error) {
    console.error('Error expandiendo contenido:', error);
    throw error;
  }
}