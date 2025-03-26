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

// Interfaces para los diferentes tipos de contenido de bloques
interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

interface GalleryContent {
  images: GalleryImage[];
  layout?: 'grid' | 'masonry' | 'carousel';
}

interface ButtonContent {
  text: string;
  url: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  align?: 'left' | 'center' | 'right';
  newTab?: boolean;
}

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
        
      case 'gallery':
        return (
          <div className="w-full space-y-4">
            {!readOnly ? (
              <>
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Galería de imágenes</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const images = [...(block.content.images || [])];
                      images.push({ src: '', alt: '', caption: '' });
                      handleContentChange({ images });
                    }}
                  >
                    Añadir imagen
                  </Button>
                </div>
                
                {(block.content.images || []).length === 0 ? (
                  <div className="h-24 border-2 border-dashed rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No hay imágenes en la galería</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(block.content.images as GalleryImage[] || []).map((image: GalleryImage, idx: number) => (
                      <div key={idx} className="border rounded-md p-3 space-y-2 relative">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 text-destructive"
                          onClick={() => {
                            const images = [...(block.content.images as GalleryImage[] || [])];
                            images.splice(idx, 1);
                            handleContentChange({ images });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-center space-x-2">
                          <Input
                            value={image.src || ''}
                            onChange={(e) => {
                              const images = [...(block.content.images as GalleryImage[] || [])];
                              images[idx] = { ...images[idx], src: e.target.value };
                              handleContentChange({ images });
                            }}
                            placeholder="URL de la imagen"
                          />
                          <Button variant="outline" size="sm">
                            Seleccionar
                          </Button>
                        </div>
                        
                        <Input
                          value={image.alt || ''}
                          onChange={(e) => {
                            const images = [...(block.content.images as GalleryImage[] || [])];
                            images[idx] = { ...images[idx], alt: e.target.value };
                            handleContentChange({ images });
                          }}
                          placeholder="Texto alternativo"
                        />
                        
                        <Input
                          value={image.caption || ''}
                          onChange={(e) => {
                            const images = [...(block.content.images as GalleryImage[] || [])];
                            images[idx] = { ...images[idx], caption: e.target.value };
                            handleContentChange({ images });
                          }}
                          placeholder="Título de la imagen"
                        />
                        
                        {image.src && (
                          <div className="mt-2">
                            <img 
                              src={image.src} 
                              alt={image.alt || ''} 
                              className="h-20 object-cover rounded-md" 
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4">
                  <Select
                    value={block.content.layout || 'grid'}
                    onValueChange={(value) => handleContentChange({ layout: value })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Estilo de galería" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Cuadrícula</SelectItem>
                      <SelectItem value="masonry">Mosaico</SelectItem>
                      <SelectItem value="carousel">Carrusel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div>
                {(block.content.images as GalleryImage[] || []).length > 0 ? (
                  <div className={`grid ${
                    block.content.layout === 'masonry' 
                      ? 'grid-cols-2 md:grid-cols-3 gap-4' 
                      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                  }`}>
                    {(block.content.images as GalleryImage[] || []).map((image: GalleryImage, idx: number) => (
                      <figure key={idx} className="overflow-hidden rounded-md">
                        <img
                          src={image.src}
                          alt={image.alt || ''}
                          className="w-full h-auto object-cover"
                        />
                        {image.caption && (
                          <figcaption className="text-sm text-muted-foreground mt-2">
                            {image.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                ) : (
                  <div className="h-40 bg-muted/30 flex items-center justify-center rounded-md">
                    <p className="text-muted-foreground">Galería sin imágenes</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'button':
        return (
          <div className="w-full space-y-4">
            {!readOnly ? (
              <>
                <div className="flex flex-col space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Texto del botón</label>
                      <Input
                        value={block.content.text || ''}
                        onChange={(e) => handleContentChange({ text: e.target.value })}
                        placeholder="Texto del botón"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">URL de destino</label>
                      <Input
                        value={block.content.url || ''}
                        onChange={(e) => handleContentChange({ url: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Estilo</label>
                      <Select
                        value={block.content.variant || 'default'}
                        onValueChange={(value) => handleContentChange({ variant: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Principal</SelectItem>
                          <SelectItem value="destructive">Destructivo</SelectItem>
                          <SelectItem value="outline">Contorno</SelectItem>
                          <SelectItem value="secondary">Secundario</SelectItem>
                          <SelectItem value="ghost">Fantasma</SelectItem>
                          <SelectItem value="link">Enlace</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Tamaño</label>
                      <Select
                        value={block.content.size || 'default'}
                        onValueChange={(value) => handleContentChange({ size: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un tamaño" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Normal</SelectItem>
                          <SelectItem value="sm">Pequeño</SelectItem>
                          <SelectItem value="lg">Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Alineación</label>
                      <Select
                        value={block.content.align || 'left'}
                        onValueChange={(value) => handleContentChange({ align: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la alineación" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Izquierda</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="right">Derecha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Abrir en nueva ventana</label>
                      <div className="flex items-center h-10">
                        <input
                          type="checkbox"
                          checked={block.content.newTab || false}
                          onChange={(e) => handleContentChange({ newTab: e.target.checked })}
                          id={`new-tab-${block.id}`}
                          className="mr-2"
                        />
                        <label htmlFor={`new-tab-${block.id}`} className="text-sm">
                          Abrir enlace en nueva ventana
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Vista previa:</p>
                  <div className={`flex ${
                    block.content.align === 'center' ? 'justify-center' : 
                    block.content.align === 'right' ? 'justify-end' : 'justify-start'
                  }`}>
                    <Button 
                      variant={block.content.variant as any || 'default'} 
                      size={block.content.size as any || 'default'}
                    >
                      {block.content.text || 'Botón'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className={`flex ${
                block.content.align === 'center' ? 'justify-center' : 
                block.content.align === 'right' ? 'justify-end' : 'justify-start'
              }`}>
                <Button 
                  variant={block.content.variant as any || 'default'} 
                  size={block.content.size as any || 'default'}
                  asChild
                >
                  <a 
                    href={block.content.url || '#'} 
                    target={block.content.newTab ? '_blank' : '_self'}
                    rel={block.content.newTab ? 'noopener noreferrer' : ''}
                  >
                    {block.content.text || 'Botón'}
                  </a>
                </Button>
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