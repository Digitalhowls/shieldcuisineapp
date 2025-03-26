import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Análisis de controles APPCC utilizando OpenAI
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
  };
  requestType: 'summary' | 'recommendations' | 'compliance' | 'trends';
  language?: 'es' | 'en';
}

/**
 * Respuesta del análisis de APPCC
 */
export interface APPCCAnalysisResponse {
  summary: string;
  recommendedActions: string[];
  complianceScore: number;
  riskAreas: string[];
  insights: string;
}

/**
 * Genera un análisis del control APPCC basado en los datos proporcionados
 */
export async function analyzeAPPCCControl(request: APPCCAnalysisRequest): Promise<APPCCAnalysisResponse> {
  try {
    const systemPrompt = getSystemPrompt(request.requestType, request.language || 'es');
    
    const prompt = `
      Analiza el siguiente control APPCC (Análisis de Peligros y Puntos de Control Crítico) y proporciona:
      1. Un resumen conciso del estado general
      2. Recomendaciones específicas de acciones a tomar
      3. Una puntuación de cumplimiento (0-100)
      4. Identificación de áreas de riesgo
      5. Insights basados en los datos proporcionados
      
      Datos del control:
      ${JSON.stringify(request.controlData, null, 2)}
      
      Responde en formato JSON con las siguientes claves: summary, recommendedActions (array), complianceScore (número), riskAreas (array), insights (texto).
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    if (!response.choices[0].message.content) {
      throw new Error("No se recibió respuesta del modelo de IA");
    }

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      summary: result.summary || "No se pudo generar un resumen",
      recommendedActions: result.recommendedActions || [],
      complianceScore: result.complianceScore || 0,
      riskAreas: result.riskAreas || [],
      insights: result.insights || ""
    };
  } catch (error: any) {
    console.error("Error analizando control APPCC:", error);
    throw new Error(`No se pudo analizar el control APPCC con IA: ${error.message}`);
  }
}

/**
 * Análisis de tendencias de inventario
 */
export interface InventoryAnalysisRequest {
  productData: {
    id: number;
    name: string;
    historicalData: Array<{
      date: string;
      quantity: number;
      transactions: string[];
    }>;
    currentStock: number;
    minStock: number;
    supplierLeadTime: number;
  };
  requestType: 'forecast' | 'optimization' | 'trends';
  language?: 'es' | 'en';
}

export interface InventoryAnalysisResponse {
  forecastConsumption: number;
  daysUntilRestock: number;
  restockRecommendation: string;
  consumptionPatterns: string;
  anomalies: string[];
}

/**
 * Analiza datos de inventario para previsión y optimización
 */
export async function analyzeInventoryData(request: InventoryAnalysisRequest): Promise<InventoryAnalysisResponse> {
  try {
    const systemPrompt = "Eres un analista de inventario experto con conocimientos de gestión de cadena de suministro alimentario.";
    
    const prompt = `
      Analiza los siguientes datos de inventario para el producto "${request.productData.name}" y proporciona:
      1. Previsión de consumo diario basado en patrones históricos
      2. Días hasta que se necesite reposición
      3. Recomendación clara sobre reposición
      4. Análisis de patrones de consumo
      5. Anomalías o irregularidades detectadas
      
      Datos de inventario:
      ${JSON.stringify(request.productData, null, 2)}
      
      Responde en formato JSON con las siguientes claves: forecastConsumption (número), daysUntilRestock (número), restockRecommendation (texto), consumptionPatterns (texto), anomalies (array de textos).
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    if (!response.choices[0].message.content) {
      throw new Error("No se recibió respuesta del modelo de IA");
    }

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      forecastConsumption: result.forecastConsumption || 0,
      daysUntilRestock: result.daysUntilRestock || 0,
      restockRecommendation: result.restockRecommendation || "Sin recomendación disponible",
      consumptionPatterns: result.consumptionPatterns || "No se pudieron analizar patrones",
      anomalies: result.anomalies || []
    };
  } catch (error: any) {
    console.error("Error analizando tendencias de inventario:", error);
    throw new Error(`No se pudo analizar el inventario con IA: ${error.message}`);
  }
}

/**
 * Análisis de órdenes de compra para optimización
 */
