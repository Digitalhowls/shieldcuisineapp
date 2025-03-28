import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Block, BlockType } from '../types';
import { 
  Settings as SettingsIcon, 
  Palette, 
  LayoutGrid, 
  MoveHorizontal,
  Sparkles,
  Eye,
  KeyRound,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  History
} from 'lucide-react';
import AnimationSettings from './animation-settings';
import RichTextSettings from './rich-text-settings';
import ImageSettings from './image-settings';
import StyleSettings from './style-settings';
import LayoutSettings from './layout-settings';
import AdvancedSettings from './advanced-settings';
import { Button } from '@/components/ui/button';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface SettingsPanelProps {
  selectedBlock: Block | null;
  onUpdate: (blockId: string, updates: Partial<Block>) => void;
  onDuplicate?: (blockId: string) => void;
  onDelete?: (blockId: string) => void;
  onMoveUp?: (blockId: string) => void;
  onMoveDown?: (blockId: string) => void;
  historyAvailable?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

/**
 * Panel de Ajustes Unificado para el Editor de Bloques
 * 
 * Este componente muestra diferentes controles y opciones según el tipo
 * de bloque seleccionado, permitiendo personalizar sus propiedades.
 * Incluye vista previa en tiempo real y acciones rápidas para el bloque.
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  selectedBlock, 
  onUpdate,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  historyAvailable = false,
  onUndo,
  onRedo
}) => {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewAutoUpdate, setPreviewAutoUpdate] = useState<boolean>(true);
  const [lastPreviewUpdate, setLastPreviewUpdate] = useState<number>(Date.now());
  
  // Reset tab when block selection changes
  useEffect(() => {
    setActiveTab('general');
    setShowPreview(false);
  }, [selectedBlock?.id]);

  // Auto-update preview with debounce
  useEffect(() => {
    if (previewAutoUpdate && showPreview && selectedBlock) {
      const now = Date.now();
      if (now - lastPreviewUpdate > 500) { // Debounce de 500ms
        setLastPreviewUpdate(now);
      }
    }
  }, [selectedBlock, previewAutoUpdate, showPreview, lastPreviewUpdate]);

  // Handle updates to block properties
  const handleUpdate = useCallback((key: string, value: any) => {
    if (!selectedBlock) return;
    
    onUpdate(selectedBlock.id, {
      ...selectedBlock,
      [key]: value
    });
    
    if (previewAutoUpdate && showPreview) {
      setLastPreviewUpdate(Date.now());
    }
  }, [selectedBlock, onUpdate, previewAutoUpdate, showPreview]);

  // Handle updates to content properties based on block type
  const handleContentUpdate = useCallback((updates: Partial<any>) => {
    if (!selectedBlock) return;
    
    onUpdate(selectedBlock.id, {
      ...selectedBlock,
      content: {
        ...selectedBlock.content,
        ...updates
      }
    });
    
    if (previewAutoUpdate && showPreview) {
      setLastPreviewUpdate(Date.now());
    }
  }, [selectedBlock, onUpdate, previewAutoUpdate, showPreview]);
  
  // Determine which settings tabs to show based on block type
  const availableTabs = useMemo(() => {
    if (!selectedBlock) return [];
    
    const tabs = [
      { id: 'general', label: 'General', icon: <SettingsIcon className="h-4 w-4" /> }
    ];
    
    // Style tab is available for all blocks
    tabs.push({ id: 'style', label: 'Estilo', icon: <Palette className="h-4 w-4" /> });
    
    // Add animation tab for all blocks
    tabs.push({ id: 'animation', label: 'Animación', icon: <Sparkles className="h-4 w-4" /> });
    
    // Add layout tab for certain blocks
    if (['image', 'gallery', 'rich-text', 'video', 'heading', 'paragraph', 'button', 'quote'].includes(selectedBlock.type)) {
      tabs.push({ id: 'layout', label: 'Diseño', icon: <LayoutGrid className="h-4 w-4" /> });
    }
    
    // Add advanced tab for all blocks
    tabs.push({ id: 'advanced', label: 'Avanzado', icon: <MoveHorizontal className="h-4 w-4" /> });
    
    return tabs;
  }, [selectedBlock]);

  // Manejar acciones de bloque
  const handleDuplicate = useCallback(() => {
    if (selectedBlock && onDuplicate) {
      onDuplicate(selectedBlock.id);
    }
  }, [selectedBlock, onDuplicate]);

  const handleDelete = useCallback(() => {
    if (selectedBlock && onDelete) {
      onDelete(selectedBlock.id);
    }
  }, [selectedBlock, onDelete]);

  const handleMoveUp = useCallback(() => {
    if (selectedBlock && onMoveUp) {
      onMoveUp(selectedBlock.id);
    }
  }, [selectedBlock, onMoveUp]);

  const handleMoveDown = useCallback(() => {
    if (selectedBlock && onMoveDown) {
      onMoveDown(selectedBlock.id);
    }
  }, [selectedBlock, onMoveDown]);

  if (!selectedBlock) {
    return (
      <Card className="w-full h-full">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-center">
              Selecciona un bloque para ver y editar sus propiedades
            </p>
            
            {historyAvailable && (
              <div className="flex justify-center gap-2 pt-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onUndo}
                        disabled={!onUndo}
                      >
                        <History className="h-4 w-4 mr-1" />
                        <span>Deshacer</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Deshacer último cambio (Ctrl+Z)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onRedo}
                        disabled={!onRedo}
                      >
                        <History className="h-4 w-4 mr-1 scale-x-[-1]" />
                        <span>Rehacer</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rehacer último cambio (Ctrl+Y)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Renderizar vista previa del bloque
  const renderPreview = useCallback(() => {
    const style = selectedBlock.style || {};
    const layout = selectedBlock.layout || {};
    
    // Crear un objeto de estilo combinado para la vista previa
    const previewStyle: React.CSSProperties = {
      // Aplicar estilos generales
      width: style.width,
      height: style.height,
      maxWidth: style.maxWidth,
      maxHeight: style.maxHeight,
      
      // Espaciado
      padding: style.padding ? 
        `${style.padding.top || 0} ${style.padding.right || 0} ${style.padding.bottom || 0} ${style.padding.left || 0}` : 
        undefined,
      margin: style.margin ? 
        `${style.margin.top || 0} ${style.margin.right || 0} ${style.margin.bottom || 0} ${style.margin.left || 0}` : 
        undefined,
      
      // Bordes
      border: style.border ? 
        `${style.border.width || '1px'} ${style.border.style || 'solid'} ${style.border.color || '#000'}` : 
        undefined,
      borderRadius: style.border?.radius,
      
      // Fondo
      backgroundColor: style.background?.color,
      backgroundImage: style.background?.image ? `url(${style.background.image})` : undefined,
      backgroundSize: style.background?.size,
      backgroundRepeat: style.background?.repeat as any,
      
      // Tipografía
      fontFamily: style.typography?.fontFamily,
      fontSize: style.typography?.fontSize,
      fontWeight: style.typography?.fontWeight as any,
      color: style.typography?.color,
      textTransform: style.typography?.textTransform as any,
      textDecoration: style.typography?.textDecoration as any,
      
      // Efectos
      opacity: style.opacity,
      boxShadow: style.boxShadow ? 
        `${style.boxShadow.inset ? 'inset ' : ''}${style.boxShadow.x || 0} ${style.boxShadow.y || 0} ${style.boxShadow.blur || 0} ${style.boxShadow.spread || 0} ${style.boxShadow.color || 'rgba(0,0,0,0.1)'}` : 
        undefined,
      
      // Layout
      position: layout.position as any,
      top: layout.top,
      right: layout.right,
      bottom: layout.bottom,
      left: layout.left,
      zIndex: layout.zIndex,
      display: layout.display as any,
      flexDirection: layout.flexDirection as any,
      justifyContent: layout.justifyContent as any,
      alignItems: layout.alignItems as any,
      textAlign: layout.textAlign as any,
      overflow: layout.overflow as any,
      
      // Transformaciones
      transform: layout.transform ? 
        `translate(${layout.transform.translate?.x || 0}, ${layout.transform.translate?.y || 0}) 
         rotate(${layout.transform.rotate || '0deg'}) 
         scale(${layout.transform.scale || 1})` : 
        undefined,
    };
    
    // Renderizar contenido según el tipo de bloque
    let previewContent;
    
    switch (selectedBlock.type) {
      case 'rich-text':
        const richTextContent = selectedBlock.content as any;
        previewContent = (
          <div 
            className="preview-content" 
            dangerouslySetInnerHTML={{ __html: richTextContent.content }}
          />
        );
        break;
      
      case 'image':
        const imageContent = selectedBlock.content as any;
        previewContent = (
          <div className="preview-content flex flex-col items-center">
            <img 
              src={imageContent.src || 'https://placehold.co/600x400'} 
              alt={imageContent.alt || 'Vista previa de imagen'} 
              className="max-w-full max-h-[200px] object-contain"
            />
            {imageContent.caption && (
              <span className="text-sm mt-2 text-center">{imageContent.caption}</span>
            )}
          </div>
        );
        break;
        
      case 'heading':
        const headingContent = selectedBlock.content as any;
        const HeadingTag = headingContent.level || 'h2';
        previewContent = (
          <HeadingTag className="preview-content">
            {headingContent.text || 'Vista previa de encabezado'}
          </HeadingTag>
        );
        break;
        
      case 'paragraph':
        const paragraphContent = selectedBlock.content as any;
        previewContent = (
          <p className="preview-content">
            {paragraphContent.text || 'Vista previa de párrafo'}
          </p>
        );
        break;
        
      case 'quote':
        const quoteContent = selectedBlock.content as any;
        previewContent = (
          <blockquote className="preview-content border-l-4 border-primary pl-4 italic">
            <p>{quoteContent.text || 'Vista previa de cita'}</p>
            {quoteContent.author && (
              <footer className="text-sm mt-2">
                — {quoteContent.author}
                {quoteContent.source && <span className="text-muted-foreground"> ({quoteContent.source})</span>}
              </footer>
            )}
          </blockquote>
        );
        break;
        
      case 'button':
        const buttonContent = selectedBlock.content as any;
        previewContent = (
          <div className="preview-content" style={{ textAlign: buttonContent.align || 'left' }}>
            <button className={`btn btn-${buttonContent.variant || 'default'} btn-${buttonContent.size || 'default'}`}>
              {buttonContent.text || 'Botón'}
            </button>
          </div>
        );
        break;
        
      default:
        previewContent = (
          <div className="preview-content">
            Vista previa para {getBlockTypeLabel(selectedBlock.type)}
          </div>
        );
    }
    
    return (
      <div className="bg-muted/30 border rounded-md p-4 flex flex-col">
        <div className="text-sm font-medium mb-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>Vista previa del bloque</span>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Badge variant="outline" className="cursor-help">
                  {previewAutoUpdate ? 'Tiempo real' : 'Manual'}
                </Badge>
              </HoverCardTrigger>
              <HoverCardContent className="w-72">
                <div className="space-y-2">
                  <h4 className="font-medium">Vista previa</h4>
                  <p className="text-sm text-muted-foreground">
                    {previewAutoUpdate 
                      ? 'La vista previa se actualiza automáticamente al hacer cambios en la configuración.'
                      : 'La vista previa se actualiza manualmente al hacer clic en el botón Actualizar.'}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setPreviewAutoUpdate(!previewAutoUpdate)}
                  >
                    {previewAutoUpdate ? 'Cambiar a manual' : 'Cambiar a tiempo real'}
                  </Button>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          <div className="flex gap-1">
            {!previewAutoUpdate && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setLastPreviewUpdate(Date.now())}
                className="h-6 px-2"
              >
                Actualizar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(false)}
              className="h-6 px-2"
            >
              Cerrar
            </Button>
          </div>
        </div>
        <div className="bg-white border rounded-md flex items-center justify-center p-4 min-h-[150px]">
          <div style={previewStyle} className="preview-wrapper">
            {previewContent}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2 text-center">
          Vista previa con las configuraciones aplicadas
        </div>
      </div>
    );
  }, [selectedBlock, previewAutoUpdate, lastPreviewUpdate]);

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Ajustes de bloque</CardTitle>
              <Badge variant="outline">ID: {selectedBlock.id.substring(0, 6)}</Badge>
            </div>
            <CardDescription className="flex items-center gap-1">
              {getBlockTypeLabel(selectedBlock.type)}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <KeyRound className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Atajos de teclado:</p>
                      <ul className="text-xs">
                        <li>Duplicar: Alt+D</li>
                        <li>Eliminar: Alt+Supr</li>
                        <li>Mover arriba: Alt+↑</li>
                        <li>Mover abajo: Alt+↓</li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-1" />
              <span className="text-xs">{showPreview ? 'Ocultar' : 'Vista previa'}</span>
            </Button>
          </div>
        </div>
        
        {/* Barra de acciones rápidas */}
        <div className="flex items-center gap-1 mt-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDuplicate}
                  disabled={!onDuplicate}
                  className="h-7 flex-1"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Duplicar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicar bloque (Alt+D)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={!onDelete}
                  className="h-7 flex-1"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Eliminar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eliminar bloque (Alt+Supr)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMoveUp}
                  disabled={!onMoveUp}
                  className="h-7 w-10 px-0"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mover hacia arriba (Alt+↑)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMoveDown}
                  disabled={!onMoveDown}
                  className="h-7 w-10 px-0"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mover hacia abajo (Alt+↓)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      {showPreview && (
        <CardContent className="pb-2 pt-0">
          {renderPreview()}
        </CardContent>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}>
          {availableTabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5">
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <CardContent className="pt-4 pb-6 max-h-[600px] overflow-y-auto">
          <TabsContent value="general" className="space-y-4 mt-0">
            {renderGeneralSettings(selectedBlock, handleContentUpdate)}
          </TabsContent>
          
          <TabsContent value="style" className="space-y-4 mt-0">
            <StyleSettings 
              blockType={selectedBlock.type}
              style={selectedBlock.style || {}}
              onChange={(style) => handleUpdate('style', style)}
            />
          </TabsContent>
          
          <TabsContent value="animation" className="space-y-4 mt-0">
            <AnimationSettings 
              animation={selectedBlock.animation || {}}
              onChange={(animation) => handleUpdate('animation', animation)}
            />
          </TabsContent>
          
          <TabsContent value="layout" className="space-y-4 mt-0">
            <LayoutSettings 
              blockType={selectedBlock.type}
              layout={selectedBlock.layout || {}}
              onChange={(layout) => handleUpdate('layout', layout)}
            />
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 mt-0">
            <AdvancedSettings 
              blockType={selectedBlock.type}
              settings={selectedBlock.advanced || {}}
              onChange={(advanced) => handleUpdate('advanced', advanced)}
            />
          </TabsContent>
        </CardContent>
      </Tabs>
      
      {historyAvailable && (
        <CardFooter className="flex justify-center gap-2 border-t py-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={onUndo}
                  disabled={!onUndo}
                >
                  <History className="h-4 w-4 mr-1" />
                  <span>Deshacer</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Deshacer último cambio (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Separator orientation="vertical" className="h-6" />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={onRedo}
                  disabled={!onRedo}
                >
                  <History className="h-4 w-4 mr-1 scale-x-[-1]" />
                  <span>Rehacer</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rehacer último cambio (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      )}
    </Card>
  );
};

// Función auxiliar para mostrar etiquetas legibles de tipos de bloques
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

// Renderiza los ajustes generales según el tipo de bloque
function renderGeneralSettings(
  block: Block, 
  onUpdate: (updates: Partial<any>) => void
) {
  switch (block.type) {
    case 'rich-text':
      return <RichTextSettings 
        content={block.content as import('../types').RichTextContent} 
        onUpdate={onUpdate} 
      />;
    case 'image':
      return <ImageSettings 
        content={block.content as import('../types').ImageContent} 
        onUpdate={onUpdate} 
      />;
    case 'heading':
      const headingContent = block.content as import('../types').HeadingContent;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Texto</label>
            <textarea
              className="w-full p-2 border rounded"
              value={headingContent.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nivel</label>
            <select
              className="w-full p-2 border rounded"
              value={headingContent.level || 'h2'}
              onChange={(e) => onUpdate({ level: e.target.value as any })}
            >
              <option value="h1">H1 - Título principal</option>
              <option value="h2">H2 - Título secundario</option>
              <option value="h3">H3 - Subtítulo</option>
              <option value="h4">H4 - Subtítulo menor</option>
              <option value="h5">H5 - Título pequeño</option>
              <option value="h6">H6 - Título más pequeño</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Alineación</label>
            <select
              className="w-full p-2 border rounded"
              value={headingContent.alignment || 'left'}
              onChange={(e) => onUpdate({ alignment: e.target.value as any })}
            >
              <option value="left">Izquierda</option>
              <option value="center">Centro</option>
              <option value="right">Derecha</option>
            </select>
          </div>
        </div>
      );
    case 'paragraph':
      const paragraphContent = block.content as import('../types').ParagraphContent;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Texto</label>
            <textarea
              className="w-full p-2 border rounded"
              value={paragraphContent.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              rows={4}
            />
          </div>
        </div>
      );
    case 'quote':
      const quoteContent = block.content as import('../types').QuoteContent;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Texto de la cita</label>
            <textarea
              className="w-full p-2 border rounded"
              value={quoteContent.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Autor</label>
            <input
              className="w-full p-2 border rounded"
              value={quoteContent.author || ''}
              onChange={(e) => onUpdate({ author: e.target.value })}
              placeholder="Opcional"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Fuente</label>
            <input
              className="w-full p-2 border rounded"
              value={quoteContent.source || ''}
              onChange={(e) => onUpdate({ source: e.target.value })}
              placeholder="Libro, artículo, etc. (opcional)"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Estilo</label>
            <select
              className="w-full p-2 border rounded"
              value={quoteContent.style || 'default'}
              onChange={(e) => onUpdate({ style: e.target.value as any })}
            >
              <option value="default">Estándar</option>
              <option value="large">Grande</option>
              <option value="bordered">Con borde</option>
            </select>
          </div>
        </div>
      );
    case 'button':
      const buttonContent = block.content as import('../types').ButtonContent;
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Texto del botón</label>
            <input
              className="w-full p-2 border rounded"
              value={buttonContent.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="Haz clic aquí"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">URL</label>
            <input
              className="w-full p-2 border rounded"
              value={buttonContent.url || ''}
              onChange={(e) => onUpdate({ url: e.target.value })}
              placeholder="https://ejemplo.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Variante</label>
              <select
                className="w-full p-2 border rounded"
                value={buttonContent.variant || 'default'}
                onChange={(e) => onUpdate({ variant: e.target.value as any })}
              >
                <option value="default">Por defecto</option>
                <option value="destructive">Destructivo</option>
                <option value="outline">Contorno</option>
                <option value="secondary">Secundario</option>
                <option value="ghost">Fantasma</option>
                <option value="link">Enlace</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tamaño</label>
              <select
                className="w-full p-2 border rounded"
                value={buttonContent.size || 'default'}
                onChange={(e) => onUpdate({ size: e.target.value as any })}
              >
                <option value="default">Normal</option>
                <option value="sm">Pequeño</option>
                <option value="lg">Grande</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Alineación</label>
            <select
              className="w-full p-2 border rounded"
              value={buttonContent.align || 'left'}
              onChange={(e) => onUpdate({ align: e.target.value as any })}
            >
              <option value="left">Izquierda</option>
              <option value="center">Centro</option>
              <option value="right">Derecha</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="new-tab"
              checked={buttonContent.newTab || false}
              onChange={(e) => onUpdate({ newTab: e.target.checked })}
            />
            <label htmlFor="new-tab" className="text-sm font-medium">
              Abrir en nueva pestaña
            </label>
          </div>
        </div>
      );
    default:
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Configuración específica para este tipo de bloque en desarrollo.
          </p>
          <div className="bg-muted/40 rounded-md p-4">
            <h4 className="font-medium mb-2">Información de desarrollo</h4>
            <p className="text-sm text-muted-foreground">
              El panel de ajustes para bloques de tipo <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{block.type}</span> 
              está en implementación. Las opciones generales están disponibles en las demás pestañas.
            </p>
          </div>
        </div>
      );
  }
}

export default SettingsPanel;