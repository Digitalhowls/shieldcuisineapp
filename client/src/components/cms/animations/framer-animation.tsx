import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AnimationConfig } from './animation-config';
import { getFramerMotionConfig } from './animation-utils';

interface FramerAnimationProps extends AnimationConfig {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  viewportOnce?: boolean;
  style?: React.CSSProperties;
}

/**
 * Componente de animación usando Framer Motion
 * 
 * Este componente aplica animaciones con la biblioteca Framer Motion,
 * convertiendo la configuración unificada a la sintaxis específica de Framer.
 */
export const FramerAnimation: React.FC<FramerAnimationProps> = ({
  children,
  className = '',
  onClick,
  effect,
  duration,
  delay,
  repeat,
  threshold,
  intensity,
  direction,
  easing,
  viewportOnce = true,
  style
}) => {
  // Obtener configuración específica para Framer Motion
  const animationConfig = getFramerMotionConfig({
    effect,
    duration,
    delay,
    repeat,
    threshold,
    intensity,
    direction,
    easing
  });

  // Configurar parámetros de visualización
  const viewportOptions = {
    once: viewportOnce,
    amount: threshold || 0.2
  };

  return (
    <motion.div
      className={className}
      onClick={onClick}
      initial={animationConfig.initial}
      animate={animationConfig.animate}
      exit={animationConfig.exit}
      transition={animationConfig.transition}
      whileHover={animationConfig.whileHover}
      whileTap={animationConfig.whileTap}
      whileInView={animationConfig.whileInView}
      viewport={viewportOptions}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default FramerAnimation;