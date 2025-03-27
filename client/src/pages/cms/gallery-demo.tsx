import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Gallery } from '../../components/cms/gallery';
import { GalleryViewType } from '../../components/cms/gallery/index';
import { GalleryImage } from '../../components/cms/block-editor/types';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/layouts/admin-layout';

// Imágenes de ejemplo para la demostración
const demoImages: GalleryImage[] = [
  {
    src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1470&auto=format&fit=crop',
    alt: 'Plato de comida saludable',
    caption: 'Menú equilibrado y nutritivo'
  },
  {
    src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1374&auto=format&fit=crop',
    alt: 'Chef preparando un plato',
    caption: 'Preparación con los más altos estándares'
  },
  {
    src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1381&auto=format&fit=crop',
    alt: 'Pizza casera',
    caption: 'Ingredientes de primera calidad'
  },
  {
    src: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=1380&auto=format&fit=crop',
    alt: 'Platos preparados',
    caption: 'Control de calidad en cada etapa'
  },
  {
    src: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1374&auto=format&fit=crop',
    alt: 'Ensalada fresca',
    caption: 'Productos frescos y locales'
  },
  {
    src: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1470&auto=format&fit=crop',
    alt: 'Bandeja de vegetales',
    caption: 'Almacenamiento y manipulación seguros'
  }
];

export default function GalleryDemo() {
  const { toast } = useToast();
  const [viewType, setViewType] = useState<GalleryViewType>('grid');
  const [columns, setColumns] = useState<2 | 3 | 4>(3);
  const [showDots, setShowDots] = useState(true);
  const [showArrows, setShowArrows] = useState(true);
  const [autoplay, setAutoplay] = useState(false);

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Demostración de Galería</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Opciones de visualización</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Tipo de vista</h3>
                  <Tabs defaultValue={viewType} onValueChange={(v) => setViewType(v as GalleryViewType)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="grid">Cuadrícula</TabsTrigger>
                      <TabsTrigger value="masonry">Mosaico</TabsTrigger>
                      <TabsTrigger value="carousel">Carrusel</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Columnas</h3>
                  <Tabs 
                    defaultValue={columns.toString()} 
                    onValueChange={(v) => setColumns(parseInt(v) as 2 | 3 | 4)}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="2">2 columnas</TabsTrigger>
                      <TabsTrigger value="3">3 columnas</TabsTrigger>
                      <TabsTrigger value="4">4 columnas</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {viewType === 'carousel' && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Opciones de carrusel</h3>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant={showDots ? "default" : "outline"}
                        onClick={() => setShowDots(!showDots)}
                        size="sm"
                      >
                        {showDots ? "Ocultar puntos" : "Mostrar puntos"}
                      </Button>
                      
                      <Button 
                        variant={showArrows ? "default" : "outline"}
                        onClick={() => setShowArrows(!showArrows)}
                        size="sm"
                      >
                        {showArrows ? "Ocultar flechas" : "Mostrar flechas"}
                      </Button>
                      
                      <Button 
                        variant={autoplay ? "default" : "outline"}
                        onClick={() => setAutoplay(!autoplay)}
                        size="sm"
                      >
                        {autoplay ? "Detener auto" : "Auto reproducir"}
                      </Button>
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full mt-4" 
                  onClick={() => {
                    toast({
                      title: "Configuración aplicada",
                      description: `Vista: ${viewType}, Columnas: ${columns}`,
                    })
                  }}
                >
                  Aplicar cambios
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Vista previa</CardTitle>
            </CardHeader>
            <CardContent>
              <Gallery 
                images={demoImages}
                viewType={viewType}
                columns={columns}
                showDots={showDots}
                showArrows={showArrows}
                autoplay={autoplay}
                autoplayInterval={3000}
                gap="medium"
              />
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>¿Cómo utilizar la galería?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              El componente de galería permite mostrar colecciones de imágenes en tres formatos diferentes:
            </p>
            
            <ul className="space-y-2 list-disc pl-5">
              <li><strong>Cuadrícula:</strong> Muestra imágenes en una cuadrícula uniforme, perfecto para galerías de imágenes estándar.</li>
              <li><strong>Mosaico:</strong> Distribuye las imágenes en columnas verticales, respetando sus proporciones, ideal para colecciones de imágenes variadas.</li>
              <li><strong>Carrusel:</strong> Muestra las imágenes en un slider navegable con controles, perfecto para destacar imágenes o para espacios reducidos.</li>
            </ul>
            
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Implementación</h4>
              <pre className="text-sm overflow-x-auto">
                {`<Gallery 
  images={misImagenes}
  viewType="carousel"  // "grid" | "masonry" | "carousel"
  columns={3}         // 2 | 3 | 4
  showDots={true}     // solo para carousel
  showArrows={true}   // solo para carousel
  autoplay={false}    // solo para carousel
  gap="medium"        // "small" | "medium" | "large"
/>`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}