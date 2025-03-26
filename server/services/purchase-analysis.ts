/**
 * Servicio para análisis de datos de compras usando OpenAI
 * 
 * Este servicio proporciona análisis de tendencias de compras, 
 * patrones por proveedor, y recomendaciones de optimización
 */

import OpenAI from "openai";
import { storage } from "../storage";
import { PurchaseOrder, Supplier, Product } from "@shared/schema";

// Inicializar OpenAI con la clave API
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PurchaseAnalysisRequest {
  companyId: number;
  analysisType: 'supplier_performance' | 'expense_trends' | 'inventory_optimization' | 'future_needs';
  timeframe: 'last_month' | 'last_quarter' | 'last_year' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  supplierId?: number;
  productCategories?: string[];
  warehouseId?: number;
}

export interface PurchaseAnalysisResponse {
  analysis: string;
  insights: string[];
  recommendations: string[];
  dataPoints?: any;
  charts?: any;
}

/**
 * Realiza análisis de patrones de compra por proveedor
 */
export async function analyzeSupplierPerformance(
  orders: any[],
  suppliers: any[],
  timeframe: string
): Promise<PurchaseAnalysisResponse> {
  try {
    // Preparar datos en formato procesable
    const supplierData = suppliers.map(supplier => {
      const supplierOrders = orders.filter(order => order.supplierId === supplier.id);
      const totalAmount = supplierOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || '0'), 0);
      const onTimeDeliveryRate = calculateOnTimeDelivery(supplierOrders);
      const qualityIssues = supplierOrders.filter(order => order.hasQualityIssues).length;
      
      return {
        id: supplier.id,
        name: supplier.name,
        ordersCount: supplierOrders.length,
        totalAmount,
        onTimeDeliveryRate,
        qualityIssues,
        averageResponseTime: calculateAverageResponseTime(supplierOrders),
      };
    });

    // Crear prompt para OpenAI
    const prompt = `
Analiza el rendimiento de los siguientes proveedores en el período ${timeframe}:

${JSON.stringify(supplierData, null, 2)}

Por favor, proporciona:
1. Un análisis de cada proveedor destacando fortalezas y debilidades
2. Comparación de precios y calidad entre proveedores
3. Recomendaciones sobre qué proveedores priorizar
4. Oportunidades de negociación o mejora

Responde con un JSON que contenga los siguientes campos:
- analysis: Un resumen general del rendimiento de los proveedores
- insights: Un array de insights clave sobre los proveedores
- recommendations: Un array de recomendaciones prácticas
    `;

    // Llamar a OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "Eres un analista experto en gestión de proveedores y compras. Proporciona análisis detallados y accionables basados en datos reales." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Procesar y retornar respuesta
    const result = JSON.parse(response.choices[0].message.content);
    return {
      analysis: result.analysis,
      insights: result.insights || [],
      recommendations: result.recommendations || [],
      dataPoints: supplierData
    };
  } catch (error) {
    console.error("Error en análisis de proveedores:", error);
    throw new Error(`Error al analizar rendimiento de proveedores: ${error.message}`);
  }
}

/**
 * Analiza tendencias de gastos en compras
 */
export async function analyzeExpenseTrends(
  orders: any[],
  timeframe: string
): Promise<PurchaseAnalysisResponse> {
  try {
    // Agrupar gastos por mes y categoría
    const monthlyExpenses: {[key: string]: number} = {};
    const categoryExpenses: {[key: string]: number} = {};
    
    orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('es', { month: 'long', year: 'numeric' });
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + parseFloat(order.totalAmount || '0');
      
      // Agrupar por categoría de producto si está disponible
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          if (item.productCategory) {
            categoryExpenses[item.productCategory] = (categoryExpenses[item.productCategory] || 0) + 
              parseFloat(item.totalPrice || '0');
          }
        });
      }
    });

    // Calcular variaciones mes a mes
    const monthsArray = Object.keys(monthlyExpenses);
    const variations = monthsArray.map((month, index) => {
      if (index === 0) return { month, variation: 0 };
      const currentMonth = monthlyExpenses[month];
      const previousMonth = monthlyExpenses[monthsArray[index - 1]];
      const variation = previousMonth ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;
      return { month, variation: parseFloat(variation.toFixed(2)) };
    }).filter((_, index) => index > 0); // Excluir el primer mes que no tiene variación

    // Crear prompt para OpenAI
    const prompt = `
Analiza las siguientes tendencias de gastos en compras durante ${timeframe}:

Gastos mensuales:
${JSON.stringify(monthlyExpenses, null, 2)}

Variaciones mes a mes (%):
${JSON.stringify(variations, null, 2)}

Gastos por categoría:
${JSON.stringify(categoryExpenses, null, 2)}

Por favor, proporciona:
1. Un análisis general de la tendencia de gastos
2. Identificación de patrones estacionales si los hay
3. Categorías con mayor crecimiento o decrecimiento
4. Recomendaciones para optimizar costos

Responde con un JSON que contenga los siguientes campos:
- analysis: Un resumen del análisis de tendencias de gastos
- insights: Un array de insights clave sobre las tendencias
- recommendations: Un array de recomendaciones para optimizar gastos
    `;

    // Llamar a OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "Eres un analista financiero especializado en control de gastos y compras. Proporciona análisis detallados y accionables basados en datos reales." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Procesar y retornar respuesta
    const result = JSON.parse(response.choices[0].message.content);
    return {
      analysis: result.analysis,
      insights: result.insights || [],
      recommendations: result.recommendations || [],
      dataPoints: {
        monthlyExpenses,
        variations,
        categoryExpenses
      }
    };
  } catch (error) {
    console.error("Error en análisis de gastos:", error);
    throw new Error(`Error al analizar tendencias de gastos: ${error.message}`);
  }
}

