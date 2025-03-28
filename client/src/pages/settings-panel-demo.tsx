import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SettingsPanel from '@/components/cms/block-editor/settings-panel';
import { Block, BlockType } from '@/components/cms/block-editor/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from '@/components/ui/select';

/**
 * Página de demostración para el Panel de Ajustes
 * 
 * Esta página permite probar el Panel de Ajustes con diferentes tipos de bloques
 * para verificar su funcionamiento.
 */
const SettingsPanelDemo = () => {
  // Bloque seleccionado actualmente en el panel
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  
  // Lista de bloques disponibles para seleccionar
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>([
    {
      id: uuidv4(),
      type: 'rich-text',
      content: {
        content: '<h2>Ejemplo de texto enriquecido</h2><p>Este es un bloque con formato.</p>',
        textAlign: 'left'
      }
    },
    {
      id: uuidv4(),
      type: 'image',
      content: {
        src: 'https://placehold.co/600x400',
        alt: 'Imagen de ejemplo',
        caption: 'Leyenda de la imagen de demostración'
      }
    },
    {
      id: uuidv4(),
      type: 'heading',
      content: {
        text: 'Ejemplo de encabezado',
        level: 'h2',
        alignment: 'left'
      }
    }
  ]);

  // Actualiza las propiedades de un bloque
  const handleUpdateBlock = (blockId: string, updates: Partial<Block>) => {
    setAvailableBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
    
    // Actualiza también el bloque seleccionado si corresponde
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  // Crea un nuevo bloque del tipo especificado
  const handleCreateBlock = (type: BlockType) => {
    const newBlock = createEmptyBlock(type);
    setAvailableBlocks(prev => [...prev, newBlock]);
    setSelectedBlock(newBlock);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-8 md:col-span-2">
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold">Panel de Ajustes - Demostración</h1>
            <p className="text-muted-foreground mt-2">
              Prueba el panel de ajustes con diferentes tipos de bloques
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Bloques disponibles</h2>
              <div className="flex items-center gap-2">
                <Label htmlFor="block-type">Añadir bloque:</Label>
                <Select onValueChange={(value) => handleCreateBlock(value as BlockType)}>
                  <SelectTrigger id="block-type" className="w-[180px]">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rich-text">Texto enriquecido</SelectItem>
                    <SelectItem value="image">Imagen</SelectItem>
                    <SelectItem value="heading">Encabezado</SelectItem>
                    <SelectItem value="paragraph">Párrafo</SelectItem>
                    <SelectItem value="divider">Divisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableBlocks.map(block => (
                <div 
                  key={block.id}
                  className={`border p-4 rounded-md cursor-pointer transition-all hover:border-primary hover:bg-muted/50 ${selectedBlock?.id === block.id ? 'border-primary-600 ring-2 ring-primary/20' : ''}`}
                  onClick={() => setSelectedBlock(block)}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium truncate">
                      {getBlockTypeLabel(block.type)}
                    </h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {block.id.slice(-4)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {getBlockPreview(block)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t pt-4">
              <h2 className="text-xl font-semibold mb-2">Estado del bloque seleccionado:</h2>
              <pre className="bg-muted p-4 rounded-md overflow-auto max-h-60 text-sm">
                {selectedBlock ? JSON.stringify(selectedBlock, null, 2) : 'Ningún bloque seleccionado'}
              </pre>
            </div>
          </div>
        </div>

        <div className="border rounded-lg">
          <SettingsPanel
            selectedBlock={selectedBlock}
            onUpdate={handleUpdateBlock}
          />
        </div>
      </div>
    </div>
  );
};

// Funciones auxiliares

// Crear un bloque vacío según el tipo
function createEmptyBlock(type: BlockType): Block {
  const id = uuidv4();
  
  switch (type) {
    case 'rich-text':
      return {
        id,
        type,
        content: {
          content: '<p>Haz clic para editar este contenido</p>',
          textAlign: 'left'
        }
      };
    case 'image':
      return {
        id,
        type,
        content: {
          src: 'https://placehold.co/600x400',
          alt: 'Descripción de la imagen',
          caption: ''
        }
      };
    case 'heading':
      return {
        id,
        type,
        content: {
          text: 'Nuevo encabezado',
          level: 'h2'
        }
      };
    case 'paragraph':
      return {
        id,
        type,
        content: {
          text: 'Nuevo párrafo de texto. Edita este contenido.'
        }
      };
    case 'divider':
      return {
        id,
        type,
        content: {
          style: 'solid',
          width: 'full',
          thickness: 'normal'
        }
      };
    default:
      return {
        id,
        type,
        content: {} as any
      };
  }
}

// Obtener una etiqueta legible para el tipo de bloque
function getBlockTypeLabel(type: BlockType): string {
  const labels: Record<BlockType, string> = {
    'heading': 'Encabezado',
    'paragraph': 'Párrafo',
    'rich-text': 'Texto enriquecido',
    'image': 'Imagen',
    'gallery': 'Galería',
    'button': 'Botón',
    'quote': 'Cita',
    'table': 'Tabla',
    'video': 'Video',
    'divider': 'Divisor',
    'list': 'Lista',
    'html': 'HTML personalizado',
    'form': 'Formulario',
    'contact-form': 'Formulario de contacto',
    'ai': 'Contenido IA'
  };
  
  return labels[type] || 'Bloque';
}

// Obtener una vista previa del contenido del bloque
function getBlockPreview(block: Block): string {
  switch (block.type) {
    case 'rich-text':
      const richTextContent = block.content as any;
      // Elimina etiquetas HTML para mostrar solo texto
      return richTextContent.content.replace(/<[^>]*>?/gm, '').slice(0, 50) + '...';
    case 'image':
      const imageContent = block.content as any;
      return `Imagen: ${imageContent.alt || 'Sin descripción'}`;
    case 'heading':
      const headingContent = block.content as any;
      return `${headingContent.level}: ${headingContent.text}`;
    case 'paragraph':
      const paragraphContent = block.content as any;
      return paragraphContent.text.slice(0, 50) + '...';
    default:
      return 'Vista previa no disponible';
  }
}

export default SettingsPanelDemo;