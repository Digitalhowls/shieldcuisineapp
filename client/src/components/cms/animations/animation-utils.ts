import { 
  AnimationConfig, 
  AnimationEffect, 
  AnimationLibrary,
  AnimationDirection,
  AnimationEasing,
  AnimationDuration,
  AnimationDelay,
  getDurationValue,
  getDelayValue
} from './animation-config';

/**
 * Transformar configuración genérica a propiedades específicas de Framer Motion
 */
export function getFramerMotionProps(config: Partial<AnimationConfig>) {
  const {
    effect = 'none',
    duration = 'normal',
    delay = 'none',
    repeat = 0,
    intensity = 1,
    direction = 'none',
    easing = 'ease'
  } = config;
  
  // Valores default
  const result: any = {
    initial: {},
    animate: {},
    transition: {
      duration: getDurationValue(duration) / 1000, // Convertir ms a segundos
      delay: getDelayValue(delay) / 1000,
      repeat: repeat,
      ease: convertEasingToFramerMotion(easing)
    }
  };
  
  // Aplicar configuración de dirección
  if (direction === 'reverse') {
    const temp = result.initial;
    result.initial = result.animate;
    result.animate = temp;
  } else if (direction === 'alternate') {
    result.transition.yoyo = true;
  } else if (direction === 'alternate-reverse') {
    result.transition.yoyo = true;
    const temp = result.initial;
    result.initial = result.animate;
    result.animate = temp;
  }
  
  // Configurar animación según el efecto
  switch (effect) {
    case 'fadeIn':
      result.initial = { opacity: 0 };
      result.animate = { opacity: 1 };
      break;
    case 'fadeOut':
      result.initial = { opacity: 1 };
      result.animate = { opacity: 0 };
      break;
    case 'fadeInUp':
      result.initial = { opacity: 0, y: 20 * intensity };
      result.animate = { opacity: 1, y: 0 };
      break;
    case 'fadeInDown':
      result.initial = { opacity: 0, y: -20 * intensity };
      result.animate = { opacity: 1, y: 0 };
      break;
    case 'fadeInLeft':
      result.initial = { opacity: 0, x: -20 * intensity };
      result.animate = { opacity: 1, x: 0 };
      break;
    case 'fadeInRight':
      result.initial = { opacity: 0, x: 20 * intensity };
      result.animate = { opacity: 1, x: 0 };
      break;
    case 'slideInUp':
      result.initial = { y: 50 * intensity };
      result.animate = { y: 0 };
      break;
    case 'slideInDown':
      result.initial = { y: -50 * intensity };
      result.animate = { y: 0 };
      break;
    case 'slideInLeft':
      result.initial = { x: -50 * intensity };
      result.animate = { x: 0 };
      break;
    case 'slideInRight':
      result.initial = { x: 50 * intensity };
      result.animate = { x: 0 };
      break;
    case 'zoomIn':
      result.initial = { scale: 0.8 };
      result.animate = { scale: 1 };
      break;
    case 'zoomOut':
      result.initial = { scale: 1.2 };
      result.animate = { scale: 1 };
      break;
    case 'zoomInUp':
      result.initial = { scale: 0.8, y: 20 * intensity };
      result.animate = { scale: 1, y: 0 };
      break;
    case 'zoomInDown':
      result.initial = { scale: 0.8, y: -20 * intensity };
      result.animate = { scale: 1, y: 0 };
      break;
    case 'pulse':
      result.animate = { scale: [1, 1.05 * intensity, 1] };
      result.transition.times = [0, 0.5, 1];
      break;
    case 'bounce':
      result.animate = { y: [0, -10 * intensity, 0] };
      result.transition.times = [0, 0.5, 1];
      break;
    case 'shake':
      result.animate = { x: [0, -5 * intensity, 5 * intensity, -5 * intensity, 0] };
      result.transition.times = [0, 0.25, 0.5, 0.75, 1];
      break;
    case 'flipX':
      result.initial = { rotateX: 90 };
      result.animate = { rotateX: 0 };
      break;
    case 'flipY':
      result.initial = { rotateY: 90 };
      result.animate = { rotateY: 0 };
      break;
    case 'rotate':
      result.initial = { rotate: -90 };
      result.animate = { rotate: 0 };
      break;
    case 'none':
    default:
      result.initial = {};
      result.animate = {};
      break;
  }
  
  return result;
}

/**
 * Transformar configuración genérica a propiedades específicas de React Spring
 */
