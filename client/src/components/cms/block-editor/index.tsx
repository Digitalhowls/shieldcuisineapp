import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';
import { FixedSizeList as List } from 'react-window';
import BlockToolbar from './BlockToolbar';
import BlockContainer from './BlockContainer';
import EmptyState from './EmptyState';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Eye } from 'lucide-react';

import {
  Block,
  BlockType,
  BlockContent,
  HeadingContent,
  ParagraphContent,
  ImageContent,
  GalleryContent,
  ButtonContent,
  VideoContent,
  QuoteContent,
  ListContent,
  HtmlContent,
  FormContent,
  TableContent,
  DividerContent,
  ContactFormContent
} from './types';

/**
 * Interfaz para el contenido completo de la página en el editor
 */
export interface PageContent {
  /** Lista de bloques que componen la página */
  blocks: Block[];
  /** Configuración general de la página */
  settings?: {
    /** Ancho del contenido ('full' = 100%, 'boxed' = contenedor) */
    layout?: 'full' | 'boxed';
    /** Espaciado entre bloques */
    spacing?: 'tight' | 'normal' | 'loose';
    /** Color o URL de imagen de fondo */
    background?: string;
  };
}

/**
 * Propiedades para el componente BlockEditor
 */
interface BlockEditorProps {
  /** Contenido inicial para cargar en el editor (objeto o JSON string) */
  initialContent?: PageContent | string;
  /** Callback llamado cuando cambia el contenido */
  onChange?: (content: PageContent) => void;
  /** Callback llamado al guardar el contenido */
  onSave?: (content: PageContent) => void;
  /** Callback llamado para previsualizar el contenido */
  onPreview?: (content: PageContent) => void;
  /** Si el editor está en modo solo lectura */
  readOnly?: boolean;
}

/**
 * Editor de bloques para el CMS
 * 
 * Componente principal que gestiona la creación, edición y organización
 * de bloques de contenido para páginas web. Implementa funcionalidad
 * drag & drop y una interfaz visual para editar diferentes tipos de contenido.
 * 
 * @module BlockEditor
 * @category CMS
 * @subcategory BlockEditor
 */
