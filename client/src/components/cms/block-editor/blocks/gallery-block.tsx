import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Image, Plus, Trash2 } from 'lucide-react';
import { GalleryContent, GalleryImage, Block } from '../types';
import { Gallery } from '../../gallery';
import { GalleryViewType } from '../../gallery/index';

interface GalleryBlockProps {
  block: Block;
  onChange: (updatedBlock: Block) => void;
  editable?: boolean;
}

interface GalleryBlockEditorProps {
  content: GalleryContent;
  onChange: (content: GalleryContent) => void;
}

// Componente para seleccionar/editar imágenes individuales
const ImageSelector: React.FC<{
  image: GalleryImage;
  onChange: (updatedImage: GalleryImage) => void;
  onRemove: () => void;
}> = ({ image, onChange, onRemove }) => {
  return (
    <div className="relative border rounded-md overflow-hidden group">
      <img 
        src={image.src} 
        alt={image.alt} 
        className="w-full h-48 object-cover"
      />
      
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
        <div className="p-3 w-full">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={image.alt || ''}
              onChange={(e) => onChange({ ...image, alt: e.target.value })}
              placeholder="Texto alternativo"
              className="flex-1 px-3 py-1 text-sm rounded border border-gray-300 bg-white"
            />
            <Button 
              size="icon" 
              variant="destructive" 
              onClick={onRemove}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <input
            type="text"
            value={image.caption || ''}
            onChange={(e) => onChange({ ...image, caption: e.target.value })}
            placeholder="Pie de foto (opcional)"
            className="w-full px-3 py-1 text-sm rounded border border-gray-300 bg-white"
          />
        </div>
      </div>
    </div>
  );
};

// Editor para el bloque de galería
const GalleryBlockEditor: React.FC<GalleryBlockEditorProps> = ({ content, onChange }) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  
  const addImage = () => {
    if (!newImageUrl.trim()) return;
    
    const newImage: GalleryImage = {
      src: newImageUrl,
      alt: ''
    };
    
    onChange({
      ...content,
      images: [...content.images, newImage]
    });
    
    setNewImageUrl('');
  };
  
  const removeImage = (index: number) => {
    const updatedImages = [...content.images];
    updatedImages.splice(index, 1);
    onChange({
      ...content,
      images: updatedImages
    });
  };
  
  const updateImage = (index: number, updatedImage: GalleryImage) => {
    const updatedImages = [...content.images];
    updatedImages[index] = updatedImage;
    onChange({
      ...content,
      images: updatedImages
    });
  };
  
  const updateLayout = (layout: 'grid' | 'masonry' | 'carousel') => {
    onChange({
      ...content,
      layout
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gallery-layout">Tipo de visualización</Label>
          <Select 
            value={content.layout || 'grid'} 
            onValueChange={(value) => updateLayout(value as 'grid' | 'masonry' | 'carousel')}
          >
            <SelectTrigger id="gallery-layout">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Cuadrícula</SelectItem>
              <SelectItem value="masonry">Mosaico</SelectItem>
              <SelectItem value="carousel">Carrusel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="new-image-url">Añadir imagen</Label>
            <input
              id="new-image-url"
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="URL de la imagen"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button onClick={addImage} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md p-3 bg-muted/50">
        <h4 className="font-medium mb-2 flex items-center">
          <Image className="h-4 w-4 mr-2" />
          Imágenes ({content.images.length})
        </h4>
        
        {content.images.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            Agrega imágenes para crear tu galería
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {content.images.map((image, index) => (
              <ImageSelector
                key={index}
                image={image}
                onChange={(updatedImage) => updateImage(index, updatedImage)}
                onRemove={() => removeImage(index)}
              />
            ))}
          </div>
        )}
      </div>
      
      {content.images.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Vista previa</h4>
          <div className="border rounded-md p-4">
            <Gallery
              images={content.images}
              viewType={(content.layout || 'grid') as GalleryViewType}
              columns={3}
              showDots={true}
              showArrows={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Bloque de galería (modo visualización y edición)
const GalleryBlock: React.FC<GalleryBlockProps> = ({ block, onChange, editable = false }) => {
  const content = block.content as GalleryContent;
  
  if (editable) {
    return (
      <GalleryBlockEditor
        content={content}
        onChange={(updatedContent) => {
          onChange({
            ...block,
            content: updatedContent
          });
        }}
      />
    );
  }
  
  if (!content.images || content.images.length === 0) {
    return <div className="text-muted-foreground text-center p-4">Galería sin imágenes</div>;
  }
  
  return (
    <Gallery
      images={content.images}
      viewType={(content.layout || 'grid') as GalleryViewType}
      columns={3}
      showDots={true}
      showArrows={true}
    />
  );
};

export default GalleryBlock;