import React from 'react';
import CmsLayout from '@/components/cms/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Animation from '@/components/cms/animations/animation';

export default function AnimatedBlocksDemo() {
  const demoBlocks = [
    {
      title: 'Fade In',
      effect: 'fade-in',
      library: 'framer-motion',
      duration: 0.8,
      delay: 0.1
    },
    {
      title: 'Slide Up',
      effect: 'slide-up',
      library: 'react-spring',
      duration: 1,
      delay: 0.2
    },
    {
      title: 'Bounce',
      effect: 'bounce',
      library: 'gsap',
      duration: 1.2,
      delay: 0.3
    },
    {
      title: 'Zoom In',
      effect: 'zoom-in',
      library: 'aos',
      duration: 0.8,
      delay: 0.4
    },
    {
      title: 'Flip',
      effect: 'flip-left',
      library: 'aos',
      duration: 1,
      delay: 0.5
    }
  ];

  return (
    <CmsLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Demostración de Bloques Animados</h1>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoBlocks.map((block, index) => (
            <Animation 
              key={index}
              effect={block.effect}
              duration={block.duration}
              delay={block.delay}
              library={block.library}
              scrollTrigger={true}
              threshold={0.1}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{block.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted/20 rounded-md text-center">
                    <p className="mb-2 font-medium">{block.effect}</p>
                    <p className="text-sm text-muted-foreground">
                      Biblioteca: {block.library} • 
                      Duración: {block.duration}s • 
                      Retraso: {block.delay}s
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Animation>
          ))}
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Bloques con Efectos Secuenciales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((delay, index) => (
                <Animation 
                  key={index}
                  effect="slide-right"
                  duration={0.5}
                  delay={delay}
                  library="framer-motion"
                >
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
                    <p className="font-medium">Bloque secuencial {index + 1}</p>
                    <p className="text-sm text-muted-foreground">Con retraso de {delay}s</p>
                  </div>
                </Animation>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CmsLayout>
  );
}