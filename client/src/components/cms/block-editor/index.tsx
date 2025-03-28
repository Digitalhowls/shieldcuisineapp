import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Save, Eye, Keyboard, History, RotateCcw, Undo, Redo } from 'lucide-react';
import { useKeyboardShortcuts } from './keyboard-shortcuts';
import { KeyboardShortcutsModal } from './keyboard-shortcuts-modal';
import { useEditorHistory } from './hooks/use-editor-history';
import { HistoryManager } from './history-manager';
import { AutoRecoveryDialog } from './auto-recovery-dialog';

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
  // Estado para bloques y historial
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState<boolean>(false);
  
  // Preparar datos iniciales para el editor
  const [initialBlocks, setInitialBlocks] = useState<Record<string, Block>>({});
  const [initialBlockIds, setInitialBlockIds] = useState<string[]>([]);
  
  // Inicializar con el contenido proporcionado
  useEffect(() => {
    if (initialContent) {
      let parsedContent: PageContent;
      
      if (typeof initialContent === 'string') {
        try {
          parsedContent = JSON.parse(initialContent);
        } catch (e) {
          // Si no se puede parsear, crear un bloque de párrafo con el contenido
          const id = uuidv4();
          parsedContent = {
            blocks: [
              {
                id,
                type: 'paragraph',
                content: { text: initialContent }
              }
            ]
          };
        }
      } else {
        parsedContent = initialContent;
      }
      
      // Convertir el array de bloques a formato de diccionario para el historial
      const blocksDict: Record<string, Block> = {};
      const blockIds: string[] = [];
      
      parsedContent.blocks.forEach(block => {
        blocksDict[block.id] = block;
        blockIds.push(block.id);
      });
      
      setInitialBlocks(blocksDict);
      setInitialBlockIds(blockIds);
    }
  }, [initialContent]);
  
  // Inicializar el sistema de historial
  const {
    blocks,
    blockIds,
    canUndo,
    canRedo,
    undo,
    redo,
    saveSnapshot,
    restoreSnapshot,
    recordAddBlock,
    recordUpdateBlock,
    recordDeleteBlock,
    recordMoveBlock,
    recordDuplicateBlock,
    recordReorderBlocks,
    historyService
  } = useEditorHistory({
    initialBlocks,
    initialBlockIds,
    enableLocalStorage: true,
    localStorageKey: 'editor_history_state'
  });
  
  // Construir el objeto de contenido a partir del estado del historial
  const content: PageContent = useMemo(() => {
    const pageBlocks = blockIds.map(id => blocks[id]);
    // Preservar la configuración del initialContent si existe
    const settings = initialContent && typeof initialContent !== 'string' && initialContent.settings 
      ? initialContent.settings 
      : { layout: 'boxed' as const, spacing: 'normal' as const };
    return { blocks: pageBlocks, settings };
  }, [blocks, blockIds, initialContent]);

  // Manipulación de bloques con tipado seguro
  /**
   * Añade un nuevo bloque al editor
   * 
   * @param type - Tipo de bloque a crear
   * @param index - Posición opcional donde insertar el bloque (al final por defecto)
   */
  // Crear un nuevo bloque con un tipo específico
  const addBlock = useCallback((type: BlockType, index?: number) => {
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

    // Registrar la acción en el historial
    const insertIndex = typeof index === 'number' ? index : blockIds.length;
    
    // Determinar el ID del bloque antes o después según la posición
    const afterId = insertIndex > 0 ? blockIds[insertIndex - 1] : undefined;
    const beforeId = insertIndex < blockIds.length ? blockIds[insertIndex] : undefined;
    
    // Registrar la acción con metadata adecuada
    recordAddBlock(newBlock, { 
      afterId,
      beforeId
    });
    
    // Notificar cambios si hay un callback
    if (onChange) {
      // Construir el nuevo objeto de contenido para pasarlo al callback
      const pageBlocks = [...blockIds, newBlock.id].map(id => blocks[id] || newBlock);
      const newPageContent: PageContent = { 
        blocks: pageBlocks,
        settings: content.settings 
      };
      onChange(newPageContent);
    }
  }, [blockIds, blocks, onChange, recordAddBlock]);

  /**
   * Actualiza el contenido de un bloque específico
   * 
   * @param id - Identificador único del bloque
   * @param updatedContent - Nuevo contenido parcial para el bloque
   */
  const updateBlock = useCallback((id: string, updatedContent: Partial<BlockContent>) => {
    // Registrar la actualización en el historial
    // Creamos una actualización que se aplicará directamente al bloque
    // Asegurarnos de que el contenido esté completo
    const block = blocks[id];
    if (block) {
      // Combinamos el contenido actual con las actualizaciones
      const mergedContent = {
        ...block.content,
        ...updatedContent
      };
      
      // Registrar la actualización con el contenido combinado
      recordUpdateBlock(id, { content: mergedContent });
    }
    
    // Notificar cambios si hay un callback
    if (onChange) {
      onChange(content);
    }
  }, [onChange, recordUpdateBlock, content, blocks]);

  /**
   * Elimina un bloque según su ID
   */
  const removeBlock = useCallback((id: string) => {
    // Registrar la eliminación en el historial
    recordDeleteBlock(id);
    
    // Notificar cambios si hay un callback
    if (onChange) {
      onChange(content);
    }
  }, [onChange, recordDeleteBlock, content]);

  /**
   * Mueve un bloque de una posición a otra
   */
  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    if (dragIndex === hoverIndex) return;
    
    // Obtener los IDs de los bloques a mover
    const dragId = blockIds[dragIndex];
    const hoverId = blockIds[hoverIndex];
    
    if (!dragId || !hoverId) return;
    
    // Registrar la acción en el historial
    recordMoveBlock(dragId, dragIndex, hoverIndex);
    
    // Notificar cambios si hay un callback
    if (onChange) {
      onChange(content);
    }
  }, [onChange, blockIds, recordMoveBlock, content]);

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
    // En el futuro, podríamos implementar un historial específico para
    // los cambios en la configuración de la página
    // Por ahora, simplemente actualizamos el estado del contenido
    
    // Creamos un nuevo objeto de contenido con los settings actualizados
    const newContent: PageContent = { 
      ...content, 
      settings: { ...content.settings, ...settings } 
    };
    
    // Notificamos cambios si hay un callback
    if (onChange) {
      onChange(newContent);
    }
  }, [onChange, content]);

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
  
  /**
   * Estado para mostrar/ocultar la ayuda de atajos de teclado
   */
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  /**
   * Configuración e integración de atajos de teclado
   */
  /**
   * Actualiza el contenido completo (utilizado por atajos de teclado)
   */
  const updateContent = useCallback((newContent: PageContent) => {
    // En un futuro, podríamos implementar una función específica en el historial
    // para actualizar todo el contenido de una vez
    if (onChange) {
      onChange(newContent);
    }
  }, [onChange]);
  
  /**
   * Ejecuta la acción de deshacer con notificación
   */
  const performUndo = useCallback(() => {
    if (canUndo) {
      undo();
      if (onChange) {
        onChange(content);
      }
      toast({
        title: "Acción deshecha",
        description: "Se ha deshecho la última acción realizada.",
        variant: "default"
      });
    }
  }, [canUndo, undo, onChange, content, toast]);
  
  /**
   * Ejecuta la acción de rehacer con notificación
   */
  const performRedo = useCallback(() => {
    if (canRedo) {
      redo();
      if (onChange) {
        onChange(content);
      }
      toast({
        title: "Acción rehecha",
        description: "Se ha rehecho la última acción deshecha.",
        variant: "default"
      });
    }
  }, [canRedo, redo, onChange, content, toast]);
  
  useKeyboardShortcuts({
    content,
    activeBlockId,
    actions: {
      onSave: onSave ? handleSave : undefined,
      onPreview: onPreview ? handlePreview : undefined,
      addBlock,
      updateContent,
      setActiveBlockId,
      undo: canUndo ? performUndo : undefined,
      redo: canRedo ? performRedo : undefined
    },
  });

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
          // Crear una copia del bloque con nuevo ID
          const newBlock = {
            ...block,
            id: uuidv4()
          };
          
          // Registrar la acción en el historial
          recordDuplicateBlock(block.id, newBlock);
          
          // Notificar cambios si hay un callback
          if (onChange) {
            onChange(content);
          }
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

  // Componente memoizado para renderizar cada bloque
  // Mejora significativamente el rendimiento al evitar re-renders innecesarios
  const MemoizedBlockItem = React.memo(({ 
    block, 
    index 
  }: { 
    block: Block, 
    index: number 
  }) => renderBlock(block, index));

  // Función que renderiza cada item virtualizado
  const renderVirtualizedItem = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const block = content.blocks[index];
    return (
      <div style={{ ...style, paddingBottom: '16px' }}>
        <MemoizedBlockItem 
          block={block} 
          index={index} 
        />
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowKeyboardShortcuts(true)}
                      className="hover:bg-muted"
                    >
                      <Keyboard className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Atajos de teclado</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={performUndo}
                      disabled={!canUndo}
                      className="hover:bg-muted"
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Deshacer (Ctrl+Z)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={performRedo}
                      disabled={!canRedo}
                      className="hover:bg-muted"
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rehacer (Ctrl+Shift+Z)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
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
        
        {/* Modal de atajos de teclado */}
        <KeyboardShortcutsModal 
          open={showKeyboardShortcuts} 
          onOpenChange={setShowKeyboardShortcuts} 
        />
        
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
                  // Renderización normal para listas cortas utilizando componentes memoizados
                  content.blocks.map((block, index) => (
                    <MemoizedBlockItem 
                      key={block.id}
                      block={block} 
                      index={index} 
                    />
                  ))
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