# HOJA DE RUTA: CMS Y CONSTRUCTOR WEB

## 1. ARQUITECTURA DEL CMS

### 1.1 Estructura de Componentes
- **Gestión de Páginas** (`client/src/pages/cms/paginas.tsx`)
  - Vista general de páginas creadas
  - CRUD completo (Crear, Leer, Actualizar, Eliminar)
  - Filtrado por estado y tipo
- **Editor de Páginas** (`client/src/components/cms/page-editor.tsx`)
  - Formulario completo con pestañas
  - Información básica (título, slug, descripción)
  - Configuración (estado, visibilidad, tipo)
  - Editor de contenido (visual/HTML)
  - SEO (metaTitle, metaDescription)
- **Editor de Bloques** (`client/src/components/cms/block-editor/*`)
  - `index.tsx`: Componente principal y tipos
  - `BlockToolbar.tsx`: Barra de herramientas para añadir bloques
  - `BlockContainer.tsx`: Contenedor de bloques con opciones
  - `EmptyState.tsx`: Estado vacío al iniciar una nueva página

### 1.2 Modelos de Datos
- `PageContent`: Estructura principal del contenido
  ```typescript
  interface PageContent {
    blocks: Block[];
    settings?: {
      layout?: 'full' | 'boxed';
      spacing?: 'tight' | 'normal' | 'loose';
      background?: string;
    };
  }
  ```
- `Block`: Bloque individual de contenido
  ```typescript
  interface Block {
    id: string;
    type: BlockType;
    content: any;
  }
  ```
- `BlockType`: Tipos de bloques soportados
  ```typescript
  type BlockType = 
    | 'heading'
    | 'paragraph'
    | 'image'
    | 'gallery'
    | 'button'
    | 'video'
    | 'divider'
    | 'quote'
    | 'list'
    | 'html'
    | 'contact-form';
  ```

### 1.3 Almacenamiento
- Los datos se almacenan en PostgreSQL a través de tablas definidas en `shared/schema.ts`:
  - `cmsPages`: Páginas del CMS
  - `cmsCategories`: Categorías para organizar contenido
  - `cmsTags`: Etiquetas para clasificar contenido
  - `cmsMedia`: Biblioteca de medios
  - `cmsBranding`: Configuración de marca
  - `cmsMenus`: Menús de navegación
  - `cmsFormSubmissions`: Envíos de formularios

## 2. EDITOR DE BLOQUES

### 2.1 Funcionalidades Implementadas
- **Sistema Drag & Drop**: Reorganización de bloques mediante arrastrar y soltar
- **Herramientas de Edición**: Barra de herramientas con bloques comunes y avanzados
- **Contenido Dinámico**: Edición y actualización en tiempo real
- **Persistencia**: Almacenamiento como JSON en la base de datos
- **Vista Previa**: Previsualización del contenido final

### 2.2 Tipos de Bloques Disponibles
- **Básicos**:
  - `heading`: Títulos (H1-H4)
  - `paragraph`: Párrafos de texto
  - `image`: Imágenes con caption
  - `button`: Botones interactivos
- **Avanzados**:
  - `gallery`: Galerías de imágenes
  - `video`: Integración de videos
  - `divider`: Separadores visuales
  - `quote`: Citas destacadas
  - `list`: Listas ordenadas y no ordenadas
  - `html`: Código HTML personalizado
  - `contact-form`: Formularios de contacto

### 2.3 Flujo de Interacción del Editor
1. **Creación**: El usuario selecciona "Nueva página" o edita una existente
2. **Edición**: Uso del editor visual para añadir/editar bloques
3. **Organización**: Reordenación de bloques mediante drag & drop
4. **Configuración**: Ajuste de propiedades específicas de cada bloque
5. **Vista Previa**: Visualización del resultado final antes de publicar
6. **Publicación**: Cambio de estado a "publicado" y disponibilidad en web

## 3. PLAN DE IMPLEMENTACIÓN COMPLETA

### 3.1 Fase 1: Infraestructura Base (Completada)
- ✅ Estructura de datos en PostgreSQL
- ✅ Componentes UI base con Shadcn
- ✅ Sistema de autenticación y autorización
- ✅ Gestor de páginas básico
- ✅ Editor visual con bloques fundamentales

### 3.2 Fase 2: Mejoras del Editor (En progreso)
- ⬜ Completar todos los tipos de bloques
- ⬜ Añadir estilos personalizados a bloques
- ⬜ Mejorar sistema drag & drop con animaciones
- ⬜ Implementar historial de cambios (undo/redo)
- ⬜ Sistema de plantillas predefinidas

### 3.3 Fase 3: Gestión de Medios
- ⬜ Biblioteca de medios completa
- ⬜ Carga y optimización de imágenes
- ⬜ Organización por carpetas
- ⬜ Recorte y edición básica de imágenes
- ⬜ Integración con el editor de bloques

### 3.4 Fase 4: Sistema de Temas y Personalización
- ⬜ Editor de temas global
- ⬜ Personalización de colores y tipografías
- ⬜ Configuración de espaciados y layouts
- ⬜ Componentes reutilizables
- ⬜ Exportación e importación de temas

### 3.5 Fase 5: Gestión de Menús y Navegación
- ⬜ Creación y edición de menús visuales
- ⬜ Asignación de ubicaciones para menús
- ⬜ Anidación de elementos de menú
- ⬜ Integración con páginas existentes

### 3.6 Fase 6: SEO y Rendimiento
- ⬜ Panel de SEO avanzado
- ⬜ Análisis de contenido para SEO
- ⬜ Generación de sitemap
- ⬜ Optimización de rendimiento front-end
- ⬜ Caché de páginas generadas

### 3.7 Fase 7: API y Extensibilidad
- ⬜ API REST completa para gestión de contenido
- ⬜ Sistema de hooks para extensiones
- ⬜ Documentación API
- ⬜ Ejemplos de integraciones
- ⬜ SDK para desarrolladores

## 4. CASOS DE USO Y PRUEBAS

### 4.1 Casos de Uso Principales
- Creación de páginas web corporativas
- Publicación de artículos de blog
- Generación de landing pages
- Diseño de páginas de cursos
- Construcción de formularios personalizados

### 4.2 Pruebas Automatizadas
- **Tests de Navegación** (`tests/basic-navigation.spec.js`)
- **Tests de Autenticación** (`tests/auth.spec.js`)
- **Tests del Módulo CMS** (`tests/cms-module.spec.js`)
- **Tests de API** (`tests/api.spec.js`)

## 5. INTEGRACIÓN CON OTROS MÓDULOS

### 5.1 APPCC
- Visualización de registros APPCC
- Personalización de informes públicos

### 5.2 E-Learning
- Publicación de material de cursos
- Presentación de contenido formativo

### 5.3 Transparencia Portal
- Generación de páginas públicas
- Visualización de datos de seguridad alimentaria

### 5.4 WooCommerce
- Sincronización de contenido con tienda
- Diseño de páginas de producto