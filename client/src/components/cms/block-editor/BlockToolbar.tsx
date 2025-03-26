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
  Button as ButtonIcon,
  Video,
  Minus,
  Quote,
  List,
  Code,
  MessageSquare,
  PanelTop,
  Plus,
  PlusCircle,
  Images,
} from 'lucide-react';
import { BlockType } from './index';
import { Button } from '@/components/ui/button';

interface BlockToolProps {
  icon: React.ReactNode;
  label: string;
  type: BlockType;
  onClick: (type: BlockType) => void;
}

const BlockTool: React.FC<BlockToolProps> = ({ icon, label, type, onClick }) => (
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

interface BlockToolbarProps {
  onAddBlock: (type: BlockType) => void;
}

const BlockToolbar: React.FC<BlockToolbarProps> = ({ onAddBlock }) => {
  const commonTools = [
    { icon: <Type size={16} />, label: 'Título', type: 'heading' as BlockType },
    { icon: <FileText size={16} />, label: 'Párrafo', type: 'paragraph' as BlockType },
    { icon: <Image size={16} />, label: 'Imagen', type: 'image' as BlockType },
    { icon: <ButtonIcon size={16} />, label: 'Botón', type: 'button' as BlockType },
  ];

  const moreTools = [
    { icon: <Images size={16} />, label: 'Galería', type: 'gallery' as BlockType },
    { icon: <Video size={16} />, label: 'Vídeo', type: 'video' as BlockType },
    { icon: <Minus size={16} />, label: 'Divisor', type: 'divider' as BlockType },
    { icon: <Quote size={16} />, label: 'Cita', type: 'quote' as BlockType },
    { icon: <List size={16} />, label: 'Lista', type: 'list' as BlockType },
    { icon: <Code size={16} />, label: 'HTML', type: 'html' as BlockType },
    { icon: <MessageSquare size={16} />, label: 'Formulario de contacto', type: 'contact-form' as BlockType },
  ];

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

export default BlockToolbar;