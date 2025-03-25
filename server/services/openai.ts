import OpenAI from 'openai';
import { log } from '../vite';

// Inicializar el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

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
    const { controlData, requestType, language = 'es' } = request;
    
    // Construir el prompt del sistema según el tipo de solicitud
    const systemPrompt = getSystemPrompt(requestType, language);
    
    // Construir el contenido del mensaje del usuario con los datos del control
    let userMessageContent = '';
    
    if (language === 'es') {
      userMessageContent += `Datos del control APPCC #${controlData.id}: "${controlData.name}"\n\n`;
      userMessageContent += `Tipo: ${controlData.type}\n`;
      userMessageContent += `Estado: ${controlData.status}\n`;
      userMessageContent += `Ubicación: ${controlData.location}\n`;
      userMessageContent += `Fecha: ${controlData.date}\n`;
      userMessageContent += `Responsable: ${controlData.responsible}\n\n`;
    } else {
      userMessageContent += `HACCP Control Data #${controlData.id}: "${controlData.name}"\n\n`;
      userMessageContent += `Type: ${controlData.type}\n`;
      userMessageContent += `Status: ${controlData.status}\n`;
      userMessageContent += `Location: ${controlData.location}\n`;
      userMessageContent += `Date: ${controlData.date}\n`;
      userMessageContent += `Responsible: ${controlData.responsible}\n\n`;
    }
    
    // Añadir las secciones y elementos de control
    for (const section of controlData.sections) {
      userMessageContent += `### ${section.title}\n\n`;
      
      for (const item of section.items) {
        const statusEmoji = item.status === 'ok' ? '✅' : 
                           item.status === 'warning' ? '⚠️' : 
                           item.status === 'error' ? '❌' : '';
        
        userMessageContent += `${statusEmoji} ${item.question}: ${item.answer}\n`;
        
        if (item.notes) {
          userMessageContent += `   ${language === 'es' ? 'Notas' : 'Notes'}: ${item.notes}\n`;
        }
        
        userMessageContent += '\n';
      }
    }
    
    // Añadir el resumen si está disponible
    if (controlData.summary) {
      userMessageContent += `### ${language === 'es' ? 'Resumen' : 'Summary'}\n\n`;
      
      if (controlData.summary.score !== undefined) {
        userMessageContent += `${language === 'es' ? 'Puntuación' : 'Score'}: ${controlData.summary.score}\n`;
      }
      
      if (controlData.summary.issues && controlData.summary.issues.length > 0) {
        userMessageContent += `${language === 'es' ? 'Problemas identificados' : 'Identified issues'}:\n`;
        for (const issue of controlData.summary.issues) {
          userMessageContent += `- ${issue}\n`;
        }
        userMessageContent += '\n';
      }
      
      if (controlData.summary.correctiveActions && controlData.summary.correctiveActions.length > 0) {
        userMessageContent += `${language === 'es' ? 'Acciones correctivas' : 'Corrective actions'}:\n`;
        for (const action of controlData.summary.correctiveActions) {
          userMessageContent += `- ${action}\n`;
        }
        userMessageContent += '\n';
      }
    }
    
    // Añadir la solicitud específica según el tipo
    switch (requestType) {
      case 'summary':
        userMessageContent += language === 'es' 
          ? 'Por favor, proporciona un resumen conciso de este control APPCC, destacando los puntos clave y cualquier área de preocupación.' 
          : 'Please provide a concise summary of this HACCP control, highlighting key points and any areas of concern.';
        break;
      case 'recommendations':
        userMessageContent += language === 'es'
          ? 'Basándote en estos datos, proporciona recomendaciones específicas para mejorar el cumplimiento de seguridad alimentaria.'
          : 'Based on this data, provide specific recommendations to improve food safety compliance.';
        break;
      case 'compliance':
        userMessageContent += language === 'es'
          ? 'Evalúa el nivel de cumplimiento de este control APPCC según los datos proporcionados. Incluye una puntuación estimada (0-100%) y un nivel de riesgo (bajo, medio, alto).'
          : 'Assess the compliance level of this HACCP control based on the provided data. Include an estimated score (0-100%) and risk level (low, medium, high).';
        break;
      case 'trends':
        userMessageContent += language === 'es'
          ? 'Analiza las tendencias generales de los controles APPCC para esta ubicación, identificando patrones, fortalezas y áreas que requieren atención.'
          : 'Analyze the general trends of HACCP controls for this location, identifying patterns, strengths, and areas requiring attention.';
        break;
    }
    
    log('Enviando solicitud a OpenAI...', 'openai-service');
    
    // Realizar la llamada a la API
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessageContent }
      ],
      temperature: 0.2, // Valores bajos para respuestas más consistentes y menos creativas
      response_format: { type: "json_object" },
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No se recibió respuesta de la IA');
    }
    
    log('Respuesta recibida de OpenAI', 'openai-service');
    
    // Parsear la respuesta JSON
    const result = JSON.parse(content) as APPCCAnalysisResponse;
    
    // Asegurarse de que la respuesta tenga el formato correcto
    if (!result.analysis) {
      throw new Error('Formato de respuesta de la IA inválido: falta el campo "analysis"');
    }
    
    return result;
    
  } catch (error) {
    log(`Error en el servicio de OpenAI: ${error}`, 'openai-service');
    throw error;
  }
}

