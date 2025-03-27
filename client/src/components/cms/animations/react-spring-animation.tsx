import React, { ReactNode, CSSProperties } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { 
  AnimationConfig, 
  AnimationEffect, 
  AnimationDirection, 
  AnimationEasing,
  AnimationDuration,
  AnimationDelay
} from './animation-config';
import { getReactSpringProps } from './animation-utils';

/**
 * Propiedades para el componente de animación React Spring
 */
export interface ReactSpringAnimationProps {
  children: ReactNode;
  effect?: AnimationEffect;
  duration?: AnimationDuration;
  delay?: AnimationDelay;
  repeat?: number;
  intensity?: number;
  direction?: AnimationDirection;
  easing?: AnimationEasing;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

/**
 * Componente de animación que usa React Spring
 * 
 * Acepta una configuración de animación genérica y la transforma
 * en propiedades de React Spring.
 */
export const ReactSpringAnimation: React.FC<ReactSpringAnimationProps> = ({
  children,
  effect = 'none',
  duration = 'normal',
  delay = 'none',
  repeat = 0,
  intensity = 1,
  direction = 'none',
  easing = 'ease',
  className = '',
  onClick,
  style,
  ...props
}) => {
  // Si no hay efecto, simplemente mostrar los niños sin animación
  if (effect === 'none') {
    return (
      <div className={className} onClick={onClick} style={style}>
        {children}
      </div>
    );
  }
  
  // Configurar la animación
  const springProps = getReactSpringProps({
    effect,
    duration,
    delay,
    repeat,
    intensity,
    direction,
    easing,
    threshold: 0 // React Spring no usa threshold directamente
  });
  
  // Crear la animación
  const animation = useSpring(springProps);
  
  return (
    <animated.div
      className={className}
      onClick={onClick}
      style={{
        ...style,
        ...animation
      }}
      {...props}
    >
      {children}
    </animated.div>
  );
};

export default ReactSpringAnimation;