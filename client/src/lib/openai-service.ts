import { apiRequest } from "./queryClient";

// En el cliente, accedemos a la API de OpenAI a través del backend
// que usa GPT-4o (el modelo más reciente lanzado el 13 de mayo de 2024)

/**
 * Análisis de controles APPCC utilizando OpenAI
 */
export interface APPCCControlData {
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
}

export interface APPCCAnalysisResult {
  summarySummary: string;
  recommendedActions: string[];
  complianceScore: number;
  riskAreas: string[];
  dataInsights: string;
}

export async function analyzeAPPCCControl(controlData: APPCCControlData): Promise<APPCCAnalysisResult> {
  try {
    const requestData = {
      controlData,
      requestType: 'summary',
      language: 'es'
    };

    const response = await apiRequest('POST', '/api/ai/analyze/appcc', requestData);
    const result = await response.json();
    
    return {
      summarySummary: result.summary || "No se pudo generar un resumen",
      recommendedActions: result.recommendedActions || [],
      complianceScore: result.complianceScore || 0,
      riskAreas: result.riskAreas || [],
      dataInsights: result.insights || ""
    };
  } catch (error) {
    console.error("Error analizando control APPCC:", error);
    throw new Error("No se pudo analizar el control APPCC con IA");
  }
}

/**
 * Análisis de tendencias de inventario
 */
export interface InventoryAnalysisData {
  productId: number;
  productName: string;
  historicalData: Array<{
    date: string;
    quantity: number;
    transactions: string[];
  }>;
  currentStock: number;
  minStock: number;
  supplierLeadTime: number;
}

export interface InventoryAnalysisResult {
  forecastConsumption: number;
  daysUntilRestock: number;
  restockRecommendation: string;
  consumptionPatterns: string;
  anomalies: string[];
}

export async function analyzeInventoryTrends(inventoryData: InventoryAnalysisData): Promise<InventoryAnalysisResult> {
  try {
    const requestData = {
      productData: inventoryData,
      requestType: 'forecast',
      language: 'es'
    };

    const response = await apiRequest('POST', '/api/ai/analyze/inventory', requestData);
    const result = await response.json();
    
    return {
      forecastConsumption: result.forecastConsumption || 0,
      daysUntilRestock: result.daysUntilRestock || 0,
      restockRecommendation: result.restockRecommendation || "Sin recomendación disponible",
      consumptionPatterns: result.consumptionPatterns || "No se pudieron analizar patrones",
      anomalies: result.anomalies || []
    };
  } catch (error) {
    console.error("Error analizando tendencias de inventario:", error);
    throw new Error("No se pudo analizar el inventario con IA");
  }
}

/**
 * Análisis de órdenes de compra para optimización
 */
export interface PurchaseOrdersData {
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
    deliveryTime: number; // en días
  }>;
  timeframe: string; // 'week', 'month', 'quarter', 'year'
}

export interface PurchaseOrdersAnalysisResult {
  costSavingOpportunities: string[];
  supplierPerformance: Record<string, { score: number, notes: string }>;
  frequentlyPurchasedItems: string[];
  seasonalPatterns: string;
  optimizationRecommendations: string[];
}

export async function analyzePurchaseOrders(poData: PurchaseOrdersData): Promise<PurchaseOrdersAnalysisResult> {
  try {
    const requestData = {
      ordersData: poData,
      requestType: 'optimization',
      language: 'es'
    };

    const response = await apiRequest('POST', '/api/ai/analyze/purchases', requestData);
    const result = await response.json();
    
    return {
      costSavingOpportunities: result.costSavingOpportunities || [],
      supplierPerformance: result.supplierPerformance || {},
      frequentlyPurchasedItems: result.frequentlyPurchasedItems || [],
      seasonalPatterns: result.seasonalPatterns || "No se detectaron patrones estacionales",
      optimizationRecommendations: result.optimizationRecommendations || []
    };
  } catch (error) {
    console.error("Error analizando órdenes de compra:", error);
    throw new Error("No se pudo analizar las órdenes de compra con IA");
  }
}

/**
 * Generación de contenido para el blog y marketing
 */
export async function generateContentIdeas(topic: string, contentType: 'blog' | 'social' | 'email', targetAudience: string): Promise<string[]> {
  try {
    const prompt = `
      Genera 5 ideas de contenido para ${contentType} sobre "${topic}" dirigidas a "${targetAudience}" en la industria alimentaria. 
      Cada idea debe ser específica, relevante y atractiva para el público objetivo.
      
      Devuelve solo la lista de ideas, sin introducción ni conclusión.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Eres un experto en marketing de contenidos para la industria alimentaria." },
        { role: "user", content: prompt }
      ]
    });

    const content = response.choices[0].message.content || "";
    const result = content.split("\n")
      .filter(line => line.trim() !== "")
      .map(line => line.replace(/^\d+\.\s*/, "").trim());
    
    return result;
  } catch (error) {
    console.error("Error generando ideas de contenido:", error);
    throw new Error("No se pudo generar ideas de contenido");
  }
}

/**
 * Análisis de imagen para verificación de cumplimiento
 */
export async function analyzeComplianceImage(base64Image: string, complianceType: 'cleanliness' | 'storage' | 'labeling' | 'equipment'): Promise<{
  compliant: boolean;
  confidence: number;
  issues: string[];
  recommendations: string[];
}> {
  try {
    const promptsByType = {
      cleanliness: "Evalúa esta imagen de un área de cocina/preparación de alimentos y determina si cumple con los estándares de limpieza e higiene.",
      storage: "Evalúa esta imagen de almacenamiento de alimentos y determina si cumple con las normas de almacenamiento seguro (temperatura, separación, etiquetado).",
      labeling: "Evalúa esta imagen de etiquetado de alimentos y determina si cumple con las regulaciones de etiquetado (ingredientes, alérgenos, fecha).",
      equipment: "Evalúa esta imagen de equipamiento de cocina y determina si cumple con los estándares de mantenimiento, limpieza y seguridad."
    };

    const promptText = promptsByType[complianceType] + " Identifica cualquier problema y proporciona recomendaciones específicas.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Eres un inspector de seguridad alimentaria experto que puede identificar problemas de cumplimiento en imágenes." },
        { 
          role: "user", 
          content: [
            { type: "text", text: promptText },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    const analysisResult = JSON.parse(content);
    
    return {
      compliant: analysisResult.compliant || false,
      confidence: analysisResult.confidence || 0,
      issues: analysisResult.issues || [],
      recommendations: analysisResult.recommendations || []
    };
  } catch (error) {
    console.error("Error analizando imagen de cumplimiento:", error);
    throw new Error("No se pudo analizar la imagen con IA");
  }
}