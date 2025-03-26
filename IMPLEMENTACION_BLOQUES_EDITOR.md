# IMPLEMENTACIÓN DE BLOQUES EN EL EDITOR CMS

Este documento describe en detalle la implementación de los diferentes tipos de bloques en el editor visual del CMS, incluyendo su estructura, propiedades y consideraciones técnicas.

## 1. ARQUITECTURA DE BLOQUES

### 1.1 Estructura Base

Cada bloque sigue esta estructura base:

```typescript
interface Block {
  id: string;          // Identificador único (UUID v4)
  type: BlockType;     // Tipo de bloque (heading, paragraph, etc.)
  content: any;        // Contenido específico del bloque
}
```

### 1.2 Sistema de Renderizado

El componente `BlockContainer.tsx` utiliza un patrón de renderizado condicional basado en el tipo de bloque:

```typescript
renderBlockContent = () => {
  switch (block.type) {
    case 'heading': 
      return <HeadingBlockContent {...props} />;
    case 'paragraph':
      return <ParagraphBlockContent {...props} />;
    // ... otros tipos de bloques
  }
};
```

## 2. BLOQUES IMPLEMENTADOS

### 2.1 Bloque de Título (`heading`)

**Propiedades:**
```typescript
{
  text: string;        // Texto del título
  level: 'h1' | 'h2' | 'h3' | 'h4'; // Nivel jerárquico
}
```

**Interfaz de edición:**
- Campo de texto para el contenido
- Selector para nivel de título (H1-H4)

**Consideraciones:**
- H1 debería usarse una sola vez por página (SEO)
- El nivel de título refleja la jerarquía de contenido

### 2.2 Bloque de Párrafo (`paragraph`)

**Propiedades:**
```typescript
{
  text: string;        // Texto del párrafo
}
```

**Interfaz de edición:**
- Área de texto con múltiples líneas
- Soporte para saltos de línea

**Consideraciones:**
- Soporte futuro para formato básico (negrita, cursiva, enlaces)

### 2.3 Bloque de Imagen (`image`)

**Propiedades:**
```typescript
{
  src: string;         // URL de la imagen
  alt: string;         // Texto alternativo (accesibilidad)
  caption: string;     // Pie de foto opcional
}
```

**Interfaz de edición:**
- Campo para URL de imagen
- Botón para seleccionar desde biblioteca
- Campos para texto alternativo y pie de foto

**Consideraciones:**
- Integración pendiente con la biblioteca de medios
- Posible adición de propiedades de tamaño y alineación

### 2.4 Bloque de Galería (`gallery`)

**Propiedades:**
```typescript
{
  images: Array<{
    src: string;       // URL de la imagen
    alt: string;       // Texto alternativo
    caption?: string;  // Pie de foto opcional
  }>;
}
```

**Interfaz de edición:**
- Lista de imágenes con posibilidad de reordenar
- Botón para añadir nuevas imágenes
- Campos para cada imagen (similar al bloque de imagen)

**Consideraciones:**
- Implementación pendiente de la interfaz completa
- Opciones futuras para estilo de galería (grid, carrusel, mosaico)

### 2.5 Bloque de Botón (`button`)

**Propiedades:**
```typescript
{
  text: string;        // Texto del botón
  url: string;         // URL de destino
  variant: 'default' | 'outline' | 'ghost' | 'link'; // Estilo visual
}
```

**Interfaz de edición:**
- Campo para texto del botón
- Campo para URL de destino
- Selector de variante visual

**Consideraciones:**
- Posible adición de opciones de tamaño
- Integración con sistema de navegación interna

### 2.6 Bloque de Vídeo (`video`)

**Propiedades:**
```typescript
{
  src: string;         // URL del video
  type: 'youtube' | 'vimeo' | 'file'; // Tipo de fuente
  autoplay?: boolean;  // Reproducción automática
  controls?: boolean;  // Mostrar controles
}
```

**Interfaz de edición:**
- Campo para URL de video
- Selector de tipo de fuente
- Opciones de configuración (autoplay, controles)

**Consideraciones:**
- Implementación pendiente de la interfaz completa
- Gestión de aspectos de privacidad y rendimiento

### 2.7 Bloque de Divisor (`divider`)

**Propiedades:**
```typescript
{
  style: 'solid' | 'dashed' | 'dotted' | 'double'; // Estilo de línea
}
```

**Interfaz de edición:**
- Selector de estilo visual

**Consideraciones:**
- Posible adición de opciones de color y grosor
- Uso semántico apropiado en HTML

### 2.8 Bloque de Cita (`quote`)

**Propiedades:**
```typescript
{
  text: string;        // Texto de la cita
  author: string;      // Autor de la cita
}
```

**Interfaz de edición:**
- Área de texto para la cita
- Campo para el autor

