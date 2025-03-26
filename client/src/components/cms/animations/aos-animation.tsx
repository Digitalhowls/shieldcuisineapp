import React, { ReactNode, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AnimationConfig, getAOSProps } from './animation-utils';

interface AOSAnimationProps extends AnimationConfig {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Componente de animación basado en AOS (Animate On Scroll)
 * 
 * Este componente permite aplicar fácilmente efectos de animación al hacer scroll
 * utilizando la biblioteca AOS.
 * 
 * @example
 * <AOSAnimation
 *   effect="fadeIn"
 *   duration="normal"
 *   delay="small"
 * >
 *   <div>Contenido animado al hacer scroll</div>
 * </AOSAnimation>
 */
export const AOSAnimation: React.FC<AOSAnimationProps> = ({
  children,
  className = '',
  onClick,
  ...animationConfig
}) => {
  // Inicializar AOS
  useEffect(() => {
    // Inicializar AOS solo una vez
    if (!document.body.hasAttribute('data-aos-initialized')) {
      AOS.init({
        // Opciones globales
        offset: 120,
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
      });
      
      document.body.setAttribute('data-aos-initialized', 'true');
    }
    
    // Actualizar AOS cuando cambian los hijos del componente
    AOS.refresh();
  }, [children]);
  
  // Obtener propiedades de AOS basadas en la configuración
  const aosProps = getAOSProps(animationConfig);
  
  return (
    <div
      className={className}
      onClick={onClick}
      {...aosProps}
    >
      {children}
    </div>
  );
};

export default AOSAnimation;