# Implementación de Bloques en el Editor CMS

Este documento proporciona una guía detallada para la implementación de nuevos bloques en el sistema de editor CMS. Esta guía complementa los estándares generales de codificación y exportación definidos en los documentos `CODIGO_ESTANDARES.md` y `CONVENCIONES_EXPORTACION.md`.

## 1. Estructura de Tipos

### 1.1 Tipo Base para Bloques

Todos los bloques deben implementar la interfaz `BlockData`:

```tsx
interface BlockData {
  id: string;
  type: BlockType;
  content: any; // Se tipifica específicamente en cada tipo de bloque
}
```

### 1.2 Tipos Específicos para Contenido de Bloques

Cada tipo de bloque debe tener una interfaz específica que defina su estructura de contenido:

```tsx
// Para un bloque de texto
interface TextContent {
  text: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  size?: 'small' | 'normal' | 'large';
}

// Para un bloque de imagen
interface ImageContent {
  src: string;
  alt: string;
  caption?: string;
  width?: number | string;
  height?: number | string;
}
```

### 1.3 Tipado Completo de un Bloque

```tsx
interface TextBlockData extends BlockData {
  type: 'text';
  content: TextContent;
}
```

## 2. Estructura de Componentes de Bloques

### 2.1 Estructura de Archivos

Cada bloque debe seguir esta estructura:
- `blocks/[nombre-bloque]/index.ts` - Exporta el componente principal y tipos
- `blocks/[nombre-bloque]/[nombre-bloque].tsx` - Implementación del componente
- `blocks/[nombre-bloque]/[nombre-bloque]-settings.tsx` - Panel de configuración

### 2.2 Props de Componentes de Bloque

Todos los componentes de bloque deben recibir y manejar las siguientes props estándar:

```tsx
interface BlockProps<T extends BlockData> {
  // Datos del bloque
  block: T;
  // Función para actualizar datos del bloque
  onUpdate: (updatedBlock: T) => void;
  // Flag para modo de edición
  isEditing: boolean;
  // Flag para modo de arrastrado
  isDragging?: boolean;
  // Flag para bloque seleccionado
  isSelected: boolean;
  // Función para seleccionar este bloque
  onSelect: () => void;
  // Opciones adicionales específicas del bloque
  options?: BlockOptions;
}
```

## 3. Implementación de un Nuevo Bloque

### 3.1 Definición de Tipos

Primero, define los tipos específicos para el nuevo bloque:

```tsx
// En blocks/quote/quote.types.ts
export interface QuoteContent {
  text: string;
  author?: string;
  citation?: string;
  style?: 'simple' | 'bordered' | 'elegant';
}

export interface QuoteBlockData extends BlockData {
  type: 'quote';
  content: QuoteContent;
}
```

### 3.2 Componente del Bloque

Implementa el componente siguiendo el patrón establecido:

```tsx
// En blocks/quote/quote.tsx
import React from 'react';
import cn from 'clsx';
import { BlockProps } from '../types';
import { QuoteBlockData } from './quote.types';

export const QuoteBlock = ({ 
  block, 
  onUpdate, 
  isEditing,
  isSelected,
  onSelect,
  isDragging
}: BlockProps<QuoteBlockData>) => {
  const { content } = block;
  
  // Función para actualizar contenido manteniendo otros valores
  const updateContent = (updates: Partial<QuoteContent>) => {
    onUpdate({
      ...block,
      content: {
        ...content,
        ...updates
      }
    });
  };
  
  // Renderizado condicional según el estado de edición
  if (isEditing) {
    return (
      <div 
        className={cn(
          "p-4 border rounded-md",
          isSelected && "ring-2 ring-primary",
          isDragging && "opacity-50"
        )}
        onClick={onSelect}
      >
        <textarea
          className="w-full p-2 border rounded"
          value={content.text}
          onChange={(e) => updateContent({ text: e.target.value })}
          placeholder="Escribe una cita..."
        />
        <input
          className="w-full mt-2 p-2 border rounded"
          value={content.author || ''}
          onChange={(e) => updateContent({ author: e.target.value })}
          placeholder="Autor (opcional)"
        />
      </div>
    );
  }
  
  // Renderizado para visualización
  return (
    <blockquote 
      className={cn(
        "p-4 relative",
        content.style === 'bordered' && "border-l-4 border-primary pl-6",
        content.style === 'elegant' && "italic text-gray-700"
      )}
    >
      <p className="text-lg">{content.text}</p>
      {content.author && (
        <footer className="mt-2 text-sm">
          — <cite>{content.author}</cite>
          {content.citation && <span className="text-muted-foreground"> ({content.citation})</span>}
        </footer>
      )}
    </blockquote>
  );
};
```

