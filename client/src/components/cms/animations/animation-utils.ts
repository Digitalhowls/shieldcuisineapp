/**
 * Utilidades de animación para el CMS
 * 
 * Este archivo contiene tipos y utilidades para trabajar con diferentes bibliotecas
 * de animación en el CMS.
 */

// Tipos de efectos de animación disponibles
export type AnimationEffect = 
  // Efectos de entrada
  | 'fadeIn' 
  | 'slideInLeft' 
  | 'slideInRight' 
  | 'slideInUp' 
  | 'slideInDown' 
  | 'zoomIn' 
  | 'bounceIn'
  | 'flipInX'
  | 'flipInY'
  | 'rotateIn'
  
  // Efectos de atención
  | 'pulse' 
  | 'flash' 
  | 'rubberBand' 
  | 'shake' 
  | 'swing' 
  | 'tada' 
  | 'heartBeat'
  
  // Efectos hover
  | 'hoverGrow'
  | 'hoverShrink'
  | 'hoverRotate'
  | 'hoverBright'
  | 'hoverDarken'
  | 'hoverFloat'
  | 'hoverSink'
  
  // Efectos al hacer scroll
  | 'scrollFadeIn'
  | 'scrollSlideUp'
  | 'scrollZoomIn'
  | 'scrollBounce'
  | 'scrollRotate';

// Duración de las animaciones
export type AnimationDuration = 'fast' | 'normal' | 'slow' | 'verySlow';

// Retraso de las animaciones
export type AnimationDelay = 'none' | 'small' | 'medium' | 'large';

// Configuración de animación
export interface AnimationConfig {
  effect: AnimationEffect;
  duration?: AnimationDuration;
  delay?: AnimationDelay;
  repeat?: boolean;
  infinite?: boolean;
  threshold?: number; // para animaciones scroll, % visible del elemento para activar (0.0 - 1.0)
}

// Mapeo de duraciones a milisegundos
export const durationMap: Record<AnimationDuration, number> = {
  fast: 300,
  normal: 500,
  slow: 800,
  verySlow: 1200
};

// Mapeo de retrasos a milisegundos
export const delayMap: Record<AnimationDelay, number> = {
  none: 0,
  small: 150,
  medium: 300,
  large: 500
};

// Variables CSS para animaciones personalizadas
export const cssAnimationVariables = `
  :root {
    --animation-duration-fast: 300ms;
    --animation-duration-normal: 500ms;
    --animation-duration-slow: 800ms;
    --animation-duration-very-slow: 1200ms;
    
    --animation-delay-none: 0ms;
    --animation-delay-small: 150ms;
    --animation-delay-medium: 300ms;
    --animation-delay-large: 500ms;
    
    --animation-easing-linear: linear;
    --animation-easing-ease: ease;
    --animation-easing-ease-in: ease-in;
    --animation-easing-ease-out: ease-out;
    --animation-easing-ease-in-out: ease-in-out;
    --animation-easing-bounce: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
`;