**Consideraciones:**
- Representación semántica con elementos `<blockquote>` y `<cite>`
- Posible adición de estilos visuales predefinidos

### 2.9 Bloque de Lista (`list`)

**Propiedades:**
```typescript
{
  items: string[];     // Elementos de la lista
  type: 'ordered' | 'unordered'; // Tipo de lista
}
```

**Interfaz de edición:**
- Campo para cada elemento con posibilidad de añadir/eliminar
- Selector de tipo de lista

**Consideraciones:**
- Implementación pendiente de la interfaz completa
- Posible soporte futuro para listas anidadas

### 2.10 Bloque de HTML personalizado (`html`)

**Propiedades:**
```typescript
{
  code: string;        // Código HTML personalizado
}
```

**Interfaz de edición:**
- Editor de código con resaltado de sintaxis

**Consideraciones:**
- Medidas de seguridad para el código HTML insertado
- Advertencias sobre posibles problemas de accesibilidad o renderizado

### 2.11 Bloque de Formulario de Contacto (`contact-form`)

**Propiedades:**
```typescript
{
  title: string;       // Título del formulario
  fields: Array<{
    name: string;      // Nombre del campo
    label: string;     // Etiqueta visible
    type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox'; // Tipo
    required: boolean; // Obligatorio u opcional
    options?: string[]; // Opciones para select
  }>;
  submitLabel: string; // Texto del botón de envío
  successMessage: string; // Mensaje de éxito tras envío
}
```

**Interfaz de edición:**
- Campo para título del formulario
- Gestor de campos con posibilidad de añadir/eliminar/reordenar
- Configuración para cada campo
- Campos para mensajes y etiquetas

**Consideraciones:**
- Implementación pendiente de la interfaz completa
- Integración con sistema de procesamiento de formularios
- Gestión de GDPR y consentimiento de datos

## 3. EXTENSIÓN DEL SISTEMA DE BLOQUES

### 3.1 Proceso para Añadir Nuevos Tipos de Bloques

1. **Definir el tipo**: Añadir el nuevo tipo a la unión `BlockType`
2. **Implementar contenido predeterminado**: Añadir en la función `addBlock` del editor
3. **Crear componente de renderizado**: Implementar en `BlockContainer.tsx`
4. **Añadir a la barra de herramientas**: Incluir en `BlockToolbar.tsx`
5. **Documentar propiedades y uso**: Actualizar la documentación

### 3.2 Ideas para Futuros Bloques

- **Acordeón**: Contenido expandible/colapsable
- **Pestañas**: Contenido organizado en pestañas
- **Mapa**: Integración con servicios de mapas
- **Contador**: Números animados para estadísticas
- **Descargas**: Enlaces a archivos con estadísticas
- **Slider/Carrusel**: Contenido deslizable
- **Testimonios**: Diseño específico para opiniones de clientes
- **Redes Sociales**: Integración con feeds de redes sociales
- **Calendario/Eventos**: Visualización de fechas y eventos
- **Gráficos**: Visualización de datos

## 4. ASPECTOS TÉCNICOS

### 4.1 Gestión de Estado

- Uso de `useState` para el contenido principal
- Funciones `useCallback` para operaciones con bloques
- Sincronización con el formulario principal vía props

### 4.2 Drag & Drop

- Implementado con `react-dnd` y `react-dnd-html5-backend`
- Función `moveBlock` para la reorganización
- Interfaz visual durante el arrastre

### 4.3 Serialización/Deserialización

- Almacenamiento como JSON en la base de datos
- Parsing en el efecto `useEffect` al inicializar
- Manejo de formatos incorrectos con fallback

### 4.4 Rendimiento

- Uso de `key` en listas para optimizar rendering
- Operaciones inmutables para actualización de estado
- Potencial para memoización de componentes pesados

## 5. USABILIDAD Y ACCESIBILIDAD

### 5.1 Consideraciones de Usabilidad

- Interfaz intuitiva con botones claros
- Retroalimentación visual durante interacciones
- Barra de herramientas con acciones contextuales
- Vista previa en tiempo real

### 5.2 Consideraciones de Accesibilidad

- Contraste adecuado en la interfaz
- Etiquetas descriptivas en controles
- Manejo de teclado para todas las operaciones
- Fomento de prácticas accesibles (como textos alt)

## 6. PRUEBAS Y GARANTÍA DE CALIDAD

### 6.1 Pruebas Manuales

- Verificación de todas las operaciones CRUD por bloque
- Pruebas de responsividad en diferentes dispositivos
- Validación de la experiencia de usuario

### 6.2 Pruebas Automatizadas

- Tests end-to-end para flujos principales
- Tests unitarios para funciones críticas
- Tests de integración para la interacción con la API

### 6.3 Control de Calidad

- Revisión de código por pares
- Documentación actualizada
- Guía de estilo y patrones consistentes