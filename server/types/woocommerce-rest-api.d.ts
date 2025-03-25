declare module '@woocommerce/woocommerce-rest-api' {
  interface WooCommerceAPIOptions {
    url: string;
    consumerKey: string;
    consumerSecret: string;
    version: string;
    queryStringAuth?: boolean;
    timeout?: number;
  }

  class WooCommerceAPI {
    constructor(options: WooCommerceAPIOptions);
    get(endpoint: string, params?: any): Promise<any>;
    post(endpoint: string, data: any): Promise<any>;
    put(endpoint: string, data: any): Promise<any>;
    delete(endpoint: string, params?: any): Promise<any>;
    options(endpoint: string): Promise<any>;
  }

  export default WooCommerceAPI;
}