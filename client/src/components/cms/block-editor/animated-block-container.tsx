import React from 'react';
import Animation from '../animations/animation';
import { Block, AnimationOptions } from './types';
import { AnimationLibrary, AnimationConfig } from '../animations/animation-config';

// Extender el tipo Block para incluir animación
export interface AnimationData {
  config: AnimationConfig;
  library: AnimationLibrary;
}

export interface AnimatedBlock extends Block {
  animation?: AnimationData;
}

interface AnimatedBlockContainerProps {
  children: React.ReactNode;
  block: AnimatedBlock;
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
  // Determinar si hay animación configurada
  const hasAnimation = 
    block.animation && 
    block.animation.config && 
    block.animation.config.effect && 
    block.animation.library !== 'none';
  
  // Si hay animación y no estamos en modo edición, aplicar animación
  if (hasAnimation && !isEditing && block.animation) {
    return (
      <Animation 
        className={className}
        library={block.animation.library}
        effect={block.animation.config.effect}
        duration={block.animation.config.duration}
        delay={block.animation.config.delay}
        repeat={block.animation.config.repeat}
        threshold={block.animation.config.threshold}
        intensity={block.animation.config.intensity}
        direction={block.animation.config.direction}
        easing={block.animation.config.easing}
        scrollTrigger={block.animation.config.scrollTrigger}
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

export default AnimatedBlockContainer;