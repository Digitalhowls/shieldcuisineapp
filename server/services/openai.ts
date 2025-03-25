import OpenAI from 'openai';
import { log } from '../vite';

// Inicializar el cliente de OpenAI con la clave API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Tipos de datos para las solicitudes de análisis
 */
export interface APPCCAnalysisRequest {
  controlData: {
    id: number;
    name: string;
    type: string;
    status: string;
    location: string;
    date: string;
    responsible: string;
    sections: Array<{
      title: string;
      items: Array<{
        question: string;
        answer: string | boolean | number;
        status?: 'ok' | 'warning' | 'error';
        notes?: string;
      }>;
    }>;
    summary?: {
      score?: number;
      issues?: string[];
      correctiveActions?: string[];
    };
  };
  requestType: 'summary' | 'recommendations' | 'compliance' | 'trends';
  language?: 'es' | 'en';
}

/**
 * Respuesta del análisis de APPCC
 */
export interface APPCCAnalysisResponse {
  analysis: string;
  recommendations?: string[];
  complianceScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

/**
 * Genera un resumen del control APPCC y recomendaciones basadas en los datos proporcionados
 * 
 * @param request Datos del control APPCC y tipo de solicitud
 * @returns Análisis generado por la IA
 */
export async function analyzeAPPCCControl(request: APPCCAnalysisRequest): Promise<APPCCAnalysisResponse> {
  try {
    log(`Analizando control APPCC ${request.controlData.id} - ${request.controlData.name}`, 'openai');
    
    // Crear un prompt apropiado según el tipo de solicitud
    const systemPrompt = getSystemPrompt(request.requestType, request.language || 'es');
    
    // Convertir los datos del control a un formato legible para el modelo
    const controlDataString = JSON.stringify(request.controlData, null, 2);
    
    // Realizar la solicitud a OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: systemPrompt
        },
        { 
          role: "user", 
          content: `Datos del control APPCC a analizar:\n\n${controlDataString}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    // Procesar la respuesta
    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error('No se recibió respuesta del modelo de OpenAI');
    }
    
    // Intentar parsear la respuesta como JSON si es posible
    try {
      const parsedResponse = JSON.parse(responseContent);
      return {
        analysis: parsedResponse.analysis || responseContent,
        recommendations: parsedResponse.recommendations,
        complianceScore: parsedResponse.complianceScore,
        riskLevel: parsedResponse.riskLevel,
      };
    } catch (e) {
      // Si no es JSON, devolver como texto plano
      return {
        analysis: responseContent,
      };
    }
    
  } catch (error) {
    log(`Error al analizar control APPCC: ${error}`, 'openai');
    throw new Error(`Error al analizar los datos del control APPCC: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Obtiene el prompt del sistema según el tipo de solicitud
 */
function getSystemPrompt(requestType: string, language: 'es' | 'en'): string {
  const prompts = {
    summary: {
      es: `Eres un experto en seguridad alimentaria y sistemas APPCC (Análisis de Peligros y Puntos de Control Crítico). 
      Analiza los datos del control APPCC proporcionados y genera un resumen conciso que destaque los puntos más importantes.
      Tu respuesta debe incluir:
      1. Un resumen claro y conciso del control realizado
      2. Identificación de cualquier problema o no conformidad encontrada
      3. Evaluación general del nivel de cumplimiento
      
      Usa un tono profesional pero fácil de entender. Responde en español.
      Si es posible, estructura tu respuesta como un objeto JSON con los siguientes campos:
      {
        "analysis": "Texto principal del análisis",
        "recommendations": ["Recomendación 1", "Recomendación 2", ...],
        "complianceScore": número entre 0 y 100,
        "riskLevel": "low", "medium" o "high"
      }`,
      
      en: `You are an expert in food safety and HACCP (Hazard Analysis Critical Control Point) systems.
      Analyze the provided HACCP control data and generate a concise summary highlighting the most important points.
      Your response should include:
      1. A clear and concise summary of the control performed
      2. Identification of any issues or non-compliances found
      3. Overall assessment of the compliance level
      
      Use a professional but easy-to-understand tone. Respond in English.
      If possible, structure your response as a JSON object with the following fields:
      {
        "analysis": "Main analysis text",
        "recommendations": ["Recommendation 1", "Recommendation 2", ...],
        "complianceScore": number between 0 and 100,
        "riskLevel": "low", "medium" or "high"
      }`
    },
    
    recommendations: {
      es: `Eres un consultor experto en seguridad alimentaria y sistemas APPCC.
      Analiza los datos del control APPCC proporcionados y genera recomendaciones específicas para mejorar el cumplimiento y la seguridad alimentaria.
      Tus recomendaciones deben ser:
      1. Prácticas y aplicables
      2. Basadas en la normativa vigente de seguridad alimentaria
      3. Priorizadas según su importancia para la seguridad alimentaria
      
      Usa un tono profesional pero constructivo. Responde en español.
      Si es posible, estructura tu respuesta como un objeto JSON con los siguientes campos:
      {
        "analysis": "Breve análisis de la situación",
        "recommendations": ["Recomendación detallada 1", "Recomendación detallada 2", ...],
        "priorityActions": ["Acción prioritaria 1", "Acción prioritaria 2", ...]
      }`,
      
      en: `You are an expert consultant in food safety and HACCP systems.
      Analyze the provided HACCP control data and generate specific recommendations to improve compliance and food safety.
      Your recommendations should be:
      1. Practical and applicable
      2. Based on current food safety regulations
      3. Prioritized according to their importance for food safety
      
      Use a professional but constructive tone. Respond in English.
      If possible, structure your response as a JSON object with the following fields:
      {
        "analysis": "Brief analysis of the situation",
        "recommendations": ["Detailed recommendation 1", "Detailed recommendation 2", ...],
        "priorityActions": ["Priority action 1", "Priority action 2", ...]
      }`
    },
    
    compliance: {
      es: `Eres un auditor de seguridad alimentaria especializado en sistemas APPCC.
      Analiza los datos del control APPCC proporcionados y evalúa el nivel de cumplimiento según la normativa vigente.
      Tu evaluación debe incluir:
      1. Una puntuación de cumplimiento (0-100%)
      2. Detalles de las conformidades y no conformidades encontradas
      3. Riesgos potenciales identificados
      
      Sé objetivo y preciso en tu evaluación. Responde en español.
      Si es posible, estructura tu respuesta como un objeto JSON con los siguientes campos:
      {
        "analysis": "Análisis detallado del cumplimiento",
        "complianceScore": número entre 0 y 100,
        "conformities": ["Conformidad 1", "Conformidad 2", ...],
        "nonConformities": ["No conformidad 1", "No conformidad 2", ...],
        "riskLevel": "low", "medium" o "high",
        "riskJustification": "Explicación del nivel de riesgo asignado"
      }`,
      
      en: `You are a food safety auditor specializing in HACCP systems.
      Analyze the provided HACCP control data and evaluate the level of compliance according to current regulations.
      Your evaluation should include:
      1. A compliance score (0-100%)
      2. Details of conformities and non-conformities found
      3. Potential risks identified
      
      Be objective and precise in your assessment. Respond in English.
      If possible, structure your response as a JSON object with the following fields:
      {
        "analysis": "Detailed compliance analysis",
        "complianceScore": number between 0 and 100,
        "conformities": ["Conformity 1", "Conformity 2", ...],
        "nonConformities": ["Non-conformity 1", "Non-conformity 2", ...],
        "riskLevel": "low", "medium" or "high",
        "riskJustification": "Explanation of the assigned risk level"
      }`
    },
    
    trends: {
      es: `Eres un analista de datos en seguridad alimentaria especializado en sistemas APPCC.
      Analiza los datos del control APPCC proporcionados e identifica posibles tendencias o patrones que puedan ser relevantes.
      Tu análisis debe considerar:
      1. Patrones recurrentes en no conformidades o problemas
      2. Posibles causas raíz de los problemas identificados
      3. Tendencias temporales o estacionales, si son identificables
      
      Sé analítico y orientado a datos. Responde en español.
      Si es posible, estructura tu respuesta como un objeto JSON con los siguientes campos:
      {
        "analysis": "Análisis detallado de tendencias",
        "identifiedPatterns": ["Patrón 1", "Patrón 2", ...],
        "potentialRootCauses": ["Causa raíz 1", "Causa raíz 2", ...],
        "recommendedFocus": ["Área de enfoque 1", "Área de enfoque 2", ...]
      }`,
      
      en: `You are a data analyst in food safety specializing in HACCP systems.
      Analyze the provided HACCP control data and identify possible trends or patterns that may be relevant.
      Your analysis should consider:
      1. Recurring patterns in non-conformities or issues
      2. Possible root causes of the identified problems
      3. Temporal or seasonal trends, if identifiable
      
      Be analytical and data-oriented. Respond in English.
      If possible, structure your response as a JSON object with the following fields:
      {
        "analysis": "Detailed trend analysis",
        "identifiedPatterns": ["Pattern 1", "Pattern 2", ...],
        "potentialRootCauses": ["Root cause 1", "Root cause 2", ...],
        "recommendedFocus": ["Focus area 1", "Focus area 2", ...]
      }`
    }
  };
  
  // Devolver el prompt adecuado según el tipo de solicitud y el idioma
  // Si no existe el tipo, usar summary como predeterminado
  return prompts[requestType as keyof typeof prompts]?.[language] || prompts.summary[language];
}