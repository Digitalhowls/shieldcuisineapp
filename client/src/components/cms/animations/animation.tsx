import React, { ReactNode, CSSProperties } from 'react';
import { 
  AnimationConfig, 
  AnimationEffect, 
  AnimationLibrary, 
  AnimationDirection, 
  AnimationEasing, 
  AnimationDuration, 
  AnimationDelay,
  defaultAnimationConfig
} from './animation-config';
import FramerMotionAnimation from './framer-motion-animation';
import ReactSpringAnimation from './react-spring-animation';
import GSAPAnimation from './gsap-animation';
import AOSAnimation from './aos-animation';
import LottieAnimation from './lottie-animation';

/**
 * Propiedades para el componente Animation
 */
export interface AnimationProps {
  children: ReactNode;
  // Configuración de animación
  config?: Partial<AnimationConfig>;
  // Biblioteca a utilizar
  library?: AnimationLibrary;
  // Clases CSS adicionales
  className?: string;
  // Función a ejecutar al hacer clic
  onClick?: () => void;
  // Estilos adicionales
  style?: CSSProperties;
}

/**
 * Componente Animation
 * 
 * Este componente es un wrapper para todas las bibliotecas de animación,
 * seleccionando automáticamente el componente adecuado según la configuración.
 */
export const Animation: React.FC<AnimationProps> = ({
  children,
  config = defaultAnimationConfig,
  library,
  className = '',
  onClick,
  style
}) => {
  // Biblioteca a utilizar (preferencia por la específica, luego la de config)
  const animationLibrary = library || config.library || 'framer-motion';
  
  // Si no hay biblioteca o es 'none', simplemente renderizar los hijos sin animación
  if (animationLibrary === 'none') {
    return (
      <div className={className} onClick={onClick} style={style}>
        {children}
      </div>
    );
  }
  
  // Render del componente según la biblioteca seleccionada
  switch (animationLibrary) {
    case 'framer-motion':
      return (
        <FramerMotionAnimation
          effect={config.effect}
          duration={config.duration}
          delay={config.delay}
          repeat={config.repeat}
          threshold={config.threshold}
          intensity={config.intensity}
          direction={config.direction}
          easing={config.easing}
          viewportOnce={!config.scrollTrigger} // Invertir la lógica para framer-motion
          className={className}
          onClick={onClick}
          style={style}
        >
          {children}
        </FramerMotionAnimation>
      );
    
    case 'react-spring':
      return (
        <ReactSpringAnimation
          effect={config.effect}
          duration={config.duration}
          delay={config.delay}
          repeat={config.repeat}
          intensity={config.intensity}
          direction={config.direction}
          easing={config.easing}
          className={className}
          onClick={onClick}
          style={style}
        >
          {children}
        </ReactSpringAnimation>
      );
    
    case 'gsap':
      return (
        <GSAPAnimation
          effect={config.effect}
          duration={config.duration}
          delay={config.delay}
          repeat={config.repeat}
          threshold={config.threshold}
          intensity={config.intensity}
          direction={config.direction}
          easing={config.easing}
          runOnScroll={config.scrollTrigger}
          scrollTriggerThreshold={config.threshold}
          className={className}
          onClick={onClick}
          style={style}
        >
          {children}
        </GSAPAnimation>
      );
    
    case 'aos':
      return (
        <AOSAnimation
          effect={config.effect}
          duration={config.duration}
          delay={config.delay}
          repeat={config.repeat}
          direction={config.direction}
          easing={config.easing}
          className={className}
          onClick={onClick}
          style={style}
        >
          {children}
        </AOSAnimation>
      );
    
    case 'lottie':
      // Asegurarse de que existe la configuración necesaria para Lottie
      if (!config.lottieAnimation) {
        return (
          <div className={className} onClick={onClick} style={style}>
            {children || <div>No Lottie animation provided</div>}
          </div>
        );
      }
      
      return (
        <LottieAnimation
          animationData={config.lottieAnimation}
          loop={config.repeat === -1 || config.repeat > 0}
          autoplay={true}
          speed={1.0} // Velocidad estándar
          className={className}
          onClick={onClick}
          style={style}
        >
          {children}
        </LottieAnimation>
      );
    
    default:
      // Fallback a Framer Motion si la biblioteca especificada no existe
      return (
        <FramerMotionAnimation
          effect={config.effect}
          duration={config.duration}
          delay={config.delay}
          repeat={config.repeat}
          threshold={config.threshold}
          intensity={config.intensity}
          direction={config.direction}
          easing={config.easing}
          viewportOnce={!config.scrollTrigger}
          className={className}
          onClick={onClick}
          style={style}
        >
          {children}
        </FramerMotionAnimation>
      );
  }
};

export default Animation;