// Función para convertir la configuración de animación a propiedades de Framer Motion
export function getFramerMotionProps(config: AnimationConfig) {
  const duration = config.duration ? durationMap[config.duration] : durationMap.normal;
  const delay = config.delay ? delayMap[config.delay] : delayMap.none;
  
  // Props básicos
  const baseProps = {
    initial: {},
    animate: {},
    whileHover: {},
    whileTap: {},
    transition: { 
      duration: duration / 1000, 
      delay: delay / 1000,
      repeat: config.infinite ? Infinity : (config.repeat ? 1 : 0)
    }
  };
  
  // Efectos de entrada
  if (config.effect === 'fadeIn') {
    baseProps.initial = { opacity: 0 };
    baseProps.animate = { opacity: 1 };
  } else if (config.effect === 'slideInLeft') {
    baseProps.initial = { opacity: 0, x: -100 };
    baseProps.animate = { opacity: 1, x: 0 };
  } else if (config.effect === 'slideInRight') {
    baseProps.initial = { opacity: 0, x: 100 };
    baseProps.animate = { opacity: 1, x: 0 };
  } else if (config.effect === 'slideInUp') {
    baseProps.initial = { opacity: 0, y: 100 };
    baseProps.animate = { opacity: 1, y: 0 };
  } else if (config.effect === 'slideInDown') {
    baseProps.initial = { opacity: 0, y: -100 };
    baseProps.animate = { opacity: 1, y: 0 };
  } else if (config.effect === 'zoomIn') {
    baseProps.initial = { opacity: 0, scale: 0.5 };
    baseProps.animate = { opacity: 1, scale: 1 };
  } else if (config.effect === 'bounceIn') {
    baseProps.initial = { opacity: 0, scale: 0.3 };
    baseProps.animate = { opacity: 1, scale: 1 };
    baseProps.transition = {
      ...baseProps.transition,
      type: 'spring',
      bounce: 0.5
    };
  } else if (config.effect === 'flipInX') {
    baseProps.initial = { opacity: 0, rotateX: 90 };
    baseProps.animate = { opacity: 1, rotateX: 0 };
  } else if (config.effect === 'flipInY') {
    baseProps.initial = { opacity: 0, rotateY: 90 };
    baseProps.animate = { opacity: 1, rotateY: 0 };
  } else if (config.effect === 'rotateIn') {
    baseProps.initial = { opacity: 0, rotate: -180 };
    baseProps.animate = { opacity: 1, rotate: 0 };
  }
  
  // Efectos de atención
  else if (config.effect === 'pulse') {
    baseProps.animate = { 
      scale: [1, 1.1, 1],
      transition: {
        duration: duration / 1000, 
        delay: delay / 1000,
        repeat: config.infinite ? Infinity : (config.repeat ? 1 : 0),
        times: [0, 0.5, 1]
      }
    };
  } else if (config.effect === 'flash') {
    baseProps.animate = { 
      opacity: [1, 0, 1, 0, 1],
      transition: {
        duration: duration / 1000, 
        delay: delay / 1000,
        repeat: config.infinite ? Infinity : (config.repeat ? 1 : 0),
        times: [0, 0.25, 0.5, 0.75, 1]
      }
    };
  } else if (config.effect === 'rubberBand') {
    baseProps.animate = { 
      scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1],
      scaleY: [1, 0.75, 1.25, 0.85, 1.05, 0.95, 1],
      transition: {
        duration: duration / 1000, 
        delay: delay / 1000,
        repeat: config.infinite ? Infinity : (config.repeat ? 1 : 0),
        times: [0, 0.3, 0.4, 0.5, 0.65, 0.75, 1]
      }
    };
  } else if (config.effect === 'shake') {
    baseProps.animate = { 
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: {
        duration: duration / 1000, 
        delay: delay / 1000,
        repeat: config.infinite ? Infinity : (config.repeat ? 1 : 0),
        times: [0, 0.1, 0.3, 0.5, 0.7, 0.8, 0.9, 1]
      }
    };
  } else if (config.effect === 'swing') {
    baseProps.animate = { 
      rotate: [0, 15, -10, 5, -5, 0],
      transition: {
        duration: duration / 1000, 
        delay: delay / 1000,
        repeat: config.infinite ? Infinity : (config.repeat ? 1 : 0),
        times: [0, 0.2, 0.4, 0.6, 0.8, 1]
      }
    };
  } else if (config.effect === 'tada') {
    baseProps.animate = { 
      scale: [1, 0.9, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1],
      rotate: [0, -3, -3, 3, -3, 3, -3, 3, -3, 0],
      transition: {
        duration: duration / 1000, 
        delay: delay / 1000,
        repeat: config.infinite ? Infinity : (config.repeat ? 1 : 0),
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
      }
    };
  } else if (config.effect === 'heartBeat') {
    baseProps.animate = { 
      scale: [1, 1.3, 1, 1.3, 1],
      transition: {
        duration: duration / 1000, 
        delay: delay / 1000,
        repeat: config.infinite ? Infinity : (config.repeat ? 1 : 0),
        times: [0, 0.14, 0.28, 0.42, 0.7]
      }
    };
  }
  
  // Efectos hover
  else if (config.effect === 'hoverGrow') {
    baseProps.whileHover = { scale: 1.05 };
  } else if (config.effect === 'hoverShrink') {
    baseProps.whileHover = { scale: 0.95 };
  } else if (config.effect === 'hoverRotate') {
    baseProps.whileHover = { rotate: 5 };
  } else if (config.effect === 'hoverBright') {
    baseProps.whileHover = { filter: 'brightness(1.2)' };
  } else if (config.effect === 'hoverDarken') {
    baseProps.whileHover = { filter: 'brightness(0.9)' };
  } else if (config.effect === 'hoverFloat') {
    baseProps.whileHover = { y: -5 };
  } else if (config.effect === 'hoverSink') {
    baseProps.whileHover = { y: 5 };
  }
  
  return baseProps;
}

