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
  Sparkles
} from 'lucide-react';
import AnimationSettings from './animation-settings';
import RichTextSettings from './rich-text-settings';
import ImageSettings from './image-settings';

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
  
  // Reset tab when block selection changes
  React.useEffect(() => {
    setActiveTab('general');
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
    if (['image', 'gallery', 'rich-text', 'video'].includes(selectedBlock.type)) {
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

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Ajustes de bloque</CardTitle>
        <CardDescription>
          {getBlockTypeLabel(selectedBlock.type)}
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}>
          {availableTabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5">
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <CardContent className="pt-4 pb-6">
          <TabsContent value="general" className="space-y-4 mt-0">
            {renderGeneralSettings(selectedBlock, handleContentUpdate)}
          </TabsContent>
          
          <TabsContent value="style" className="space-y-4 mt-0">
            {/* Estilos específicos según tipo de bloque */}
            <p>Opciones de estilo disponibles próximamente</p>
          </TabsContent>
          
          <TabsContent value="animation" className="space-y-4 mt-0">
            <AnimationSettings 
              animation={selectedBlock.animation || {}}
              onChange={(animation) => handleUpdate('animation', animation)}
            />
          </TabsContent>
          
          <TabsContent value="layout" className="space-y-4 mt-0">
            {/* Opciones de diseño */}
            <p>Opciones de diseño disponibles próximamente</p>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 mt-0">
            {/* Opciones avanzadas */}
            <p>Opciones avanzadas disponibles próximamente</p>
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

// Los componentes de ajustes específicos ahora están importados desde sus respectivos archivos

export default SettingsPanel;