import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Type,
  Image,
  FileText,
  BadgeAlert,
  Video,
  Minus,
  Quote,
  List,
  Code,
  MessageSquare,
  PlusCircle,
  Images,
  Table,
} from 'lucide-react';
import { BlockType } from './types';
import { Button } from '@/components/ui/button';

/**
 * Propiedades para el componente BlockTool
 */
interface BlockToolProps {
  /** Icono a mostrar en el botón */
  icon: React.ReactNode;
  /** Texto descriptivo que se muestra en el tooltip */
  label: string;
  /** Tipo de bloque que se añadirá */
  type: BlockType;
  /** Función a llamar cuando se hace clic en el botón */
  onClick: (type: BlockType) => void;
}

/**
 * Componente para un botón de herramienta individual
 * 
 * Renderiza un botón con un icono y un tooltip que muestra
 * una descripción al hacer hover
 */
const MemoizedBlockTool: React.FC<BlockToolProps> = ({ icon, label, type, onClick }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-md"
          onClick={() => onClick(type)}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

/**
 * Versión memoizada del componente BlockTool para evitar renderizados innecesarios
 */
export const BlockTool = React.memo(MemoizedBlockTool);

/**
 * Propiedades para el componente BlockToolbar
 */
interface BlockToolbarProps {
  /** Función a llamar cuando se selecciona un tipo de bloque para añadir */
  onAddBlock: (type: BlockType) => void;
}

/**
 * Implementación interna de la barra de herramientas 
 * 
 * Proporciona acceso rápido a los tipos de bloques más comunes
 * y un menú desplegable para acceder a tipos adicionales.
 * 
 * @module BlockToolbar
 * @category CMS
 * @subcategory BlockEditor
 */
const MemoizedBlockToolbar: React.FC<BlockToolbarProps> = ({ onAddBlock }) => {
  // Definimos los arrays de herramientas como constantes para evitar recrearlos en cada renderizado
  const commonTools = React.useMemo(() => [
    { icon: <Type size={16} />, label: 'Título', type: 'heading' as BlockType },
    { icon: <FileText size={16} />, label: 'Párrafo', type: 'paragraph' as BlockType },
    { icon: <Image size={16} />, label: 'Imagen', type: 'image' as BlockType },
    { icon: <BadgeAlert size={16} />, label: 'Botón', type: 'button' as BlockType },
  ], []);

  const moreTools = React.useMemo(() => [
    { icon: <Images size={16} />, label: 'Galería', type: 'gallery' as BlockType },
    { icon: <Table size={16} />, label: 'Tabla', type: 'table' as BlockType },
    { icon: <Video size={16} />, label: 'Vídeo', type: 'video' as BlockType },
    { icon: <Minus size={16} />, label: 'Divisor', type: 'divider' as BlockType },
    { icon: <Quote size={16} />, label: 'Cita', type: 'quote' as BlockType },
    { icon: <List size={16} />, label: 'Lista', type: 'list' as BlockType },
    { icon: <Code size={16} />, label: 'HTML', type: 'html' as BlockType },
    { icon: <MessageSquare size={16} />, label: 'Formulario de contacto', type: 'contact-form' as BlockType },
  ], []);

  return (
    <div className="flex items-center space-x-1 bg-muted/30 p-1 rounded-md">
      {commonTools.map((tool) => (
        <BlockTool
          key={tool.type}
          icon={tool.icon}
          label={tool.label}
          type={tool.type}
          onClick={onAddBlock}
        />
      ))}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-md">
            <PlusCircle size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Más bloques</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {moreTools.map((tool) => (
            <DropdownMenuItem
              key={tool.type}
              onClick={() => onAddBlock(tool.type)}
              className="flex items-center gap-2 cursor-pointer"
            >
              {tool.icon}
              <span>{tool.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

/**
 * Barra de herramientas para añadir bloques al editor - versión memoizada
 * 
 * Esta versión memoizada evita renderizados innecesarios para mejorar el rendimiento
 * cuando se editan bloques en el editor. Especialmente útil cuando hay muchos bloques.
 */
export const BlockToolbar = React.memo(MemoizedBlockToolbar);

// Mantiene la exportación por defecto para compatibilidad con código existente
export default BlockToolbar;