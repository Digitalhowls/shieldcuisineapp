import { Block } from '../block-editor/types';
import { 
  AnimationConfig, 
  AnimationLibrary,
  AnimationEffect,
  AnimationDuration,
  AnimationDelay,
  AnimationDirection,
  AnimationEasing,
  defaultAnimationConfig
} from './animation-config';

/**
 * Convierte la configuración de animación de un bloque a la configuración
 * utilizada por el componente Animation
 * 
 * @param block El bloque que contiene la configuración de animación
 * @returns Configuración de animación para el componente Animation
 */
export function blockToAnimationConfig(block: Block): Partial<AnimationConfig> {
  // Si no hay configuración de animación, retornar un objeto vacío
  if (!block.animation || !block.animation.library || block.animation.library === 'none') {
    return { library: 'none' };
  }

  // Convertir la configuración del bloque a la configuración de Animation
  return {
    library: block.animation.library as AnimationLibrary,
    effect: block.animation.effect as AnimationEffect || 'none',
    duration: block.animation.duration as AnimationDuration || 'normal',
    delay: block.animation.delay as AnimationDelay || 'none',
    repeat: typeof block.animation.repeat === 'number' ? block.animation.repeat : 0,
    intensity: typeof block.animation.intensity === 'number' ? block.animation.intensity : 1,
    direction: block.animation.direction as AnimationDirection || 'normal',
    easing: block.animation.easing as AnimationEasing || 'ease',
    threshold: typeof block.animation.threshold === 'number' ? block.animation.threshold : 0.2,
    scrollTrigger: !!block.animation.scrollTrigger,
    // No incluir lottieAnimation, asumimos que no se está usando
  };
}

/**
 * Determina si un bloque tiene una animación configurada
 * 
 * @param block El bloque a verificar
 * @returns true si el bloque tiene una animación válida
 */
export function hasAnimation(block: Block): boolean {
  return !!(
    block.animation &&
    block.animation.library &&
    block.animation.library !== 'none' &&
    block.animation.effect &&
    block.animation.effect !== 'none'
  );
}

/**
 * Combina la configuración de animación por defecto con la configuración
 * del bloque para obtener una configuración completa
 * 
 * @param block El bloque con configuración de animación
 * @returns Configuración de animación completa
 */
export function getFullAnimationConfig(block: Block): AnimationConfig {
  if (!hasAnimation(block)) {
    return { ...defaultAnimationConfig, library: 'none' };
  }
  
  const blockConfig = blockToAnimationConfig(block);
  return { ...defaultAnimationConfig, ...blockConfig };
}