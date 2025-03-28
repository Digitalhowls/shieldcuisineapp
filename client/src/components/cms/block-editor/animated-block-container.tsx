import React from 'react';
import Animation from '../animations/animation';
import { Block, AnimationOptions } from './types';
import { 
  AnimationLibrary, 
  AnimationConfig,
  AnimationEffect,
  AnimationDuration,
  AnimationDelay,
  AnimationDirection,
  AnimationEasing,
  defaultAnimationConfig
} from '../animations/animation-config';

/**
 * Estructura de datos para la animación en los bloques
 * Esto extiende AnimationOptions para usar tipos más específicos
 */
export interface AnimationData {
  config: AnimationConfig;
  library: AnimationLibrary;
}

/**
 * Convertir de AnimationOptions (tipo general usado en Block)
 * a AnimationData (tipo específico con tipos estrictos)
 */
function convertAnimationOptions(options?: AnimationOptions): AnimationData | undefined {
  if (!options) return undefined;
  
  return {
    library: (options.library as AnimationLibrary) || defaultAnimationConfig.library,
    config: {
      effect: (options.effect as AnimationEffect) || defaultAnimationConfig.effect,
      duration: (options.duration as AnimationDuration) || defaultAnimationConfig.duration,
      delay: (options.delay as AnimationDelay) || defaultAnimationConfig.delay,
      repeat: options.repeat ?? defaultAnimationConfig.repeat,
      threshold: options.threshold ?? defaultAnimationConfig.threshold,
      intensity: options.intensity ?? defaultAnimationConfig.intensity,
      direction: (options.direction as AnimationDirection) || defaultAnimationConfig.direction,
      easing: (options.easing as AnimationEasing) || defaultAnimationConfig.easing,
      scrollTrigger: options.scrollTrigger ?? defaultAnimationConfig.scrollTrigger,
      library: (options.library as AnimationLibrary) || defaultAnimationConfig.library
    }
  };
}

interface AnimatedBlockContainerProps {
  children: React.ReactNode;
  block: Block;  // Ahora usamos el tipo Block original
  className?: string;
  isEditing?: boolean;
}

/**
 * Contenedor de bloque con soporte para animaciones
 * 
 * Este componente envuelve los bloques del editor con la animación
 * configurada por el usuario.
 */
export const AnimatedBlockContainer: React.FC<AnimatedBlockContainerProps> = ({
  children,
  block,
  className = '',
  isEditing = false
}) => {
  // Convertir las opciones de animación al formato con tipado estricto
  const animationData = convertAnimationOptions(block.animation);
  
  // Determinar si hay animación configurada
  const hasAnimation = 
    animationData && 
    animationData.config && 
    animationData.config.effect !== 'none' && 
    animationData.library !== 'none';
  
  // Si hay animación y no estamos en modo edición, aplicar animación
  if (hasAnimation && !isEditing && animationData) {
    return (
      <Animation 
        className={className}
        library={animationData.library}
        effect={animationData.config.effect}
        duration={animationData.config.duration}
        delay={animationData.config.delay}
        repeat={animationData.config.repeat}
        threshold={animationData.config.threshold}
        intensity={animationData.config.intensity}
        direction={animationData.config.direction}
        easing={animationData.config.easing}
        scrollTrigger={animationData.config.scrollTrigger}
      >
        {children}
      </Animation>
    );
  }
  
  // Sin animación o en modo edición, renderizar normalmente
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Mantiene la exportación por defecto para compatibilidad con código existente
export default AnimatedBlockContainer;