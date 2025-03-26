import React, { ReactNode } from 'react';
import FramerAnimation from './framer-motion-animation';
import ReactSpringAnimation from './react-spring-animation';
import GSAPAnimation from './gsap-animation';
import AOSAnimation from './aos-animation';
import { AnimationConfig } from './animation-utils';

// Tipo de biblioteca de animación a utilizar
export type AnimationLibrary = 'framer-motion' | 'react-spring' | 'gsap' | 'aos' | 'none';

interface AnimationProps extends AnimationConfig {
  children: ReactNode;
  library?: AnimationLibrary;
  className?: string;
  onClick?: () => void;
  scrollTrigger?: boolean;
}

/**
 * Componente unificado de animación
 * 
 * Este componente permite utilizar diferentes bibliotecas de animación
 * a través de una interfaz común.
 * 
 * @example
 * <Animation
 *   library="framer-motion"
 *   effect="fadeIn"
 *   duration="normal"
 *   delay="small"
 * >
 *   <div>Contenido animado</div>
 * </Animation>
 */
export const Animation: React.FC<AnimationProps> = ({
  children,
  library = 'framer-motion',
  className = '',
  onClick,
  scrollTrigger = false,
  ...animationConfig
}) => {
  // Si no hay efecto o la librería es 'none', renderizar sin animación
  if (!animationConfig.effect || library === 'none') {
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    );
  }
  
  // Renderizar con la biblioteca seleccionada
  switch (library) {
    case 'framer-motion':
      return (
        <FramerAnimation
          className={className}
          onClick={onClick}
          viewportOnce={!animationConfig.repeat}
          {...animationConfig}
        >
          {children}
        </FramerAnimation>
      );
    
    case 'react-spring':
      return (
        <ReactSpringAnimation
          className={className}
          onClick={onClick}
          {...animationConfig}
        >
          {children}
        </ReactSpringAnimation>
      );
    
    case 'gsap':
      return (
        <GSAPAnimation
          className={className}
          onClick={onClick}
          runOnScroll={scrollTrigger}
          scrollTriggerThreshold={animationConfig.threshold || 0.2}
          {...animationConfig}
        >
          {children}
        </GSAPAnimation>
      );
    
    case 'aos':
      return (
        <AOSAnimation
          className={className}
          onClick={onClick}
          {...animationConfig}
        >
          {children}
        </AOSAnimation>
      );
    
    default:
      return (
        <div className={className} onClick={onClick}>
          {children}
        </div>
      );
  }
};

export default Animation;