### 3.3 Panel de Configuración

Implementa el panel de configuración para el bloque:

```tsx
// En blocks/quote/quote-settings.tsx
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlockSettingsPanelProps } from '../types';
import { QuoteBlockData } from './quote.types';

export const QuoteSettings = ({ 
  block, 
  onUpdate 
}: BlockSettingsPanelProps<QuoteBlockData>) => {
  const { content } = block;
  
  // Función para actualizar contenido manteniendo otros valores
  const updateContent = (updates: Partial<QuoteContent>) => {
    onUpdate({
      ...block,
      content: {
        ...content,
        ...updates
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="citation">Fuente de la cita</Label>
        <Input
          id="citation"
          value={content.citation || ''}
          onChange={(e) => updateContent({ citation: e.target.value })}
          placeholder="Libro, artículo, etc."
        />
      </div>
      
      <div>
        <Label>Estilo</Label>
        <Tabs 
          value={content.style || 'simple'} 
          onValueChange={(value) => updateContent({ 
            style: value as 'simple' | 'bordered' | 'elegant' 
          })}
          className="mt-2"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="simple">Simple</TabsTrigger>
            <TabsTrigger value="bordered">Bordeado</TabsTrigger>
            <TabsTrigger value="elegant">Elegante</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
```

### 3.4 Archivo Index para Exportaciones

Configura el archivo de exportación:

```tsx
// En blocks/quote/index.ts
export { QuoteBlock } from './quote';
export { QuoteSettings } from './quote-settings';
export type { QuoteContent, QuoteBlockData } from './quote.types';
```

## 4. Registro del Nuevo Bloque

### 4.1 Actualización del Enum de Tipos

Actualiza el enum de tipos de bloques:

```tsx
// En blocks/types.ts
export enum BlockType {
  // Tipos existentes
  Heading = 'heading',
  Text = 'text',
  Image = 'image',
  // Nuevo tipo
  Quote = 'quote',
}
```

### 4.2 Registro en el Mapa de Bloques

Añade el nuevo bloque al mapa de componentes:

```tsx
// En blocks/block-map.tsx
import { BlockType } from './types';
import { HeadingBlock } from './heading';
import { TextBlock } from './text';
import { ImageBlock } from './image';
// Importar el nuevo bloque
import { QuoteBlock } from './quote';

export const blockMap = {
  [BlockType.Heading]: HeadingBlock,
  [BlockType.Text]: TextBlock,
  [BlockType.Image]: ImageBlock,
  // Registrar el nuevo bloque
  [BlockType.Quote]: QuoteBlock,
};
```

### 4.3 Registro en el Panel de Ajustes

Añade el panel de ajustes del nuevo bloque:

```tsx
// En block-settings-panel.tsx
import { BlockType } from './types';
import { HeadingSettings } from './heading';
import { TextSettings } from './text';
import { ImageSettings } from './image';
// Importar ajustes del nuevo bloque
import { QuoteSettings } from './quote';

const settingsMap = {
  [BlockType.Heading]: HeadingSettings,
  [BlockType.Text]: TextSettings,
  [BlockType.Image]: ImageSettings,
  // Registrar panel de ajustes
  [BlockType.Quote]: QuoteSettings,
};
```

## 5. Creación de Bloques desde la Barra de Herramientas

### 5.1 Actualización del Menú de Adición

Añade una opción para el nuevo bloque en el menú de adición:

```tsx
// En editor-toolbar.tsx
export const blockOptions = [
  {
    type: BlockType.Heading,
    icon: <Heading className="h-5 w-5" />,
    label: 'Encabezado',
  },
  {
    type: BlockType.Text,
    icon: <Type className="h-5 w-5" />,
    label: 'Texto',
  },
  {
    type: BlockType.Image,
    icon: <ImageIcon className="h-5 w-5" />,
    label: 'Imagen',
  },
  // Añadir nuevo bloque
  {
    type: BlockType.Quote,
    icon: <Quote className="h-5 w-5" />,
    label: 'Cita',
  },
];
```

