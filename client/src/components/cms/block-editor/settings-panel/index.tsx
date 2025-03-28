import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Block, BlockType } from '../types';
import { 
  Settings as SettingsIcon, 
  Palette, 
  LayoutGrid, 
  MoveHorizontal,
  Sparkles,
  Eye
} from 'lucide-react';
import AnimationSettings from './animation-settings';
import RichTextSettings from './rich-text-settings';
import ImageSettings from './image-settings';
import StyleSettings from './style-settings';
import LayoutSettings from './layout-settings';
import AdvancedSettings from './advanced-settings';
import { Button } from '@/components/ui/button';

interface SettingsPanelProps {
  selectedBlock: Block | null;
  onUpdate: (blockId: string, updates: Partial<Block>) => void;
}

/**
 * Panel de Ajustes Unificado para el Editor de Bloques
 * 
 * Este componente muestra diferentes controles y opciones según el tipo
 * de bloque seleccionado, permitiendo personalizar sus propiedades.
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  selectedBlock, 
  onUpdate 
}) => {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  
  // Reset tab when block selection changes
  React.useEffect(() => {
    setActiveTab('general');
    setShowPreview(false);
  }, [selectedBlock?.id]);

  // Handle updates to block properties
  const handleUpdate = (key: string, value: any) => {
    if (!selectedBlock) return;
    
    onUpdate(selectedBlock.id, {
      ...selectedBlock,
      [key]: value
    });
  };

  // Handle updates to content properties based on block type
  const handleContentUpdate = (updates: Partial<any>) => {
    if (!selectedBlock) return;
    
    onUpdate(selectedBlock.id, {
      ...selectedBlock,
      content: {
        ...selectedBlock.content,
        ...updates
      }
    });
  };
  
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
    if (['image', 'gallery', 'rich-text', 'video', 'heading', 'paragraph', 'button'].includes(selectedBlock.type)) {
      tabs.push({ id: 'layout', label: 'Diseño', icon: <LayoutGrid className="h-4 w-4" /> });
    }
    
    // Add advanced tab for all blocks
    tabs.push({ id: 'advanced', label: 'Avanzado', icon: <MoveHorizontal className="h-4 w-4" /> });
    
    return tabs;
  }, [selectedBlock]);

  if (!selectedBlock) {
    return (
      <Card className="w-full h-full">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <p className="text-muted-foreground text-center">
            Selecciona un bloque para ver y editar sus propiedades
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Renderizar vista previa del bloque
  const renderPreview = () => {
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
          <span>Vista previa del bloque</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(false)}
            className="h-6 px-2"
          >
            Cerrar
          </Button>
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
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Ajustes de bloque</CardTitle>
            <CardDescription>
              {getBlockTypeLabel(selectedBlock.type)}
            </CardDescription>
          </div>
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
    default:
      return <p>Configuración específica para este tipo de bloque en desarrollo</p>;
  }
}

export default SettingsPanel;