/**
 * Obtiene el prompt del sistema según el tipo de solicitud
 */
function getSystemPrompt(requestType: string, language: 'es' | 'en'): string {
  // Base del prompt del sistema
  let basePrompt = language === 'es'
    ? `Eres un experto en seguridad alimentaria y sistemas APPCC (Análisis de Peligros y Puntos de Control Crítico).
      Tu tarea es analizar los datos de controles APPCC proporcionados y generar información útil para los usuarios.
      Responde siempre en formato JSON con la siguiente estructura:
      { 
        "analysis": "Texto principal del análisis", 
        "recommendations": ["Recomendación 1", "Recomendación 2", ...],
        "complianceScore": número entre 0 y 100 (opcional),
        "riskLevel": "low", "medium" o "high" (opcional)
      }
      
      Usa un tono profesional pero accesible y asegúrate de que tus respuestas sean específicas para el control analizado.`
    : `You are an expert in food safety and HACCP (Hazard Analysis Critical Control Points) systems.
      Your task is to analyze the provided HACCP control data and generate useful insights for users.
      Always respond in JSON format with the following structure:
      { 
        "analysis": "Main analysis text", 
        "recommendations": ["Recommendation 1", "Recommendation 2", ...],
        "complianceScore": number between 0 and 100 (optional),
        "riskLevel": "low", "medium", or "high" (optional)
      }
      
      Use a professional but accessible tone and ensure your responses are specific to the control being analyzed.`;
  
  // Añadir instrucciones específicas según el tipo de solicitud
  switch (requestType) {
    case 'summary':
      basePrompt += language === 'es'
        ? `\n\nPara este tipo de análisis, proporciona un resumen conciso (3-5 párrafos) del control APPCC. 
          Identifica si hay problemas críticos, áreas que funcionan bien y conclusiones generales.
          No incluyas los campos "complianceScore" o "riskLevel" en tu respuesta JSON.`
        : `\n\nFor this type of analysis, provide a concise summary (3-5 paragraphs) of the HACCP control.
          Identify if there are any critical issues, areas that are working well, and general conclusions.
          Do not include the "complianceScore" or "riskLevel" fields in your JSON response.`;
      break;
    case 'recommendations':
      basePrompt += language === 'es'
        ? `\n\nPara este tipo de análisis, enfócate en generar recomendaciones prácticas y específicas 
          basadas en los datos del control. Proporciona al menos 3-5 recomendaciones priorizadas.
          El campo "analysis" debe explicar brevemente por qué estas recomendaciones son importantes, 
          y el campo "recommendations" debe contener las recomendaciones específicas como un array de strings.
          No incluyas los campos "complianceScore" o "riskLevel" en tu respuesta JSON.`
        : `\n\nFor this type of analysis, focus on generating practical and specific recommendations 
          based on the control data. Provide at least 3-5 prioritized recommendations.
          The "analysis" field should briefly explain why these recommendations are important, 
          and the "recommendations" field should contain the specific recommendations as an array of strings.
          Do not include the "complianceScore" or "riskLevel" fields in your JSON response.`;
      break;
    case 'compliance':
      basePrompt += language === 'es'
        ? `\n\nPara este tipo de análisis, evalúa el nivel de cumplimiento del control APPCC.
          Proporciona una puntuación estimada (complianceScore) entre 0 y 100, donde 100 representa
          el cumplimiento perfecto. Asigna también un nivel de riesgo (riskLevel) como "low", "medium" o "high".
          En el campo "analysis", explica los factores que influyen en tu evaluación y las implicaciones
          para la seguridad alimentaria. Incluye todos los campos en tu respuesta JSON.`
        : `\n\nFor this type of analysis, assess the compliance level of the HACCP control.
          Provide an estimated score (complianceScore) between 0 and 100, where 100 represents
          perfect compliance. Also assign a risk level (riskLevel) as "low", "medium", or "high".
          In the "analysis" field, explain the factors influencing your assessment and the implications
          for food safety. Include all fields in your JSON response.`;
      break;
    case 'trends':
      basePrompt += language === 'es'
        ? `\n\nPara este tipo de análisis, identifica patrones y tendencias en los controles APPCC
          para la ubicación especificada. Destaca fortalezas consistentes y áreas que requieren atención.
          Proporciona una visión general de la efectividad del sistema APPCC en esta ubicación.
          No incluyas los campos "complianceScore" o "riskLevel" en tu respuesta JSON.`
        : `\n\nFor this type of analysis, identify patterns and trends in HACCP controls
          for the specified location. Highlight consistent strengths and areas requiring attention.
          Provide an overview of the effectiveness of the HACCP system at this location.
          Do not include the "complianceScore" or "riskLevel" fields in your JSON response.`;
      break;
  }
  
  return basePrompt;
}