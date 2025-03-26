import React from 'react';
import { Block } from './index';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
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
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface BlockContainerProps {
  block: Block;
  index: number;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  updateBlock: (id: string, updatedContent: any) => void;
  removeBlock: (id: string) => void;
  readOnly?: boolean;
}

const BlockContainer: React.FC<BlockContainerProps> = ({
  block,
  index,
  moveBlock,
  updateBlock,
  removeBlock,
  readOnly = false,
}) => {
  const handleContentChange = (
    newContent: Partial<typeof block.content>
  ) => {
    updateBlock(block.id, { ...block.content, ...newContent });
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="w-full">
            {!readOnly ? (
              <div className="space-y-2">
                <Input
                  value={block.content.text || ''}
                  onChange={(e) => handleContentChange({ text: e.target.value })}
                  className="font-bold"
                  placeholder="Título"
                />
                <Select
                  value={block.content.level || 'h2'}
                  onValueChange={(value) => handleContentChange({ level: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Nivel de título" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h1">H1 - Título principal</SelectItem>
                    <SelectItem value="h2">H2 - Subtítulo</SelectItem>
                    <SelectItem value="h3">H3 - Título terciario</SelectItem>
                    <SelectItem value="h4">H4 - Título menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <RenderHeading
                text={block.content.text || ''}
                level={block.content.level || 'h2'}
              />
            )}
          </div>
        );

      case 'paragraph':
        return (
          <div className="w-full">
            {!readOnly ? (
              <Textarea
                value={block.content.text || ''}
                onChange={(e) => handleContentChange({ text: e.target.value })}
                placeholder="Escribe aquí el contenido..."
                className="min-h-[100px] resize-y"
              />
            ) : (
              <p className="whitespace-pre-wrap">{block.content.text || ''}</p>
            )}
          </div>
        );

      case 'image':
        return (
          <div className="w-full space-y-2">
            {!readOnly ? (
              <>
                <div className="flex items-center space-x-2">
                  <Input
                    value={block.content.src || ''}
                    onChange={(e) => handleContentChange({ src: e.target.value })}
                    placeholder="URL de la imagen"
                  />
                  <Button variant="outline" size="sm">
                    Seleccionar
                  </Button>
                </div>
                <Input
                  value={block.content.alt || ''}
                  onChange={(e) => handleContentChange({ alt: e.target.value })}
                  placeholder="Texto alternativo"
                />
                <Input
                  value={block.content.caption || ''}
                  onChange={(e) => handleContentChange({ caption: e.target.value })}
                  placeholder="Título de la imagen"
                />
              </>
            ) : block.content.src ? (
              <figure>
                <img
                  src={block.content.src}
                  alt={block.content.alt || ''}
                  className="max-w-full h-auto rounded-md"
                />
                {block.content.caption && (
                  <figcaption className="text-sm text-muted-foreground mt-2">
                    {block.content.caption}
                  </figcaption>
                )}
              </figure>
            ) : (
              <div className="h-40 bg-muted/30 flex items-center justify-center rounded-md">
                <p className="text-muted-foreground">Vista previa de imagen</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 border rounded-md bg-muted/20">
            <p className="text-muted-foreground">
              Bloque de tipo "{block.type}" (Implementación pendiente)
            </p>
          </div>
        );
    }
  };

  return (
    <div className="relative group">
      {!readOnly && (
        <div className="absolute right-2 top-2 z-10 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => moveBlock(index, Math.max(0, index - 1))}>
                <ArrowUp className="h-4 w-4 mr-2" />
                <span>Mover arriba</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => moveBlock(index, index + 1)}>
                <ArrowDown className="h-4 w-4 mr-2" />
                <span>Mover abajo</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                <span>Duplicar</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => removeBlock(block.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <Card className="overflow-hidden border border-muted-foreground/10 group-hover:border-muted-foreground/20 transition-all">
        <CardContent className="p-4">{renderBlockContent()}</CardContent>
      </Card>
    </div>
  );
};

// Componente para renderizar títulos según el nivel
const RenderHeading = ({ text, level }: { text: string; level: string }) => {
  switch (level) {
    case 'h1':
      return <h1 className="text-3xl font-bold">{text}</h1>;
    case 'h2':
      return <h2 className="text-2xl font-bold">{text}</h2>;
    case 'h3':
      return <h3 className="text-xl font-bold">{text}</h3>;
    case 'h4':
      return <h4 className="text-lg font-bold">{text}</h4>;
    default:
      return <h2 className="text-2xl font-bold">{text}</h2>;
  }
};

export default BlockContainer;