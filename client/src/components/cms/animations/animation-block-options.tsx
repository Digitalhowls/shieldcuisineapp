import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  AnimationLibrary,
  AnimationEffect,
  AnimationDuration,
  AnimationDelay,
  AnimationDirection,
  AnimationEasing,
  effectsByLibrary
} from './animation-config';
import { Block } from '../block-editor/types';

/**
 * Propiedades del componente de opciones de animación para bloques
 */
interface AnimationBlockOptionsProps {
  block: Block;
  onChange: (updatedBlock: Block) => void;
}

/**
 * Componente para configurar opciones de animación en el editor de bloques
 * 
 * Este componente permite seleccionar y configurar animaciones para un bloque
 */
const AnimationBlockOptions: React.FC<AnimationBlockOptionsProps> = ({ 
  block, 
  onChange 
}) => {
  // Inicializar valores de animación
  const animation = block.animation || {};
  const library = (animation.library as AnimationLibrary) || 'none';
  
  // Manejador para actualizar la configuración de animación
  const handleAnimationChange = (field: string, value: any) => {
    const updatedBlock = {
      ...block,
      animation: {
        ...animation,
        [field]: value
      }
    };
    onChange(updatedBlock);
  };

  // Manejador específico para cambiar la biblioteca
  const handleLibraryChange = (value: string) => {
    // Al cambiar la biblioteca, resetear el efecto si no es compatible
    const newLibrary = value as AnimationLibrary;
    let updatedAnimation = {
      ...animation,
      library: newLibrary
    };
    
    // Si la biblioteca es 'none', eliminar la animación
    if (newLibrary === 'none') {
      const { animation, ...rest } = block;
      onChange(rest);
      return;
    }
    
    // Si hay un efecto seleccionado, verificar compatibilidad
    if (animation.effect) {
      const effectType = getEffectType(animation.effect as string);
      const libraryEffects = effectsByLibrary[newLibrary];
      
      // Verificar si el tipo de efecto está disponible en la nueva biblioteca
      const effectAvailable = effectType && libraryEffects[effectType].includes(animation.effect as string);
      
      if (!effectAvailable) {
        // Si el efecto no está disponible, usar el primer efecto disponible
        const firstEffectType = Object.keys(libraryEffects).find(
          key => libraryEffects[key as keyof typeof libraryEffects].length > 0
        ) as keyof typeof libraryEffects;
        
        if (firstEffectType) {
          updatedAnimation.effect = libraryEffects[firstEffectType][0];
        } else {
          delete updatedAnimation.effect;
        }
      }
    }
    
    // Actualizar el bloque con la nueva animación
    const updatedBlock = {
      ...block,
      animation: updatedAnimation
    };
    
    onChange(updatedBlock);
  };

  /**
   * Obtiene el tipo de efecto (fade, slide, etc.) basado en el nombre del efecto
   */
  const getEffectType = (effect: string): keyof typeof effectsByLibrary[AnimationLibrary] | undefined => {
    for (const lib of Object.values(effectsByLibrary)) {
      for (const [type, effects] of Object.entries(lib)) {
        if (effects.includes(effect)) {
          return type as keyof typeof effectsByLibrary[AnimationLibrary];
        }
      }
    }
    return undefined;
  };

  // Obtener la lista de efectos disponibles para la biblioteca seleccionada
  const getAvailableEffects = () => {
    if (library === 'none') return [];
    
    const effects: string[] = [];
    const libraryEffects = effectsByLibrary[library];
    
    Object.keys(libraryEffects).forEach(categoryKey => {
      const category = categoryKey as keyof typeof libraryEffects;
      libraryEffects[category].forEach(effect => {
        effects.push(effect);
      });
    });
    
    return effects;
  };

  // No mostrar opciones si no hay animación configurada o es 'none'
  if (library === 'none' && !animation.effect) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="animation-library">Biblioteca de Animación</Label>
          <Select
            value={library}
            onValueChange={handleLibraryChange}
          >
            <SelectTrigger id="animation-library" className="w-[180px]">
              <SelectValue placeholder="Biblioteca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin animación</SelectItem>
              <SelectItem value="framer-motion">Framer Motion</SelectItem>
              <SelectItem value="react-spring">React Spring</SelectItem>
              <SelectItem value="gsap">GSAP</SelectItem>
              <SelectItem value="aos">AOS</SelectItem>
              <SelectItem value="lottie">Lottie</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  // Lista de efectos disponibles
  const availableEffects = getAvailableEffects();

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="animation-options">
        <AccordionTrigger>Opciones de Animación</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {/* Biblioteca de animación */}
            <div className="flex items-center justify-between">
              <Label htmlFor="animation-library">Biblioteca</Label>
              <Select
                value={library}
                onValueChange={handleLibraryChange}
              >
                <SelectTrigger id="animation-library" className="w-[180px]">
                  <SelectValue placeholder="Biblioteca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin animación</SelectItem>
                  <SelectItem value="framer-motion">Framer Motion</SelectItem>
                  <SelectItem value="react-spring">React Spring</SelectItem>
                  <SelectItem value="gsap">GSAP</SelectItem>
                  <SelectItem value="aos">AOS</SelectItem>
                  <SelectItem value="lottie">Lottie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Efecto */}
            <div className="flex items-center justify-between">
              <Label htmlFor="animation-effect">Efecto</Label>
              <Select
                value={animation.effect || 'none'}
                onValueChange={(value) => handleAnimationChange('effect', value)}
              >
                <SelectTrigger id="animation-effect" className="w-[180px]">
                  <SelectValue placeholder="Efecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  {availableEffects.map(effect => (
                    <SelectItem key={effect} value={effect}>
                      {effect}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duración */}
            <div className="flex items-center justify-between">
              <Label htmlFor="animation-duration">Duración</Label>
              <Select
                value={animation.duration?.toString() || 'normal'}
                onValueChange={(value) => handleAnimationChange('duration', value)}
              >
                <SelectTrigger id="animation-duration" className="w-[180px]">
                  <SelectValue placeholder="Duración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Rápida</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="slow">Lenta</SelectItem>
                  <SelectItem value="very-slow">Muy lenta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Retraso */}
            <div className="flex items-center justify-between">
              <Label htmlFor="animation-delay">Retraso</Label>
              <Select
                value={animation.delay?.toString() || 'none'}
                onValueChange={(value) => handleAnimationChange('delay', value)}
              >
                <SelectTrigger id="animation-delay" className="w-[180px]">
                  <SelectValue placeholder="Retraso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin retraso</SelectItem>
                  <SelectItem value="short">Corto</SelectItem>
                  <SelectItem value="medium">Medio</SelectItem>
                  <SelectItem value="long">Largo</SelectItem>
                  <SelectItem value="page-load">Carga de página</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Intensidad */}
            <div className="flex items-center justify-between">
              <Label htmlFor="animation-intensity">Intensidad</Label>
              <Input
                id="animation-intensity"
                type="number"
                min="0.1"
                max="3"
                step="0.1"
                className="w-[180px]"
                value={animation.intensity || 1}
                onChange={(e) => handleAnimationChange('intensity', parseFloat(e.target.value))}
              />
            </div>

            {/* Repeticiones */}
            <div className="flex items-center justify-between">
              <Label htmlFor="animation-repeat">Repeticiones</Label>
              <Input
                id="animation-repeat"
                type="number"
                min="-1"
                max="10"
                step="1"
                className="w-[180px]"
                value={animation.repeat || 0}
                onChange={(e) => handleAnimationChange('repeat', parseInt(e.target.value))}
              />
              <span className="text-xs text-muted-foreground ml-2">(-1 = infinito)</span>
            </div>

            {/* Animación en scroll */}
            <div className="flex items-center justify-between">
              <Label htmlFor="animation-scroll">Activar en scroll</Label>
              <Switch
                id="animation-scroll"
                checked={animation.scrollTrigger || false}
                onCheckedChange={(checked) => handleAnimationChange('scrollTrigger', checked)}
              />
            </div>

            {/* Dirección */}
            <div className="flex items-center justify-between">
              <Label htmlFor="animation-direction">Dirección</Label>
              <Select
                value={animation.direction || 'normal'}
                onValueChange={(value) => handleAnimationChange('direction', value)}
              >
                <SelectTrigger id="animation-direction" className="w-[180px]">
                  <SelectValue placeholder="Dirección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="reverse">Reversa</SelectItem>
                  <SelectItem value="alternate">Alternada</SelectItem>
                  <SelectItem value="alternate-reverse">Alternada inversa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aceleración */}
            <div className="flex items-center justify-between">
              <Label htmlFor="animation-easing">Aceleración</Label>
              <Select
                value={animation.easing || 'ease'}
                onValueChange={(value) => handleAnimationChange('easing', value)}
              >
                <SelectTrigger id="animation-easing" className="w-[180px]">
                  <SelectValue placeholder="Aceleración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Lineal</SelectItem>
                  <SelectItem value="ease">Ease</SelectItem>
                  <SelectItem value="ease-in">Ease In</SelectItem>
                  <SelectItem value="ease-out">Ease Out</SelectItem>
                  <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="bounce">Bounce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Umbral de visibilidad (solo para scroll) */}
            {animation.scrollTrigger && (
              <div className="flex items-center justify-between">
                <Label htmlFor="animation-threshold">Umbral de visibilidad</Label>
                <Input
                  id="animation-threshold"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-[180px]"
                  value={animation.threshold || 0.2}
                  onChange={(e) => handleAnimationChange('threshold', parseFloat(e.target.value))}
                />
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AnimationBlockOptions;