### 5.2 Configuración del Estado Inicial

Define la estructura por defecto del nuevo bloque cuando se crea:

```tsx
// En editor-context.tsx o similar
const getDefaultBlockContent = (type: BlockType): any => {
  switch (type) {
    case BlockType.Heading:
      return { text: 'Nuevo título', level: 2 };
    case BlockType.Text:
      return { text: 'Escribe algo aquí...' };
    case BlockType.Image:
      return { src: '', alt: '', caption: '' };
    // Configuración por defecto para el nuevo bloque
    case BlockType.Quote:
      return { text: 'Escribe una cita aquí...', author: '', style: 'simple' };
    default:
      return {};
  }
};
```

## 6. Persistencia y Serialización

### 6.1 Validación para Guardado

Si es necesario, implementa funciones de validación específicas para el nuevo tipo de bloque:

```tsx
// En validation-utils.ts
export const validateQuoteBlock = (block: QuoteBlockData): string[] => {
  const errors: string[] = [];
  
  if (!block.content.text) {
    errors.push('El texto de la cita no puede estar vacío');
  }
  
  return errors;
};
```

### 6.2 Renderizado para Publicación

Si es necesario, implementa un renderizador específico para la publicación:

```tsx
// En render-utils.ts
export const renderQuoteBlock = (block: QuoteBlockData): string => {
  const { content } = block;
  
  let html = `<blockquote class="quote quote-${content.style || 'simple'}">`;
  html += `<p>${content.text}</p>`;
  
  if (content.author) {
    html += `<footer>— <cite>${content.author}</cite>`;
    if (content.citation) {
      html += ` <span class="citation">(${content.citation})</span>`;
    }
    html += `</footer>`;
  }
  
  html += `</blockquote>`;
  
  return html;
};
```

## 7. Pruebas

### 7.1 Pruebas Unitarias

Crea pruebas para el componente del bloque:

```tsx
// En quote/quote.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QuoteBlock } from './quote';

describe('QuoteBlock', () => {
  const mockBlock: QuoteBlockData = {
    id: 'test-id',
    type: 'quote',
    content: {
      text: 'Test quote',
      author: 'Test Author',
      style: 'simple'
    }
  };
  
  test('renders correctly in view mode', () => {
    render(
      <QuoteBlock 
        block={mockBlock}
        onUpdate={jest.fn()}
        isEditing={false}
        isSelected={false}
        onSelect={jest.fn()}
      />
    );
    
    expect(screen.getByText('Test quote')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });
  
  // Añadir más pruebas...
});
```

### 7.2 Pruebas de Integración

Crea pruebas de integración con el editor:

```tsx
// En editor.test.tsx
test('can add and configure a quote block', async () => {
  // Configuración de la prueba
  
  // Comprobar que se añade correctamente
  
  // Comprobar que se configura correctamente
  
  // Comprobar que se renderiza correctamente
});
```

## 8. Documentación

### 8.1 Comentarios JSDoc

Asegúrate de documentar correctamente tus componentes y funciones:

```tsx
/**
 * Componente para mostrar y editar bloques de citas.
 * Permite configurar el texto, autor, fuente y estilo visual.
 *
 * @param block - Datos del bloque de cita
 * @param onUpdate - Función para actualizar el bloque
 * @param isEditing - Si está en modo edición
 * @param isSelected - Si el bloque está seleccionado
 * @param onSelect - Función para seleccionar el bloque
 * @param isDragging - Si el bloque está siendo arrastrado
 */
export const QuoteBlock = (...)
```

### 8.2 Actualización del Índice de Bloques Disponibles

Actualiza el documento general de bloques disponibles:

```markdown
## Bloques Disponibles

...

### Cita (Quote)

Propósito: Mostrar citas textuales con atribución al autor.

Opciones:
- Texto de la cita
- Autor
- Fuente/Citación
- Estilo visual (Simple, Bordeado, Elegante)

![Vista previa](./docs/assets/quote-block.png)
```

---

Siguiendo esta guía, asegurarás una implementación consistente y de alta calidad para los nuevos bloques del editor CMS, manteniendo el sistema extensible y fácil de mantener.