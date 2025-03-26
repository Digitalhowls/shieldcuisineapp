import React, { ReactNode, CSSProperties, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AnimationConfig, AnimationEffect, AnimationDirection, AnimationEasing } from './animation-config';
import { getAosProps } from './animation-utils';

// Inicializar AOS
let aosInitialized = false;

/**
 * Propiedades para el componente de animación AOS
 */
export interface AOSAnimationProps {
  children: ReactNode;
  effect?: AnimationEffect;
  duration?: string | number;
  delay?: string | number;
  repeat?: number;
  direction?: AnimationDirection;
  easing?: AnimationEasing;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

/**
 * Componente de animación que usa AOS
 * 
 * Acepta una configuración de animación genérica y la transforma
 * en propiedades de AOS.
 */
export const AOSAnimation: React.FC<AOSAnimationProps> = ({
  children,
  effect = 'none',
  duration = 'normal',
  delay = 'none',
  repeat = 0,
  direction = 'none',
  easing = 'ease',
  className = '',
  onClick,
  style,
  ...props
}) => {
  // Inicializar AOS si no está inicializado
  useEffect(() => {
    if (!aosInitialized) {
      AOS.init({
        disable: false,
        startEvent: 'DOMContentLoaded',
        initClassName: 'aos-init',
        animatedClassName: 'aos-animate',
        useClassNames: false,
        disableMutationObserver: false,
        debounceDelay: 50,
        throttleDelay: 99,
        offset: 120,
        delay: 0,
        duration: 400,
        easing: 'ease',
        once: false,
        mirror: false,
        anchorPlacement: 'top-bottom'
      });
      aosInitialized = true;
    }
    
    // Refrescar AOS cuando el componente se monta
    AOS.refresh();
  }, []);
  
  // Si no hay efecto, simplemente mostrar los niños sin animación
  if (effect === 'none') {
    return (
      <div className={className} onClick={onClick} style={style} {...props}>
        {children}
      </div>
    );
  }
  
  // Obtener propiedades AOS
  const aosProps = getAosProps({
    effect,
    duration,
    delay,
    repeat,
    intensity: 1, // AOS no maneja intensidad directamente
    direction,
    easing,
    threshold: 0.2 // Valor por defecto
  });
  
  return (
    <div
      className={className}
      onClick={onClick}
      style={style}
      {...aosProps}
      {...props}
    >
      {children}
    </div>
  );
};

export default AOSAnimation;