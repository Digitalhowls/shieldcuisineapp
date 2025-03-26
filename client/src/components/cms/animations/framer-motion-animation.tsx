import React, { ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { AnimationConfig, getFramerMotionProps } from './animation-utils';

interface FramerMotionAnimationProps extends AnimationConfig {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  viewportOnce?: boolean;
}

/**
 * Componente de animación basado en Framer Motion
 * 
 * Este componente permite aplicar fácilmente efectos de animación a cualquier 
 * elemento utilizando Framer Motion.
 * 
 * @example
 * <FramerMotionAnimation
 *   effect="fadeIn"
 *   duration="normal"
 *   delay="small"
 * >
 *   <div>Contenido animado</div>
 * </FramerMotionAnimation>
 */
export const FramerMotionAnimation: React.FC<FramerMotionAnimationProps> = ({
  children,
  className = '',
  onClick,
  viewportOnce = true,
  ...animationConfig
}) => {
  // Referencia para animaciones basadas en scroll
  const ref = React.useRef(null);
  const isInView = useInView(ref, {
    once: viewportOnce,
    amount: animationConfig.threshold || 0.2
  });
  
  // Obtener propiedades para Framer Motion basadas en la configuración
  const motionProps = getFramerMotionProps(animationConfig);
  
  // Detectar si es un efecto basado en scroll
  const isScrollEffect = animationConfig.effect?.startsWith('scroll');
  
  // Si es un efecto de scroll, aplicar animación cuando esté en vista
  if (isScrollEffect) {
    // Mapear efectos de scroll a efectos normales
    const scrollToNormalEffect = (effect: string) => {
      return effect.replace('scroll', 'fade') as any;
    };
    
    // Obtener propiedades para el efecto convertido
    const scrollMotionProps = getFramerMotionProps({
      ...animationConfig,
      effect: scrollToNormalEffect(animationConfig.effect || '')
    });
    
    return (
      <motion.div
        ref={ref}
        className={className}
        onClick={onClick}
        initial={scrollMotionProps.initial}
        animate={isInView ? scrollMotionProps.animate : scrollMotionProps.initial}
        transition={scrollMotionProps.transition}
      >
        {children}
      </motion.div>
    );
  }
  
  // Para efectos hover, aplicar whileHover
  const isHoverEffect = animationConfig.effect?.startsWith('hover');
  
  if (isHoverEffect) {
    return (
      <motion.div
        className={className}
        onClick={onClick}
        whileHover={motionProps.whileHover}
        whileTap={motionProps.whileTap}
        transition={motionProps.transition}
      >
        {children}
      </motion.div>
    );
  }
  
  // Para efectos normales
  return (
    <motion.div
      className={className}
      onClick={onClick}
      initial={motionProps.initial}
      animate={motionProps.animate}
      transition={motionProps.transition}
    >
      {children}
    </motion.div>
  );
};

export default FramerMotionAnimation;