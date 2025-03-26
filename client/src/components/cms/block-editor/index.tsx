import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import BlockToolbar from './BlockToolbar';
import BlockContainer from './BlockContainer';
import EmptyState from './EmptyState';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Eye } from 'lucide-react';

// Tipos de bloques disponibles
export type BlockType = 
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

// Interfaz para un bloque genérico
export interface Block {
  id: string;
  type: BlockType;
  content: any;
}

// Interfaz para el contenido de la página completa
export interface PageContent {
  blocks: Block[];
  settings?: {
    layout?: 'full' | 'boxed';
    spacing?: 'tight' | 'normal' | 'loose';
    background?: string;
  };
}

interface BlockEditorProps {
  initialContent?: PageContent | string;
  onChange?: (content: PageContent) => void;
  onSave?: (content: PageContent) => void;
  onPreview?: (content: PageContent) => void;
  readOnly?: boolean;
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  initialContent,
  onChange,
  onSave,
  onPreview,
  readOnly = false
}) => {
  const { toast } = useToast();
  // Estado para los bloques
  const [content, setContent] = useState<PageContent>({ blocks: [] });
  
  // Inicializar con el contenido proporcionado
  useEffect(() => {
    if (initialContent) {
      if (typeof initialContent === 'string') {
        try {
          setContent(JSON.parse(initialContent));
        } catch (e) {
          // Si no se puede parsear, crear un bloque de párrafo con el contenido
          setContent({
            blocks: [
              {
                id: uuidv4(),
                type: 'paragraph',
                content: { text: initialContent }
              }
            ]
          });
        }
      } else {
        setContent(initialContent);
      }
    }
  }, [initialContent]);

  // Manipulación de bloques
  const addBlock = useCallback((type: BlockType, index?: number) => {
    let newBlock: Block = {
      id: uuidv4(),
      type,
      content: {}
    };

    // Contenido predeterminado según el tipo
    switch (type) {
      case 'heading':
        newBlock.content = { text: 'Título nuevo', level: 'h2' };
        break;
      case 'paragraph':
        newBlock.content = { text: 'Escribe aquí el contenido...' };
        break;
      case 'image':
        newBlock.content = { src: '', alt: '', caption: '' };
        break;
      case 'gallery':
        newBlock.content = { images: [] };
        break;
      case 'button':
        newBlock.content = { text: 'Botón', url: '#', variant: 'default' };
        break;
      case 'video':
        newBlock.content = { src: '', type: 'youtube' };
        break;
      case 'divider':
        newBlock.content = { style: 'solid' };
        break;
      case 'quote':
        newBlock.content = { text: 'Cita', author: '' };
        break;
      case 'list':
        newBlock.content = { items: ['Elemento 1'], type: 'unordered' };
        break;
      case 'html':
        newBlock.content = { code: '<!-- Inserta tu código HTML aquí -->' };
        break;
      case 'contact-form':
        newBlock.content = { 
          title: 'Formulario de contacto',
          fields: [
            { name: 'name', label: 'Nombre', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'message', label: 'Mensaje', type: 'textarea', required: true }
          ]
        };
        break;
    }

    // Insertar el bloque en la posición indicada o al final
    const insertIndex = typeof index === 'number' ? index : content.blocks.length;
    const newBlocks = [
      ...content.blocks.slice(0, insertIndex),
      newBlock,
      ...content.blocks.slice(insertIndex)
    ];

    const newContent = { ...content, blocks: newBlocks };
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }
  }, [content, onChange]);

  const updateBlock = useCallback((id: string, updatedContent: any) => {
    const newBlocks = content.blocks.map(block => 
      block.id === id ? { ...block, content: updatedContent } : block
    );
    
    const newContent = { ...content, blocks: newBlocks };
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }
  }, [content, onChange]);

  const removeBlock = useCallback((id: string) => {
    const newBlocks = content.blocks.filter(block => block.id !== id);
    
    const newContent = { ...content, blocks: newBlocks };
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }
  }, [content, onChange]);

  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    const dragBlock = content.blocks[dragIndex];
    const newBlocks = [...content.blocks];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, dragBlock);
    
    const newContent = { ...content, blocks: newBlocks };
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }
  }, [content, onChange]);

  const updateSettings = useCallback((settings: any) => {
    const newContent = { ...content, settings: { ...content.settings, ...settings } };
    setContent(newContent);
    
    if (onChange) {
      onChange(newContent);
    }
  }, [content, onChange]);

  const handleSave = () => {
    if (onSave) {
      onSave(content);
      toast({
        title: "Contenido guardado",
        description: "Los cambios han sido guardados correctamente."
      });
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(content);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {!readOnly && (
        <div className="flex justify-between items-center">
          <BlockToolbar onAddBlock={addBlock} />
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4 mr-2" />
              Vista previa
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      )}
      
      <Separator />
      
      <Card>
        <CardContent className="p-4">
          {content.blocks.length === 0 ? (
            <EmptyState onAddBlock={addBlock} />
          ) : (
            <div className="space-y-4">
              {content.blocks.map((block, index) => (
                <BlockContainer
                  key={block.id}
                  block={block}
                  index={index}
                  moveBlock={moveBlock}
                  updateBlock={updateBlock}
                  removeBlock={removeBlock}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockEditor;