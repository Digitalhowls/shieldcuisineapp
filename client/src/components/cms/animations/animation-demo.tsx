import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import Animation from './animation';
import AnimationSettings from './animation-settings';
import { AnimationConfig } from './animation-config';

interface AnimationDemoProps {
  initialConfig?: Partial<AnimationConfig>;
  demoText?: string;
  showSettings?: boolean;
}

/**
 * Componente para demonstrar y probar animaciones
 * 
 * Este componente muestra un elemento animado y permite ajustar
 * su configuración de animación en tiempo real.
 */
export const AnimationDemo: React.FC<AnimationDemoProps> = ({
  initialConfig = {},
  demoText = "Animación de ejemplo",
  showSettings = true
}) => {
  // Estado de configuración de animación
  const [animationConfig, setAnimationConfig] = useState<Partial<AnimationConfig>>({
    effect: 'fadeIn',
    duration: 'normal',
    delay: 'none',
    repeat: 0,
    intensity: 1,
    library: 'framer-motion',
    ...initialConfig
  });
  
  // Estado para controlar el reinicio de animación
  const [key, setKey] = useState(0);
  
  // Reiniciar la animación
  const resetAnimation = () => {
    setKey(prevKey => prevKey + 1);
  };
  
  return (
    <div className="animation-demo space-y-6">
      {/* Área de previsualización */}
      <Card className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={resetAnimation}
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
        
        <CardContent className="flex items-center justify-center p-10 min-h-[200px]">
          <Animation
            key={key}
            effect={animationConfig.effect}
            duration={animationConfig.duration}
            delay={animationConfig.delay}
            repeat={animationConfig.repeat}
            threshold={animationConfig.threshold}
            intensity={animationConfig.intensity}
            direction={animationConfig.direction}
            easing={animationConfig.easing}
            library={animationConfig.library as any}
            scrollTrigger={animationConfig.scrollTrigger}
          >
            <div className="text-center p-8 bg-card rounded-lg shadow-md border">
              <h3 className="text-lg font-medium">{demoText}</h3>
            </div>
          </Animation>
        </CardContent>
      </Card>
      
      {/* Panel de configuración */}
      {showSettings && (
        <AnimationSettings
          value={animationConfig}
          onChange={setAnimationConfig}
        />
      )}
    </div>
  );
};

export default AnimationDemo;