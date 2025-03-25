// Importar WooCommerce API correctamente
import WooCommerceRestApiPackage from '@woocommerce/woocommerce-rest-api';
import { log } from '../vite';

// La librería exporta el constructor como default
const WooCommerceRestApi = WooCommerceRestApiPackage;

// Tipos para la configuración de WooCommerce
export interface WooCommerceConfig {
  url: string;
  consumerKey: string;
  consumerSecret: string;
  version: string;
}

// Interfaz para productos de WooCommerce
export interface WooCommerceProduct {
  id?: number;
  name: string;
  slug?: string;
  permalink?: string;
  date_created?: string;
  type?: string;
  status?: string;
  featured?: boolean;
  catalog_visibility?: string;
  description?: string;
  short_description?: string;
  sku?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  purchasable?: boolean;
  total_sales?: number;
  virtual?: boolean;
  downloadable?: boolean;
  stock_quantity?: number;
  stock_status?: 'instock' | 'outofstock' | 'onbackorder';
  categories?: Array<{id?: number, name?: string, slug?: string}>;
  tags?: Array<{id?: number, name?: string, slug?: string}>;
  images?: Array<{
    id?: number;
    src?: string;
    name?: string;
    alt?: string;
  }>;
  // Metadatos personalizados para conectar con nuestro sistema
  meta_data?: Array<{
    key: string;
    value: string;
  }>;
}

// Interfaz para pedidos de WooCommerce
export interface WooCommerceOrder {
  id?: number;
  status?: string;
  currency?: string;
  date_created?: string;
  date_modified?: string;
  discount_total?: string;
  shipping_total?: string;
  total?: string;
  customer_id?: number;
  customer_note?: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
  shipping?: {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
  line_items?: Array<{
    id?: number;
    name?: string;
    product_id?: number;
    variation_id?: number;
    quantity?: number;
    tax_class?: string;
    subtotal?: string;
    subtotal_tax?: string;
    total?: string;
    total_tax?: string;
    sku?: string;
    price?: number;
  }>;
  // Metadatos personalizados para conectar con nuestro sistema
  meta_data?: Array<{
    key: string;
    value: string;
  }>;
}

/**
 * Clase para manejar la integración con WooCommerce
 */
export class WooCommerceService {
  private api: any | null = null;
  private initialized: boolean = false;

  /**
   * Inicializa la API de WooCommerce con la configuración proporcionada
   */
  initialize(config: WooCommerceConfig): boolean {
    try {
      this.api = new WooCommerceRestApi({
        url: config.url,
        consumerKey: config.consumerKey,
        consumerSecret: config.consumerSecret,
        version: config.version || 'wc/v3',
        queryStringAuth: true // Forzar autenticación por parámetros de URL
      });
      this.initialized = true;
      log('WooCommerce API inicializada correctamente', 'woocommerce');
      return true;
    } catch (error) {
      log(`Error al inicializar WooCommerce API: ${error}`, 'woocommerce');
      this.initialized = false;
      return false;
    }
  }

  /**
   * Verifica si la API está inicializada con credenciales válidas
   */
  async testConnection(): Promise<boolean> {
    if (!this.initialized || !this.api) {
      return false;
    }

    try {
      // Intentar hacer una llamada simple para verificar la conexión
      const response = await this.api.get('system_status');
      return response.status === 200;
    } catch (error) {
      log(`Error al probar la conexión con WooCommerce: ${error}`, 'woocommerce');
      return false;
    }
  }

  /**
   * Obtiene todos los productos de WooCommerce
   */
  async getProducts(params: any = {}): Promise<WooCommerceProduct[]> {
    this.checkInitialized();

    try {
      const response = await this.api.get('products', params);
      return response.data;
    } catch (error) {
      log(`Error al obtener productos de WooCommerce: ${error}`, 'woocommerce');
      throw error;
    }
  }

  /**
   * Obtiene un producto específico de WooCommerce por su ID
   */
  async getProduct(id: number): Promise<WooCommerceProduct> {
    this.checkInitialized();

    try {
      const response = await this.api.get(`products/${id}`);
      return response.data;
    } catch (error) {
      log(`Error al obtener producto de WooCommerce: ${error}`, 'woocommerce');
      throw error;
    }
  }

  /**
   * Crea un nuevo producto en WooCommerce
   */
  async createProduct(product: WooCommerceProduct): Promise<WooCommerceProduct> {
    this.checkInitialized();

    try {
      const response = await this.api.post('products', product);
      return response.data;
    } catch (error) {
      log(`Error al crear producto en WooCommerce: ${error}`, 'woocommerce');
      throw error;
    }
  }

  /**
   * Actualiza un producto existente en WooCommerce
   */
  async updateProduct(id: number, product: Partial<WooCommerceProduct>): Promise<WooCommerceProduct> {
    this.checkInitialized();

    try {
      const response = await this.api.put(`products/${id}`, product);
      return response.data;
    } catch (error) {
      log(`Error al actualizar producto en WooCommerce: ${error}`, 'woocommerce');
      throw error;
    }
  }

