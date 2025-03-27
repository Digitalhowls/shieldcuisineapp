# Implementación de Bloques para el Editor CMS

Este documento describe los tipos de bloques disponibles en el editor del CMS de ShieldCuisine, su estructura y funcionalidades.

## Tipos de Bloques

El editor de ShieldCuisine es un sistema modular basado en bloques que permite la construcción de páginas mediante drag & drop. Los siguientes tipos de bloques están disponibles:

### 1. Bloques de Texto

#### Párrafo
- Editor de texto enriquecido con opciones básicas
- Soporte para enlaces, negritas, cursivas, subrayados
- Opción de justificación y sangría

#### Título
- 6 niveles de título (H1-H6)
- Opciones de estilo (tamaño, color, alineación)
- Identificador automático para anclajes

#### Lista
- Listas ordenadas y no ordenadas
- Listas anidadas
- Marcadores personalizables

#### Cita
- Estilo de blockquote personalizable
- Opción para atribución de autor
- Variantes de diseño disponibles

### 2. Bloques Multimedia

#### Imagen
- Carga desde biblioteca de medios
- Recorte y ajuste integrado
- Opciones de alineación y tamaño
- Texto alternativo para accesibilidad
- Lightbox opcional

#### Galería
- Diferentes layouts (grid, masonry, slider)
- Opciones de espaciado y bordes
- Lightbox integrado

#### Vídeo
- Soporte para vídeos subidos o embebidos (YouTube, Vimeo)
- Opciones de reproducción automática, controles, etc.
- Poster personalizable

#### Audio
- Reproductor de audio con controles
- Soporte para archivos MP3, WAV, etc.
- Visualización opcional de forma de onda

### 3. Bloques de Interacción

#### Botón
- Personalización completa (color, tamaño, bordes)
- Opciones de animación hover
- Enlaces internos/externos o ejecución de acciones

#### Formulario
- Constructor de formularios drag & drop
- Validación de campos
- Integración con sistema de notificaciones
- Anti-spam y CAPTCHA

#### Acordeón/Tabs
- Contenido colapsable
- Personalización de diseño y comportamiento
- Anidación de bloques dentro de cada sección

### 4. Bloques Dinámicos

#### Lista de Entradas
- Muestra entradas de blog filtradas
- Opciones de paginación, filtrado y ordenación
- Múltiples layouts disponibles

#### Cursos
- Muestra cursos disponibles o seleccionados
- Opciones de visualización (grid, lista, carrusel)
- Filtrado por categoría, niveles, etc.

#### Productos
- Integración con WooCommerce
- Diversos layouts de visualización
- Filtrado por categoría, precio, etc.

### 5. Bloques de Diseño

#### Separador
- Líneas, iconos o elementos decorativos
- Personalización de estilo y espaciado

#### Columnas
- División flexible del contenido
- Ajuste de ancho por breakpoint
- Opción de fondo y bordes por columna

#### Contenedor
- Agrupa bloques con un estilo común
- Opciones de fondo, bordes, sombras, etc.
- Márgenes y rellenos personalizables

### 6. Bloques Avanzados

#### HTML Personalizado
- Inserción directa de código HTML
- Modo seguro para evitar scripts maliciosos

#### Embebido
- Inserción de cualquier contenido embebible (tweets, posts de Instagram, etc.)
- Ajuste de ancho y altura
- Caché opcional para mejorar rendimiento

#### AI Content
- Generación de contenido con IA
- Opciones para tono, extensión, etc.
- Edición posterior del contenido generado

## Estructura Técnica

Cada bloque sigue esta estructura técnica:

```typescript
interface Block {
  id: string;           // Identificador único
  type: string;         // Tipo de bloque
  content: any;         // Contenido específico del bloque
  settings: Settings;   // Configuración visual y comportamiento
  metadata: Metadata;   // Datos adicionales no visuales
}

interface Settings {
  layout?: string;      // Variante de layout si aplica
  alignment?: string;   // Alineación del contenido
  background?: Background; // Fondo (color, degradado, imagen)
  spacing?: Spacing;    // Márgenes y padding
  typography?: Typography; // Configuración de texto si aplica
  responsive?: Responsive; // Comportamiento en diferentes dispositivos
}

interface Metadata {
  createdAt: string;    // Fecha de creación
  updatedAt: string;    // Fecha de última modificación
  visibility?: string;  // Visibilidad condicional
  animations?: Animation[]; // Animaciones asociadas
  customClasses?: string[]; // Clases CSS personalizadas
}
```

## Sistema de Drag & Drop

El sistema de drag & drop utiliza `react-dnd` para permitir:

1. Añadir nuevos bloques desde el selector
2. Reordenar bloques existentes
3. Mover bloques entre contenedores y columnas
4. Duplicar bloques con todas sus propiedades

Cada bloque tiene:
- Manejadores de arrastre
- Menú contextual (duplicar, eliminar, etc.)
- Indicadores visuales durante el arrastre

## Guardado y Persistencia

Los bloques se serializan a JSON para su almacenamiento en la base de datos, incluyendo:

```json
{
  "blocks": [
    {
      "id": "block-1",
      "type": "heading",
      "content": {
        "text": "Título de la página",
        "level": 1
      },
      "settings": {
        "alignment": "center",
        "typography": {
          "font": "Roboto",
          "size": 32,
          "weight": 700
        }
      }
    },
    // Más bloques...
  ],
  "version": "1.0",
  "metadata": {
    "lastSaved": "2025-02-15T12:30:00Z",
    "author": "admin"
  }
}
```

## Renderizado y Visualización

El contenido estructurado en bloques se renderiza de dos formas:

1. **Editor**: Con controles, manejadores y panel de opciones
2. **Vista pública**: Solo el contenido final optimizado

La vista previa permite alternar entre diferentes tamaños de pantalla para verificar el diseño responsivo.

## Extensibilidad

El sistema permite crear bloques personalizados mediante:

1. Definición del esquema del bloque
2. Componente de edición
3. Componente de renderizado
4. Controles de configuración

Los bloques personalizados aparecen en el selector junto a los bloques estándar.

## Integración con la Biblioteca de Medios

Los bloques multimedia (imagen, galería, video) se integran con la biblioteca de medios para:

1. Seleccionar archivos existentes
2. Subir nuevos archivos durante la edición
3. Organizar los archivos por categorías
4. Filtrar por tipo de archivo

## Próximas Mejoras

1. Bloques templatizados (secciones prediseñadas)
2. Sistema de revisiones para restaurar versiones anteriores
3. Colaboración en tiempo real
4. Mejora de la experiencia móvil para edición in-situ