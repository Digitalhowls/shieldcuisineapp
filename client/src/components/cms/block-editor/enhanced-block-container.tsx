import React, { useState } from 'react';
import { Block } from './types';
import Animation from '../animations/animation';
import AnimationBlockOptions from './animation-block-options';
import { AnimationConfig, AnimationLibrary } from '../animations/animation-config';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  MoreHorizontal,
  Trash2,
  GripVertical,
  Plus,
  Paintbrush,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Extender el tipo Block para incluir animación
export interface EnhancedBlock extends Block {
  animation?: {
    config: AnimationConfig;
    library: AnimationLibrary;
  };
  styles?: {
    margin?: string;
    padding?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    borderColor?: string;
    borderWidth?: string;
    width?: string;
    height?: string;
    maxWidth?: string;
  };
}

interface EnhancedBlockContainerProps {
  block: EnhancedBlock;
  index: number;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  updateBlock: (id: string, updatedContent: any) => void;
  updateBlockMeta: (id: string, meta: Partial<Omit<EnhancedBlock, 'content'>>) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  addBlockAfter: (id: string, type: string) => void;
  readOnly?: boolean;
  children: React.ReactNode;
}

/**
 * Contenedor mejorado para bloques con soporte para animaciones y estilos
 * 
 * Este componente extiende la funcionalidad del BlockContainer para
 * incluir opciones de animación y estilo.
 */
export const EnhancedBlockContainer: React.FC<EnhancedBlockContainerProps> = ({
  block,
  index,
  moveBlock,
  updateBlock,
  updateBlockMeta,
  removeBlock,
  duplicateBlock,
  addBlockAfter,
  readOnly = false,
  children,
}) => {
  const [showControls, setShowControls] = useState(false);
  
  // Manejo de animaciones
  const handleAnimationChange = (config: Partial<AnimationConfig>, library: AnimationLibrary) => {
    updateBlockMeta(block.id, {
      animation: {
        config: config as AnimationConfig,
        library,
      },
    });
  };
  
  // Renderizar el bloque con animación en modo lectura
  if (readOnly) {
    const hasAnimation = 
      block.animation && 
      block.animation.config && 
      block.animation.config.effect && 
      block.animation.library !== 'none';
    
    // Aplicar estilos personalizados si existen
    const customStyles = block.styles || {};
    
    return hasAnimation && block.animation ? (
      <Animation
        // Pasar la biblioteca de animación
        library={block.animation.library}
        // Pasar las propiedades de configuración individualmente
        effect={block.animation.config.effect}
        duration={block.animation.config.duration}
        delay={block.animation.config.delay}
        repeat={block.animation.config.repeat}
        threshold={block.animation.config.threshold}
        intensity={block.animation.config.intensity}
        direction={block.animation.config.direction}
        easing={block.animation.config.easing}
        scrollTrigger={block.animation.config.scrollTrigger}
        // Propiedades de estilo
        className="mb-6 last:mb-0"
        style={customStyles}
      >
        {children}
      </Animation>
    ) : (
      <div className="mb-6 last:mb-0" style={customStyles}>
        {children}
      </div>
    );
  }
  
  // Barra de herramientas para el bloque
  const BlockToolbar = () => (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="cursor-move h-8 w-8" 
          aria-label="Mover bloque"
        >
          <GripVertical className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground text-xs"
        >
          {getBlockTypeName(block.type)}
        </Button>
      </div>
      
      <div className="flex items-center gap-1">
        {/* Opciones de animación */}
        <AnimationBlockOptions
          blockId={block.id}
          animation={block.animation?.config || {}}
          onUpdate={(newConfig) => handleAnimationChange(newConfig, block.animation?.library || 'none')}
          onRemove={() => updateBlockMeta(block.id, { animation: undefined })}
        />
        
        {/* Menú de opciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => moveBlock(index, index - 1)}>
              <ArrowUp className="mr-2 h-4 w-4" />
              <span>Mover arriba</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => moveBlock(index, index + 1)}>
              <ArrowDown className="mr-2 h-4 w-4" />
              <span>Mover abajo</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicateBlock(block.id)}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Duplicar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => removeBlock(block.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
  
  return (
    <div 
      className="relative group mb-4"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <Card className={`border-2 ${showControls ? 'border-primary' : 'border-transparent'}`}>
        <BlockToolbar />
        <CardContent className="p-4">
          {children}
        </CardContent>
      </Card>
      
      {/* Botón para añadir nuevo bloque */}
      <div className={`absolute left-1/2 -bottom-4 transform -translate-x-1/2 transition-opacity ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background shadow-md">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => addBlockAfter(block.id, 'heading')}>
              Encabezado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlockAfter(block.id, 'paragraph')}>
              Párrafo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlockAfter(block.id, 'image')}>
              Imagen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlockAfter(block.id, 'gallery')}>
              Galería
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlockAfter(block.id, 'button')}>
              Botón
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlockAfter(block.id, 'quote')}>
              Cita
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlockAfter(block.id, 'video')}>
              Video
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlockAfter(block.id, 'divider')}>
              Divisor
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlockAfter(block.id, 'table')}>
              Tabla
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlockAfter(block.id, 'html')}>
              HTML
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlockAfter(block.id, 'form')}>
              Formulario
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

// Función auxiliar para obtener el nombre del tipo de bloque
const getBlockTypeName = (type: string): string => {
  const blockTypes: Record<string, string> = {
    heading: 'Encabezado',
    paragraph: 'Párrafo',
    image: 'Imagen',
    gallery: 'Galería',
    button: 'Botón',
    quote: 'Cita',
    table: 'Tabla',
    video: 'Video',
    divider: 'Divisor',
    list: 'Lista',
    html: 'HTML',
    form: 'Formulario',
  };
  
  return blockTypes[type] || type;
};

export default EnhancedBlockContainer;