  /**
   * Actualiza el stock de un producto en WooCommerce
   */
  async updateProductStock(id: number, quantity: number): Promise<WooCommerceProduct> {
    return this.updateProduct(id, {
      stock_quantity: quantity,
      stock_status: quantity > 0 ? 'instock' : 'outofstock'
    });
  }

  /**
   * Obtiene todos los pedidos de WooCommerce
   */
  async getOrders(params: any = {}): Promise<WooCommerceOrder[]> {
    this.checkInitialized();

    try {
      const response = await this.api.get('orders', params);
      return response.data;
    } catch (error) {
      log(`Error al obtener pedidos de WooCommerce: ${error}`, 'woocommerce');
      throw error;
    }
  }

  /**
   * Obtiene un pedido específico de WooCommerce por su ID
   */
  async getOrder(id: number): Promise<WooCommerceOrder> {
    this.checkInitialized();

    try {
      const response = await this.api.get(`orders/${id}`);
      return response.data;
    } catch (error) {
      log(`Error al obtener pedido de WooCommerce: ${error}`, 'woocommerce');
      throw error;
    }
  }

  /**
   * Actualiza el estado de un pedido en WooCommerce
   */
  async updateOrderStatus(id: number, status: string): Promise<WooCommerceOrder> {
    this.checkInitialized();

    try {
      const response = await this.api.put(`orders/${id}`, { status });
      return response.data;
    } catch (error) {
      log(`Error al actualizar estado de pedido en WooCommerce: ${error}`, 'woocommerce');
      throw error;
    }
  }

  /**
   * Sincroniza productos del sistema interno con WooCommerce
   * @param products Productos del sistema interno a sincronizar
   */
  async syncProductsToWooCommerce(products: any[]): Promise<{
    created: WooCommerceProduct[];
    updated: WooCommerceProduct[];
    failed: any[];
  }> {
    this.checkInitialized();

    const result = {
      created: [] as WooCommerceProduct[],
      updated: [] as WooCommerceProduct[],
      failed: [] as any[]
    };

    // Obtener todos los productos de WooCommerce para mapear
    try {
      const wcProducts = await this.getProducts({ per_page: 100 });
      const wcProductsMap = new Map<string, WooCommerceProduct>();
      
      // Crear un mapa por SKU para buscar coincidencias
      wcProducts.forEach(product => {
        if (product.sku) {
          wcProductsMap.set(product.sku, product);
        }
      });

      // Procesar cada producto
      for (const product of products) {
        try {
          // Comprobar si el producto ya existe en WooCommerce por SKU
          const existingProduct = wcProductsMap.get(product.sku);

          // Transformar producto interno al formato de WooCommerce
          const wcProductData: WooCommerceProduct = {
            name: product.name,
            description: product.description || '',
            short_description: product.shortDescription || '',
            sku: product.sku,
            regular_price: product.price ? product.price.toString() : '0',
            stock_quantity: product.stockQuantity || 0,
            stock_status: (product.stockQuantity && product.stockQuantity > 0) ? 'instock' : 'outofstock',
            // Agregar metadatos para identificación cruzada
            meta_data: [
              {
                key: 'internal_product_id',
                value: product.id.toString()
              }
            ]
          };

          if (existingProduct && existingProduct.id) {
            // Actualizar el producto existente
            const updated = await this.updateProduct(existingProduct.id, wcProductData);
            result.updated.push(updated);
          } else {
            // Crear un nuevo producto
            const created = await this.createProduct(wcProductData);
            result.created.push(created);
          }
        } catch (error) {
          log(`Error al sincronizar producto a WooCommerce: ${error}`, 'woocommerce');
          result.failed.push({ product, error });
        }
      }

      return result;
    } catch (error) {
      log(`Error al sincronizar productos a WooCommerce: ${error}`, 'woocommerce');
      throw error;
    }
  }

  /**
   * Sincroniza pedidos de WooCommerce al sistema interno
   */
  async syncOrdersFromWooCommerce(sinceDate?: Date): Promise<WooCommerceOrder[]> {
    this.checkInitialized();

    try {
      // Filtrar por fecha si se proporciona
      const params: any = { per_page: 100 };
      if (sinceDate) {
        params.after = sinceDate.toISOString();
      }

      // Obtener pedidos recientes
      const orders = await this.getOrders(params);
      return orders;
    } catch (error) {
      log(`Error al sincronizar pedidos desde WooCommerce: ${error}`, 'woocommerce');
      throw error;
    }
  }

  // Método de utilidad para verificar si la API está inicializada
  private checkInitialized(): void {
    if (!this.initialized || !this.api) {
      throw new Error('WooCommerce API no inicializada');
    }
  }
}

// Instancia única del servicio
export const wooCommerceService = new WooCommerceService();