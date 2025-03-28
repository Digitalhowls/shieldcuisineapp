/**
 * Media Upload Service
 * 
 * Este servicio maneja la carga de archivos multimedia:
 * - Validación de tipos MIME
 * - Almacenamiento seguro
 * - Integración con el optimizador de imágenes
 * - Procesamiento de metadatos
 */

import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { InsertCmsMedia, mediaFileTypeEnum } from '@shared/schema';
import { mediaOptimizer, OptimizationType } from './media-optimizer';

export interface UploadResult {
  success: boolean;
  file?: {
    filename: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    path: string;
    url: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
  };
  error?: string;
}

interface FileMetadata {
  title?: string;
  description?: string;
  alt?: string;
  folder?: string;
  tags?: string[];
}

/**
 * Media Upload Service
 */
export class MediaUploadService {
  /**
   * Determina el tipo de archivo según su MIME type
   */
  private getFileTypeFromMime(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType.startsWith('video/')) {
      return 'video';
    } else if (mimeType.startsWith('audio/')) {
      return 'audio';
    } else if (
      mimeType === 'application/pdf' ||
      mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/vnd.ms-excel' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-powerpoint' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      mimeType === 'text/plain' ||
      mimeType === 'text/csv'
    ) {
      return 'document';
    }
    
    return 'other';
  }
  
  /**
   * Valida un archivo
   */
  private validateFile(
    file: Express.Multer.File,
    allowedTypes: string[] = ['image', 'document', 'video', 'audio', 'other']
  ): { valid: boolean; message?: string } {
    // Comprobar tamaño máximo (20MB por defecto)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return {
        valid: false,
        message: `El archivo es demasiado grande. Tamaño máximo permitido: ${maxSize / (1024 * 1024)}MB`
      };
    }
    
    // Comprobar tipo de archivo
    const fileType = this.getFileTypeFromMime(file.mimetype);
    if (!allowedTypes.includes(fileType)) {
      return {
        valid: false,
        message: `Tipo de archivo no permitido: ${fileType}`
      };
    }
    
    return { valid: true };
  }
  
  /**
   * Genera un nombre de archivo único
   */
  private generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const uuid = uuidv4().slice(0, 8);
    const ext = path.extname(originalFilename);
    const sanitizedName = path.basename(originalFilename, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    
    return `${sanitizedName}-${timestamp}-${uuid}${ext}`;
  }
  
  /**
   * Crea un directorio para un empresa específica
   */
  private getCompanyUploadDir(companyId: number): string {
    const baseDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    const companyDir = path.join(baseDir, `company-${companyId}`);
    
    if (!fs.existsSync(companyDir)) {
      fs.mkdirSync(companyDir, { recursive: true });
    }
    
    return companyDir;
  }
  
  /**
   * Procesa y guarda un archivo
   */
  public async processUpload(
    file: Express.Multer.File,
    companyId: number,
    userId: number,
    metadata: FileMetadata = {}
  ): Promise<UploadResult> {
    try {
      // Validar archivo
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.message
        };
      }
      
      // Crear directorio para la empresa
      const companyDir = this.getCompanyUploadDir(companyId);
      
      // Generar nombre de archivo único
      const uniqueFilename = this.generateUniqueFilename(file.originalname);
      
      // Determinar tipo de archivo
      const fileType = this.getFileTypeFromMime(file.mimetype);
      
      // Crear ruta para el archivo
      const fileDir = path.join(companyDir, fileType);
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }
      
      let finalPath = '';
      let url = '';
      let thumbnailUrl = '';
      let width: number | undefined;
      let height: number | undefined;
      
      // Procesar según el tipo de archivo
      if (fileType === 'image') {
        // Para imágenes, usar el optimizador
        const versions = await mediaOptimizer.generateOptimizedVersions(
          file.path,
          fileDir
        );
        
        // Usar la versión optimizada como principal
        finalPath = path.relative(process.cwd(), versions.optimized.optimizedPath);
        url = `/uploads/${path.relative(path.join(process.cwd(), 'uploads'), versions.optimized.optimizedPath)}`;
        
        // Guardar miniatura si existe
        thumbnailUrl = `/uploads/${path.relative(path.join(process.cwd(), 'uploads'), versions.thumbnail.optimizedPath)}`;
        
        // Guardar dimensiones
        width = versions.optimized.width;
        height = versions.optimized.height;
      } else {
        // Para otros archivos, simplemente moverlos
        finalPath = path.join(fileDir, uniqueFilename);
        fs.copyFileSync(file.path, finalPath);
        
        // Generar URL relativa
        finalPath = path.relative(process.cwd(), finalPath);
        url = `/uploads/${path.relative(path.join(process.cwd(), 'uploads'), finalPath)}`;
      }
      
      // Limpiar archivo temporal
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      // Definir el objeto file por separado para evitar errores de tipado
      const fileObject = {
        filename: uniqueFilename,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: finalPath,
        url,
        thumbnailUrl: thumbnailUrl || undefined,
        width,
        height
      };
      
      const result: UploadResult = {
        success: true,
        file: fileObject
      };
      
      return result;
    } catch (error: unknown) {
      console.error('Error en procesamiento de archivo:', error);
      return {
        success: false,
        error: `Error al procesar archivo: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  /**
   * Prepara un objeto CmsMedia desde los resultados de carga
   */
  public prepareMediaRecord(
    uploadResult: UploadResult,
    companyId: number,
    userId: number,
    metadata: FileMetadata = {}
  ): InsertCmsMedia {
    if (!uploadResult.success || !uploadResult.file) {
      throw new Error('No se puede preparar registro para un archivo inválido');
    }
    
    const { file } = uploadResult;
    
    return {
      filename: file.filename,
      originalFilename: file.originalFilename,
      mimeType: file.mimeType,
      size: file.size,
      path: file.path,
      url: file.url,
      thumbnailUrl: file.thumbnailUrl,
      width: file.width,
      height: file.height,
      title: metadata.title || file.originalFilename,
      description: metadata.description,
      alt: metadata.alt || file.originalFilename,
      folder: metadata.folder || '',
      tags: metadata.tags || [],
      companyId,
      uploadedBy: userId
    };
  }
}

export const mediaUploadService = new MediaUploadService();