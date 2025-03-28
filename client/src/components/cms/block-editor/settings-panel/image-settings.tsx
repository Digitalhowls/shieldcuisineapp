import React from 'react';
import { ImageContent } from '../types';
import { 
  Input
} from '@/components/ui/input';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Textarea 
} from '@/components/ui/textarea';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Image as ImageIcon, 
  Upload 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ImageSettingsProps {
  content: ImageContent;
  onUpdate: (updates: Partial<ImageContent>) => void;
}

/**
 * Componente para configurar bloques de imagen
 */
const ImageSettings: React.FC<ImageSettingsProps> = ({ 
  content, 
  onUpdate 
}) => {
  const handleChange = (field: keyof ImageContent, value: string) => {
    onUpdate({ [field]: value });
  };

  // Simulación de subida de imagen - en producción se conectaría a un selector de medios
  const handleImageSelect = () => {
    // Aquí se implementaría la selección de imagen de la biblioteca de medios
    console.log('Selección de imagen iniciada');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="border rounded-md p-4 flex flex-col items-center justify-center">
          {content.src ? (
            <div className="relative w-full">
              <img 
                src={content.src} 
                alt={content.alt || 'Vista previa de la imagen'} 
                className="rounded-md object-cover w-full max-h-36"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={handleImageSelect}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Cambiar imagen
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full py-8 flex flex-col gap-2"
              onClick={handleImageSelect}
            >
              <Upload className="h-8 w-8" />
              <span>Seleccionar imagen</span>
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="image-src">URL de la imagen</Label>
        <Input 
          id="image-src"
          value={content.src || ''}
          onChange={(e) => handleChange('src', e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
        <p className="text-xs text-muted-foreground">
          Enlace directo a la imagen o selecciona de la biblioteca de medios
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-alt">Texto alternativo</Label>
        <Input 
          id="image-alt"
          value={content.alt || ''}
          onChange={(e) => handleChange('alt', e.target.value)}
          placeholder="Descripción de la imagen"
        />
        <p className="text-xs text-muted-foreground">
          Importante para accesibilidad y SEO
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-caption">Leyenda</Label>
        <Textarea 
          id="image-caption"
          value={content.caption || ''}
          onChange={(e) => handleChange('caption', e.target.value)}
          placeholder="Leyenda opcional para mostrar debajo de la imagen"
          rows={2}
        />
      </div>
    </div>
  );
};

export default ImageSettings;