/**
 * Analiza oportunidades de optimización de inventario basado en compras
 */
export async function analyzeInventoryOptimization(
  orders: any[],
  inventory: any[],
  timeframe: string
): Promise<PurchaseAnalysisResponse> {
  try {
    // Calcular frecuencia de compra y cantidades por producto
    const productPurchases: {[key: string]: {
      productId: number,
      name: string,
      totalQuantity: number,
      orderCount: number,
      averageQuantity: number,
      currentStock: number,
      turnoverRate: number
    }} = {};
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          if (!productPurchases[item.productId]) {
            const inventoryItem = inventory.find(inv => inv.productId === item.productId);
            productPurchases[item.productId] = {
              productId: item.productId,
              name: item.productName,
              totalQuantity: 0,
              orderCount: 0,
              averageQuantity: 0,
              currentStock: inventoryItem ? inventoryItem.quantity : 0,
              turnoverRate: 0
            };
          }
          
          productPurchases[item.productId].totalQuantity += parseFloat(item.quantity || '0');
          productPurchases[item.productId].orderCount += 1;
        });
      }
    });
    
    // Calcular promedios y tasa de rotación
    Object.keys(productPurchases).forEach(productId => {
      const product = productPurchases[productId];
      product.averageQuantity = product.orderCount ? product.totalQuantity / product.orderCount : 0;
      
      // Calcular tasa de rotación (total comprado / stock actual)
      if (product.currentStock > 0) {
        product.turnoverRate = product.totalQuantity / product.currentStock;
      }
    });

    // Convertir a array para facilitar el análisis
    const productsArray = Object.values(productPurchases);
    
    // Crear prompt para OpenAI
    const prompt = `
Analiza las siguientes métricas de compra e inventario durante ${timeframe}:

${JSON.stringify(productsArray, null, 2)}

Por favor, proporciona:
1. Productos con alto volumen de compra pero baja rotación (posible sobrestock)
2. Productos con alta rotación (posible riesgo de quiebre de stock)
3. Recomendaciones para optimizar niveles de inventario
4. Estrategias para mejorar la gestión de compras

Responde con un JSON que contenga los siguientes campos:
- analysis: Un resumen del análisis de optimización de inventario
- insights: Un array de insights clave sobre las tendencias de compra e inventario
- recommendations: Un array de recomendaciones prácticas
    `;

    // Llamar a OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "Eres un experto en gestión de inventario y cadena de suministro. Proporciona análisis detallados y accionables basados en datos reales." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Procesar y retornar respuesta
    const result = JSON.parse(response.choices[0].message.content);
    return {
      analysis: result.analysis,
      insights: result.insights || [],
      recommendations: result.recommendations || [],
      dataPoints: productsArray
    };
  } catch (error) {
    console.error("Error en análisis de inventario:", error);
    throw new Error(`Error al analizar optimización de inventario: ${error.message}`);
  }
}

/**
 * Predice necesidades futuras de compra
 */