export interface PurchaseOrdersAnalysisRequest {
  ordersData: {
    orders: Array<{
      id: number;
      date: string;
      supplier: string;
      items: Array<{
        productName: string;
        quantity: number;
        unitPrice: number;
        category: string;
      }>;
      totalAmount: number;
      deliveryTime: number;
    }>;
    timeframe: string;
  };
  requestType: 'cost_savings' | 'supplier_analysis' | 'optimization';
  language?: 'es' | 'en';
}

export interface PurchaseOrdersAnalysisResponse {
  costSavingOpportunities: string[];
  supplierPerformance: Record<string, { score: number, notes: string }>;
  frequentlyPurchasedItems: string[];
  seasonalPatterns: string;
  optimizationRecommendations: string[];
}

/**
 * Analiza órdenes de compra para optimización
 */
export async function analyzePurchaseOrders(request: PurchaseOrdersAnalysisRequest): Promise<PurchaseOrdersAnalysisResponse> {
  try {
    const systemPrompt = "Eres un analista de compras experto en la industria alimentaria.";
    
    const prompt = `
      Analiza los siguientes datos de órdenes de compra y proporciona:
      1. Oportunidades de ahorro de costos
      2. Evaluación del rendimiento de proveedores
      3. Artículos comprados con mayor frecuencia
      4. Patrones estacionales detectados
      5. Recomendaciones de optimización
      
      Datos de órdenes de compra:
      ${JSON.stringify(request.ordersData, null, 2)}
      
      Responde en formato JSON con las siguientes claves: 
      costSavingOpportunities (array), 
      supplierPerformance (objeto con proveedor como clave y objeto {score: número, notes: texto} como valor), 
      frequentlyPurchasedItems (array), 
      seasonalPatterns (texto), 
      optimizationRecommendations (array).
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    if (!response.choices[0].message.content) {
      throw new Error("No se recibió respuesta del modelo de IA");
    }

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      costSavingOpportunities: result.costSavingOpportunities || [],
      supplierPerformance: result.supplierPerformance || {},
      frequentlyPurchasedItems: result.frequentlyPurchasedItems || [],
      seasonalPatterns: result.seasonalPatterns || "No se detectaron patrones estacionales",
      optimizationRecommendations: result.optimizationRecommendations || []
    };
  } catch (error: any) {
    console.error("Error analizando órdenes de compra:", error);
    throw new Error(`No se pudo analizar las órdenes de compra con IA: ${error.message}`);
  }
}

/**
 * Obtiene el prompt del sistema según el tipo de solicitud
 */
function getSystemPrompt(requestType: string, language: 'es' | 'en'): string {
  if (language === 'en') {
    switch (requestType) {
      case 'summary':
        return "You are an expert in food safety and HACCP systems. Provide a concise and accurate analysis of the HACCP control data.";
      case 'recommendations':
        return "You are a food safety consultant specializing in HACCP. Focus on providing practical and specific recommendations to improve compliance.";
      case 'compliance':
        return "You are a food safety auditor. Focus on evaluating compliance levels and identifying risk areas in the HACCP control data.";
      case 'trends':
        return "You are a data analyst specializing in food safety trends. Analyze patterns and trends in the HACCP control data.";
      default:
        return "You are an expert in food safety and HACCP systems.";
    }
  } else {
    switch (requestType) {
      case 'summary':
        return "Eres un experto en seguridad alimentaria y sistemas APPCC. Proporciona un análisis conciso y preciso de los datos de control APPCC.";
      case 'recommendations':
        return "Eres un consultor de seguridad alimentaria especializado en APPCC. Céntrate en proporcionar recomendaciones prácticas y específicas para mejorar el cumplimiento.";
      case 'compliance':
        return "Eres un auditor de seguridad alimentaria. Céntrate en evaluar los niveles de cumplimiento e identificar áreas de riesgo en los datos de control APPCC.";
      case 'trends':
        return "Eres un analista de datos especializado en tendencias de seguridad alimentaria. Analiza patrones y tendencias en los datos de control APPCC.";
      default:
        return "Eres un experto en seguridad alimentaria y sistemas APPCC.";
    }
  }
}