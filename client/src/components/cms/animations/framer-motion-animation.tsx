import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AnimationConfig, getFramerMotionProps } from './animation-utils';

interface FramerAnimationProps extends AnimationConfig {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
  onClick?: () => void;
  viewportOnce?: boolean;
  viewportMargin?: string;
}

/**
 * Componente de animación basado en Framer Motion
 * 
 * Este componente permite aplicar fácilmente efectos de animación a cualquier 
 * elemento utilizando Framer Motion.
 * 
 * @example
 * <FramerAnimation
 *   effect="fadeIn"
 *   duration="normal"
 *   delay="small"
 * >
 *   <div>Contenido animado</div>
 * </FramerAnimation>
 */
export const FramerAnimation: React.FC<FramerAnimationProps> = ({
  children,
  className = '',
  as = 'div',
  onClick,
  viewportOnce = true,
  viewportMargin = '-100px',
  ...animationConfig
}) => {
  // Obtener propiedades para Framer Motion basadas en la configuración
  const motionProps = getFramerMotionProps(animationConfig);
  
  // Si es una animación al hacer scroll, usar viewport
  const isScrollAnimation = animationConfig.effect?.startsWith('scroll');
  const viewportProps = isScrollAnimation ? {
    viewport: {
      once: viewportOnce,
      margin: viewportMargin,
    }
  } : {};
  
  return (
    <motion.div
      className={className}
      onClick={onClick}
      {...motionProps}
      {...viewportProps}
    >
      {children}
    </motion.div>
  );
};

export default FramerAnimation;