// Función para convertir la configuración de animación a propiedades de React Spring
export function getReactSpringProps(config: AnimationConfig) {
  const duration = config.duration ? durationMap[config.duration] : durationMap.normal;
  const delay = config.delay ? delayMap[config.delay] : delayMap.none;
  
  // Props básicos
  const baseProps = {
    from: {},
    to: {},
    config: { 
      duration,
      tension: 170, 
      friction: 26,
    },
    delay
  };
  
  // Efectos de entrada
  if (config.effect === 'fadeIn') {
    baseProps.from = { opacity: 0 };
    baseProps.to = { opacity: 1 };
  } else if (config.effect === 'slideInLeft') {
    baseProps.from = { opacity: 0, x: -100 };
    baseProps.to = { opacity: 1, x: 0 };
  } else if (config.effect === 'slideInRight') {
    baseProps.from = { opacity: 0, x: 100 };
    baseProps.to = { opacity: 1, x: 0 };
  } else if (config.effect === 'slideInUp') {
    baseProps.from = { opacity: 0, y: 100 };
    baseProps.to = { opacity: 1, y: 0 };
  } else if (config.effect === 'slideInDown') {
    baseProps.from = { opacity: 0, y: -100 };
    baseProps.to = { opacity: 1, y: 0 };
  } else if (config.effect === 'zoomIn') {
    baseProps.from = { opacity: 0, scale: 0.5 };
    baseProps.to = { opacity: 1, scale: 1 };
  } else if (config.effect === 'bounceIn') {
    baseProps.from = { opacity: 0, scale: 0.3 };
    baseProps.to = { opacity: 1, scale: 1 };
    baseProps.config = {
      tension: 300,
      friction: 10
    };
  } else if (config.effect === 'flipInX') {
    baseProps.from = { opacity: 0, rotateX: 90 };
    baseProps.to = { opacity: 1, rotateX: 0 };
  } else if (config.effect === 'flipInY') {
    baseProps.from = { opacity: 0, rotateY: 90 };
    baseProps.to = { opacity: 1, rotateY: 0 };
  } else if (config.effect === 'rotateIn') {
    baseProps.from = { opacity: 0, rotate: -180 };
    baseProps.to = { opacity: 1, rotate: 0 };
  }
  
  return baseProps;
}

// Función para convertir la configuración de animación a propiedades AOS
export function getAOSProps(config: AnimationConfig) {
  const duration = config.duration ? durationMap[config.duration] : durationMap.normal;
  const delay = config.delay ? delayMap[config.delay] : delayMap.none;
  
  let aosEffect = 'fade-up'; // efecto por defecto
  
  // Mapeo de efectos a nombres de efectos AOS
  if (config.effect === 'fadeIn') {
    aosEffect = 'fade';
  } else if (config.effect === 'slideInLeft') {
    aosEffect = 'fade-right';
  } else if (config.effect === 'slideInRight') {
    aosEffect = 'fade-left';
  } else if (config.effect === 'slideInUp') {
    aosEffect = 'fade-up';
  } else if (config.effect === 'slideInDown') {
    aosEffect = 'fade-down';
  } else if (config.effect === 'zoomIn') {
    aosEffect = 'zoom-in';
  } else if (config.effect === 'flipInX') {
    aosEffect = 'flip-up';
  } else if (config.effect === 'flipInY') {
    aosEffect = 'flip-left';
  }
  
  // Configuración para AOS
  return {
    'data-aos': aosEffect,
    'data-aos-duration': duration,
    'data-aos-delay': delay,
    'data-aos-once': !config.repeat && !config.infinite,
    'data-aos-mirror': config.repeat || config.infinite,
    'data-aos-easing': 'ease-out-cubic'
  };
}

