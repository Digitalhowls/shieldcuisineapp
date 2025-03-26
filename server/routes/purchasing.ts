/**
 * Rutas de API para el módulo de compras
 */
import { Request, Response, Express } from "express";
import { storage } from "../storage";
import { verifyAuth } from "./auth-middleware";
import { 
  insertPurchaseOrderSchema, 
  insertPurchaseOrderItemSchema,
  insertGoodsReceiptSchema,
  insertGoodsReceiptItemSchema
} from "@shared/schema";
import { getPurchaseAnalysis, PurchaseAnalysisRequest } from "../services/purchase-analysis";

/**
 * Middleware para verificar rol de administrador
 */
const verifyAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "No autenticado" });
  }
  
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'company_admin')) {
    return res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador" });
  }
  
  next();
};

/**
 * Registra las rutas para el módulo de compras
 */
export function registerPurchasingRoutes(app: Express) {
  /**
   * Obtiene todas las órdenes de compra
   */
  app.get("/api/purchase-orders", verifyAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).send("No autenticado");
      
      const companyId = req.user.companyId;
      if (!companyId) return res.status(403).send("Usuario no asociado a una empresa");
      
      const purchaseOrders = await storage.getPurchaseOrders(companyId);
      
      // Enriquecer con datos relacionados
      const enrichedOrders = await Promise.all(purchaseOrders.map(async (order) => {
        const supplier = await storage.getSupplier(order.supplierId);
        const location = await storage.getLocation(order.locationId);
        const warehouse = await storage.getWarehouse(order.warehouseId);
        const createdBy = await storage.getUser(order.createdBy);
        
        return {
          ...order,
          supplierName: supplier?.name || "Desconocido",
          locationName: location?.name || "Desconocida",
          warehouseName: warehouse?.name || "Desconocido",
          createdByName: createdBy?.name || "Desconocido",
        };
      }));
      
      res.json(enrichedOrders);
    } catch (error) {
      console.error("Error al obtener órdenes de compra:", error);
      res.status(500).send("Error interno del servidor");
    }
  });
  
  /**
   * Obtiene una orden de compra específica por ID
   */
  app.get("/api/purchase-orders/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).send("No autenticado");
      
      const orderId = parseInt(req.params.id, 10);
      if (isNaN(orderId)) {
        return res.status(400).send("ID de orden inválido");
      }
      
      const order = await storage.getPurchaseOrder(orderId);
      
      if (!order) {
        return res.status(404).send("Orden de compra no encontrada");
      }
      
      // Verificar pertenencia a la empresa
      if (req.user.companyId !== order.companyId) {
        return res.status(403).send("Acceso denegado a este recurso");
      }
      
      // Obtener los items de la orden
      const items = await storage.getPurchaseOrderItems(orderId);
      
      // Enriquecer con datos relacionados
      const supplier = await storage.getSupplier(order.supplierId);
      const location = await storage.getLocation(order.locationId);
      const warehouse = await storage.getWarehouse(order.warehouseId);
      const createdBy = await storage.getUser(order.createdBy);
      const approvedBy = order.approvedBy ? await storage.getUser(order.approvedBy) : null;
      
      // Enriquecer items con nombres de productos
      const enrichedItems = await Promise.all(items.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          productName: product?.name || "Desconocido",
          productSku: product?.sku || null,
        };
      }));
      
      const enrichedOrder = {
        ...order,
        items: enrichedItems,
        supplier,
        location,
        warehouse,
        createdBy,
        approvedBy,
      };
      
      res.json(enrichedOrder);
    } catch (error) {
      console.error("Error al obtener orden de compra:", error);
      res.status(500).send("Error interno del servidor");
    }
  });
  
  /**
   * Crea una nueva orden de compra
   */
  app.post("/api/purchase-orders", verifyAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).send("No autenticado");
      const companyId = req.user.companyId;
      if (!companyId) return res.status(403).send("Usuario no asociado a una empresa");
      
      // Validar datos de la orden
      const validatedOrderData = insertPurchaseOrderSchema.parse({
        ...req.body,
        companyId,
        createdBy: req.user.id,
      });
      
      // Validar items de la orden
      if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).send("La orden debe contener al menos un producto");
      }
      
      // Crear la orden
      const newOrder = await storage.createPurchaseOrder(validatedOrderData);
      
      // Crear items de la orden
      for (const item of req.body.items) {
        const validatedItemData = insertPurchaseOrderItemSchema.parse({
          ...item,
          purchaseOrderId: newOrder.id,
        });
        await storage.createPurchaseOrderItem(validatedItemData);
      }
      
      // Generar notificación si el estado es 'sent'
      if (newOrder.status === 'sent') {
        // Obtener datos para la notificación
        const supplier = await storage.getSupplier(newOrder.supplierId);
        const location = await storage.getLocation(newOrder.locationId);
        
        // Crear notificación para el administrador de la empresa
        const admins = await storage.getCompanyAdmins(companyId);
        for (const admin of admins) {
          // Verificar preferencias de notificación
          const preferences = await storage.getUserNotificationPreferences(admin.id);
          
          if (!preferences || preferences.purchasingNotifications) {
            await storage.createNotification({
              userId: admin.id,
              title: "Nueva orden de compra enviada",
              body: `Se ha enviado la orden ${newOrder.orderNumber} al proveedor ${supplier?.name} para la ubicación ${location?.name}.`,
              type: "purchasing",
              icon: "shopping-cart",
              url: `/compras/${newOrder.id}`,
              isRead: false,
              metadata: { orderId: newOrder.id, status: newOrder.status },
              createdAt: new Date(),
              expiresAt: null,
            });
          }
        }
        
        // También notificar a los gerentes de la ubicación
        if (newOrder.locationId) {
          const locationManagers = await storage.getLocationManagers(newOrder.locationId);
          for (const manager of locationManagers) {
            // Verificar preferencias de notificación
            const preferences = await storage.getUserNotificationPreferences(manager.id);
            
            if (!preferences || preferences.purchasingNotifications) {
              await storage.createNotification({
                userId: manager.id,
                title: "Nueva orden de compra enviada",
                body: `Se ha enviado la orden ${newOrder.orderNumber} al proveedor ${supplier?.name}.`,
                type: "purchasing",
                icon: "shopping-cart",
                url: `/compras/${newOrder.id}`,
                isRead: false,
                metadata: { orderId: newOrder.id, status: newOrder.status },
                createdAt: new Date(),
                expiresAt: null,
              });
            }
          }
        }
      }
      
      // Devolver la orden creada
      res.status(201).json(newOrder);
    } catch (error) {
      console.error("Error al crear orden de compra:", error);
      res.status(500).send("Error interno del servidor");
    }
  });
  
  /**
   * Actualiza el estado de una orden de compra
   */
  app.put("/api/purchase-orders/:id/status", verifyAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).send("No autenticado");
      
      const orderId = parseInt(req.params.id, 10);
      if (isNaN(orderId)) {
        return res.status(400).send("ID de orden inválido");
      }
      
      const { status } = req.body;
      if (!status || typeof status !== 'string') {
        return res.status(400).send("Estado inválido");
      }
      
      // Obtener la orden actual
      const order = await storage.getPurchaseOrder(orderId);
      if (!order) {
        return res.status(404).send("Orden de compra no encontrada");
      }
      
      // Verificar pertenencia a la empresa
      if (req.user.companyId !== order.companyId) {
        return res.status(403).send("Acceso denegado a este recurso");
      }
      
      // Verificar transiciones de estado válidas
      const validTransitions: Record<string, string[]> = {
        'draft': ['sent', 'cancelled'],
        'sent': ['confirmed', 'cancelled'],
        'confirmed': ['partially_received', 'completed', 'cancelled'],
        'partially_received': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': [],
      };
      
      if (!validTransitions[order.status]?.includes(status)) {
        return res.status(400).send(`Transición de estado inválida: ${order.status} -> ${status}`);
      }
      
      // Actualizar la orden
      const updatedData: any = {
        status,
      };
      
      // Si se confirma, registrar quién lo hizo
      if (status === 'confirmed') {
        updatedData.approvedBy = req.user.id;
        updatedData.approvedAt = new Date();
      }
      
      const updatedOrder = await storage.updatePurchaseOrder(orderId, updatedData);
      
      // Generar notificación de cambio de estado
      if (updatedOrder) {
        // Obtener datos para la notificación
        const supplier = await storage.getSupplier(order.supplierId);
        
        // Determinando el mensaje según el estado
        let title: string;
        let body: string;
        
        switch (status) {
          case 'sent':
            title = "Orden de compra enviada";
            body = `La orden ${order.orderNumber} ha sido enviada al proveedor ${supplier?.name}.`;
            break;
          case 'confirmed':
            title = "Orden de compra confirmada";
            body = `El proveedor ${supplier?.name} ha confirmado la orden ${order.orderNumber}.`;
            break;
          case 'partially_received':
            title = "Orden recibida parcialmente";
            body = `Se ha registrado una recepción parcial para la orden ${order.orderNumber}.`;
            break;
          case 'completed':
            title = "Orden de compra completada";
            body = `La orden ${order.orderNumber} ha sido completada.`;
            break;
          case 'cancelled':
            title = "Orden de compra cancelada";
            body = `La orden ${order.orderNumber} ha sido cancelada.`;
            break;
          default:
            title = "Actualización de orden de compra";
            body = `La orden ${order.orderNumber} ha cambiado al estado: ${status}.`;
        }
        
        // Notificar a los administradores de la empresa
        const admins = await storage.getCompanyAdmins(order.companyId);
        for (const admin of admins) {
          // Verificar preferencias de notificación
          const preferences = await storage.getUserNotificationPreferences(admin.id);
          
          if (!preferences || preferences.purchasingNotifications) {
            await storage.createNotification({
              userId: admin.id,
              title,
              body,
              type: "purchasing",
              icon: "shopping-cart",
              url: `/compras/${order.id}`,
              isRead: false,
              metadata: { orderId: order.id, status },
              createdAt: new Date(),
              expiresAt: null,
            });
          }
        }
        
        // También notificar a los gerentes de la ubicación
        if (order.locationId) {
          const locationManagers = await storage.getLocationManagers(order.locationId);
          for (const manager of locationManagers) {
            // Verificar preferencias de notificación
            const preferences = await storage.getUserNotificationPreferences(manager.id);
            
            if (!preferences || preferences.purchasingNotifications) {
              await storage.createNotification({
                userId: manager.id,
                title,
                body,
                type: "purchasing",
                icon: "shopping-cart",
                url: `/compras/${order.id}`,
                isRead: false,
                metadata: { orderId: order.id, status },
                createdAt: new Date(),
                expiresAt: null,
              });
            }
          }
        }
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error al actualizar estado de orden de compra:", error);
      res.status(500).send("Error interno del servidor");
    }
  });
  
  /**
   * Registra la recepción de mercancía
   */
  app.post("/api/purchase-orders/:id/receipts", verifyAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).send("No autenticado");
      
      const orderId = parseInt(req.params.id, 10);
      if (isNaN(orderId)) {
        return res.status(400).send("ID de orden inválido");
      }
      
      // Obtener la orden
      const order = await storage.getPurchaseOrder(orderId);
      if (!order) {
        return res.status(404).send("Orden de compra no encontrada");
      }
      
      // Verificar pertenencia a la empresa
      if (req.user.companyId !== order.companyId) {
        return res.status(403).send("Acceso denegado a este recurso");
      }
      
      // Verificar que la orden está en un estado que permite recepciones
      if (!['confirmed', 'partially_received'].includes(order.status)) {
        return res.status(400).send("La orden debe estar confirmada para registrar recepciones");
      }
      
      // Validar datos de la recepción
      const validatedReceiptData = insertGoodsReceiptSchema.parse({
        ...req.body,
        purchaseOrderId: orderId,
        receivedBy: req.user.id,
      });
      
      // Validar items de la recepción
      if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).send("La recepción debe contener al menos un producto");
      }
      
      // Crear la recepción
      const newReceipt = await storage.createGoodsReceipt(validatedReceiptData);
      
      // Crear items de la recepción
      for (const item of req.body.items) {
        const validatedItemData = insertGoodsReceiptItemSchema.parse({
          ...item,
          goodsReceiptId: newReceipt.id,
        });
        
        await storage.createGoodsReceiptItem(validatedItemData);
        
        // Actualizar el stock en el inventario
        const purchaseOrderItem = await storage.getPurchaseOrderItem(item.purchaseOrderItemId);
        if (purchaseOrderItem) {
          // Buscar el item en el inventario o crear uno nuevo
          const inventoryItem = await storage.getInventoryItemByProductAndWarehouse(
            purchaseOrderItem.productId,
            order.warehouseId
          );
          
          if (inventoryItem) {
            // Actualizar cantidad
            await storage.updateInventoryItem(inventoryItem.id, {
              quantity: inventoryItem.quantity + item.quantity,
              updatedAt: new Date(),
            });
          } else {
            // Crear nuevo registro
            await storage.createInventoryItem({
              productId: purchaseOrderItem.productId,
              warehouseId: order.warehouseId,
              quantity: item.quantity,
              unit: item.unit,
              batchNumber: item.batchNumber || null,
              expiryDate: item.expiryDate || null,
              supplierId: order.supplierId,
              purchaseDate: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          
          // Registrar la transacción de inventario
          await storage.createInventoryTransaction({
            productId: purchaseOrderItem.productId,
            destinationWarehouseId: order.warehouseId,
            quantity: item.quantity,
            unit: item.unit,
            batchNumber: item.batchNumber || null,
            type: "purchase",
            documentId: newReceipt.id,
            documentType: "goods_receipt",
            userId: req.user.id,
            notes: `Recepción de mercancía - Orden ${order.orderNumber}`,
            createdAt: new Date(),
          });
          
          // Actualizar la cantidad recibida en el item de la orden
          await storage.updatePurchaseOrderItem(purchaseOrderItem.id, {
            receivedQuantity: purchaseOrderItem.receivedQuantity + item.quantity,
          });
        }
      }
      
      // Verificar si todos los items han sido recibidos completamente
      const allItems = await storage.getPurchaseOrderItems(orderId);
      const allItemsReceived = allItems.every(item => 
        item.receivedQuantity >= item.quantity
      );
      
      // Actualizar el estado de la orden
      if (allItemsReceived) {
        await storage.updatePurchaseOrder(orderId, { 
          status: 'completed',
          updatedAt: new Date()
        });
      } else {
        await storage.updatePurchaseOrder(orderId, { 
          status: 'partially_received',
          updatedAt: new Date()
        });
      }
      
      // Generar notificación de recepción
      const supplier = await storage.getSupplier(order.supplierId);
      const location = await storage.getLocation(order.locationId);
      
      // Crear notificación para administradores y gerentes
      const title = "Recepción de mercancía registrada";
      const body = `Se ha registrado una recepción para la orden ${order.orderNumber} del proveedor ${supplier?.name} en ${location?.name}.`;
      
      // Notificar a los administradores de la empresa
      const admins = await storage.getCompanyAdmins(order.companyId);
      for (const admin of admins) {
        // Verificar preferencias de notificación
        const preferences = await storage.getUserNotificationPreferences(admin.id);
        
        if (!preferences || preferences.purchasingNotifications) {
          await storage.createNotification({
            userId: admin.id,
            title,
            body,
            type: "purchasing",
            icon: "shopping-cart",
            url: `/compras/${order.id}`,
            isRead: false,
            metadata: { orderId: order.id, receiptId: newReceipt.id },
            createdAt: new Date(),
            expiresAt: null,
          });
        }
      }
      
      // También notificar a los gerentes de la ubicación
      if (order.locationId) {
        const locationManagers = await storage.getLocationManagers(order.locationId);
        for (const manager of locationManagers) {
          // Verificar preferencias de notificación
          const preferences = await storage.getUserNotificationPreferences(manager.id);
          
          if (!preferences || preferences.purchasingNotifications) {
            await storage.createNotification({
              userId: manager.id,
              title,
              body,
              type: "purchasing",
              icon: "shopping-cart",
              url: `/compras/${order.id}`,
              isRead: false,
              metadata: { orderId: order.id, receiptId: newReceipt.id },
              createdAt: new Date(),
              expiresAt: null,
            });
          }
        }
      }
      
      res.status(201).json(newReceipt);
    } catch (error) {
      console.error("Error al registrar recepción de mercancía:", error);
      res.status(500).send("Error interno del servidor");
    }
  });
}