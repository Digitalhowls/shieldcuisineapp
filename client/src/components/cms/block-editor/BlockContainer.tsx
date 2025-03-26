import React, { useState } from 'react';
import { Block } from './index';
import { getYouTubeID, getVimeoID } from './utils';
import DialogMediaSelector from '../media/DialogMediaSelector';
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
  Plus,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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

interface QuoteContent {
  text: string;
  author?: string;
  source?: string;
  align?: 'left' | 'center' | 'right';
  style?: 'default' | 'large' | 'bordered';
}

interface TableCell {
  content: string;
  header?: boolean;
  colspan?: number;
  rowspan?: number;
  align?: 'left' | 'center' | 'right';
}

interface TableContent {
  rows: TableCell[][];
  caption?: string;
  withHeader?: boolean;
  withBorder?: boolean;
  striped?: boolean;
}

interface VideoContent {
  src: string;
  type: 'youtube' | 'vimeo' | 'file';
  title?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
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
                    className="flex-1"
                  />
                  <DialogMediaSelector
                    title="Seleccionar imagen"
                    description="Elige una imagen de la biblioteca de medios"
                    defaultTab="image"
                    allowedTypes={['image']}
                    trigger={
                      <Button variant="outline" size="sm">Seleccionar</Button>
                    }
                    onSelect={(media) => {
                      handleContentChange({ 
                        src: media.url,
                        alt: media.title || block.content.alt || '',
                      });
                    }}
                  />
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
                            className="flex-1"
                          />
                          <DialogMediaSelector
                            title="Seleccionar imagen para galería"
                            description="Elige una imagen de la biblioteca de medios"
                            defaultTab="image"
                            allowedTypes={['image']}
                            trigger={
                              <Button variant="outline" size="sm">Seleccionar</Button>
                            }
                            onSelect={(media) => {
                              const images = [...(block.content.images as GalleryImage[] || [])];
                              images[idx] = { 
                                ...images[idx], 
                                src: media.url,
                                alt: media.title || images[idx].alt || '',
                              };
                              handleContentChange({ images });
                            }}
                          />
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