// Función para obtener clases CSS para animate.css
export function getAnimateCssClasses(config: AnimationConfig) {
  const duration = config.duration ? durationMap[config.duration] : durationMap.normal;
  const delay = config.delay ? delayMap[config.delay] : delayMap.none;
  
  let animateEffect = 'fadeIn'; // efecto por defecto
  
  // Mapeo de efectos a nombres de clases de animate.css
  if (config.effect === 'fadeIn') {
    animateEffect = 'fadeIn';
  } else if (config.effect === 'slideInLeft') {
    animateEffect = 'slideInLeft';
  } else if (config.effect === 'slideInRight') {
    animateEffect = 'slideInRight';
  } else if (config.effect === 'slideInUp') {
    animateEffect = 'slideInUp';
  } else if (config.effect === 'slideInDown') {
    animateEffect = 'slideInDown';
  } else if (config.effect === 'zoomIn') {
    animateEffect = 'zoomIn';
  } else if (config.effect === 'bounceIn') {
    animateEffect = 'bounceIn';
  } else if (config.effect === 'flipInX') {
    animateEffect = 'flipInX';
  } else if (config.effect === 'flipInY') {
    animateEffect = 'flipInY';
  } else if (config.effect === 'rotateIn') {
    animateEffect = 'rotateIn';
  } else if (config.effect === 'pulse') {
    animateEffect = 'pulse';
  } else if (config.effect === 'flash') {
    animateEffect = 'flash';
  } else if (config.effect === 'rubberBand') {
    animateEffect = 'rubberBand';
  } else if (config.effect === 'shake') {
    animateEffect = 'shake';
  } else if (config.effect === 'swing') {
    animateEffect = 'swing';
  } else if (config.effect === 'tada') {
    animateEffect = 'tada';
  } else if (config.effect === 'heartBeat') {
    animateEffect = 'heartBeat';
  }
  
  // Componer clases
  const classes = ['animate__animated', `animate__${animateEffect}`];
  
  // Duración
  if (config.duration === 'fast') {
    classes.push('animate__faster');
  } else if (config.duration === 'slow') {
    classes.push('animate__slow');
  } else if (config.duration === 'verySlow') {
    classes.push('animate__slower');
  }
  
  // Retraso se aplica con estilos inline
  
  // Repetición
  if (config.infinite) {
    classes.push('animate__infinite');
  }
  
  return {
    className: classes.join(' '),
    style: {
      animationDelay: `${delay}ms`
    }
  };
}

// Función para generar configuración de GSAP
export function getGSAPConfig(config: AnimationConfig) {
  const duration = config.duration ? durationMap[config.duration] / 1000 : durationMap.normal / 1000;
  const delay = config.delay ? delayMap[config.delay] / 1000 : delayMap.none / 1000;
  
  // Configuración básica
  const gsapConfig = {
    duration,
    delay,
    repeat: config.infinite ? -1 : (config.repeat ? 1 : 0),
    ease: "power2.out"
  };
  
  // Propiedades de animación
  let fromVars = {};
  let toVars = { ...gsapConfig };
  
  // Efectos de entrada
  if (config.effect === 'fadeIn') {
    fromVars = { opacity: 0 };
    toVars = { ...toVars, opacity: 1 };
  } else if (config.effect === 'slideInLeft') {
    fromVars = { opacity: 0, x: -100 };
    toVars = { ...toVars, opacity: 1, x: 0 };
  } else if (config.effect === 'slideInRight') {
    fromVars = { opacity: 0, x: 100 };
    toVars = { ...toVars, opacity: 1, x: 0 };
  } else if (config.effect === 'slideInUp') {
    fromVars = { opacity: 0, y: 100 };
    toVars = { ...toVars, opacity: 1, y: 0 };
  } else if (config.effect === 'slideInDown') {
    fromVars = { opacity: 0, y: -100 };
    toVars = { ...toVars, opacity: 1, y: 0 };
  } else if (config.effect === 'zoomIn') {
    fromVars = { opacity: 0, scale: 0.5 };
    toVars = { ...toVars, opacity: 1, scale: 1 };
  } else if (config.effect === 'bounceIn') {
    fromVars = { opacity: 0, scale: 0.3 };
    toVars = { ...toVars, opacity: 1, scale: 1, ease: "back.out(1.7)" };
  } else if (config.effect === 'flipInX') {
    fromVars = { opacity: 0, rotationX: 90, transformPerspective: 600 };
    toVars = { ...toVars, opacity: 1, rotationX: 0 };
  } else if (config.effect === 'flipInY') {
    fromVars = { opacity: 0, rotationY: 90, transformPerspective: 600 };
    toVars = { ...toVars, opacity: 1, rotationY: 0 };
  } else if (config.effect === 'rotateIn') {
    fromVars = { opacity: 0, rotation: -180, transformOrigin: "center center" };
    toVars = { ...toVars, opacity: 1, rotation: 0 };
  }
  
  return { fromVars, toVars };
}

