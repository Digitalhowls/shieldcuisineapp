// Tipo para la biblioteca de animación
export type AnimationLibrary = 'framer-motion' | 'react-spring' | 'gsap' | 'aos' | 'none';

// Tipo para los efectos de animación
export type AnimationEffect = 
  // Efectos de entrada
  | 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight'
  | 'zoomIn' | 'zoomInUp' | 'zoomInDown'
  | 'slideIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight'
  | 'rotateIn' | 'rotateInX' | 'rotateInY'
  
  // Efectos de atención
  | 'bounce' | 'pulse' | 'flash' | 'shake' | 'tada' | 'rubberBand' | 'jello'
  
  // Efectos de hover
  | 'hoverPulse' | 'hoverBounce' | 'hoverGrow' | 'hoverShrink'
  | 'hoverRotate' | 'hoverSpin' | 'hoverFlip'
  
  // Efectos de scroll
  | 'scrollFadeIn' | 'scrollFadeUp' | 'scrollFadeDown' | 'scrollZoomIn' 
  | 'scrollZoomOut' | 'scrollSlideUp' | 'scrollSlideDown' | 'scrollRotate';

// Duración de la animación
export type AnimationDuration = 'fast' | 'normal' | 'slow' | 'verySlow';

// Retraso de la animación
export type AnimationDelay = 'none' | 'small' | 'medium' | 'large';

// Configuración de la animación
export interface AnimationConfig {
  effect?: AnimationEffect;
  duration?: AnimationDuration;
  delay?: AnimationDelay;
  repeat?: boolean;
  infinite?: boolean;
  threshold?: number; // 0.0 - 1.0 para animaciones basadas en scroll
}

// Opciones de duración con etiquetas
export const durationOptions = [
  { value: 'fast', label: 'Rápido (300ms)' },
  { value: 'normal', label: 'Normal (500ms)' },
  { value: 'slow', label: 'Lento (800ms)' },
  { value: 'verySlow', label: 'Muy lento (1200ms)' }
];

// Opciones de retraso con etiquetas
export const delayOptions = [
  { value: 'none', label: 'Sin retraso' },
  { value: 'small', label: 'Pequeño (100ms)' },
  { value: 'medium', label: 'Medio (300ms)' },
  { value: 'large', label: 'Grande (500ms)' }
];

// Grupos de efectos de animación
export const animationGroups = {
  entrada: [
    { value: 'fadeIn', label: 'Aparecer' },
    { value: 'fadeInUp', label: 'Aparecer desde abajo' },
    { value: 'fadeInDown', label: 'Aparecer desde arriba' },
    { value: 'fadeInLeft', label: 'Aparecer desde izquierda' },
    { value: 'fadeInRight', label: 'Aparecer desde derecha' },
    { value: 'zoomIn', label: 'Zoom in' },
    { value: 'zoomInUp', label: 'Zoom in desde abajo' },
    { value: 'zoomInDown', label: 'Zoom in desde arriba' },
    { value: 'slideIn', label: 'Deslizar' },
    { value: 'slideInUp', label: 'Deslizar desde abajo' },
    { value: 'slideInDown', label: 'Deslizar desde arriba' },
    { value: 'slideInLeft', label: 'Deslizar desde izquierda' },
    { value: 'slideInRight', label: 'Deslizar desde derecha' },
    { value: 'rotateIn', label: 'Rotar' },
    { value: 'rotateInX', label: 'Rotar en X' },
    { value: 'rotateInY', label: 'Rotar en Y' }
  ],
  atencion: [
    { value: 'bounce', label: 'Rebote' },
    { value: 'pulse', label: 'Pulso' },
    { value: 'flash', label: 'Flash' },
    { value: 'shake', label: 'Agitar' },
    { value: 'tada', label: 'Tada' },
    { value: 'rubberBand', label: 'Elástico' },
    { value: 'jello', label: 'Gelatina' }
  ],
  hover: [
    { value: 'hoverPulse', label: 'Pulso' },
    { value: 'hoverBounce', label: 'Rebote' },
    { value: 'hoverGrow', label: 'Crecer' },
    { value: 'hoverShrink', label: 'Reducir' },
    { value: 'hoverRotate', label: 'Rotar' },
    { value: 'hoverSpin', label: 'Girar' },
    { value: 'hoverFlip', label: 'Voltear' }
  ],
  scroll: [
    { value: 'scrollFadeIn', label: 'Aparecer' },
    { value: 'scrollFadeUp', label: 'Aparecer desde abajo' },
    { value: 'scrollFadeDown', label: 'Aparecer desde arriba' },
    { value: 'scrollZoomIn', label: 'Zoom in' },
    { value: 'scrollZoomOut', label: 'Zoom out' },
    { value: 'scrollSlideUp', label: 'Deslizar hacia arriba' },
    { value: 'scrollSlideDown', label: 'Deslizar hacia abajo' },
    { value: 'scrollRotate', label: 'Rotar' }
  ]
};

