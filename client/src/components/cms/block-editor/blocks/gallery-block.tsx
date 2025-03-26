import React, { useState } from 'react';
import { GalleryContent, Block } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DialogMediaSelector from '../../media/DialogMediaSelector';
import { Gallery } from '../../gallery';
import { X } from 'lucide-react';

interface GalleryBlockProps {
  block: Block;
  onChange: (block: Block) => void;
  editable: boolean;
}

const GalleryBlock: React.FC<GalleryBlockProps> = ({ 
  block, 
  onChange, 
  editable 
}) => {
  const content = block.content as GalleryContent;
  
  const handleAddImage = (image: { url: string, title?: string }) => {
    const newImages = [
      ...(content.images || []),
      {
        src: image.url,
        alt: image.title || '',
        caption: ''
      }
    ];
    
    onChange({
      ...block,
      content: {
        ...content,
        images: newImages
      }
    });
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...content.images];
    newImages.splice(index, 1);
    
    onChange({
      ...block,
      content: {
        ...content,
        images: newImages
      }
    });
  };
  
  const handleUpdateImage = (index: number, key: string, value: string) => {
    const newImages = [...content.images];
    newImages[index] = {
      ...newImages[index],
      [key]: value
    };
    
    onChange({
      ...block,
      content: {
        ...content,
        images: newImages
      }
    });
  };
  
  const handleLayoutChange = (layout: string) => {
    onChange({
      ...block,
      content: {
        ...content,
        layout: layout as 'grid' | 'masonry' | 'carousel'
      }
    });
  };
  
  if (editable) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Galería de imágenes</h3>
          <Select
            value={content.layout || 'grid'}
            onValueChange={handleLayoutChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar vista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Cuadrícula</SelectItem>
              <SelectItem value="masonry">Mosaico</SelectItem>
              <SelectItem value="carousel">Carrusel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {content.images && content.images.map((image, index) => (
            <Card key={image.src + index} className="overflow-hidden">
              <div className="relative h-32 bg-background">
                <img 
                  src={image.src}
                  alt={image.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-1 right-1 w-6 h-6"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-3 space-y-2">
                <Input
                  placeholder="Texto alternativo"
                  value={image.alt || ''}
                  onChange={(e) => handleUpdateImage(index, 'alt', e.target.value)}
                  className="text-xs h-7"
                />
                <Input
                  placeholder="Título (opcional)"
                  value={image.caption || ''}
                  onChange={(e) => handleUpdateImage(index, 'caption', e.target.value)}
                  className="text-xs h-7"
                />
              </CardContent>
            </Card>
          ))}
          
          <Card className="border-dashed flex items-center justify-center h-[170px]">
            <DialogMediaSelector
              title="Añadir imagen a la galería"
              description="Selecciona una imagen de la biblioteca de medios"
              defaultTab="image"
              allowedTypes={['image']}
              trigger={
                <Button variant="ghost">Añadir imagen</Button>
              }
              onSelect={handleAddImage}
            />
          </Card>
        </div>
        
        {content.images && content.images.length > 0 && content.layout && (
          <div className="border rounded-lg p-4 mt-4">
            <p className="text-sm font-medium mb-3">Vista previa</p>
            <Gallery 
              images={content.images} 
              viewType={content.layout}
              // Opciones específicas para cada tipo de vista
              showDots={true}
              showArrows={true}
              columns={3}
              gap="medium"
            />
          </div>
        )}
      </div>
    );
  } else {
    // Modo de visualización - sólo mostrar la galería
    return (
      <div className="gallery-block">
        {content.images && content.images.length > 0 && (
          <Gallery 
            images={content.images} 
            viewType={content.layout || 'grid'}
            showDots={true}
            showArrows={true}
            autoplay={true}
            autoplayInterval={5000}
            columns={3}
            gap="medium"
          />
        )}
      </div>
    );
  }
};

export default GalleryBlock;