export async function predictFutureNeeds(
  orders: any[],
  inventory: any[],
  timeframe: string
): Promise<PurchaseAnalysisResponse> {
  try {
    // Extraer historial de compras por producto por mes
    const productHistory: {[key: string]: {[key: string]: number}} = {};
    
    orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('es', { month: 'long', year: 'numeric' });
      
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          if (!productHistory[item.productId]) {
            productHistory[item.productId] = {};
          }
          
          if (!productHistory[item.productId][month]) {
            productHistory[item.productId][month] = 0;
          }
          
          productHistory[item.productId][month] += parseFloat(item.quantity || '0');
        });
      }
    });
    
    // Calcular promedios y tendencias
    const productPredictions = Object.keys(productHistory).map(productId => {
      const monthlyData = productHistory[productId];
      const months = Object.keys(monthlyData);
      
      // Encontrar el producto en el inventario
      const inventoryItem = inventory.find(inv => inv.productId === parseInt(productId));
      const productItem = orders.find(o => o.items && o.items.some((i: any) => i.productId === parseInt(productId)))?.items?.find((i: any) => i.productId === parseInt(productId));
      
      // Calcular promedio de los últimos 3 meses si hay suficientes datos
      const recentMonths = months.slice(-3);
      const recentMonthsData = recentMonths.map(m => monthlyData[m]);
      const avgQuantity = recentMonthsData.length > 0 
        ? recentMonthsData.reduce((sum, qty) => sum + qty, 0) / recentMonthsData.length 
        : 0;
      
      // Calcular tendencia (simple: comparar último mes con promedio)
      const lastMonth = months[months.length - 1];
      const lastMonthQuantity = lastMonth ? monthlyData[lastMonth] : 0;
      const trend = avgQuantity > 0 ? ((lastMonthQuantity - avgQuantity) / avgQuantity) * 100 : 0;
      
      return {
        productId: parseInt(productId),
        name: productItem?.productName || `Producto ${productId}`,
        currentStock: inventoryItem ? inventoryItem.quantity : 0,
        monthlyHistory: monthlyData,
        averageMonthlyQuantity: avgQuantity,
        lastMonthQuantity,
        trend: parseFloat(trend.toFixed(2)),
        monthsOfSupplyLeft: inventoryItem && avgQuantity > 0 ? inventoryItem.quantity / avgQuantity : 0
      };
    });
    
    // Crear prompt para OpenAI
    const prompt = `
Analiza los siguientes datos históricos de compras e inventario y predice necesidades futuras:

${JSON.stringify(productPredictions, null, 2)}

Por favor, proporciona:
1. Predicción de necesidades de compra para los próximos 3 meses
2. Productos que necesitarán ser reabastecidos pronto
3. Productos cuya demanda está creciendo significativamente
4. Recomendaciones para planificación de compras futuras

Responde con un JSON que contenga los siguientes campos:
- analysis: Un resumen de las predicciones de necesidades futuras
- insights: Un array de insights clave sobre tendencias y necesidades
- recommendations: Un array de recomendaciones para planificación de compras
    `;

    // Llamar a OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "Eres un analista de forecasting y planificación de demanda. Proporciona predicciones detalladas y accionables basadas en datos históricos." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Procesar y retornar respuesta
    const result = JSON.parse(response.choices[0].message.content);
    return {
      analysis: result.analysis,
      insights: result.insights || [],
      recommendations: result.recommendations || [],
      dataPoints: productPredictions
    };
  } catch (error) {
    console.error("Error en predicción de necesidades:", error);
    throw new Error(`Error al predecir necesidades futuras: ${error.message}`);
  }
}

/**
 * Función principal para obtener análisis de compras
 */
export async function getPurchaseAnalysis(
  request: PurchaseAnalysisRequest
): Promise<PurchaseAnalysisResponse> {
  try {
    // Determinar rango de fechas
    let startDate: Date, endDate = new Date();
    
    switch (request.timeframe) {
      case 'last_month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'last_quarter':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'last_year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'custom':
        startDate = request.customStartDate ? new Date(request.customStartDate) : new Date();
        startDate.setMonth(startDate.getMonth() - 3); // Default a 3 meses si no se especifica
        endDate = request.customEndDate ? new Date(request.customEndDate) : new Date();
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
    }
    
    // Obtener órdenes filtradas
    // En una implementación real, esto usaría storage.getPurchaseOrdersByDateRange()
    // Por ahora, usamos una función simulada
    let orders = await getPurchaseOrdersByFilters(
      request.companyId, 
      startDate, 
      endDate, 
      request.supplierId,
      request.warehouseId
    );
    
    // Realizar el análisis solicitado
    let timeframeString = '';
    switch (request.timeframe) {
      case 'last_month': timeframeString = 'el último mes'; break;
      case 'last_quarter': timeframeString = 'el último trimestre'; break;
      case 'last_year': timeframeString = 'el último año'; break;
      case 'custom': timeframeString = 'el período seleccionado'; break;
    }
    
    switch (request.analysisType) {
      case 'supplier_performance':
        const suppliers = await getAllSuppliers(request.companyId);
        return await analyzeSupplierPerformance(orders, suppliers, timeframeString);
        
      case 'expense_trends':
        return await analyzeExpenseTrends(orders, timeframeString);
        
      case 'inventory_optimization':
        const inventory = await getInventoryItems(request.companyId, request.warehouseId);
        return await analyzeInventoryOptimization(orders, inventory, timeframeString);
        
      case 'future_needs':
        const inventoryForPrediction = await getInventoryItems(request.companyId, request.warehouseId);
        return await predictFutureNeeds(orders, inventoryForPrediction, timeframeString);
        
      default:
        throw new Error("Tipo de análisis no soportado");
    }
  } catch (error) {
    console.error("Error en análisis de compras:", error);
    throw new Error(`Error al realizar análisis de compras: ${error.message}`);
  }
}

