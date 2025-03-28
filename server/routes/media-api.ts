/**
 * Media API Routes
 * 
 * API para la gestión avanzada de archivos multimedia:
 * - Carga y optimización de imágenes
 * - Organización por categorías y etiquetas
 * - Búsqueda y filtrado
 */

import { Request, Response, Express } from 'express';
import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import multer from 'multer';
import { db } from '../db';
import { eq, and, like, ilike, inArray, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { cmsMedia, cmsMediaCategories, cmsMediaToCategories, insertCmsMediaSchema, mediaFileTypeEnum } from '@shared/schema';
import { mediaUploadService } from '../services/media-upload';
import { verifyAuth } from '../auth';

// Configuración de Multer para carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Validar tipos de archivos permitidos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    // Imágenes
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documentos
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    // Video
    'video/mp4', 'video/webm', 'video/quicktime',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
  }
};

// Configurar uploader
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB límite por defecto
  }
});

// Registra las rutas de la API de medios
export function registerMediaApiRoutes(app: Express) {
  // Middleware para servir archivos estáticos
  const uploadsDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
  
  /**
   * RUTAS PARA GESTIÓN DE ARCHIVOS MULTIMEDIA
   */
  
  // Obtener todos los archivos multimedia con filtros
  app.get('/api/cms/media', verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId || parseInt(req.query.companyId as string);
      if (!companyId) {
        return res.status(400).json({ error: 'Se requiere ID de empresa' });
      }
      
      // Parámetros de filtrado opcionales
      const fileType = req.query.fileType as string;
      const search = req.query.search as string;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const folder = req.query.folder as string;
      
      // Construir condiciones de filtrado
      let conditions = [eq(cmsMedia.companyId, companyId)];
      
      if (fileType && fileType !== 'all') {
        // Determinar el tipo MIME basado en el tipo de archivo solicitado
        if (fileType === 'image') {
          conditions.push(like(cmsMedia.mimeType, 'image/%'));
        } else if (fileType === 'document') {
          conditions.push(or(
            like(cmsMedia.mimeType, 'application/pdf'),
            like(cmsMedia.mimeType, 'application/msword'),
            like(cmsMedia.mimeType, 'application/vnd.openxmlformats-officedocument%'),
            like(cmsMedia.mimeType, 'text/%')
          ));
        } else if (fileType === 'video') {
          conditions.push(like(cmsMedia.mimeType, 'video/%'));
        } else if (fileType === 'audio') {
          conditions.push(like(cmsMedia.mimeType, 'audio/%'));
        }
      }
      
      if (search) {
        conditions.push(or(
          ilike(cmsMedia.title, `%${search}%`),
          ilike(cmsMedia.filename, `%${search}%`),
          ilike(cmsMedia.description, `%${search}%`)
        ));
      }
      
      if (folder) {
        conditions.push(eq(cmsMedia.folder, folder));
      }
      
      // Consulta base
      let query = db.select().from(cmsMedia).where(and(...conditions));
      
      // Si se especifica categoría, realizar join con la tabla de relación
      if (categoryId) {
        query = db.select({
          id: cmsMedia.id,
          filename: cmsMedia.filename,
          originalFilename: cmsMedia.originalFilename,
          mimeType: cmsMedia.mimeType,
          size: cmsMedia.size,
          path: cmsMedia.path,
          url: cmsMedia.url,
          thumbnailUrl: cmsMedia.thumbnailUrl,
          width: cmsMedia.width,
          height: cmsMedia.height,
          alt: cmsMedia.alt,
          title: cmsMedia.title,
          description: cmsMedia.description,
          folder: cmsMedia.folder,
          tags: cmsMedia.tags,
          companyId: cmsMedia.companyId,
          uploadedBy: cmsMedia.uploadedBy,
          createdAt: cmsMedia.createdAt,
          updatedAt: cmsMedia.updatedAt,
        })
        .from(cmsMedia)
        .innerJoin(
          cmsMediaToCategories,
          and(
            eq(cmsMediaToCategories.mediaId, cmsMedia.id),
            eq(cmsMediaToCategories.categoryId, categoryId)
          )
        )
        .where(and(...conditions));
      }
      
      // Ordenar por fecha de creación (más reciente primero)
      query = query.orderBy(sql`${cmsMedia.createdAt} DESC`);
      
      // Ejecutar consulta
      const files = await query;
      
      res.json(files);
    } catch (error) {
      console.error('Error al obtener archivos multimedia:', error);
      res.status(500).json({ error: 'Error al obtener archivos multimedia' });
    }
  });
  
  // Obtener un archivo multimedia específico
  app.get('/api/cms/media/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const file = await db.query.cmsMedia.findFirst({
        where: eq(cmsMedia.id, id),
      });
      
      if (!file) {
        return res.status(404).json({ error: 'Archivo no encontrado' });
      }
      
      // Verificar permisos (sólo administradores o usuarios de la misma empresa)
      if (req.user?.role !== 'admin' && file.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: 'No tienes permiso para ver este archivo' });
      }
      
      res.json(file);
    } catch (error) {
      console.error('Error al obtener archivo:', error);
      res.status(500).json({ error: 'Error al obtener archivo' });
    }
  });
  
  // Subir un nuevo archivo multimedia
  app.post('/api/cms/media/upload', verifyAuth, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
      }
      
      const companyId = req.user?.companyId || parseInt(req.body.companyId as string);
      if (!companyId) {
        return res.status(400).json({ error: 'Se requiere ID de empresa' });
      }
      
      // Extraer parámetros adicionales del formulario
      const title = req.body.title as string;
      const description = req.body.description as string;
      const alt = req.body.alt as string;
      const folder = req.body.folder as string;
      const tags = req.body.tags ? JSON.parse(req.body.tags) : [];
      const categoryId = req.body.categoryId ? parseInt(req.body.categoryId as string) : undefined;
      
      // Procesar el archivo con el servicio de carga
      const uploadResult = await mediaUploadService.processUpload(
        req.file,
        companyId,
        req.user!.id,
        { title, description, alt, folder, tags }
      );
      
      if (!uploadResult.success) {
        return res.status(400).json({ error: uploadResult.error });
      }
      
      // Preparar registro para la base de datos
      const mediaRecord = mediaUploadService.prepareMediaRecord(
        uploadResult,
        companyId,
        req.user!.id,
        { title, description, alt, folder, tags }
      );
      
      // Insertar en la base de datos
      const [newMedia] = await db.insert(cmsMedia).values(mediaRecord).returning();
      
      // Si se especificó una categoría, crear la relación
      if (categoryId) {
        await db.insert(cmsMediaToCategories).values({
          mediaId: newMedia.id,
          categoryId,
        });
      }
      
      // Devolver el nuevo archivo con información adicional
      res.status(201).json(newMedia);
    } catch (error: unknown) {
      console.error('Error al subir archivo multimedia:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: `Error al subir archivo: ${errorMessage}` });
    }
  });
  
  // Actualizar un archivo multimedia existente
  app.put('/api/cms/media/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Buscar archivo existente
      const existingFile = await db.query.cmsMedia.findFirst({
        where: eq(cmsMedia.id, id),
      });
      
      if (!existingFile) {
        return res.status(404).json({ error: 'Archivo no encontrado' });
      }
      
      // Verificar permisos
      if (req.user?.role !== 'admin' && existingFile.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este archivo' });
      }
      
      // Validar datos de actualización
      const updateData = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        alt: z.string().optional(),
        folder: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }).parse(req.body);
      
      // Actualizar archivo
      const [updatedFile] = await db
        .update(cmsMedia)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(cmsMedia.id, id))
        .returning();
      
      res.json(updatedFile);
    } catch (error) {
      console.error('Error al actualizar archivo multimedia:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
      }
      res.status(500).json({ error: 'Error al actualizar archivo multimedia' });
    }
  });
  
  // Eliminar un archivo multimedia
  app.delete('/api/cms/media/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Buscar archivo existente
      const existingFile = await db.query.cmsMedia.findFirst({
        where: eq(cmsMedia.id, id),
      });
      
      if (!existingFile) {
        return res.status(404).json({ error: 'Archivo no encontrado' });
      }
      
      // Verificar permisos
      if (req.user?.role !== 'admin' && existingFile.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este archivo' });
      }
      
      // Eliminar relaciones con categorías
      await db
        .delete(cmsMediaToCategories)
        .where(eq(cmsMediaToCategories.mediaId, id));
      
      // Eliminar el archivo físico si existe
      const filePath = path.join(process.cwd(), 'uploads', existingFile.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Eliminar thumbnails si existen
      if (existingFile.thumbnailUrl) {
        const thumbnailPath = path.join(
          process.cwd(), 
          'uploads', 
          existingFile.thumbnailUrl.replace('/uploads/', '')
        );
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }
      
      // Eliminar el registro de la base de datos
      await db
        .delete(cmsMedia)
        .where(eq(cmsMedia.id, id));
      
      res.status(200).json({ success: true, message: 'Archivo eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar archivo multimedia:', error);
      res.status(500).json({ error: 'Error al eliminar archivo multimedia' });
    }
  });
  
  /**
   * RUTAS PARA CATEGORÍAS DE MEDIOS
   */
  
  // Obtener todas las categorías de media
  app.get('/api/cms/media/categories', verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId || parseInt(req.query.companyId as string);
      if (!companyId) {
        return res.status(400).json({ error: 'Se requiere ID de empresa' });
      }
      
      const categories = await db.query.cmsMediaCategories.findMany({
        where: eq(cmsMediaCategories.companyId, companyId),
        orderBy: sql`${cmsMediaCategories.name} ASC`,
      });
      
      res.json(categories);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ error: 'Error al obtener categorías' });
    }
  });
  
  // Obtener una categoría específica
  app.get('/api/cms/media/categories/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const category = await db.query.cmsMediaCategories.findFirst({
        where: eq(cmsMediaCategories.id, id),
      });
      
      if (!category) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
      
      // Verificar permisos
      if (req.user?.role !== 'admin' && category.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: 'No tienes permiso para ver esta categoría' });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({ error: 'Error al obtener categoría' });
    }
  });
  
  // Crear una nueva categoría
  app.post('/api/cms/media/categories', verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId || parseInt(req.body.companyId as string);
      if (!companyId) {
        return res.status(400).json({ error: 'Se requiere ID de empresa' });
      }
      
      // Validar datos con Zod
      const categoryData = z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        parentId: z.number().optional(),
      }).parse(req.body);
      
      // Verificar si ya existe una categoría con el mismo slug
      const existingCategory = await db.query.cmsMediaCategories.findFirst({
        where: and(
          eq(cmsMediaCategories.slug, categoryData.slug),
          eq(cmsMediaCategories.companyId, companyId)
        ),
      });
      
      if (existingCategory) {
        return res.status(400).json({ error: 'Ya existe una categoría con este slug' });
      }
      
      // Crear nueva categoría
      const [newCategory] = await db.insert(cmsMediaCategories).values({
        ...categoryData,
        companyId,
      }).returning();
      
      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
      }
      res.status(500).json({ error: 'Error al crear categoría' });
    }
  });
  
  // Actualizar una categoría existente
  app.put('/api/cms/media/categories/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Buscar categoría existente
      const category = await db.query.cmsMediaCategories.findFirst({
        where: eq(cmsMediaCategories.id, id),
      });
      
      if (!category) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
      
      // Verificar permisos
      if (req.user?.role !== 'admin' && category.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: 'No tienes permiso para modificar esta categoría' });
      }
      
      // Validar datos de actualización
      const updateData = z.object({
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        parentId: z.number().optional().nullable(),
      }).parse(req.body);
      
      // Si se actualiza el slug, verificar que no exista otra categoría con el mismo
      if (updateData.slug && updateData.slug !== category.slug) {
        const existingCategory = await db.query.cmsMediaCategories.findFirst({
          where: and(
            eq(cmsMediaCategories.slug, updateData.slug),
            eq(cmsMediaCategories.companyId, category.companyId),
            sql`${cmsMediaCategories.id} <> ${id}`
          ),
        });
        
        if (existingCategory) {
          return res.status(400).json({ error: 'Ya existe otra categoría con este slug' });
        }
      }
      
      // Actualizar categoría
      const [updatedCategory] = await db
        .update(cmsMediaCategories)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(cmsMediaCategories.id, id))
        .returning();
      
      res.json(updatedCategory);
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
      }
      res.status(500).json({ error: 'Error al actualizar categoría' });
    }
  });
  
  // Eliminar una categoría
  app.delete('/api/cms/media/categories/:id', verifyAuth, async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      
      // Buscar categoría existente
      const category = await db.query.cmsMediaCategories.findFirst({
        where: eq(cmsMediaCategories.id, categoryId),
      });
      
      if (!category) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
      
      // Verificar permisos
      if (req.user?.role !== 'admin' && category.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar esta categoría' });
      }
      
      // Actualizar categorías hijas para quitar el parentId
      await db
        .update(cmsMediaCategories)
        .set({ parentId: null })
        .where(eq(cmsMediaCategories.parentId, categoryId));
      
      // Eliminar relaciones con medios
      await db
        .delete(cmsMediaToCategories)
        .where(eq(cmsMediaToCategories.categoryId, categoryId));
      
      // Eliminar la categoría
      await db
        .delete(cmsMediaCategories)
        .where(eq(cmsMediaCategories.id, categoryId));
      
      res.status(200).json({ success: true, message: 'Categoría eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({ error: 'Error al eliminar categoría' });
    }
  });
  
  /**
   * RUTAS PARA ASIGNACIÓN DE MEDIOS A CATEGORÍAS
   */
  
  // Asignar un archivo a una categoría
  app.post('/api/cms/media/:mediaId/categories/:categoryId', verifyAuth, async (req: Request, res: Response) => {
    try {
      const mediaId = parseInt(req.params.mediaId);
      const categoryId = parseInt(req.params.categoryId);
      
      // Verificar que existen tanto el archivo como la categoría
      const media = await db.query.cmsMedia.findFirst({
        where: eq(cmsMedia.id, mediaId),
      });
      
      const category = await db.query.cmsMediaCategories.findFirst({
        where: eq(cmsMediaCategories.id, categoryId),
      });
      
      if (!media) {
        return res.status(404).json({ error: 'Archivo no encontrado' });
      }
      
      if (!category) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
      
      // Verificar permisos
      if (req.user?.role !== 'admin' && media.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este archivo' });
      }
      
      // Verificar que ambos pertenecen a la misma empresa
      if (media.companyId !== category.companyId) {
        return res.status(400).json({ 
          error: 'El archivo y la categoría deben pertenecer a la misma empresa' 
        });
      }
      
      // Verificar si ya existe la relación
      const existingRelation = await db.query.cmsMediaToCategories.findFirst({
        where: and(
          eq(cmsMediaToCategories.mediaId, mediaId),
          eq(cmsMediaToCategories.categoryId, categoryId)
        ),
      });
      
      if (existingRelation) {
        return res.status(200).json({ message: 'El archivo ya está asignado a esta categoría' });
      }
      
      // Crear la relación
      await db.insert(cmsMediaToCategories).values({
        mediaId,
        categoryId,
      });
      
      res.status(201).json({ success: true, message: 'Archivo asignado a categoría correctamente' });
    } catch (error) {
      console.error('Error al asignar archivo a categoría:', error);
      res.status(500).json({ error: 'Error al asignar archivo a categoría' });
    }
  });
  
  // Quitar un archivo de una categoría
  app.delete('/api/cms/media/:mediaId/categories/:categoryId', verifyAuth, async (req: Request, res: Response) => {
    try {
      const mediaId = parseInt(req.params.mediaId);
      const categoryId = parseInt(req.params.categoryId);
      
      // Verificar que existe el archivo
      const media = await db.query.cmsMedia.findFirst({
        where: eq(cmsMedia.id, mediaId),
      });
      
      if (!media) {
        return res.status(404).json({ error: 'Archivo no encontrado' });
      }
      
      // Verificar permisos
      if (req.user?.role !== 'admin' && media.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: 'No tienes permiso para modificar este archivo' });
      }
      
      // Eliminar la relación
      await db
        .delete(cmsMediaToCategories)
        .where(and(
          eq(cmsMediaToCategories.mediaId, mediaId),
          eq(cmsMediaToCategories.categoryId, categoryId)
        ));
      
      res.status(200).json({ success: true, message: 'Archivo removido de la categoría correctamente' });
    } catch (error) {
      console.error('Error al quitar archivo de categoría:', error);
      res.status(500).json({ error: 'Error al quitar archivo de categoría' });
    }
  });
  
  // Obtener todos los archivos de una categoría
  app.get('/api/cms/media/categories/:categoryId/files', verifyAuth, async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      
      // Verificar que existe la categoría
      const category = await db.query.cmsMediaCategories.findFirst({
        where: eq(cmsMediaCategories.id, categoryId),
      });
      
      if (!category) {
        return res.status(404).json({ error: 'Categoría no encontrada' });
      }
      
      // Verificar permisos
      if (req.user?.role !== 'admin' && category.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: 'No tienes permiso para ver esta categoría' });
      }
      
      // Obtener archivos asociados a la categoría
      const files = await db
        .select({
          id: cmsMedia.id,
          filename: cmsMedia.filename,
          originalFilename: cmsMedia.originalFilename,
          mimeType: cmsMedia.mimeType,
          size: cmsMedia.size,
          path: cmsMedia.path,
          url: cmsMedia.url,
          thumbnailUrl: cmsMedia.thumbnailUrl,
          width: cmsMedia.width,
          height: cmsMedia.height,
          alt: cmsMedia.alt,
          title: cmsMedia.title,
          description: cmsMedia.description,
          folder: cmsMedia.folder,
          tags: cmsMedia.tags,
          companyId: cmsMedia.companyId,
          uploadedBy: cmsMedia.uploadedBy,
          createdAt: cmsMedia.createdAt,
          updatedAt: cmsMedia.updatedAt,
        })
        .from(cmsMedia)
        .innerJoin(
          cmsMediaToCategories,
          and(
            eq(cmsMediaToCategories.mediaId, cmsMedia.id),
            eq(cmsMediaToCategories.categoryId, categoryId)
          )
        )
        .where(eq(cmsMedia.companyId, category.companyId))
        .orderBy(sql`${cmsMedia.createdAt} DESC`);
      
      res.json(files);
    } catch (error) {
      console.error('Error al obtener archivos de categoría:', error);
      res.status(500).json({ error: 'Error al obtener archivos de categoría' });
    }
  });
}