// Duración en milisegundos
export function getDurationMs(duration?: AnimationDuration): number {
  switch (duration) {
    case 'fast': return 300;
    case 'normal': return 500;
    case 'slow': return 800;
    case 'verySlow': return 1200;
    default: return 500;
  }
}

// Retraso en milisegundos
export function getDelayMs(delay?: AnimationDelay): number {
  switch (delay) {
    case 'small': return 100;
    case 'medium': return 300;
    case 'large': return 500;
    default: return 0;
  }
}

// Convertir configuración a propiedades para Framer Motion
export function getFramerMotionProps(config: AnimationConfig): any {
  const { effect, duration, delay, repeat, infinite } = config;
  const durationMs = getDurationMs(duration);
  const delayMs = getDelayMs(delay);
  
  // Configuración base
  const baseProps = {
    initial: {},
    animate: {},
    transition: {
      duration: durationMs / 1000,
      delay: delayMs / 1000,
      repeat: infinite ? Infinity : (repeat ? 1 : 0),
      ease: 'easeOut'
    },
    whileHover: {},
    whileTap: {}
  };
  
  // Aplicar efecto específico
  switch (effect) {
    // Efectos de entrada
    case 'fadeIn':
      baseProps.initial = { opacity: 0 };
      baseProps.animate = { opacity: 1 };
      break;
      
    case 'fadeInUp':
      baseProps.initial = { opacity: 0, y: 50 };
      baseProps.animate = { opacity: 1, y: 0 };
      break;
      
    case 'fadeInDown':
      baseProps.initial = { opacity: 0, y: -50 };
      baseProps.animate = { opacity: 1, y: 0 };
      break;
      
    case 'fadeInLeft':
      baseProps.initial = { opacity: 0, x: -50 };
      baseProps.animate = { opacity: 1, x: 0 };
      break;
      
    case 'fadeInRight':
      baseProps.initial = { opacity: 0, x: 50 };
      baseProps.animate = { opacity: 1, x: 0 };
      break;
      
    case 'zoomIn':
      baseProps.initial = { opacity: 0, scale: 0.8 };
      baseProps.animate = { opacity: 1, scale: 1 };
      break;
      
    case 'zoomInUp':
      baseProps.initial = { opacity: 0, scale: 0.8, y: 50 };
      baseProps.animate = { opacity: 1, scale: 1, y: 0 };
      break;
      
    case 'zoomInDown':
      baseProps.initial = { opacity: 0, scale: 0.8, y: -50 };
      baseProps.animate = { opacity: 1, scale: 1, y: 0 };
      break;
      
    case 'slideIn':
      baseProps.initial = { x: -100, opacity: 0 };
      baseProps.animate = { x: 0, opacity: 1 };
      break;
      
    case 'slideInUp':
      baseProps.initial = { y: 100, opacity: 0 };
      baseProps.animate = { y: 0, opacity: 1 };
      break;
      
    case 'slideInDown':
      baseProps.initial = { y: -100, opacity: 0 };
      baseProps.animate = { y: 0, opacity: 1 };
      break;
      
    case 'slideInLeft':
      baseProps.initial = { x: -100, opacity: 0 };
      baseProps.animate = { x: 0, opacity: 1 };
      break;
      
    case 'slideInRight':
      baseProps.initial = { x: 100, opacity: 0 };
      baseProps.animate = { x: 0, opacity: 1 };
      break;
      
    case 'rotateIn':
      baseProps.initial = { rotate: -90, opacity: 0 };
      baseProps.animate = { rotate: 0, opacity: 1 };
      break;
      
    case 'rotateInX':
      baseProps.initial = { rotateX: -90, opacity: 0 };
      baseProps.animate = { rotateX: 0, opacity: 1 };
      break;
      
    case 'rotateInY':
      baseProps.initial = { rotateY: -90, opacity: 0 };
      baseProps.animate = { rotateY: 0, opacity: 1 };
      break;
    
    // Efectos de atención
    case 'bounce':
      baseProps.animate = { y: [0, -15, 0] };
      baseProps.transition = {
        ...baseProps.transition,
        repeat: infinite ? Infinity : repeat ? 3 : 1,
        repeatType: 'mirror',
        ease: 'easeInOut'
      };
      break;
      
    case 'pulse':
      baseProps.animate = { scale: [1, 1.05, 1] };
      baseProps.transition = {
        ...baseProps.transition,
        repeat: infinite ? Infinity : repeat ? 3 : 1,
        repeatType: 'mirror',
        ease: 'easeInOut'
      };
      break;
      
    case 'flash':
      baseProps.animate = { opacity: [1, 0, 1, 0, 1] };
      baseProps.transition = {
        ...baseProps.transition,
        repeat: infinite ? Infinity : repeat ? 2 : 1,
        ease: 'easeInOut'
      };
      break;
      
    case 'shake':
      baseProps.animate = { x: [0, -10, 10, -10, 10, -5, 5, 0] };
      baseProps.transition = {
        ...baseProps.transition,
        repeat: infinite ? Infinity : repeat ? 1 : 0,
        ease: 'easeInOut'
      };
      break;
      
    case 'tada':
      baseProps.animate = {
        scale: [1, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1],
        rotate: [0, -3, 3, -3, 3, -3, 3, -3, 0]
      };
      baseProps.transition = {
        ...baseProps.transition,
        repeat: infinite ? Infinity : repeat ? 1 : 0,
        ease: 'easeInOut'
      };
      break;
      
    case 'rubberBand':
      baseProps.animate = {
        scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1]
      };
      baseProps.transition = {
        ...baseProps.transition,
        repeat: infinite ? Infinity : repeat ? 1 : 0,
        ease: 'easeInOut'
      };
      break;
      
    case 'jello':
      baseProps.animate = {
        rotate: [0, 0, -5, 3, -3, 2, -1, 1, 0]
      };
      baseProps.transition = {
        ...baseProps.transition,
        repeat: infinite ? Infinity : repeat ? 1 : 0,
        ease: 'easeInOut'
      };
      break;
      
    // Efectos de hover
    case 'hoverPulse':
      baseProps.whileHover = { scale: 1.05 };
      break;
      
    case 'hoverBounce':
      baseProps.whileHover = { y: -10 };
      break;
      
    case 'hoverGrow':
      baseProps.whileHover = { scale: 1.1 };
      break;
      
    case 'hoverShrink':
      baseProps.whileHover = { scale: 0.95 };
      break;
      
    case 'hoverRotate':
      baseProps.whileHover = { rotate: 5 };
      break;
      
    case 'hoverSpin':
      baseProps.whileHover = { rotate: 360, transition: { duration: 0.5 } };
      break;
      
    case 'hoverFlip':
      baseProps.whileHover = { rotateY: 180, transition: { duration: 0.5 } };
      break;
      
    // Efectos de scroll (se manejan de forma especial con useInView)
    case 'scrollFadeIn':
    case 'scrollFadeUp':
    case 'scrollFadeDown':
    case 'scrollZoomIn':
    case 'scrollZoomOut':
    case 'scrollSlideUp':
    case 'scrollSlideDown':
    case 'scrollRotate':
      // Para estos efectos, la animación se configura en el componente
      // usando useInView, por lo que retornamos los props base
      break;
      
    default:
      // Sin efecto, no aplicar animación
      break;
  }
  
  return baseProps;
}

