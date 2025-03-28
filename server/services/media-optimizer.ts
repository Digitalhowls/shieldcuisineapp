/**
 * Media Optimizer Service
 * 
 * Este servicio se encarga de optimizar archivos multimedia:
 * - Compresión y redimensionamiento de imágenes
 * - Conversión automática a WebP
 * - Generación de miniaturas
 */

import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { exec } from 'child_process';

/**
 * Tipos de optimización soportados
 */
export enum OptimizationType {
  ORIGINAL = 'original',  // No optimizar
  MEDIUM = 'medium',      // Optimización media (calidad 80%)
  HIGH = 'high',          // Optimización alta (calidad 60%)
  THUMBNAIL = 'thumbnail', // Miniatura (200px de ancho)
}

/**
 * Opciones de optimización
 */
export interface OptimizationOptions {
  type: OptimizationType;
  maxWidth?: number;    // Ancho máximo para redimensionar
  maxHeight?: number;   // Alto máximo para redimensionar
  quality?: number;     // Calidad (1-100)
  toWebP?: boolean;     // Convertir a WebP
  toJPEG?: boolean;     // Convertir a JPEG
}

/**
 * Resultado del proceso de optimización
 */
export interface OptimizationResult {
  optimizedPath: string;
  originalSize: number;
  optimizedSize: number;
  width?: number;
  height?: number;
  format: string;
  optimization: number; // Porcentaje de optimización (0-100)
}

/**
 * Media Optimizer Service
 */
export class MediaOptimizerService {
  private execPromise = util.promisify(exec);
  
  /**
   * Optimiza una imagen utilizando las opciones proporcionadas
   */
  public async optimizeImage(
    inputPath: string,
    outputDirectory: string,
    options: OptimizationOptions
  ): Promise<OptimizationResult> {
    try {
      // Crear directorio de salida si no existe
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }
      
      const originalSize = fs.statSync(inputPath).size;
      const fileExt = path.extname(inputPath);
      const fileName = path.basename(inputPath, fileExt);
      
      // Determinar formato de salida
      let outputFormat = fileExt.toLowerCase().replace('.', '');
      if (options.toWebP) {
        outputFormat = 'webp';
      } else if (options.toJPEG) {
        outputFormat = 'jpg';
      }
      
      // Configurar sufijo según tipo de optimización
      let suffix = '';
      switch (options.type) {
        case OptimizationType.MEDIUM:
          suffix = '_medium';
          break;
        case OptimizationType.HIGH:
          suffix = '_high';
          break;
        case OptimizationType.THUMBNAIL:
          suffix = '_thumb';
          break;
      }
      
      const outputFilename = `${fileName}${suffix}.${outputFormat}`;
      const outputPath = path.join(outputDirectory, outputFilename);
      
      // Construir comando para ImageMagick
      let command = `convert "${inputPath}"`;
      
      // Configurar redimensionamiento si es necesario
      if (options.maxWidth || options.maxHeight) {
        command += ` -resize ${options.maxWidth || ''}x${options.maxHeight || ''}`;
      }
      
      // Configurar calidad
      if (options.quality) {
        command += ` -quality ${options.quality}`;
      }
      
      // Finalizar comando con ruta de salida
      command += ` "${outputPath}"`;
      
      // Ejecutar comando
      await this.execPromise(command);
      
      // Obtener información del archivo optimizado
      const optimizedSize = fs.statSync(outputPath).size;
      const optimization = Math.round((1 - (optimizedSize / originalSize)) * 100);
      
      // Obtener dimensiones (esto requeriría otro comando o librería)
      let width: number | undefined;
      let height: number | undefined;
      
      try {
        const dimensionResult = await this.execPromise(`identify -format "%wx%h" "${outputPath}"`);
        const dimensions = dimensionResult.stdout.trim().split('x');
        width = parseInt(dimensions[0]);
        height = parseInt(dimensions[1]);
      } catch (error) {
        console.error('Error al obtener dimensiones:', error);
      }
      
      return {
        optimizedPath: outputPath,
        originalSize,
        optimizedSize,
        width,
        height,
        format: outputFormat,
        optimization,
      };
    } catch (error: unknown) {
      console.error('Error en optimización de imagen:', error);
      throw new Error(`Error al optimizar imagen: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Genera diferentes versiones optimizadas de una imagen
   */
  public async generateOptimizedVersions(
    inputPath: string,
    outputDirectory: string
  ): Promise<{
    original: OptimizationResult,
    optimized: OptimizationResult,
    thumbnail: OptimizationResult,
    webp?: OptimizationResult
  }> {
    try {
      // Versión original (copia simple)
      const original = await this.optimizeImage(inputPath, outputDirectory, {
        type: OptimizationType.ORIGINAL
      });
      
      // Versión optimizada (calidad media)
      const optimized = await this.optimizeImage(inputPath, outputDirectory, {
        type: OptimizationType.MEDIUM,
        quality: 80
      });
      
      // Versión miniatura
      const thumbnail = await this.optimizeImage(inputPath, outputDirectory, {
        type: OptimizationType.THUMBNAIL,
        maxWidth: 200,
        quality: 80
      });
      
      // Versión WebP (si es una imagen que lo soporta)
      let webp: OptimizationResult | undefined;
      const supportedFormats = ['.jpg', '.jpeg', '.png'];
      const fileExt = path.extname(inputPath).toLowerCase();
      
      if (supportedFormats.includes(fileExt)) {
        webp = await this.optimizeImage(inputPath, outputDirectory, {
          type: OptimizationType.MEDIUM,
          quality: 80,
          toWebP: true
        });
      }
      
      return {
        original,
        optimized,
        thumbnail,
        webp
      };
    } catch (error: unknown) {
      console.error('Error al generar versiones optimizadas:', error);
      throw new Error(`Error al generar versiones optimizadas: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const mediaOptimizer = new MediaOptimizerService();