export const BlockEditor: React.FC<BlockEditorProps> = ({
  initialContent,
  onChange,
  onSave,
  onPreview,
  readOnly = false
}) => {
  const { toast } = useToast();
  // Estado para los bloques
  const [content, setContent] = useState<PageContent>({ blocks: [] });
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  
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

  // Manipulación de bloques con tipado seguro
  /**
   * Añade un nuevo bloque al editor
   * 
   * @param type - Tipo de bloque a crear
   * @param index - Posición opcional donde insertar el bloque (al final por defecto)
   */
  const addBlock = useCallback((type: BlockType, index?: number) => {
    setContent(prevContent => {
      // Crear un bloque con contenido tipado específicamente para cada tipo
      let newBlock: Block;
      
      // Contenido predeterminado según el tipo con el tipado correcto
      switch (type) {
        case 'heading': {
          const headingContent: HeadingContent = { text: 'Título nuevo', level: 'h2' };
          newBlock = {
            id: uuidv4(),
            type,
            content: headingContent
          };
          break;
        }
        case 'paragraph': {
          const paragraphContent: ParagraphContent = { text: 'Escribe aquí el contenido...' };
          newBlock = {
            id: uuidv4(),
            type,
            content: paragraphContent
          };
          break;
        }
        case 'image': {
          const imageContent: ImageContent = { src: '', alt: '', caption: '' };
          newBlock = {
            id: uuidv4(),
            type,
            content: imageContent
          };
          break;
        }
        case 'gallery': {
          const galleryContent: GalleryContent = { images: [] };
          newBlock = {
            id: uuidv4(),
            type,
            content: galleryContent
          };
          break;
        }
        case 'button': {
          const buttonContent: ButtonContent = { text: 'Botón', url: '#', variant: 'default' };
          newBlock = {
            id: uuidv4(),
            type,
            content: buttonContent
          };
          break;
        }
        case 'video': {
          const videoContent: VideoContent = { src: '', type: 'youtube' };
          newBlock = {
            id: uuidv4(),
            type,
            content: videoContent
          };
          break;
        }
        case 'divider': {
          const dividerContent: DividerContent = { style: 'solid' };
          newBlock = {
            id: uuidv4(),
            type,
            content: dividerContent
          };
          break;
        }
        case 'quote': {
          const quoteContent: QuoteContent = { text: 'Cita', author: '' };
          newBlock = {
            id: uuidv4(),
            type,
            content: quoteContent
          };
          break;
        }
        case 'list': {
          const listContent: ListContent = { 
            items: [{ text: 'Elemento 1', level: 0 }], 
            type: 'unordered' 
          };
          newBlock = {
            id: uuidv4(),
            type,
            content: listContent
          };
          break;
        }
        case 'html': {
          const htmlContent: HtmlContent = { code: '<!-- Inserta tu código HTML aquí -->' };
          newBlock = {
            id: uuidv4(),
            type,
            content: htmlContent
          };
          break;
        }
        case 'contact-form': {
          const contactFormContent: ContactFormContent = { 
            title: 'Formulario de contacto',
            fields: [
              { name: 'name', label: 'Nombre', type: 'text', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'message', label: 'Mensaje', type: 'textarea', required: true }
            ],
            successMessage: 'Gracias por contactarnos',
            errorMessage: 'Hubo un error al enviar el formulario'
          };
          newBlock = {
            id: uuidv4(),
            type,
            content: contactFormContent
          };
          break;
        }
        case 'table': {
          const tableContent: TableContent = {
            rows: [
              [{ content: 'Encabezado 1', header: true }, { content: 'Encabezado 2', header: true }],
              [{ content: 'Celda 1' }, { content: 'Celda 2' }]
            ],
            withHeader: true,
            withBorder: true,
            striped: false,
            caption: 'Tabla de datos'
          };
          newBlock = {
            id: uuidv4(),
            type,
            content: tableContent
          };
          break;
        }
        case 'ai': {
          // Contenido para bloque AI
          const aiContent = {
            prompt: '',
            content: '',
            format: 'text' as const
          };
          newBlock = {
            id: uuidv4(),
            type,
            content: aiContent
          };
          break;
        }
        case 'form': {
          // Contenido predeterminado para bloque de formulario
          const formContent: FormContent = {
            fields: [],
            submitButtonText: 'Enviar'
          };
          newBlock = {
            id: uuidv4(),
            type,
            content: formContent
          };
          break;
        }
        default: {
          // Caso predeterminado con un contenido vacío
          newBlock = {
            id: uuidv4(),
            type,
            content: {}
          };
        }
      }
  
      // Insertar el bloque en la posición indicada o al final
      const insertIndex = typeof index === 'number' ? index : prevContent.blocks.length;
      const newBlocks = [
        ...prevContent.blocks.slice(0, insertIndex),
        newBlock,
        ...prevContent.blocks.slice(insertIndex)
      ];
  
      // Creamos el nuevo estado con type assertion
      const newState = { 
        ...prevContent, 
        blocks: newBlocks 
      } as PageContent;
      
      // Notificamos cambios si hay un callback
      if (onChange) {
        onChange(newState);
      }
      
      return newState;
    });
  }, [onChange]);

  /**
   * Actualiza el contenido de un bloque específico
   * 
   * @param id - Identificador único del bloque
   * @param updatedContent - Nuevo contenido parcial para el bloque
   */
  const updateBlock = useCallback((id: string, updatedContent: Partial<BlockContent>) => {
    setContent(prevContent => {
      // Creamos nuevos bloques actualizando el bloque específico
      const newBlocks = prevContent.blocks.map(block => {
        if (block.id === id) {
          // Usamos type assertion para evitar errores de tipos
          return {
            ...block,
            content: {
              ...block.content,
              ...updatedContent
            }
          } as Block;
        }
        return block;
      });
      
      // Creamos el nuevo estado con type assertion
      const newState = {
        ...prevContent,
        blocks: newBlocks
      } as PageContent;
      
      // Notificamos cambios si hay un callback
      if (onChange) {
        onChange(newState);
      }
      
      return newState;
    });
  }, [onChange]);

  /**
   * Elimina un bloque según su ID
   */
  const removeBlock = useCallback((id: string) => {
    setContent(prevContent => {
      const newBlocks = prevContent.blocks.filter(block => block.id !== id);
      
      const newState = {
        ...prevContent,
        blocks: newBlocks
      } as PageContent;
      
      if (onChange) {
        onChange(newState);
      }
      
      return newState;
    });
  }, [onChange]);

  /**
   * Mueve un bloque de una posición a otra
   */
  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    setContent(prevContent => {
      const dragBlock = prevContent.blocks[dragIndex];
      const newBlocks = [...prevContent.blocks];
      newBlocks.splice(dragIndex, 1);
      newBlocks.splice(hoverIndex, 0, dragBlock);
      
      const newState = {
        ...prevContent,
        blocks: newBlocks
      } as PageContent;
      
      if (onChange) {
        onChange(newState);
      }
      
      return newState;
    });
  }, [onChange]);

  /**
   * Configuraciones generales de la página
   */
  interface PageSettings {
    /** Ancho del contenido ('full' = 100%, 'boxed' = contenedor) */
    layout?: 'full' | 'boxed';
    /** Espaciado entre bloques */
    spacing?: 'tight' | 'normal' | 'loose';
    /** Color o URL de imagen de fondo */
    background?: string;
    /** Otras propiedades configurables */
    [key: string]: any; // Para permitir configuraciones adicionales
  }

  /**
   * Actualiza la configuración de la página
   */
  const updateSettings = useCallback((settings: Partial<PageSettings>) => {
    setContent(prevContent => {
      const newState = { 
        ...prevContent, 
        settings: { ...prevContent.settings, ...settings } 
      } as PageContent;
      
      if (onChange) {
        onChange(newState);
      }
      
      return newState;
    });
  }, [onChange]);

  /**
   * Gestiona el evento de guardar el contenido
   * Invoca el callback onSave y muestra una notificación
   */
  const handleSave = () => {
    if (onSave) {
      onSave(content);
      toast({
        title: "Contenido guardado",
        description: "Los cambios han sido guardados correctamente."
      });
    }
  };

  /**
   * Gestiona el evento de previsualizar el contenido
   * Invoca el callback onPreview con el contenido actual
   */
  const handlePreview = () => {
    if (onPreview) {
      onPreview(content);
    }
  };

  // Renderiza un bloque individual
  const renderBlock = (block: Block, index: number) => {
    return (
      <BlockContainer
        key={block.id}
        id={block.id}
        type={block.type}
        block={block}
        index={index}
        isActive={activeBlockId === block.id}
        onActivate={() => setActiveBlockId(block.id)}
        onDeactivate={() => setActiveBlockId(null)}
        onMove={moveBlock}
        onDelete={() => removeBlock(block.id)}
        onDuplicate={() => {
          setContent(prevContent => {
            // Crear una copia del bloque con nuevo ID
            const newBlock = {
              ...block,
              id: uuidv4()
            };
            
            // Insertar después del bloque actual
            const newBlocks = [...prevContent.blocks];
            newBlocks.splice(index + 1, 0, newBlock);
            
            // Creamos el nuevo estado con type assertion
            const newState = {
              ...prevContent,
              blocks: newBlocks
            } as PageContent;
            
            // Notificamos cambios si hay un callback
            if (onChange) {
              onChange(newState);
            }
            
            return newState;
          });
        }}
        updateBlock={updateBlock}
        readOnly={readOnly}
      >
        {/* Contenido visual del bloque según su tipo */}
        <div className="block-content">
          {block.type === 'heading' && (
            <div className={`heading-${(block.content as HeadingContent).level || 'h2'}`}>
              {(block.content as HeadingContent).text || 'Título'}
            </div>
          )}
          
          {block.type === 'paragraph' && (
            <p>{(block.content as ParagraphContent).text || 'Texto del párrafo'}</p>
          )}
          
          {block.type === 'image' && (
            <div className="image-block">
              {(block.content as ImageContent).src ? (
                <img 
                  src={(block.content as ImageContent).src} 
                  alt={(block.content as ImageContent).alt || ''} 
                  className="max-w-full"
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-12 text-center">
                  <p className="text-muted-foreground">Selecciona una imagen</p>
                </div>
              )}
              {(block.content as ImageContent).caption && (
                <p className="text-sm text-muted-foreground mt-2">{(block.content as ImageContent).caption}</p>
              )}
            </div>
          )}
          
          {/* Visualización para formulario de contacto */}
          {block.type === 'contact-form' && (
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-2">
                {(block.content as ContactFormContent).title}
              </h3>
              <div className="space-y-2">
                {((block.content as ContactFormContent).fields || []).map((field: { label: string; required?: boolean; type: string; }, i: number) => (
                  <div key={i} className="flex flex-col">
                    <p className="text-sm font-medium mb-1">
                      {field.label}{field.required && ' *'}
                    </p>
                    <div className="h-8 bg-muted/20 rounded-md"></div>
                  </div>
                ))}
                <div className="mt-4">
                  <div className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md inline-flex items-center justify-center text-sm font-medium">
                    Enviar
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Placeholder para otros tipos de bloques */}
          {!['heading', 'paragraph', 'image', 'contact-form'].includes(block.type) && (
            <div className="p-4 border rounded-md bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Bloque de tipo: <strong>{block.type}</strong>
              </p>
            </div>
          )}
        </div>
      </BlockContainer>
    );
  };

  // Renderiza un elemento en la lista virtualizada
  const renderVirtualizedItem = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const block = content.blocks[index];
    return (
      <div style={{ ...style, paddingBottom: '16px' }}>
        {renderBlock(block, index)}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
                {content.blocks.length > 20 ? (
                  // Renderización virtualizada para listas largas
                  <List
                    height={600}
                    itemCount={content.blocks.length}
                    itemSize={150}
                    width="100%"
                    className="list-virtualized"
                  >
                    {renderVirtualizedItem}
                  </List>
                ) : (
                  // Renderización normal para listas cortas
                  content.blocks.map((block, index) => renderBlock(block, index))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
};

// Mantiene la exportación por defecto para compatibilidad con código existente
export default BlockEditor;