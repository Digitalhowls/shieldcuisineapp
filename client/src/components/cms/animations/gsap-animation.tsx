import React, { ReactNode, CSSProperties, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  AnimationConfig, 
  AnimationEffect, 
  AnimationDirection, 
  AnimationEasing,
  AnimationDuration,
  AnimationDelay
} from './animation-config';
import { getGsapProps } from './animation-utils';

// Registrar ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

/**
 * Propiedades para el componente de animación GSAP
 */
export interface GSAPAnimationProps {
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
  runOnScroll?: boolean;
  scrollTriggerThreshold?: number;
}

/**
 * Componente de animación que usa GSAP
 * 
 * Acepta una configuración de animación genérica y la transforma
 * en propiedades de GSAP.
 */
export const GSAPAnimation: React.FC<GSAPAnimationProps> = ({
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
  style,
  runOnScroll = false,
  scrollTriggerThreshold = 0.2,
  ...props
}) => {
  // Referencia al elemento DOM
  const elementRef = useRef<HTMLDivElement>(null);
  const gsapContextRef = useRef<gsap.Context | null>(null);
  
  // Si no hay efecto, simplemente mostrar los niños sin animación
  if (effect === 'none') {
    return (
      <div className={className} onClick={onClick} style={style} {...props}>
        {children}
      </div>
    );
  }
  
  // Configurar y ejecutar la animación cuando el componente se monta
  useEffect(() => {
    // Limpiar cualquier contexto GSAP anterior
    if (gsapContextRef.current) {
      gsapContextRef.current.revert();
      gsapContextRef.current = null;
    }
    
    // Referencia al elemento DOM
    const element = elementRef.current;
    if (!element) return;
    
    // Obtener las propiedades GSAP
    const gsapProps = getGsapProps({
      effect,
      duration,
      delay,
      repeat,
      threshold,
      intensity,
      direction,
      easing
    });
    
    // Crear un nuevo contexto GSAP
    gsapContextRef.current = gsap.context(() => {
      // Configurar la animación
      if (runOnScroll) {
        // Animación con ScrollTrigger
        gsap.fromTo(
          element,
          gsapProps.from || {},
          {
            ...gsapProps.to,
            scrollTrigger: {
              trigger: element,
              start: `top ${scrollTriggerThreshold * 100}%`,
              toggleActions: 'play none none none'
            }
          }
        );
      } else {
        // Animación normal
        gsap.fromTo(
          element,
          gsapProps.from || {},
          {
            ...gsapProps.to,
            duration: gsapProps.duration,
            delay: gsapProps.delay,
            repeat: gsapProps.repeat,
            yoyo: gsapProps.yoyo,
            ease: gsapProps.ease
          }
        );
      }
    });
    
    // Limpieza
    return () => {
      if (gsapContextRef.current) {
        gsapContextRef.current.revert();
      }
    };
  }, [effect, duration, delay, repeat, intensity, direction, easing, runOnScroll, scrollTriggerThreshold]);
  
  return (
    <div
      ref={elementRef}
      className={className}
      onClick={onClick}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

export default GSAPAnimation;