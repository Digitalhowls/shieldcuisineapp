import React, { useState } from 'react';
import CmsLayout from '@/components/cms/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import AnimationDemo from '@/components/cms/animations/animation-demo';
import BlockEditor from '@/components/cms/block-editor';
import { PageContent } from '@/components/cms/block-editor';

const AnimationPlayground = () => {
  const [content, setContent] = useState<PageContent>({
    blocks: [
      {
        id: '1',
        type: 'heading',
        content: {
          text: 'Animaciones en el CMS',
          level: 'h1'
        }
      },
      {
        id: '2',
        type: 'paragraph',
        content: {
          text: 'Este es un ejemplo de bloques con animaciones. Puedes probar diferentes efectos y bibliotecas de animación.'
        }
      },
      {
        id: '3',
        type: 'image',
        content: {
          src: 'https://source.unsplash.com/random/800x600/?food',
          alt: 'Imagen de ejemplo',
          caption: 'Esta imagen puede animarse'
        },
        animation: {
          effect: 'fade-in',
          duration: 0.8,
          delay: 0.2,
          library: 'framer-motion'
        }
      },
      {
        id: '4',
        type: 'paragraph',
        content: {
          text: 'Otro párrafo que puede tener animaciones diferentes. Prueba a configurar una animación para él.'
        }
      },
      {
        id: '5',
        type: 'button',
        content: {
          text: 'Botón animado',
          url: '#',
          variant: 'default',
          size: 'lg',
          align: 'center'
        },
        animation: {
          effect: 'bounce',
          duration: 1,
          delay: 0.5,
          repeat: 3,
          library: 'gsap'
        }
      }
    ]
  });

  return (
    <CmsLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Playground de Animaciones</h1>
        </div>
        
        <Separator />
        
        <Tabs defaultValue="editor">
          <TabsList>
            <TabsTrigger value="editor">Editor de Bloques</TabsTrigger>
            <TabsTrigger value="examples">Ejemplos de Animaciones</TabsTrigger>
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Editor con Animaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <BlockEditor
                  initialContent={content}
                  onChange={setContent}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="examples" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Galería de Animaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimationDemo />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
              </CardHeader>
              <CardContent>
                <BlockEditor
                  initialContent={content}
                  readOnly={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CmsLayout>
  );
};

export default AnimationPlayground;