// Funciones auxiliares

function calculateOnTimeDelivery(orders: any[]): number {
  if (orders.length === 0) return 0;
  
  const onTimeOrders = orders.filter(order => {
    // Considerar entrega a tiempo si:
    // 1. Tiene fecha de entrega esperada
    // 2. Tiene fecha de entrega real (alguna recepción)
    // 3. La entrega real no es después de la esperada
    
    if (!order.expectedDeliveryDate || !order.firstReceiptDate) return false;
    
    const expectedDate = new Date(order.expectedDeliveryDate);
    const actualDate = new Date(order.firstReceiptDate);
    
    return actualDate <= expectedDate;
  });
  
  return (onTimeOrders.length / orders.length) * 100;
}

function calculateAverageResponseTime(orders: any[]): number {
  const ordersWithResponse = orders.filter(
    order => order.sentDate && order.supplierResponseDate
  );
  
  if (ordersWithResponse.length === 0) return 0;
  
  const totalResponseTime = ordersWithResponse.reduce((sum, order) => {
    const sentDate = new Date(order.sentDate);
    const responseDate = new Date(order.supplierResponseDate);
    const diffTime = Math.abs(responseDate.getTime() - sentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + diffDays;
  }, 0);
  
  return totalResponseTime / ordersWithResponse.length;
}

// Funciones para obtener datos
// En una implementación real, estas funciones harían consultas a la base de datos

async function getPurchaseOrdersByFilters(
  companyId: number,
  startDate: Date,
  endDate: Date,
  supplierId?: number,
  warehouseId?: number
): Promise<any[]> {
  try {
    // Aquí iría la lógica real de consulta a la base de datos
    // Por ahora usamos storage.db directamente
    const orders = await storage.db.query(`
      SELECT po.*, 
             json_agg(poi.*) as items,
             s.name as supplierName,
             w.name as warehouseName
      FROM purchase_orders po
      LEFT JOIN purchase_order_items poi ON po.id = poi.purchaseOrderId
      LEFT JOIN suppliers s ON po.supplierId = s.id
      LEFT JOIN warehouses w ON po.warehouseId = w.id
      WHERE po.companyId = $1
        AND po.createdAt BETWEEN $2 AND $3
        ${supplierId ? 'AND po.supplierId = $4' : ''}
        ${warehouseId ? `AND po.warehouseId = ${supplierId ? '$5' : '$4'}` : ''}
      GROUP BY po.id, s.name, w.name
      ORDER BY po.createdAt DESC
    `, [
      companyId, 
      startDate, 
      endDate,
      ...(supplierId ? [supplierId] : []),
      ...(warehouseId ? [warehouseId] : [])
    ]);

    // Procesar cada orden para calcular datos adicionales
    return orders.map((order: any) => {
      // Inicializar items si es null
      if (!order.items || order.items[0] === null) {
        order.items = [];
      }
      
      // Calcular totales
      let totalAmount = 0;
      if (order.items && order.items.length > 0) {
        totalAmount = order.items.reduce(
          (sum: number, item: any) => sum + (parseFloat(item.totalPrice) || 0), 
          0
        );
      }
      
      // Calcular fechas importantes
      const firstReceipt = order.items
        .filter((item: any) => item.receivedQuantity > 0)
        .sort((a: any, b: any) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())[0];
      
      return {
        ...order,
        totalAmount,
        firstReceiptDate: firstReceipt ? firstReceipt.updatedAt : null,
        hasQualityIssues: false, // En una implementación real, esto vendría de otro lugar
      };
    });
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return [];
  }
}

async function getAllSuppliers(companyId: number): Promise<any[]> {
  try {
    // En una implementación real:
    // return await storage.getSuppliers(companyId);
    
    const suppliers = await storage.db.query(`
      SELECT * FROM suppliers
      WHERE companyId = $1
    `, [companyId]);
    
    return suppliers;
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return [];
  }
}

async function getInventoryItems(companyId: number, warehouseId?: number): Promise<any[]> {
  try {
    // En una implementación real:
    // return await storage.getInventoryItems(companyId, warehouseId);
    
    const inventory = await storage.db.query(`
      SELECT i.*, p.name as productName, p.category as productCategory
      FROM inventory i
      JOIN products p ON i.productId = p.id
      JOIN warehouses w ON i.warehouseId = w.id
      WHERE w.companyId = $1
      ${warehouseId ? 'AND i.warehouseId = $2' : ''}
    `, warehouseId ? [companyId, warehouseId] : [companyId]);
    
    return inventory;
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return [];
  }
}