export function getReactSpringProps(config: Partial<AnimationConfig>) {
  const {
    effect = 'none',
    duration = 'normal',
    delay = 'none',
    repeat = 0,
    intensity = 1,
    direction = 'none',
    easing = 'ease'
  } = config;
  
  // Valores default
  const result: any = {
    from: {},
    to: {},
    config: {
      duration: getDurationValue(duration),
      delay: getDelayValue(delay),
      easing: convertEasingToReactSpring(easing)
    },
    reset: repeat > 0,
    loop: repeat === -1 || repeat > 0 ? true : false,
    reverse: direction === 'reverse' || direction === 'alternate-reverse'
  };
  
  // Configurar animación según el efecto
  switch (effect) {
    case 'fadeIn':
      result.from = { opacity: 0 };
      result.to = { opacity: 1 };
      break;
    case 'fadeOut':
      result.from = { opacity: 1 };
      result.to = { opacity: 0 };
      break;
    case 'fadeInUp':
      result.from = { opacity: 0, transform: `translateY(${20 * intensity}px)` };
      result.to = { opacity: 1, transform: 'translateY(0px)' };
      break;
    case 'fadeInDown':
      result.from = { opacity: 0, transform: `translateY(${-20 * intensity}px)` };
      result.to = { opacity: 1, transform: 'translateY(0px)' };
      break;
    case 'fadeInLeft':
      result.from = { opacity: 0, transform: `translateX(${-20 * intensity}px)` };
      result.to = { opacity: 1, transform: 'translateX(0px)' };
      break;
    case 'fadeInRight':
      result.from = { opacity: 0, transform: `translateX(${20 * intensity}px)` };
      result.to = { opacity: 1, transform: 'translateX(0px)' };
      break;
    case 'slideInUp':
      result.from = { transform: `translateY(${50 * intensity}px)` };
      result.to = { transform: 'translateY(0px)' };
      break;
    case 'slideInDown':
      result.from = { transform: `translateY(${-50 * intensity}px)` };
      result.to = { transform: 'translateY(0px)' };
      break;
    case 'slideInLeft':
      result.from = { transform: `translateX(${-50 * intensity}px)` };
      result.to = { transform: 'translateX(0px)' };
      break;
    case 'slideInRight':
      result.from = { transform: `translateX(${50 * intensity}px)` };
      result.to = { transform: 'translateX(0px)' };
      break;
    case 'zoomIn':
      result.from = { transform: 'scale(0.8)' };
      result.to = { transform: 'scale(1)' };
      break;
    case 'zoomOut':
      result.from = { transform: 'scale(1.2)' };
      result.to = { transform: 'scale(1)' };
      break;
    case 'pulse':
      result.from = { transform: 'scale(1)' };
      result.to = { transform: `scale(${1 + 0.05 * intensity})` };
      result.loop = { reverse: true };
      break;
    case 'bounce':
      result.from = { transform: 'translateY(0px)' };
      result.to = { transform: `translateY(${-10 * intensity}px)` };
      result.loop = { reverse: true };
      break;
    case 'flipX':
      result.from = { transform: 'rotateX(90deg)' };
      result.to = { transform: 'rotateX(0deg)' };
      break;
    case 'flipY':
      result.from = { transform: 'rotateY(90deg)' };
      result.to = { transform: 'rotateY(0deg)' };
      break;
    case 'rotate':
      result.from = { transform: 'rotate(-90deg)' };
      result.to = { transform: 'rotate(0deg)' };
      break;
    case 'none':
    default:
      result.from = {};
      result.to = {};
      break;
  }
  
  return result;
}

/**
 * Transformar configuración genérica a propiedades específicas de GSAP
 */
export function getGsapProps(config: Partial<AnimationConfig>) {
  const {
    effect = 'none',
    duration = 'normal',
    delay = 'none',
    repeat = 0,
    intensity = 1,
    direction = 'none',
    easing = 'ease'
  } = config;
  
  // Valores default
  const result: any = {
    from: {},
    to: {},
    duration: getDurationValue(duration) / 1000, // Convertir ms a segundos
    delay: getDelayValue(delay) / 1000,
    repeat: repeat,
    yoyo: direction === 'alternate' || direction === 'alternate-reverse',
    ease: convertEasingToGsap(easing)
  };
  
  // Configurar animación según el efecto
  switch (effect) {
    case 'fadeIn':
      result.from = { opacity: 0 };
      result.to = { opacity: 1 };
      break;
    case 'fadeOut':
      result.from = { opacity: 1 };
      result.to = { opacity: 0 };
      break;
    case 'fadeInUp':
      result.from = { opacity: 0, y: 20 * intensity };
      result.to = { opacity: 1, y: 0 };
      break;
    case 'fadeInDown':
      result.from = { opacity: 0, y: -20 * intensity };
      result.to = { opacity: 1, y: 0 };
      break;
    case 'fadeInLeft':
      result.from = { opacity: 0, x: -20 * intensity };
      result.to = { opacity: 1, x: 0 };
      break;
    case 'fadeInRight':
      result.from = { opacity: 0, x: 20 * intensity };
      result.to = { opacity: 1, x: 0 };
      break;
    case 'slideInUp':
      result.from = { y: 50 * intensity };
      result.to = { y: 0 };
      break;
    case 'slideInDown':
      result.from = { y: -50 * intensity };
      result.to = { y: 0 };
      break;
    case 'slideInLeft':
      result.from = { x: -50 * intensity };
      result.to = { x: 0 };
      break;
    case 'slideInRight':
      result.from = { x: 50 * intensity };
      result.to = { x: 0 };
      break;
    case 'zoomIn':
      result.from = { scale: 0.8 };
      result.to = { scale: 1 };
      break;
    case 'zoomOut':
      result.from = { scale: 1.2 };
      result.to = { scale: 1 };
      break;
    case 'zoomInUp':
      result.from = { scale: 0.8, y: 20 * intensity };
      result.to = { scale: 1, y: 0 };
      break;
    case 'zoomInDown':
      result.from = { scale: 0.8, y: -20 * intensity };
      result.to = { scale: 1, y: 0 };
      break;
    case 'pulse':
      result.from = { scale: 1 };
      result.to = { scale: 1 + 0.05 * intensity, repeat: 1, yoyo: true };
      break;
    case 'bounce':
      result.from = { y: 0 };
      result.to = { y: -10 * intensity, repeat: 1, yoyo: true };
      break;
    case 'shake':
      result.from = { x: 0 };
      result.to = { x: 5 * intensity, repeat: 2, yoyo: true };
      break;
    case 'flipX':
      result.from = { rotationX: 90 };
      result.to = { rotationX: 0 };
      break;
    case 'flipY':
      result.from = { rotationY: 90 };
      result.to = { rotationY: 0 };
      break;
    case 'rotate':
      result.from = { rotation: -90 };
      result.to = { rotation: 0 };
      break;
    case 'none':
    default:
      result.from = {};
      result.to = {};
      break;
  }
  
  return result;
}

