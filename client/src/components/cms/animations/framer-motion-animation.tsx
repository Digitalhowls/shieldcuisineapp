import React, { ReactNode, CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { 
  AnimationConfig, 
  AnimationEffect, 
  AnimationDirection, 
  AnimationEasing,
  AnimationDuration,
  AnimationDelay
} from './animation-config';
import { getFramerMotionProps } from './animation-utils';

/**
 * Propiedades para el componente de animación Framer Motion
 */
export interface FramerMotionAnimationProps {
  children: ReactNode;
  effect?: AnimationEffect;
  duration?: AnimationDuration;
  delay?: AnimationDelay;
  repeat?: number;
  threshold?: number;
  intensity?: number;
  direction?: AnimationDirection;
  easing?: AnimationEasing;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
  // Para animaciones activadas por scroll
  scrollTrigger?: boolean;
  viewportOnce?: boolean;
}

/**
 * Componente de animación que usa Framer Motion
 * 
 * Acepta una configuración de animación genérica y la transforma
 * en propiedades de Framer Motion.
 */
export const FramerMotionAnimation: React.FC<FramerMotionAnimationProps> = ({
  children,
  effect = 'none',
  duration = 'normal',
  delay = 'none',
  repeat = 0,
  threshold = 0.2,
  intensity = 1,
  direction = 'none',
  easing = 'ease',
  className = '',
  onClick,
  scrollTrigger = false,
  viewportOnce = true,
  ...props
}) => {
  // Si no hay efecto, simplemente mostrar los niños sin animación
  if (effect === 'none') {
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    );
  }
  
  // Convertir la configuración a propiedades de Framer Motion
  const motionProps = getFramerMotionProps({
    effect: effect as AnimationEffect,
    duration: duration as AnimationDuration,
    delay: delay as AnimationDelay,
    repeat,
    intensity,
    direction,
    easing
  });
  
  // Configurar opciones de viewport para scroll-triggered animations
  const viewportOptions = scrollTrigger ? {
    viewport: { 
      once: viewportOnce,
      amount: threshold
    }
  } : {};
  
  return (
    <motion.div
      className={className}
      onClick={onClick}
      {...motionProps}
      {...viewportOptions}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default FramerMotionAnimation;