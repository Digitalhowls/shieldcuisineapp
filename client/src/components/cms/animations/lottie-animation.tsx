import React, { ReactNode, CSSProperties } from 'react';
import Lottie from 'lottie-react';
import { AnimationConfig } from './animation-config';

/**
 * Propiedades para el componente de animación Lottie
 */
export interface LottieAnimationProps {
  children?: ReactNode;
  animationData: any;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
  onComplete?: () => void;
}

/**
 * Componente para reproducir animaciones Lottie
 * 
 * Este componente es diferente a los demás porque en lugar de animar sus hijos,
 * muestra una animación Lottie, opcionalmente con hijos superpuestos.
 */
export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  children,
  animationData,
  loop = true,
  autoplay = true,
  speed = 1,
  style,
  className = '',
  onClick,
  onComplete,
  ...props
}) => {
  if (!animationData) {
    return (
      <div className={className} onClick={onClick} style={style} {...props}>
        {children || <div>No animation data provided</div>}
      </div>
    );
  }
  
  return (
    <div 
      className={`relative ${className}`} 
      onClick={onClick} 
      style={{ ...style, position: 'relative' }}
    >
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay} 
        // En lottie-react la velocidad se llama "speed"
        speed={speed}
        style={style}
        className={className}
        onClick={onClick}
        onComplete={onComplete}
      />
      {children && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {children}
        </div>
      )}
    </div>
  );
};

export default LottieAnimation;