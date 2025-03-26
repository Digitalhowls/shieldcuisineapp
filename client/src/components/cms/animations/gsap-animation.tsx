import React, { ReactNode, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { AnimationConfig, getGSAPConfig } from './animation-utils';

interface GSAPAnimationProps extends AnimationConfig {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  runOnScroll?: boolean;
  scrollTriggerThreshold?: number; // 0.0 - 1.0, parte del elemento visible para activar
}

/**
 * Componente de animación basado en GSAP
 * 
 * Este componente permite aplicar fácilmente efectos de animación a cualquier 
 * elemento utilizando GSAP (GreenSock Animation Platform).
 * 
 * @example
 * <GSAPAnimation
 *   effect="fadeIn"
 *   duration="normal"
 *   delay="small"
 * >
 *   <div>Contenido animado</div>
 * </GSAPAnimation>
 */
export const GSAPAnimation: React.FC<GSAPAnimationProps> = ({
  children,
  className = '',
  onClick,
  runOnScroll = false,
  scrollTriggerThreshold = 0.2,
  ...animationConfig
}) => {
  // Referencia al elemento a animar
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Efecto para aplicar la animación
  useEffect(() => {
    if (!elementRef.current) return;
    
    // Obtener configuración GSAP
    const { fromVars, toVars } = getGSAPConfig(animationConfig);
    
    // Configurar animación
    if (!runOnScroll) {
      // Animación inmediata
      gsap.fromTo(elementRef.current, fromVars, toVars);
    } else {
      // Animación al hacer scroll
      // Nota: ScrollTrigger es un plugin adicional de GSAP
      // Si no está disponible, se usa un observador de intersección
      if ('ScrollTrigger' in gsap) {
        gsap.fromTo(elementRef.current, fromVars, {
          ...toVars,
          scrollTrigger: {
            trigger: elementRef.current,
            start: `top ${scrollTriggerThreshold * 100}%`,
            toggleActions: 'play none none none'
          }
        });
      } else {
        // Alternativa con Intersection Observer
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                gsap.fromTo(elementRef.current, fromVars, toVars);
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: scrollTriggerThreshold }
        );
        
        observer.observe(elementRef.current);
        
        // Limpiar observador
        return () => {
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        };
      }
    }
  }, [animationConfig, runOnScroll, scrollTriggerThreshold]);
  
  return (
    <div
      ref={elementRef}
      className={className}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GSAPAnimation;