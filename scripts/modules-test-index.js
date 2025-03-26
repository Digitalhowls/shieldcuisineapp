/**
 * Índice de pruebas para ShieldCuisine
 * 
 * Este archivo proporciona una visión general de todas las pruebas 
 * automatizadas disponibles para cada módulo de la aplicación.
 */

module.exports = {
  // Módulo de Autenticación
  'Autenticación': {
    description: 'Pruebas del sistema de autenticación y gestión de usuarios',
    tests: [
      { id: 'auth-login', name: 'Login con credenciales correctas', priority: 'alta' },
      { id: 'auth-login-fail', name: 'Login con credenciales incorrectas', priority: 'alta' },
      { id: 'auth-logout', name: 'Cierre de sesión', priority: 'alta' },
      { id: 'auth-reset', name: 'Restablecimiento de contraseña', priority: 'media' },
      { id: 'auth-register', name: 'Registro de nuevo usuario', priority: 'media' },
      { id: 'auth-profile', name: 'Edición de perfil de usuario', priority: 'baja' },
    ]
  },
  
  // Módulo APPCC
  'APPCC': {
    description: 'Pruebas del módulo de control de puntos críticos',
    tests: [
      { id: 'appcc-list', name: 'Listado de controles', priority: 'alta' },
      { id: 'appcc-create', name: 'Creación de nuevo control', priority: 'alta' },
      { id: 'appcc-edit', name: 'Edición de control existente', priority: 'alta' },
      { id: 'appcc-complete', name: 'Completar un control', priority: 'alta' },
      { id: 'appcc-history', name: 'Historial de controles', priority: 'media' },
      { id: 'appcc-report', name: 'Generación de informes', priority: 'media' },
      { id: 'appcc-alert', name: 'Sistema de alertas', priority: 'media' },
      { id: 'appcc-template', name: 'Gestión de plantillas', priority: 'baja' },
    ]
  },
  
  // Módulo de Inventario
  'Inventario': {
    description: 'Pruebas del sistema de gestión de inventario',
    tests: [
      { id: 'inv-list', name: 'Listado de productos', priority: 'alta' },
      { id: 'inv-search', name: 'Búsqueda de productos', priority: 'alta' },
      { id: 'inv-add', name: 'Añadir nuevo producto', priority: 'alta' },
      { id: 'inv-update', name: 'Actualizar stock', priority: 'alta' },
      { id: 'inv-movement', name: 'Registrar movimiento de inventario', priority: 'alta' },
      { id: 'inv-warehouse', name: 'Gestión de almacenes', priority: 'media' },
      { id: 'inv-category', name: 'Gestión de categorías', priority: 'media' },
      { id: 'inv-report', name: 'Generación de informes', priority: 'media' },
      { id: 'inv-expired', name: 'Control de caducidades', priority: 'media' },
      { id: 'inv-min', name: 'Alertas de stock mínimo', priority: 'baja' },
    ]
  },
  
  // Portal de Transparencia
  'Transparencia': {
    description: 'Pruebas del portal de transparencia para clientes',
    tests: [
      { id: 'trans-access', name: 'Acceso al portal', priority: 'alta' },
      { id: 'trans-view', name: 'Visualización de controles APPCC', priority: 'alta' },
      { id: 'trans-filter', name: 'Filtrado de información', priority: 'media' },
      { id: 'trans-download', name: 'Descarga de informes', priority: 'media' },
      { id: 'trans-custom', name: 'Personalización de portal', priority: 'baja' },
    ]
  },
  
  // Integración WooCommerce
  'WooCommerce': {
    description: 'Pruebas de la integración con tienda online',
    tests: [
      { id: 'woo-connect', name: 'Conexión con WooCommerce', priority: 'alta' },
      { id: 'woo-sync-products', name: 'Sincronización de productos', priority: 'alta' },
      { id: 'woo-sync-stock', name: 'Sincronización de inventario', priority: 'alta' },
      { id: 'woo-orders', name: 'Gestión de pedidos', priority: 'media' },
      { id: 'woo-customers', name: 'Sincronización de clientes', priority: 'media' },
    ]
  },
  
  // Integración Bancaria
  'Bancario': {
    description: 'Pruebas de la integración con servicios bancarios',
    tests: [
      { id: 'bank-connect', name: 'Conexión con API bancaria', priority: 'alta' },
      { id: 'bank-accounts', name: 'Listado de cuentas', priority: 'alta' },
      { id: 'bank-transactions', name: 'Listado de transacciones', priority: 'alta' },
      { id: 'bank-categorize', name: 'Categorización automática', priority: 'media' },
      { id: 'bank-reconcile', name: 'Conciliación bancaria', priority: 'media' },
      { id: 'bank-payment', name: 'Iniciar pagos', priority: 'baja' },
      { id: 'bank-report', name: 'Informes financieros', priority: 'baja' },
    ]
  },
  
  // Plataforma E-Learning
  'E-Learning': {
    description: 'Pruebas de la plataforma de formación online',
    tests: [
      { id: 'elearn-courses', name: 'Listado de cursos', priority: 'alta' },
      { id: 'elearn-enroll', name: 'Inscripción en curso', priority: 'alta' },
      { id: 'elearn-lesson', name: 'Visualización de lecciones', priority: 'alta' },
      { id: 'elearn-quiz', name: 'Realización de cuestionarios', priority: 'alta' },
      { id: 'elearn-progress', name: 'Seguimiento de progreso', priority: 'media' },
      { id: 'elearn-certificate', name: 'Generación de certificados', priority: 'media' },
      { id: 'elearn-create', name: 'Creación de cursos', priority: 'media' },
      { id: 'elearn-report', name: 'Informes de formación', priority: 'baja' },
    ]
  },
  
  // Módulo de Compras
  'Compras': {
    description: 'Pruebas del sistema de gestión de compras',
    tests: [
      { id: 'purch-suppliers', name: 'Gestión de proveedores', priority: 'alta' },
      { id: 'purch-order-create', name: 'Creación de pedidos', priority: 'alta' },
      { id: 'purch-order-list', name: 'Listado de pedidos', priority: 'alta' },
      { id: 'purch-order-status', name: 'Cambio de estado de pedidos', priority: 'alta' },
      { id: 'purch-receive', name: 'Recepción de mercancía', priority: 'alta' },
      { id: 'purch-invoice', name: 'Gestión de facturas', priority: 'media' },
      { id: 'purch-analysis', name: 'Análisis de compras con IA', priority: 'media' },
      { id: 'purch-forecast', name: 'Previsión de compras', priority: 'baja' },
    ]
  },
  
  // Módulo CMS/Constructor Web
  'CMS': {
    description: 'Pruebas del sistema de gestión de contenidos',
    tests: [
      { id: 'cms-pages', name: 'Gestión de páginas', priority: 'alta' },
      { id: 'cms-create-page', name: 'Creación de página', priority: 'alta' },
      { id: 'cms-editor', name: 'Editor de bloques', priority: 'alta' },
      { id: 'cms-media', name: 'Biblioteca de medios', priority: 'alta' },
      { id: 'cms-blog', name: 'Gestión de blog', priority: 'media' },
      { id: 'cms-menu', name: 'Gestión de menús', priority: 'media' },
      { id: 'cms-branding', name: 'Personalización de marca', priority: 'media' },
      { id: 'cms-forms', name: 'Formularios personalizados', priority: 'baja' },
      { id: 'cms-seo', name: 'Configuración SEO', priority: 'baja' },
    ]
  }
};