/**
 * Transformar configuración genérica a propiedades específicas de AOS
 */
export function getAosProps(config: Partial<AnimationConfig>) {
  const {
    effect = 'none',
    duration = 'normal',
    delay = 'none',
    repeat = 0,
    direction = 'none',
    easing = 'ease'
  } = config;
  
  const result: any = {
    'data-aos': convertEffectToAOS(effect)
  };
  
  if (duration !== 'normal') {
    result['data-aos-duration'] = getDurationValue(duration);
  }
  
  if (delay !== 'none') {
    result['data-aos-delay'] = getDelayValue(delay);
  }
  
  if (easing !== 'ease') {
    result['data-aos-easing'] = convertEasingToAOS(easing);
  }
  
  if (repeat > 0 || repeat === -1) {
    result['data-aos-once'] = false;
  }
  
  return result;
}

/**
 * Funciones auxiliares para conversión entre formatos
 */

function convertEasingToFramerMotion(easing: AnimationEasing): any {
  switch (easing) {
    case 'linear': return [0, 0, 1, 1];
    case 'ease': return [0.25, 0.1, 0.25, 1];
    case 'ease-in': return [0.42, 0, 1, 1];
    case 'ease-out': return [0, 0, 0.58, 1];
    case 'ease-in-out': return [0.42, 0, 0.58, 1];
    case 'spring': return 'spring';
    case 'bounce': return 'backOut';
    default: return [0.25, 0.1, 0.25, 1]; // ease
  }
}

function convertEasingToReactSpring(easing: AnimationEasing): any {
  switch (easing) {
    case 'linear': return 'linear';
    case 'ease': return 'easeInOut';
    case 'ease-in': return 'easeIn';
    case 'ease-out': return 'easeOut';
    case 'ease-in-out': return 'easeInOut';
    case 'spring': return 'spring';
    case 'bounce': return 'bounce';
    default: return 'easeInOut'; // ease
  }
}

function convertEasingToGsap(easing: AnimationEasing): string {
  switch (easing) {
    case 'linear': return 'none';
    case 'ease': return 'power1.out';
    case 'ease-in': return 'power2.in';
    case 'ease-out': return 'power2.out';
    case 'ease-in-out': return 'power2.inOut';
    case 'spring': return 'elastic.out(1, 0.3)';
    case 'bounce': return 'bounce.out';
    default: return 'power1.out'; // ease
  }
}

function convertEasingToAOS(easing: AnimationEasing): string {
  switch (easing) {
    case 'linear': return 'linear';
    case 'ease': return 'ease';
    case 'ease-in': return 'ease-in';
    case 'ease-out': return 'ease-out';
    case 'ease-in-out': return 'ease-in-out';
    case 'spring': return 'ease-out-back';
    case 'bounce': return 'ease-out-back';
    default: return 'ease';
  }
}

function convertEffectToAOS(effect: AnimationEffect): string {
  // Mapear los efectos genéricos a los efectos específicos de AOS
  switch (effect) {
    case 'none': return '';
    case 'fadeIn': return 'fade-up';
    case 'fadeOut': return 'fade-down';
    case 'fadeInUp': return 'fade-up';
    case 'fadeInDown': return 'fade-down';
    case 'fadeInLeft': return 'fade-right';
    case 'fadeInRight': return 'fade-left';
    case 'slideInUp': return 'slide-up';
    case 'slideInDown': return 'slide-down';
    case 'slideInLeft': return 'slide-right';
    case 'slideInRight': return 'slide-left';
    case 'zoomIn': return 'zoom-in';
    case 'zoomOut': return 'zoom-out';
    case 'zoomInUp': return 'zoom-in-up';
    case 'zoomInDown': return 'zoom-in-down';
    case 'flipX': return 'flip-up';
    case 'flipY': return 'flip-left';
    case 'rotate': return 'flip-left';
    default: return 'fade';
  }
}