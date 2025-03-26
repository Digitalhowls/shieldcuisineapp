/**
 * Definición de tipos para la configuración de animaciones
 */

// Bibliotecas de animación soportadas
export type AnimationLibrary = 'framer-motion' | 'react-spring' | 'gsap' | 'aos' | 'lottie' | 'none';

// Categorías de efectos de animación
export interface AnimationEffects {
  fade: string[];
  slide: string[];
  zoom: string[];
  attention: string[];
  transform: string[];
}

// Efectos específicos de animación
export type AnimationEffect =
  | 'none'
  | 'fadeIn'
  | 'fadeOut'
  | 'fadeInUp'
  | 'fadeInDown'
  | 'fadeInLeft'
  | 'fadeInRight'
  | 'slideInUp'
  | 'slideInDown'
  | 'slideInLeft'
  | 'slideInRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'zoomInUp'
  | 'zoomInDown'
  | 'pulse'
  | 'bounce'
  | 'shake'
  | 'flipX'
  | 'flipY'
  | 'rotate';

// Opciones de duración predefinidas
export type AnimationDuration =
  | 'none'
  | 'fast'
  | 'normal'
  | 'slow'
  | 'very-slow'
  | number;

// Opciones de retardo predefinidas
export type AnimationDelay =
  | 'none'
  | 'short'
  | 'medium'
  | 'long'
  | 'page-load'
  | number;

// Opciones de dirección para efectos
export type AnimationDirection =
  | 'none'
  | 'normal'
  | 'reverse'
  | 'alternate'
  | 'alternate-reverse';

// Opciones de funciones de aceleración
export type AnimationEasing =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'
  | 'bounce';

/**
 * Configuración genérica de animación
 * Esta interfaz se utiliza para configurar animaciones independientemente
 * de la biblioteca específica utilizada.
 */
export interface AnimationConfig {
  // Efecto visual a aplicar
  effect: AnimationEffect;
  
  // Duración de la animación
  duration: AnimationDuration;
  
  // Retardo antes de iniciar la animación
  delay: AnimationDelay;
  
  // Número de veces que se repite la animación (0 = sin repetición, -1 = infinito)
  repeat: number;
  
  // Umbral para visualizar la animación (0.0 - 1.0)
  threshold: number;
  
  // Intensidad del efecto (1.0 = normal)
  intensity: number;
  
  // Dirección de la animación
  direction: AnimationDirection;
  
  // Curva de aceleración
  easing: AnimationEasing;
  
  // Bandera que indica si debe activarse al hacer scroll
  scrollTrigger: boolean;
  
  // Biblioteca de animación a utilizar
  library: AnimationLibrary;
  
  // Datos adicionales para animaciones Lottie
  lottieAnimation?: any;
}

/**
 * Valores por defecto para animaciones
 */
export const defaultAnimationConfig: AnimationConfig = {
  effect: 'none',
  duration: 'normal',
  delay: 'none',
  repeat: 0,
  threshold: 0.2,
  intensity: 1,
  direction: 'none',
  easing: 'ease',
  scrollTrigger: false,
  library: 'framer-motion'
};

/**
 * Mapeo de duraciones de string a milisegundos
 */
export const durationMap: Record<string, number> = {
  'none': 0,
  'fast': 300,
  'normal': 500,
  'slow': 800,
  'very-slow': 1200
};

/**
 * Mapeo de retrasos de string a milisegundos
 */
export const delayMap: Record<string, number> = {
  'none': 0,
  'short': 150,
  'medium': 300,
  'long': 500,
  'page-load': 800
};

/**
 * Mapeo de funciones de aceleración a valores específicos para cada biblioteca
 */
export const easingMap: Record<AnimationEasing, any> = {
  'linear': 'linear',
  'ease': 'ease',
  'ease-in': 'easeIn',
  'ease-out': 'easeOut',
  'ease-in-out': 'easeInOut',
  'spring': 'spring',
  'bounce': 'bounce'
};

/**
 * Efectos disponibles por biblioteca
 */
export const effectsByLibrary: Record<AnimationLibrary, AnimationEffects> = {
  'framer-motion': {
    fade: ['fadeIn', 'fadeOut', 'fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight'],
    slide: ['slideInUp', 'slideInDown', 'slideInLeft', 'slideInRight'],
    zoom: ['zoomIn', 'zoomOut', 'zoomInUp', 'zoomInDown'],
    attention: ['pulse', 'bounce', 'shake'],
    transform: ['flipX', 'flipY', 'rotate']
  },
  'react-spring': {
    fade: ['fadeIn', 'fadeOut', 'fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight'],
    slide: ['slideInUp', 'slideInDown', 'slideInLeft', 'slideInRight'],
    zoom: ['zoomIn', 'zoomOut'],
    attention: ['pulse', 'bounce'],
    transform: ['flipX', 'flipY', 'rotate']
  },
  'gsap': {
    fade: ['fadeIn', 'fadeOut', 'fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight'],
    slide: ['slideInUp', 'slideInDown', 'slideInLeft', 'slideInRight'],
    zoom: ['zoomIn', 'zoomOut', 'zoomInUp', 'zoomInDown'],
    attention: ['pulse', 'bounce', 'shake'],
    transform: ['flipX', 'flipY', 'rotate']
  },
  'aos': {
    fade: ['fadeIn', 'fadeOut', 'fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight'],
    slide: ['slideInUp', 'slideInDown', 'slideInLeft', 'slideInRight'],
    zoom: ['zoomIn', 'zoomOut'],
    transform: ['flipX', 'flipY', 'rotate']
  },
  'lottie': {
    fade: [],
    slide: [],
    zoom: [],
    attention: [],
    transform: []
  },
  'none': {
    fade: [],
    slide: [],
    zoom: [],
    attention: [],
    transform: []
  }
};

/**
 * Obtener la duración en milisegundos
 */
export function getDurationValue(duration: AnimationDuration): number {
  if (typeof duration === 'number') return duration;
  return durationMap[duration] || 0;
}

/**
 * Obtener el retardo en milisegundos
 */
export function getDelayValue(delay: AnimationDelay): number {
  if (typeof delay === 'number') return delay;
  return delayMap[delay] || 0;
}

/**
 * Obtener el valor de aceleración para una biblioteca específica
 */
export function getEasingValue(easing: AnimationEasing, library: AnimationLibrary): any {
  return easingMap[easing] || 'ease';
}