// Convertir configuración a propiedades para React Spring
export function getReactSpringProps(config: AnimationConfig): any {
  const { effect, duration, delay, repeat, infinite } = config;
  const durationMs = getDurationMs(duration);
  const delayMs = getDelayMs(delay);
  
  // Configuración base
  const baseProps: any = {
    from: {},
    to: {},
    config: {
      tension: 170,
      friction: 20,
      duration: durationMs
    },
    delay: delayMs,
    loop: infinite ? true : (repeat ? { reverse: true } : false)
  };
  
  // Aplicar efecto específico
  switch (effect) {
    // Efectos de entrada
    case 'fadeIn':
      baseProps.from = { opacity: 0 };
      baseProps.to = { opacity: 1 };
      break;
      
    case 'fadeInUp':
      baseProps.from = { opacity: 0, transform: 'translateY(50px)' };
      baseProps.to = { opacity: 1, transform: 'translateY(0px)' };
      break;
      
    case 'fadeInDown':
      baseProps.from = { opacity: 0, transform: 'translateY(-50px)' };
      baseProps.to = { opacity: 1, transform: 'translateY(0px)' };
      break;
      
    case 'fadeInLeft':
      baseProps.from = { opacity: 0, transform: 'translateX(-50px)' };
      baseProps.to = { opacity: 1, transform: 'translateX(0px)' };
      break;
      
    case 'fadeInRight':
      baseProps.from = { opacity: 0, transform: 'translateX(50px)' };
      baseProps.to = { opacity: 1, transform: 'translateX(0px)' };
      break;
      
    case 'zoomIn':
      baseProps.from = { opacity: 0, transform: 'scale(0.8)' };
      baseProps.to = { opacity: 1, transform: 'scale(1)' };
      break;
      
    case 'zoomInUp':
      baseProps.from = { opacity: 0, transform: 'translateY(50px) scale(0.8)' };
      baseProps.to = { opacity: 1, transform: 'translateY(0px) scale(1)' };
      break;
      
    case 'zoomInDown':
      baseProps.from = { opacity: 0, transform: 'translateY(-50px) scale(0.8)' };
      baseProps.to = { opacity: 1, transform: 'translateY(0px) scale(1)' };
      break;
      
    // Efectos de atención
    case 'bounce':
      baseProps.from = { transform: 'translateY(0px)' };
      baseProps.to = { transform: 'translateY(-15px)' };
      baseProps.loop = { reverse: true };
      break;
      
    case 'pulse':
      baseProps.from = { transform: 'scale(1)' };
      baseProps.to = { transform: 'scale(1.05)' };
      baseProps.loop = { reverse: true };
      break;
      
    // Aplicar configuraciones para otros efectos...
    
    default:
      // Sin efecto, no aplicar animación
      break;
  }
  
  return baseProps;
}

