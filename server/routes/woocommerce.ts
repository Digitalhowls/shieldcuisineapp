import { Express, Request, Response } from 'express';
import { wooCommerceService, WooCommerceConfig } from '../services/woocommerce';
import { storage } from '../storage';
import { log } from '../vite';

// Middleware de autenticación
const verifyAuth = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
};

// Middleware para verificar rol de administrador
const verifyAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated() || req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
};

/**
 * Registra las rutas para la integración con WooCommerce
 */
export function registerWooCommerceRoutes(app: Express) {
  /**
   * Configura la conexión con WooCommerce
   */
  app.post('/api/woocommerce/config', verifyAdmin, async (req: Request, res: Response) => {
    try {
      const config: WooCommerceConfig = req.body;
      
      // Validar datos mínimos
      if (!config.url || !config.consumerKey || !config.consumerSecret) {
        return res.status(400).json({ 
          success: false, 
          error: 'Datos de configuración incompletos' 
        });
      }
      
      // Inicializar el servicio con la configuración
      const initialized = wooCommerceService.initialize(config);
      
      if (!initialized) {
        return res.status(500).json({ 
          success: false, 
          error: 'Error al inicializar la API de WooCommerce' 
        });
      }
      
      // Probar la conexión
      const connected = await wooCommerceService.testConnection();
      
      if (!connected) {
        return res.status(400).json({ 
          success: false, 
          error: 'No se pudo conectar con WooCommerce. Verifica las credenciales.' 
        });
      }
      
      // Todo correcto, devolver éxito
      return res.status(200).json({ 
        success: true, 
        message: 'Conexión con WooCommerce establecida correctamente' 
      });
    } catch (error) {
      log(`Error al configurar WooCommerce: ${error}`, 'woocommerce-routes');
      return res.status(500).json({ 
        success: false, 
        error: `Error al configurar WooCommerce: ${error}` 
      });
    }
  });

  /**
   * Verifica el estado de la conexión con WooCommerce
   */
  app.get('/api/woocommerce/status', verifyAuth, async (req: Request, res: Response) => {
    try {
      const connected = await wooCommerceService.testConnection();
      return res.status(200).json({ connected });
    } catch (error) {
      log(`Error al verificar estado de WooCommerce: ${error}`, 'woocommerce-routes');
      return res.status(500).json({ 
        connected: false, 
        error: `Error al verificar estado: ${error}` 
      });
    }
  });

  /**
   * Obtiene productos de WooCommerce
   */
  app.get('/api/woocommerce/products', verifyAuth, async (req: Request, res: Response) => {
    try {
      const products = await wooCommerceService.getProducts();
      return res.status(200).json(products);
    } catch (error) {
      log(`Error al obtener productos de WooCommerce: ${error}`, 'woocommerce-routes');
      return res.status(500).json({ 
        error: `Error al obtener productos: ${error}` 
      });
    }
  });

  /**
   * Obtiene un producto específico de WooCommerce
   */
  app.get('/api/woocommerce/products/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de producto inválido' });
      }
      
      const product = await wooCommerceService.getProduct(id);
      return res.status(200).json(product);
    } catch (error) {
      log(`Error al obtener producto de WooCommerce: ${error}`, 'woocommerce-routes');
      return res.status(500).json({ 
        error: `Error al obtener producto: ${error}` 
      });
    }
  });

  /**
   * Obtiene pedidos de WooCommerce
   */
  app.get('/api/woocommerce/orders', verifyAuth, async (req: Request, res: Response) => {
    try {
      // Parámetros de filtrado opcional
      const { status, after } = req.query;
      const params: any = {};
      
      if (status) params.status = status;
      if (after) params.after = after;
      
      const orders = await wooCommerceService.getOrders(params);
      return res.status(200).json(orders);
    } catch (error) {
      log(`Error al obtener pedidos de WooCommerce: ${error}`, 'woocommerce-routes');
      return res.status(500).json({ 
        error: `Error al obtener pedidos: ${error}` 
      });
    }
  });

  /**
   * Obtiene un pedido específico de WooCommerce
   */
  app.get('/api/woocommerce/orders/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de pedido inválido' });
      }
      
      const order = await wooCommerceService.getOrder(id);
      return res.status(200).json(order);
    } catch (error) {
      log(`Error al obtener pedido de WooCommerce: ${error}`, 'woocommerce-routes');
      return res.status(500).json({ 
        error: `Error al obtener pedido: ${error}` 
      });
    }
  });

  /**
   * Actualiza el estado de un pedido en WooCommerce
   */
  app.put('/api/woocommerce/orders/:id/status', verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID de pedido inválido' });
      }
      
      if (!status) {
        return res.status(400).json({ error: 'Estado no proporcionado' });
      }
      
      const updatedOrder = await wooCommerceService.updateOrderStatus(id, status);
      return res.status(200).json(updatedOrder);
    } catch (error) {
      log(`Error al actualizar estado de pedido en WooCommerce: ${error}`, 'woocommerce-routes');
      return res.status(500).json({ 
        error: `Error al actualizar estado de pedido: ${error}` 
      });
    }
  });

  /**
   * Sincroniza productos del sistema a WooCommerce
   */
  app.post('/api/woocommerce/sync/products', verifyAuth, async (req: Request, res: Response) => {
    try {
      // Opcionalmente aceptar lista de IDs específicos para sincronizar
      const { productIds, companyId } = req.body;
      
      // Obtener productos del sistema
      let products;
      if (productIds && Array.isArray(productIds) && productIds.length > 0) {
        // Obtener solo productos específicos
        products = await Promise.all(
          productIds.map(id => storage.getProduct(id))
        );
        // Filtrar productos no encontrados
        products = products.filter(p => p !== undefined);
      } else if (companyId) {
        // Obtener todos los productos de una empresa
        products = await storage.getProducts(companyId);
      } else {
        return res.status(400).json({ 
          error: 'Debe proporcionar productIds o companyId' 
        });
      }
      
      if (!products || products.length === 0) {
        return res.status(404).json({ 
          error: 'No se encontraron productos para sincronizar' 
        });
      }
      
      // Sincronizar productos con WooCommerce
      const result = await wooCommerceService.syncProductsToWooCommerce(products);
      
      return res.status(200).json({
        success: true,
        total: products.length,
        created: result.created.length,
        updated: result.updated.length,
        failed: result.failed.length,
        result
      });
    } catch (error) {
      log(`Error al sincronizar productos a WooCommerce: ${error}`, 'woocommerce-routes');
      return res.status(500).json({ 
        success: false,
        error: `Error al sincronizar productos: ${error}` 
      });
    }
  });

  /**
   * Sincroniza pedidos desde WooCommerce al sistema
   */
  app.post('/api/woocommerce/sync/orders', verifyAuth, async (req: Request, res: Response) => {
    try {
      const { sinceDate } = req.body;
      let sinceDateObj;
      
      if (sinceDate) {
        sinceDateObj = new Date(sinceDate);
        if (isNaN(sinceDateObj.getTime())) {
          return res.status(400).json({ 
            error: 'Formato de fecha inválido' 
          });
        }
      }
      
      // Obtener pedidos de WooCommerce
      const orders = await wooCommerceService.syncOrdersFromWooCommerce(sinceDateObj);
      
      // TODO: Implementar lógica para guardar los pedidos en nuestro sistema
      // Por ahora simplemente devolvemos los pedidos obtenidos
      
      return res.status(200).json({
        success: true,
        total: orders.length,
        orders
      });
    } catch (error) {
      log(`Error al sincronizar pedidos desde WooCommerce: ${error}`, 'woocommerce-routes');
      return res.status(500).json({ 
        success: false,
        error: `Error al sincronizar pedidos: ${error}` 
      });
    }
  });
}