// Lista de opciones agrupadas para menús desplegables en el editor de CMS
export const animationGroups = {
  entrada: [
    { value: 'fadeIn', label: 'Aparecer (Fade In)' },
    { value: 'slideInLeft', label: 'Deslizar desde izquierda' },
    { value: 'slideInRight', label: 'Deslizar desde derecha' },
    { value: 'slideInUp', label: 'Deslizar desde abajo' },
    { value: 'slideInDown', label: 'Deslizar desde arriba' },
    { value: 'zoomIn', label: 'Zoom In' },
    { value: 'bounceIn', label: 'Rebote' },
    { value: 'flipInX', label: 'Voltear horizontal' },
    { value: 'flipInY', label: 'Voltear vertical' },
    { value: 'rotateIn', label: 'Rotar' }
  ],
  atencion: [
    { value: 'pulse', label: 'Pulso' },
    { value: 'flash', label: 'Flash' },
    { value: 'rubberBand', label: 'Efecto goma' },
    { value: 'shake', label: 'Sacudir' },
    { value: 'swing', label: 'Balanceo' },
    { value: 'tada', label: 'Tada' },
    { value: 'heartBeat', label: 'Latido' }
  ],
  hover: [
    { value: 'hoverGrow', label: 'Crecer' },
    { value: 'hoverShrink', label: 'Encoger' },
    { value: 'hoverRotate', label: 'Rotar' },
    { value: 'hoverBright', label: 'Aclarar' },
    { value: 'hoverDarken', label: 'Oscurecer' },
    { value: 'hoverFloat', label: 'Flotar' },
    { value: 'hoverSink', label: 'Hundir' }
  ],
  scroll: [
    { value: 'scrollFadeIn', label: 'Aparecer al hacer scroll' },
    { value: 'scrollSlideUp', label: 'Deslizar hacia arriba al hacer scroll' },
    { value: 'scrollZoomIn', label: 'Zoom al hacer scroll' },
    { value: 'scrollBounce', label: 'Rebote al hacer scroll' },
    { value: 'scrollRotate', label: 'Rotar al hacer scroll' }
  ]
};

// Lista completa de efectos para el selector
export const animationOptions = [
  { value: 'none', label: 'Sin animación' },
  ...animationGroups.entrada,
  ...animationGroups.atencion,
  ...animationGroups.hover,
  ...animationGroups.scroll
];

// Opciones de duración
export const durationOptions = [
  { value: 'fast', label: 'Rápida (300ms)' },
  { value: 'normal', label: 'Normal (500ms)' },
  { value: 'slow', label: 'Lenta (800ms)' },
  { value: 'verySlow', label: 'Muy lenta (1200ms)' }
];

// Opciones de retraso
export const delayOptions = [
  { value: 'none', label: 'Sin retraso (0ms)' },
  { value: 'small', label: 'Pequeño (150ms)' },
  { value: 'medium', label: 'Medio (300ms)' },
  { value: 'large', label: 'Grande (500ms)' }
];