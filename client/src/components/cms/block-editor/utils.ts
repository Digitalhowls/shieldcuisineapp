/**
 * Utilidades para el editor de bloques del CMS
 */

/**
 * Extrae el ID de un video de YouTube de una URL
 * Formatos soportados:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function getYouTubeID(url: string): string {
  if (!url) return '';
  
  let videoId = '';
  
  try {
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URL(url).searchParams;
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
    }
    
    return videoId.split('&')[0]; // Eliminar parámetros adicionales
  } catch (error) {
    console.error('Error extracting YouTube ID:', error);
    return '';
  }
}

/**
 * Extrae el ID de un video de Vimeo de una URL
 * Formatos soportados:
 * - https://vimeo.com/VIDEO_ID
 * - https://player.vimeo.com/video/VIDEO_ID
 */
export function getVimeoID(url: string): string {
  if (!url) return '';
  
  let videoId = '';
  
  try {
    if (url.includes('vimeo.com/')) {
      const segments = url.split('/');
      // Encontrar el segmento que representa el ID (normalmente el último o el penúltimo)
      for (let i = segments.length - 1; i >= 0; i--) {
        if (segments[i] && segments[i].match(/^\d+$/)) {
          videoId = segments[i];
          break;
        }
      }
    }
    
    return videoId;
  } catch (error) {
    console.error('Error extracting Vimeo ID:', error);
    return '';
  }
}