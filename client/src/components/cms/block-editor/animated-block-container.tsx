import React from 'react';
import { AnimationConfig } from '../animations/animation-utils';
import Animation from '../animations/animation';
import { Block } from './types';

// Tipo para la biblioteca de animación
type AnimationLibrary = 'framer-motion' | 'react-spring' | 'gsap' | 'aos' | 'none';

// Extender el tipo Block para incluir animación
export interface AnimatedBlock extends Block {
  animation?: {
    config: AnimationConfig;
    library: AnimationLibrary;
  };
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
  if (hasAnimation && !isEditing) {
    return (
      <Animation
        library={block.animation.library}
        {...block.animation.config}
        className={className}
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