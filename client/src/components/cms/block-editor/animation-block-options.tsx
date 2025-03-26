import React, { useState } from 'react';
import { AnimationConfig } from '../animations/animation-utils';
import AnimationSettings from '../animations/animation-settings';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Tipo para la biblioteca de animación
type AnimationLibrary = 'framer-motion' | 'react-spring' | 'gsap' | 'aos' | 'none';

interface AnimationBlockOptionsProps {
  animationConfig: AnimationConfig;
  animationLibrary: AnimationLibrary;
  onChange: (config: AnimationConfig, library: AnimationLibrary) => void;
}

/**
 * Componente para configurar animaciones en bloques del CMS
 * 
 * Este componente proporciona una interfaz para añadir y configurar
 * animaciones para los bloques del editor.
 */
export const AnimationBlockOptions: React.FC<AnimationBlockOptionsProps> = ({
  animationConfig,
  animationLibrary,
  onChange
}) => {
  const [open, setOpen] = useState(false);
  
  // Determinar si hay animación configurada
  const hasAnimation = animationConfig.effect && animationLibrary !== 'none';
  
  // Etiqueta descriptiva de la animación
  const getAnimationLabel = () => {
    if (!hasAnimation) return 'Sin animación';
    return `${animationConfig.effect} (${animationLibrary})`;
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <PlayCircle size={16} />
          <span>Animación</span>
          {hasAnimation && (
            <Badge variant="outline" className="ml-2 text-xs font-normal">
              {getAnimationLabel()}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Configuración de animación</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <AnimationSettings
            config={animationConfig}
            library={animationLibrary}
            onChange={(newConfig, newLibrary) => {
              onChange(newConfig, newLibrary);
            }}
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              onChange({ effect: undefined }, 'none');
              setOpen(false);
            }}
          >
            Quitar animación
          </Button>
          
          <Button
            onClick={() => setOpen(false)}
          >
            Aplicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnimationBlockOptions;