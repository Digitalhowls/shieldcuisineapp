import React from 'react';
import Lottie from 'lottie-react';

interface LottieAnimationProps {
  animationData: any;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  onClick?: () => void;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

/**
 * Componente para mostrar animaciones Lottie
 * 
 * Este componente permite incorporar animaciones Lottie fácilmente.
 * 
 * @example
 * <LottieAnimation
 *   animationData={animationData}
 *   loop={true}
 *   autoplay={true}
 * />
 */
export const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  className = '',
  loop = true,
  autoplay = true,
  speed = 1,
  onClick,
  width,
  height,
  style = {}
}) => {
  // Estilos combinados
  const combinedStyle: React.CSSProperties = {
    width: width,
    height: height,
    ...style
  };
  
  return (
    <div className={className} onClick={onClick}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        speed={speed}
        style={combinedStyle}
      />
    </div>
  );
};

export default LottieAnimation;