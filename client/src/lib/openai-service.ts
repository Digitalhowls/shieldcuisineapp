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
 * 
 * Temporalmente implementado en el cliente - se moverá al backend cuando sea necesario
 */
export async function generateContentIdeas(topic: string, contentType: 'blog' | 'social' | 'email', targetAudience: string): Promise<string[]> {
  try {
    // Esta implementación es temporal hasta que se cree el endpoint en el backend
    // Mientras tanto, simulamos una respuesta para propósitos de desarrollo
    return [
      `Guía de implementación de APPCC en ${topic} para pequeños negocios`,
      `5 beneficios de la seguridad alimentaria en ${topic} que impresionarán a tus clientes`,
      `Cómo ${topic} puede cumplir con regulaciones alimentarias sin complicaciones`,
      `Ejemplos de éxito: Negocios de ${topic} que destacan por su seguridad alimentaria`,
      `Lista de verificación diaria de seguridad alimentaria para ${topic}`
    ];
  } catch (error) {
    console.error("Error generando ideas de contenido:", error);
    throw new Error("No se pudo generar ideas de contenido");
  }
}

/**
 * Análisis de imagen para verificación de cumplimiento
 * 
 * Temporalmente implementado en el cliente - se moverá al backend cuando sea necesario
 */
export async function analyzeComplianceImage(base64Image: string, complianceType: 'cleanliness' | 'storage' | 'labeling' | 'equipment'): Promise<{
  compliant: boolean;
  confidence: number;
  issues: string[];
  recommendations: string[];
}> {
  try {
    // Esta implementación es temporal hasta que se cree el endpoint en el backend
    // Debería realizarse en el servidor para procesar imágenes de manera segura
    
    // Simulamos una respuesta para propósitos de desarrollo
    const mockResults = {
      cleanliness: {
        compliant: true,
        confidence: 0.85,
        issues: ["Superficies de trabajo ligeramente sucias en algunos puntos"],
        recommendations: ["Implementar un horario de limpieza más frecuente", "Usar productos desinfectantes aprobados para superficies de contacto alimentario"]
      },
      storage: {
        compliant: false,
        confidence: 0.92,
        issues: ["Productos crudos almacenados junto a alimentos listos para consumo", "Temperatura de almacenamiento inadecuada"],
        recommendations: ["Separar alimentos crudos y cocinados", "Ajustar temperatura a 4°C o menos", "Implementar etiquetado con fecha de recepción/caducidad"]
      },
      labeling: {
        compliant: true,
        confidence: 0.78,
        issues: ["Falta de información de alérgenos destacada"],
        recommendations: ["Destacar alérgenos en negrita", "Incluir lista de ingredientes en orden descendente de peso"]
      },
      equipment: {
        compliant: true,
        confidence: 0.88,
        issues: [],
        recommendations: ["Mantener el programa actual de mantenimiento preventivo", "Documentar inspecciones de equipos"]
      }
    };
    
    return mockResults[complianceType];
  } catch (error) {
    console.error("Error analizando imagen de cumplimiento:", error);
    throw new Error("No se pudo analizar la imagen con IA");
  }
}