      case 'quote':
        return (
          <div className="w-full space-y-4">
            {!readOnly ? (
              <>
                <div className="flex flex-col space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium mb-1 block">Texto de la cita</label>
                    <Textarea
                      value={block.content.text || ''}
                      onChange={(e) => handleContentChange({ text: e.target.value })}
                      placeholder="Escribe el texto de la cita..."
                      className="min-h-[100px] resize-y"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Autor</label>
                      <Input
                        value={block.content.author || ''}
                        onChange={(e) => handleContentChange({ author: e.target.value })}
                        placeholder="Nombre del autor"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Fuente</label>
                      <Input
                        value={block.content.source || ''}
                        onChange={(e) => handleContentChange({ source: e.target.value })}
                        placeholder="Fuente o publicación"
                      />
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
                      <label className="text-sm font-medium mb-1 block">Estilo</label>
                      <Select
                        value={block.content.style || 'default'}
                        onValueChange={(value) => handleContentChange({ style: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Estándar</SelectItem>
                          <SelectItem value="large">Grande</SelectItem>
                          <SelectItem value="bordered">Con borde</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className={`${
                block.content.align === 'center' ? 'text-center' : 
                block.content.align === 'right' ? 'text-right' : 'text-left'
              }`}>
                <blockquote className={`relative ${
                  block.content.style === 'large' 
                    ? 'text-xl md:text-2xl font-medium' 
                    : block.content.style === 'bordered'
                    ? 'pl-4 border-l-4 border-primary'
                    : 'text-lg italic'
                }`}>
                  <span className="text-3xl leading-none opacity-20 absolute top-0 left-0 -ml-4">"</span>
                  <p className="relative">{block.content.text || ''}</p>
                  {(block.content.author || block.content.source) && (
                    <footer className="mt-2 text-sm text-muted-foreground">
                      {block.content.author && <cite className="font-medium not-italic">{block.content.author}</cite>}
                      {block.content.author && block.content.source && <span>, </span>}
                      {block.content.source && <span className="italic">{block.content.source}</span>}
                    </footer>
                  )}
                </blockquote>
              </div>
            )}
          </div>
        );  

      case 'table':
        return (
          <div className="w-full space-y-4">
            {!readOnly ? (
              <>
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Tabla de datos</h4>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const rows = [...(block.content.rows || [])];
                          const newRow = Array(rows[0]?.length || 2).fill({}).map(() => ({ content: '' }));
                          rows.push(newRow);
                          handleContentChange({ rows });
                        }}
                        disabled={!(block.content.rows || []).length}
                      >
                        Añadir fila
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const rows = [...(block.content.rows || [])];
                          if (!rows.length) {
                            // Si no hay filas, creamos una tabla 2x2
                            const newRows = [
                              [{ content: '', header: true }, { content: '', header: true }],
                              [{ content: '' }, { content: '' }]
                            ];
                            handleContentChange({ rows: newRows, withHeader: true });
                          } else {
                            // Si ya hay filas, añadimos una columna a cada fila
                            const newRows = rows.map(row => [...row, { content: '', header: row[0]?.header || false }]);
                            handleContentChange({ rows: newRows });
                          }
                        }}
                      >
                        Añadir columna
                      </Button>
                    </div>
                  </div>
                  
                  {!(block.content.rows || []).length ? (
                    <div className="h-24 border-2 border-dashed rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">No hay datos en la tabla</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border rounded-md">
                      <table className="w-full min-w-full">
                        <tbody>
                          {(block.content.rows as TableCell[][] || []).map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b last:border-b-0">
                              {row.map((cell, cellIdx) => (
                                <td key={cellIdx} className="border-r last:border-r-0 p-2">
                                  <div className="flex flex-col space-y-2">
                                    <Input
                                      value={cell.content || ''}
                                      onChange={(e) => {
                                        const rows = [...(block.content.rows as TableCell[][] || [])];
                                        rows[rowIdx][cellIdx] = { 
                                          ...rows[rowIdx][cellIdx], 
                                          content: e.target.value 
                                        };
                                        handleContentChange({ rows });
                                      }}
                                      placeholder="Contenido de la celda"
                                      className={cell.header ? "font-bold" : ""}
                                    />
                                    
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={cell.header || false}
                                          onChange={(e) => {
                                            const rows = [...(block.content.rows as TableCell[][] || [])];
                                            rows[rowIdx][cellIdx] = { 
                                              ...rows[rowIdx][cellIdx], 
                                              header: e.target.checked 
                                            };
                                            handleContentChange({ rows });
                                          }}
                                          id={`header-${block.id}-${rowIdx}-${cellIdx}`}
                                          className="mr-2"
                                        />
                                        <label 
                                          htmlFor={`header-${block.id}-${rowIdx}-${cellIdx}`} 
                                          className="text-xs"
                                        >
                                          Encabezado
                                        </label>
                                      </div>
                                      
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-6 w-6 text-destructive"
                                        onClick={() => {
                                          if (row.length > 1) {
                                            // Eliminar la celda
                                            const rows = [...(block.content.rows as TableCell[][] || [])];
                                            rows[rowIdx].splice(cellIdx, 1);
                                            handleContentChange({ rows });
                                          } else if ((block.content.rows as TableCell[][] || []).length > 1) {
                                            // Eliminar la fila
                                            const rows = [...(block.content.rows as TableCell[][] || [])];
                                            rows.splice(rowIdx, 1);
                                            handleContentChange({ rows });
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={block.content.withHeader || false}
                        onChange={(e) => handleContentChange({ withHeader: e.target.checked })}
                        id={`with-header-${block.id}`}
                        className="mr-2"
                      />
                      <label htmlFor={`with-header-${block.id}`} className="text-sm">
                        Con encabezado
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={block.content.withBorder || false}
                        onChange={(e) => handleContentChange({ withBorder: e.target.checked })}
                        id={`with-border-${block.id}`}
                        className="mr-2"
                      />
                      <label htmlFor={`with-border-${block.id}`} className="text-sm">
                        Con bordes
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={block.content.striped || false}
                        onChange={(e) => handleContentChange({ striped: e.target.checked })}
                        id={`striped-${block.id}`}
                        className="mr-2"
                      />
                      <label htmlFor={`striped-${block.id}`} className="text-sm">
                        Filas alternadas
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Leyenda</label>
                    <Input
                      value={block.content.caption || ''}
                      onChange={(e) => handleContentChange({ caption: e.target.value })}
                      placeholder="Descripción de la tabla (opcional)"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="overflow-x-auto">
                {block.content.caption && (
                  <p className="text-sm text-muted-foreground mb-2">{block.content.caption}</p>
                )}
                <table className={`w-full ${block.content.withBorder ? 'border border-border' : ''}`}>
                  {(block.content.rows as TableCell[][] || []).length > 0 && (
                    <>
                      {block.content.withHeader && (
                        <thead>
                          <tr className={`${block.content.withBorder ? 'border-b border-border' : ''}`}>
                            {(block.content.rows as TableCell[][])[0].map((cell, cellIdx) => (
                              <th 
                                key={cellIdx}
                                className={`p-2 text-left ${block.content.withBorder ? 'border-r last:border-r-0 border-border' : ''}`}
                              >
                                {cell.content}
                              </th>
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody>
                        {(block.content.rows as TableCell[][]).slice(block.content.withHeader ? 1 : 0).map((row, rowIdx) => (
                          <tr 
                            key={rowIdx}
                            className={`
                              ${block.content.withBorder ? 'border-b last:border-b-0 border-border' : ''}
                              ${block.content.striped && rowIdx % 2 ? 'bg-muted/30' : ''}
                            `}
                          >
                            {row.map((cell, cellIdx) => (
                              cell.header ? (
                                <th 
                                  key={cellIdx}
                                  className={`p-2 text-left ${block.content.withBorder ? 'border-r last:border-r-0 border-border' : ''}`}
                                >
                                  {cell.content}
                                </th>
                              ) : (
                                <td 
                                  key={cellIdx}
                                  className={`p-2 ${block.content.withBorder ? 'border-r last:border-r-0 border-border' : ''}`}
                                >
                                  {cell.content}
                                </td>
                              )
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="w-full space-y-4">
            {!readOnly ? (
              <>
                <div className="flex flex-col space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium mb-1 block">URL del vídeo</label>
                    <div className="flex space-x-2">
                      <Input
                        value={block.content.src || ''}
                        onChange={(e) => {
                          const url = e.target.value;
                          // Detectar automáticamente el tipo de video
                          let type = block.content.type || 'youtube';
                          
                          if (url.includes('youtube.com') || url.includes('youtu.be')) {
                            type = 'youtube';
                          } else if (url.includes('vimeo.com')) {
                            type = 'vimeo';
                          } else if (url.match(/\.(mp4|webm|ogg)$/i)) {
                            type = 'file';
                          }
                          
                          handleContentChange({ 
                            src: url,
                            type: type
                          });
                        }}
                        placeholder="https://www.youtube.com/watch?v=VIDEO_ID o https://vimeo.com/VIDEO_ID"
                        className="flex-1"
                      />
                      <DialogMediaSelector
                        title="Seleccionar video"
                        description="Elige un video de la biblioteca de medios"
                        defaultTab="video"
                        allowedTypes={['video', 'youtube', 'vimeo']}
                        trigger={
                          <Button variant="outline" size="sm">Explorar</Button>
                        }
                        onSelect={(media) => {
                          // Detectar automáticamente el tipo de video
                          let type = 'file';
                          if (media.type === 'youtube' || media.type === 'vimeo') {
                            type = media.type;
                          }
                          
                          handleContentChange({ 
                            src: media.url,
                            type: type,
                            title: media.title || block.content.title
                          });
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Tipo de vídeo</label>
                      <Select
                        value={block.content.type || 'youtube'}
                        onValueChange={(value) => handleContentChange({ type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="vimeo">Vimeo</SelectItem>
                          <SelectItem value="file">Archivo de vídeo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Relación de aspecto</label>
                      <Select
                        value={block.content.aspectRatio || '16:9'}
                        onValueChange={(value) => handleContentChange({ aspectRatio: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la relación" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:9">16:9 (Panorámico)</SelectItem>
                          <SelectItem value="4:3">4:3 (Estándar)</SelectItem>
                          <SelectItem value="1:1">1:1 (Cuadrado)</SelectItem>
                          <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Título del vídeo</label>
                    <Input
                      value={block.content.title || ''}
                      onChange={(e) => handleContentChange({ title: e.target.value })}
                      placeholder="Título descriptivo del vídeo (opcional)"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={block.content.autoplay || false}
                        onChange={(e) => handleContentChange({ autoplay: e.target.checked })}
                        id={`autoplay-${block.id}`}
                        className="mr-2"
                      />
                      <label htmlFor={`autoplay-${block.id}`} className="text-sm">
                        Reproducción automática
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={block.content.loop || false}
                        onChange={(e) => handleContentChange({ loop: e.target.checked })}
                        id={`loop-${block.id}`}
                        className="mr-2"
                      />
                      <label htmlFor={`loop-${block.id}`} className="text-sm">
                        Repetir
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={block.content.muted || false}
                        onChange={(e) => handleContentChange({ muted: e.target.checked })}
                        id={`muted-${block.id}`}
                        className="mr-2"
                      />
                      <label htmlFor={`muted-${block.id}`} className="text-sm">
                        Silenciado
                      </label>
                    </div>
                  </div>
                  
                  {block.content.type === 'file' && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Imagen de previsualización</label>
                      <div className="flex space-x-2">
                        <Input
                          value={block.content.poster || ''}
                          onChange={(e) => handleContentChange({ poster: e.target.value })}
                          placeholder="URL de la imagen de previsualización"
                          className="flex-1"
                        />
                        <DialogMediaSelector
                          title="Seleccionar imagen de previsualización"
                          description="Elige una imagen para la previsualización del video"
                          defaultTab="image"
                          allowedTypes={['image']}
                          trigger={
                            <Button variant="outline" size="sm">Explorar</Button>
                          }
                          onSelect={(media) => {
                            handleContentChange({ 
                              poster: media.url
                            });
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {block.content.src && (
                  <div className="mt-4 border rounded-md p-2">
                    <p className="text-sm font-medium mb-2">Vista previa:</p>
                    <div className={`relative overflow-hidden ${
                      block.content.aspectRatio === '16:9' ? 'aspect-video' :
                      block.content.aspectRatio === '4:3' ? 'aspect-[4/3]' :
                      block.content.aspectRatio === '1:1' ? 'aspect-square' :
                      'aspect-[9/16]'
                    }`}>
                      {block.content.type === 'youtube' && (
                        <div className="absolute inset-0 bg-muted/30 flex flex-col items-center justify-center p-4">
                          {getYouTubeID(block.content.src) ? (
                            <>
                              <p className="text-sm font-medium mb-2">YouTube: ID {getYouTubeID(block.content.src)}</p>
                              <div className="flex space-x-2 text-xs">
                                {block.content.autoplay && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Autoplay</span>}
                                {block.content.loop && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Loop</span>}
                                {block.content.muted && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Muted</span>}
                              </div>
                            </>
                          ) : (
                            <p className="text-muted-foreground text-sm">ID de YouTube no detectado</p>
                          )}
                        </div>
                      )}
                      {block.content.type === 'vimeo' && (
                        <div className="absolute inset-0 bg-muted/30 flex flex-col items-center justify-center p-4">
                          {getVimeoID(block.content.src) ? (
                            <>
                              <p className="text-sm font-medium mb-2">Vimeo: ID {getVimeoID(block.content.src)}</p>
                              <div className="flex space-x-2 text-xs">
                                {block.content.autoplay && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Autoplay</span>}
                                {block.content.loop && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Loop</span>}
                                {block.content.muted && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Muted</span>}
                              </div>
                            </>
                          ) : (
                            <p className="text-muted-foreground text-sm">ID de Vimeo no detectado</p>
                          )}
                        </div>
                      )}
                      {block.content.type === 'file' && (
                        <div className="absolute inset-0 bg-muted/30 flex flex-col items-center justify-center p-4">
                          {block.content.poster ? (
                            <>
                              <img 
                                src={block.content.poster} 
                                alt={block.content.title || "Vista previa"} 
                                className="w-full h-full object-cover absolute inset-0"
                              />
                              <div className="z-10 bg-background/70 px-3 py-1 rounded-md">
                                <p className="text-sm font-medium">Archivo con poster</p>
                              </div>
                            </>
                          ) : block.content.src ? (
                            <>
                              <p className="text-sm font-medium mb-2">Archivo de vídeo</p>
                              <p className="text-xs mb-2 max-w-full truncate">{block.content.src}</p>
                              <div className="flex space-x-2 text-xs">
                                {block.content.autoplay && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Autoplay</span>}
                                {block.content.loop && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Loop</span>}
                                {block.content.muted && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Muted</span>}
                              </div>
                            </>
                          ) : (
                            <p className="text-muted-foreground text-sm">Archivo de vídeo no especificado</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                {block.content.title && (
                  <h4 className="mb-2 font-medium">{block.content.title}</h4>
                )}
                <div className={`relative overflow-hidden ${
                  block.content.aspectRatio === '16:9' ? 'aspect-video' :
                  block.content.aspectRatio === '4:3' ? 'aspect-[4/3]' :
                  block.content.aspectRatio === '1:1' ? 'aspect-square' :
                  'aspect-[9/16]'
                }`}>
                  {block.content.type === 'youtube' && block.content.src && (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeID(block.content.src)}?autoplay=${block.content.autoplay ? 1 : 0}&mute=${block.content.muted ? 1 : 0}${block.content.loop ? `&loop=1&playlist=${getYouTubeID(block.content.src)}` : ''}`}
                      title={block.content.title || "YouTube video"}
                      className="absolute top-0 left-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  )}
                  
                  {block.content.type === 'vimeo' && block.content.src && (
                    <iframe
                      src={`https://player.vimeo.com/video/${getVimeoID(block.content.src)}?autoplay=${block.content.autoplay ? 1 : 0}&muted=${block.content.muted ? 1 : 0}&loop=${block.content.loop ? 1 : 0}`}
                      title={block.content.title || "Vimeo video"}
                      className="absolute top-0 left-0 w-full h-full border-0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  )}
                  
                  {block.content.type === 'file' && block.content.src && (
                    <video
                      src={block.content.src}
                      poster={block.content.poster}
                      controls
                      autoPlay={block.content.autoplay}
                      loop={block.content.loop}
                      muted={block.content.muted}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    ></video>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'divider':
        return (
          <div className="w-full">
            {!readOnly ? (
              <div className="space-y-4">
                <div className="flex flex-col space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Estilo del separador</label>
                    <Select
                      value={block.content.style || 'solid'}
                      onValueChange={(value) => handleContentChange({ style: value })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccione un estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Sólido</SelectItem>
                        <SelectItem value="dashed">Punteado</SelectItem>
                        <SelectItem value="dotted">Puntos</SelectItem>
                        <SelectItem value="double">Doble</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Ancho</label>
                      <Select
                        value={block.content.width || 'full'}
                        onValueChange={(value) => handleContentChange({ width: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el ancho" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Completo</SelectItem>
                          <SelectItem value="medium">Medio</SelectItem>
                          <SelectItem value="small">Pequeño</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Alineación</label>
                      <Select
                        value={block.content.align || 'center'}
                        onValueChange={(value) => handleContentChange({ align: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la alineación" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Izquierda</SelectItem>
                          <SelectItem value="center">Centrado</SelectItem>
                          <SelectItem value="right">Derecha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Espacio</label>
                    <Select
                      value={block.content.spacing || 'normal'}
                      onValueChange={(value) => handleContentChange({ spacing: value })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccione el espacio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tight">Compacto</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="loose">Amplio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Vista previa:</p>
                    <div className={`flex ${
                      block.content.align === 'left' ? 'justify-start' : 
                      block.content.align === 'right' ? 'justify-end' : 'justify-center'
                    }`}>
                      <div className={`border-t ${
                        block.content.width === 'small' ? 'w-1/4' : 
                        block.content.width === 'medium' ? 'w-1/2' : 'w-full'
                      } ${
                        block.content.style === 'dashed' ? 'border-dashed' : 
                        block.content.style === 'dotted' ? 'border-dotted' : 
                        block.content.style === 'double' ? 'border-double border-t-2' : 'border-solid'
                      } border-muted-foreground/50 ${
                        block.content.spacing === 'tight' ? 'my-2' :
                        block.content.spacing === 'loose' ? 'my-8' : 'my-4'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex ${
                block.content.align === 'left' ? 'justify-start' : 
                block.content.align === 'right' ? 'justify-end' : 'justify-center'
              }`}>
                <div className={`border-t ${
                  block.content.width === 'small' ? 'w-1/4' : 
                  block.content.width === 'medium' ? 'w-1/2' : 'w-full'
                } ${
                  block.content.style === 'dashed' ? 'border-dashed' : 
                  block.content.style === 'dotted' ? 'border-dotted' : 
                  block.content.style === 'double' ? 'border-double border-t-2' : 'border-solid'
                } border-muted-foreground/50 ${
                  block.content.spacing === 'tight' ? 'my-2' :
                  block.content.spacing === 'loose' ? 'my-8' : 'my-4'
                }`}></div>
              </div>
            )}
          </div>
        );
        
      case 'list':
        return (
          <div className="w-full">
            {!readOnly ? (
              <div className="space-y-4">
                <div className="flex flex-col space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipo de lista</label>
                    <Select
                      value={block.content.type || 'unordered'}
                      onValueChange={(value) => handleContentChange({ type: value })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Seleccione el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unordered">Sin orden (viñetas)</SelectItem>
                        <SelectItem value="ordered">Numerada</SelectItem>
                        <SelectItem value="check">Con casillas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Elementos de la lista</label>
                    <div className="space-y-2">
                      {(block.content.items || []).map((item: string, idx: number) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Input
                            value={item}
                            onChange={(e) => {
                              const items = [...(block.content.items || [])];
                              items[idx] = e.target.value;
                              handleContentChange({ items });
                            }}
                            placeholder={`Elemento ${idx + 1}`}
                            className="flex-1"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              const items = [...(block.content.items || [])];
                              items.splice(idx, 1);
                              handleContentChange({ items });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const items = [...(block.content.items || []), ''];
                          handleContentChange({ items });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir elemento
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Vista previa:</p>
                    {block.content.type === 'unordered' ? (
                      <ul className="list-disc pl-6 space-y-1">
                        {(block.content.items || []).map((item: string, idx: number) => (
                          <li key={idx}>{item || `Elemento ${idx + 1}`}</li>
                        ))}
                      </ul>
                    ) : block.content.type === 'ordered' ? (
                      <ol className="list-decimal pl-6 space-y-1">
                        {(block.content.items || []).map((item: string, idx: number) => (
                          <li key={idx}>{item || `Elemento ${idx + 1}`}</li>
                        ))}
                      </ol>
                    ) : (
                      <ul className="pl-6 space-y-1">
                        {(block.content.items || []).map((item: string, idx: number) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <span className="inline-flex items-center justify-center w-4 h-4 border border-muted-foreground/50 rounded-sm">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                            <span>{item || `Elemento ${idx + 1}`}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {block.content.type === 'unordered' ? (
                  <ul className="list-disc pl-6 space-y-1">
                    {(block.content.items || []).map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : block.content.type === 'ordered' ? (
                  <ol className="list-decimal pl-6 space-y-1">
                    {(block.content.items || []).map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ol>
                ) : (
                  <ul className="pl-6 space-y-1">
                    {(block.content.items || []).map((item: string, idx: number) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="inline-flex items-center justify-center w-4 h-4 border border-muted-foreground/50 rounded-sm">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        );
        
      case 'html':
        return (
          <div className="w-full">
            {!readOnly ? (
              <div className="space-y-4">
                <div className="flex flex-col space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Código HTML</label>
                    <div className="relative">
                      <Textarea
                        value={block.content.code || ''}
                        onChange={(e) => handleContentChange({ code: e.target.value })}
                        placeholder="<!-- Inserta tu código HTML aquí -->"
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Inserta código HTML personalizado. Úsalo con precaución.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`sanitize-${block.id}`}
                        checked={block.content.sanitize !== false}
                        onCheckedChange={(checked) => handleContentChange({ sanitize: checked })}
                      />
                      <Label htmlFor={`sanitize-${block.id}`}>Sanitizar HTML (recomendado)</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cuando está activado, se eliminarán scripts y atributos potencialmente peligrosos.
                    </p>
                  </div>
                  
                  {block.content.code && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Vista previa:</p>
                      <div className="p-4 border rounded-md bg-muted/20">
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: block.content.code }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        La vista previa puede diferir de la visualización final.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: block.content.code || '' }}
              />
            )}
          </div>
        );
        
      case 'contact-form':
        return (
          <div className="w-full">
            {!readOnly ? (
              <div className="space-y-4">
                <div className="flex flex-col space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Título del formulario</label>
                    <Input
                      value={block.content.title || ''}
                      onChange={(e) => handleContentChange({ title: e.target.value })}
                      placeholder="Formulario de contacto"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Descripción</label>
                    <Textarea
                      value={block.content.description || ''}
                      onChange={(e) => handleContentChange({ description: e.target.value })}
                      placeholder="Completa el siguiente formulario para contactar con nosotros."
                      className="resize-y"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">Campos del formulario</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const fields = [...(block.content.fields || [])];
                          fields.push({
                            name: `field_${fields.length + 1}`,
                            label: `Campo ${fields.length + 1}`,
                            type: 'text',
                            required: false,
                            options: []
                          });
                          handleContentChange({ fields });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir campo
                      </Button>
                    </div>
                    
                    {(block.content.fields || []).length === 0 ? (
                      <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center">
                        <p className="text-muted-foreground mb-2">No hay campos en el formulario</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleContentChange({
                              fields: [
                                { name: 'name', label: 'Nombre', type: 'text', required: true },
                                { name: 'email', label: 'Email', type: 'email', required: true },
                                { name: 'message', label: 'Mensaje', type: 'textarea', required: true }
                              ]
                            });
                          }}
                        >
                          Usar plantilla básica
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(block.content.fields || []).map((field: any, idx: number) => (
                          <div key={idx} className="border rounded-md p-3 space-y-3 relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-2 h-6 w-6 text-destructive"
                              onClick={() => {
                                const fields = [...(block.content.fields || [])];
                                fields.splice(idx, 1);
                                handleContentChange({ fields });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <label className="text-xs font-medium mb-1 block">ID del campo</label>
                                <Input
                                  value={field.name || ''}
                                  onChange={(e) => {
                                    const fields = [...(block.content.fields || [])];
                                    fields[idx] = { ...fields[idx], name: e.target.value };
                                    handleContentChange({ fields });
                                  }}
                                  placeholder="nombre_campo"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium mb-1 block">Etiqueta visible</label>
                                <Input
                                  value={field.label || ''}
                                  onChange={(e) => {
                                    const fields = [...(block.content.fields || [])];
                                    fields[idx] = { ...fields[idx], label: e.target.value };
                                    handleContentChange({ fields });
                                  }}
                                  placeholder="Etiqueta del campo"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-medium mb-1 block">Tipo de campo</label>
                                <Select
                                  value={field.type || 'text'}
                                  onValueChange={(value) => {
                                    const fields = [...(block.content.fields || [])];
                                    fields[idx] = { ...fields[idx], type: value };
                                    handleContentChange({ fields });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Texto</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="tel">Teléfono</SelectItem>
                                    <SelectItem value="number">Número</SelectItem>
                                    <SelectItem value="date">Fecha</SelectItem>
                                    <SelectItem value="textarea">Área de texto</SelectItem>
                                    <SelectItem value="select">Desplegable</SelectItem>
                                    <SelectItem value="checkbox">Casilla de verificación</SelectItem>
                                    <SelectItem value="radio">Botón de radio</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center">
                                <div className="flex items-center space-x-2 mt-4">
                                  <Switch
                                    id={`required-${field.name}-${block.id}`}
                                    checked={field.required || false}
                                    onCheckedChange={(checked) => {
                                      const fields = [...(block.content.fields || [])];
                                      fields[idx] = { ...fields[idx], required: checked };
                                      handleContentChange({ fields });
                                    }}
                                  />
                                  <Label htmlFor={`required-${field.name}-${block.id}`}>Obligatorio</Label>
                                </div>
                              </div>
                            </div>
                            
                            {(field.type === 'select' || field.type === 'radio') && (
                              <div>
                                <label className="text-xs font-medium mb-1 block">Opciones</label>
                                <div className="space-y-2">
                                  {(field.options || []).map((option: string, optIdx: number) => (
                                    <div key={optIdx} className="flex items-center space-x-2">
                                      <Input
                                        value={option}
                                        onChange={(e) => {
                                          const fields = [...(block.content.fields || [])];
                                          const options = [...(fields[idx].options || [])];
                                          options[optIdx] = e.target.value;
                                          fields[idx] = { ...fields[idx], options };
                                          handleContentChange({ fields });
                                        }}
                                        placeholder={`Opción ${optIdx + 1}`}
                                        className="flex-1"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => {
                                          const fields = [...(block.content.fields || [])];
                                          const options = [...(fields[idx].options || [])];
                                          options.splice(optIdx, 1);
                                          fields[idx] = { ...fields[idx], options };
                                          handleContentChange({ fields });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-1"
                                    onClick={() => {
                                      const fields = [...(block.content.fields || [])];
                                      const options = [...(fields[idx].options || []), ''];
                                      fields[idx] = { ...fields[idx], options };
                                      handleContentChange({ fields });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Añadir opción
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Texto del botón</label>
                      <Input
                        value={block.content.submitText || 'Enviar'}
                        onChange={(e) => handleContentChange({ submitText: e.target.value })}
                        placeholder="Enviar"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Email de destino</label>
                      <Input
                        value={block.content.email || ''}
                        onChange={(e) => handleContentChange({ email: e.target.value })}
                        placeholder="contacto@ejemplo.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Donde se enviarán las respuestas del formulario
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`showSuccess-${block.id}`}
                      checked={block.content.showSuccess !== false}
                      onCheckedChange={(checked) => handleContentChange({ showSuccess: checked })}
                    />
                    <Label htmlFor={`showSuccess-${block.id}`}>Mostrar mensaje de éxito</Label>
                  </div>
                  
                  {block.content.showSuccess !== false && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Mensaje de éxito</label>
                      <Input
                        value={block.content.successMessage || 'Gracias por tu mensaje. Te responderemos lo antes posible.'}
                        onChange={(e) => handleContentChange({ successMessage: e.target.value })}
                        placeholder="Mensaje enviado correctamente"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border rounded-md p-6 space-y-4">
                {block.content.title && (
                  <h3 className="text-xl font-bold">{block.content.title}</h3>
                )}
                {block.content.description && (
                  <p className="text-muted-foreground">{block.content.description}</p>
                )}
                
                <div className="space-y-4">
                  {(block.content.fields || []).map((field: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <label className="text-sm font-medium">{field.label}{field.required ? ' *' : ''}</label>
                      
                      {field.type === 'textarea' ? (
                        <Textarea 
                          disabled={readOnly} 
                          placeholder={field.label}
                          className="w-full"
                        />
                      ) : field.type === 'select' ? (
                        <Select disabled={readOnly}>
                          <SelectTrigger>
                            <SelectValue placeholder={`Seleccionar ${field.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {(field.options || []).map((option: string, optIdx: number) => (
                              <SelectItem key={optIdx} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === 'checkbox' ? (
                        <div className="flex items-center space-x-2">
                          <Switch id={`form-${field.name}-${block.id}`} disabled={readOnly} />
                          <Label htmlFor={`form-${field.name}-${block.id}`}>{field.label}</Label>
                        </div>
                      ) : field.type === 'radio' ? (
                        <div className="space-y-2">
                          {(field.options || []).map((option: string, optIdx: number) => (
                            <div key={optIdx} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                disabled={readOnly}
                                id={`${field.name}-${optIdx}-${block.id}`}
                                name={field.name}
                                className="h-4 w-4"
                              />
                              <label htmlFor={`${field.name}-${optIdx}-${block.id}`}>{option}</label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Input 
                          type={field.type} 
                          disabled={readOnly} 
                          placeholder={field.label}
                          className="w-full"
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <Button disabled={readOnly} className="mt-4">
                  {block.content.submitText || 'Enviar'}
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