import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Animation from './animation';
import AnimationSettings from './animation-settings';
import { AnimationConfig } from './animation-utils';

// Tipo para la biblioteca de animación
type AnimationLibrary = 'framer-motion' | 'react-spring' | 'gsap' | 'aos' | 'none';

/**
 * Componente de demostración para las animaciones
 * 
 * Este componente permite probar las diferentes bibliotecas y efectos
 * de animación disponibles en el sistema.
 */
export const AnimationDemo: React.FC = () => {
  // Estado para la configuración de la animación
  const [animationConfig, setAnimationConfig] = useState<AnimationConfig>({
    effect: 'fadeIn',
    duration: 'normal',
    delay: 'none',
    repeat: false,
    infinite: false
  });
  
  // Estado para la biblioteca de animación
  const [library, setLibrary] = useState<AnimationLibrary>('framer-motion');
  
  // Contenido de demostración
  const demoContents = [
    {
      title: 'Texto simple',
      content: (
        <div className="text-center p-8">
          <h3 className="text-2xl font-bold mb-4">Título animado</h3>
          <p className="text-muted-foreground">
            Este es un ejemplo de texto animado utilizando la biblioteca {library}.
          </p>
        </div>
      )
    },
    {
      title: 'Tarjeta',
      content: (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Tarjeta con animación</CardTitle>
            <CardDescription>
              Un ejemplo de tarjeta con efecto {animationConfig.effect}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Las animaciones mejoran la experiencia de usuario y ayudan a guiar
              la atención hacia elementos importantes de la interfaz.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancelar</Button>
            <Button>Guardar</Button>
          </CardFooter>
        </Card>
      )
    },
    {
      title: 'Imagen',
      content: (
        <div className="w-full max-w-md mx-auto p-4 text-center">
          <div className="rounded-lg overflow-hidden shadow-md">
            <div className="bg-primary h-40 flex items-center justify-center text-primary-foreground">
              Imagen de ejemplo
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Las imágenes pueden beneficiarse mucho de las animaciones para crear
            impacto visual.
          </p>
        </div>
      )
    }
  ];
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Demostración de Animaciones</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
                <CardDescription>
                  Personaliza la animación ajustando estas opciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimationSettings
                  config={animationConfig}
                  library={library}
                  onChange={(newConfig, newLibrary) => {
                    setAnimationConfig(newConfig);
                    setLibrary(newLibrary);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Previsualización</CardTitle>
              <CardDescription>
                Efecto: {animationConfig.effect || 'Ninguno'} | 
                Biblioteca: {library || 'Ninguna'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="text">
                <TabsList className="grid grid-cols-3 mb-4">
                  {demoContents.map((demo, index) => (
                    <TabsTrigger key={index} value={`demo-${index}`}>
                      {demo.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {demoContents.map((demo, index) => (
                  <TabsContent key={index} value={`demo-${index}`}>
                    <div className="border rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                      <Animation
                        library={library}
                        {...animationConfig}
                      >
                        {demo.content}
                      </Animation>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Código de ejemplo</h3>
                <Separator className="mb-4" />
                
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  {`<Animation
  library="${library}"
  effect="${animationConfig.effect || ''}"
  duration="${animationConfig.duration || 'normal'}"
  delay="${animationConfig.delay || 'none'}"
  repeat={${animationConfig.repeat ? 'true' : 'false'}}
  infinite={${animationConfig.infinite ? 'true' : 'false'}}
  ${animationConfig.threshold ? `threshold={${animationConfig.threshold}}` : ''}
>
  {/* Contenido a animar */}
  <div>Mi contenido animado</div>
</Animation>`}
                </pre>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  setAnimationConfig({
                    effect: 'fadeIn',
                    duration: 'normal',
                    delay: 'none',
                    repeat: false,
                    infinite: false
                  });
                  setLibrary('framer-motion');
                }}
                variant="outline"
              >
                Restablecer
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnimationDemo;