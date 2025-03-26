import React, { ReactNode } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { AnimationConfig, getReactSpringProps } from './animation-utils';

interface ReactSpringAnimationProps extends AnimationConfig {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Componente de animación basado en React Spring
 * 
 * Este componente permite aplicar fácilmente efectos de animación a cualquier 
 * elemento utilizando React Spring.
 * 
 * @example
 * <ReactSpringAnimation
 *   effect="fadeIn"
 *   duration="normal"
 *   delay="small"
 * >
 *   <div>Contenido animado</div>
 * </ReactSpringAnimation>
 */
export const ReactSpringAnimation: React.FC<ReactSpringAnimationProps> = ({
  children,
  className = '',
  onClick,
  ...animationConfig
}) => {
  // Obtener propiedades para React Spring basadas en la configuración
  const springProps = getReactSpringProps(animationConfig);
  
  // Configurar la animación
  const animation = useSpring(springProps);
  
  return (
    <animated.div
      className={className}
      style={animation}
      onClick={onClick}
    >
      {children}
    </animated.div>
  );
};

export default ReactSpringAnimation;