// Convertir configuración a propiedades para GSAP
export function getGSAPConfig(config: AnimationConfig): any {
  const { effect, duration, delay, repeat, infinite } = config;
  const durationMs = getDurationMs(duration);
  const delayMs = getDelayMs(delay);
  
  // Configuración base
  const fromVars: any = {};
  const toVars: any = {
    duration: durationMs / 1000,
    delay: delayMs / 1000,
    repeat: infinite ? -1 : (repeat ? 1 : 0),
    ease: 'power2.out'
  };
  
  // Aplicar efecto específico
  switch (effect) {
    // Efectos de entrada
    case 'fadeIn':
      fromVars.opacity = 0;
      toVars.opacity = 1;
      break;
      
    case 'fadeInUp':
      fromVars.opacity = 0;
      fromVars.y = 50;
      toVars.opacity = 1;
      toVars.y = 0;
      break;
      
    case 'fadeInDown':
      fromVars.opacity = 0;
      fromVars.y = -50;
      toVars.opacity = 1;
      toVars.y = 0;
      break;
      
    case 'fadeInLeft':
      fromVars.opacity = 0;
      fromVars.x = -50;
      toVars.opacity = 1;
      toVars.x = 0;
      break;
      
    case 'fadeInRight':
      fromVars.opacity = 0;
      fromVars.x = 50;
      toVars.opacity = 1;
      toVars.x = 0;
      break;
      
    // Efectos de atención
    case 'bounce':
      fromVars.y = 0;
      toVars.y = -15;
      toVars.yoyo = true;
      break;
      
    case 'pulse':
      fromVars.scale = 1;
      toVars.scale = 1.05;
      toVars.yoyo = true;
      break;
      
    // Aplicar configuraciones para otros efectos...
    
    default:
      // Sin efecto, no aplicar animación
      break;
  }
  
  return { fromVars, toVars };
}

// Convertir configuración a propiedades para AOS
export function getAOSProps(config: AnimationConfig): any {
  const { effect, duration, delay } = config;
  const durationMs = getDurationMs(duration);
  const delayMs = getDelayMs(delay);
  
  // Configuración base
  const aosProps: any = {
    'data-aos-duration': durationMs,
    'data-aos-delay': delayMs,
    'data-aos-once': !config.repeat
  };
  
  // Convertir efecto a formato AOS
  switch (effect) {
    // Efectos de entrada
    case 'fadeIn':
      aosProps['data-aos'] = 'fade';
      break;
      
    case 'fadeInUp':
      aosProps['data-aos'] = 'fade-up';
      break;
      
    case 'fadeInDown':
      aosProps['data-aos'] = 'fade-down';
      break;
      
    case 'fadeInLeft':
      aosProps['data-aos'] = 'fade-left';
      break;
      
    case 'fadeInRight':
      aosProps['data-aos'] = 'fade-right';
      break;
      
    case 'zoomIn':
      aosProps['data-aos'] = 'zoom-in';
      break;
      
    case 'zoomInUp':
      aosProps['data-aos'] = 'zoom-in-up';
      break;
      
    case 'zoomInDown':
      aosProps['data-aos'] = 'zoom-in-down';
      break;
      
    case 'slideInUp':
      aosProps['data-aos'] = 'slide-up';
      break;
      
    case 'slideInDown':
      aosProps['data-aos'] = 'slide-down';
      break;
      
    case 'slideInLeft':
      aosProps['data-aos'] = 'slide-left';
      break;
      
    case 'slideInRight':
      aosProps['data-aos'] = 'slide-right';
      break;
      
    // AOS no tiene equivalentes directos para algunos efectos
    // En esos casos usamos efectos similares
    
    default:
      aosProps['data-aos'] = 'fade'; // Valor por defecto
      break;
  }
  
  return aosProps;
}