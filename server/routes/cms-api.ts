import { Request, Response, NextFunction, Express } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertCmsPageSchema, insertCmsCategorySchema, insertCmsMediaSchema, insertCmsBrandingSchema } from "@shared/schema";

/**
 * Middleware para verificar autenticación
 */
const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
};

/**
 * Middleware para verificar roles de administrador
 */
const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || req.user?.role !== "admin") {
    return res.status(403).json({ error: "Acceso restringido" });
  }
  next();
};

/**
 * Registra las rutas de la API para el módulo CMS
 */
export function registerCmsApiRoutes(app: Express) {
  /**
   * Obtener estadísticas del CMS
   */
  app.get("/api/cms/stats", verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = Number(req.query.companyId) || req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: "ID de empresa no proporcionado" });
      }
      
      const [
        pages,
        media,
        categories
      ] = await Promise.all([
        storage.getCmsPages(companyId),
        storage.getCmsMedia(companyId),
        storage.getCmsCategories(companyId)
      ]);
      
      const totalPages = pages.length;
      const publishedPages = pages.filter(page => page.status === "published").length;
      const draftPages = pages.filter(page => page.status === "draft").length;
      const totalMedia = media.length;
      const totalCategories = categories.length;
      
      // Ordenar páginas por fecha de actualización
      const recentPages = [...pages]
        .sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5);
      
      res.json({
        totalPages,
        publishedPages,
        draftPages,
        totalMedia,
        totalCategories,
        recentPages
      });
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  });
  
  /**
   * RUTAS PARA GESTIÓN DE PÁGINAS
   */
  
  // Obtener todas las páginas
  app.get("/api/cms/pages", verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = Number(req.query.companyId) || req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: "ID de empresa no proporcionado" });
      }
      
      const pages = await storage.getCmsPages(companyId);
      res.json(pages);
    } catch (error) {
      console.error("Error al obtener páginas:", error);
      res.status(500).json({ error: "Error al obtener páginas" });
    }
  });
  
  // Obtener una página específica
  app.get("/api/cms/pages/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de página inválido" });
      }
      
      const page = await storage.getCmsPage(id);
      
      if (!page) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      // Verificar que el usuario tenga acceso a esta empresa
      if (req.user?.role !== "admin" && page.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para ver esta página" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error al obtener página:", error);
      res.status(500).json({ error: "Error al obtener página" });
    }
  });
  
  // Obtener una página pública por slug
  app.get("/api/cms/public/pages/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const companyId = Number(req.query.companyId);
      
      if (!companyId) {
        return res.status(400).json({ error: "ID de empresa no proporcionado" });
      }
      
      const page = await storage.getCmsPageBySlug(companyId, slug);
      
      if (!page) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      // Solo permitir acceso a páginas publicadas
      if (page.status !== "published") {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error al obtener página por slug:", error);
      res.status(500).json({ error: "Error al obtener página" });
    }
  });
  
  // Crear una nueva página
  app.post("/api/cms/pages", verifyAuth, async (req: Request, res: Response) => {
    try {
      // Validar datos con Zod
      const pageData = insertCmsPageSchema.parse(req.body);
      
      // Solo permitir crear páginas para la propia empresa del usuario
      if (req.user?.role !== "admin" && pageData.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para crear páginas en esta empresa" });
      }
      
      const newPage = await storage.createCmsPage(pageData);
      res.status(201).json(newPage);
    } catch (error) {
      console.error("Error al crear página:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error al crear página" });
    }
  });
  
  // Actualizar una página existente
  app.put("/api/cms/pages/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de página inválido" });
      }
      
      // Obtener la página actual para verificar permisos
      const existingPage = await storage.getCmsPage(id);
      
      if (!existingPage) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      // Verificar permisos
      if (req.user?.role !== "admin" && existingPage.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para actualizar esta página" });
      }
      
      // Validar datos con Zod
      const updateData = insertCmsPageSchema.partial().parse(req.body);
      
      // No permitir cambiar el ID de la empresa
      delete updateData.companyId;
      
      const updatedPage = await storage.updateCmsPage(id, updateData);
      
      if (!updatedPage) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      res.json(updatedPage);
    } catch (error) {
      console.error("Error al actualizar página:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error al actualizar página" });
    }
  });
  
  // Eliminar una página
  app.delete("/api/cms/pages/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de página inválido" });
      }
      
      // Obtener la página actual para verificar permisos
      const existingPage = await storage.getCmsPage(id);
      
      if (!existingPage) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      // Verificar permisos
      if (req.user?.role !== "admin" && existingPage.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para eliminar esta página" });
      }
      
      await storage.deleteCmsPage(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error al eliminar página:", error);
      res.status(500).json({ error: "Error al eliminar página" });
    }
  });
  
  /**
   * RUTAS PARA GESTIÓN DE CATEGORÍAS
   */
  
  // Obtener todas las categorías
  app.get("/api/cms/categories", verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = Number(req.query.companyId) || req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: "ID de empresa no proporcionado" });
      }
      
      const categories = await storage.getCmsCategories(companyId);
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      res.status(500).json({ error: "Error al obtener categorías" });
    }
  });
  
  // Obtener una categoría específica
  app.get("/api/cms/categories/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de categoría inválido" });
      }
      
      const category = await storage.getCmsCategory(id);
      
      if (!category) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
      
      // Verificar que el usuario tenga acceso a esta empresa
      if (req.user?.role !== "admin" && category.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para ver esta categoría" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error al obtener categoría:", error);
      res.status(500).json({ error: "Error al obtener categoría" });
    }
  });
  
  // Crear una nueva categoría
  app.post("/api/cms/categories", verifyAuth, async (req: Request, res: Response) => {
    try {
      // Validar datos con Zod
      const categoryData = insertCmsCategorySchema.parse(req.body);
      
      // Solo permitir crear categorías para la propia empresa del usuario
      if (req.user?.role !== "admin" && categoryData.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para crear categorías en esta empresa" });
      }
      
      const newCategory = await storage.createCmsCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error al crear categoría:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error al crear categoría" });
    }
  });
  
  // Actualizar una categoría existente
  app.put("/api/cms/categories/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de categoría inválido" });
      }
      
      // Obtener la categoría actual para verificar permisos
      const existingCategory = await storage.getCmsCategory(id);
      
      if (!existingCategory) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
      
      // Verificar permisos
      if (req.user?.role !== "admin" && existingCategory.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para actualizar esta categoría" });
      }
      
      // Validar datos con Zod
      const updateData = insertCmsCategorySchema.partial().parse(req.body);
      
      // No permitir cambiar el ID de la empresa
      delete updateData.companyId;
      
      const updatedCategory = await storage.updateCmsCategory(id, updateData);
      
      if (!updatedCategory) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error al actualizar categoría" });
    }
  });
  
  // Eliminar una categoría
  app.delete("/api/cms/categories/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de categoría inválido" });
      }
      
      // Obtener la categoría actual para verificar permisos
      const existingCategory = await storage.getCmsCategory(id);
      
      if (!existingCategory) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
      
      // Verificar permisos
      if (req.user?.role !== "admin" && existingCategory.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para eliminar esta categoría" });
      }
      
      await storage.deleteCmsCategory(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      res.status(500).json({ error: "Error al eliminar categoría" });
    }
  });
  
  /**
   * RUTAS PARA GESTIÓN DE ARCHIVOS MULTIMEDIA
   */
  
  // Obtener todos los archivos multimedia
  app.get("/api/cms/media", verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = Number(req.query.companyId) || req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: "ID de empresa no proporcionado" });
      }
      
      const files = await storage.getCmsMedia(companyId);
      res.json(files);
    } catch (error) {
      console.error("Error al obtener archivos multimedia:", error);
      res.status(500).json({ error: "Error al obtener archivos multimedia" });
    }
  });
  
  // Obtener un archivo multimedia específico
  app.get("/api/cms/media/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de archivo inválido" });
      }
      
      const file = await storage.getCmsMediaItem(id);
      
      if (!file) {
        return res.status(404).json({ error: "Archivo no encontrado" });
      }
      
      // Verificar que el usuario tenga acceso a esta empresa
      if (req.user?.role !== "admin" && file.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para ver este archivo" });
      }
      
      res.json(file);
    } catch (error) {
      console.error("Error al obtener archivo:", error);
      res.status(500).json({ error: "Error al obtener archivo" });
    }
  });
  
  // Crear un nuevo archivo multimedia
  app.post("/api/cms/media", verifyAuth, async (req: Request, res: Response) => {
    try {
      // Validar datos con Zod
      const fileData = insertCmsMediaSchema.parse(req.body);
      
      // Establecer el usuario que sube el archivo
      fileData.uploadedBy = req.user?.id || 0;
      
      // Solo permitir crear archivos para la propia empresa del usuario
      if (req.user?.role !== "admin" && fileData.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para subir archivos en esta empresa" });
      }
      
      const newFile = await storage.createCmsMedia(fileData);
      res.status(201).json(newFile);
    } catch (error) {
      console.error("Error al crear archivo multimedia:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error al crear archivo multimedia" });
    }
  });
  
  // Actualizar un archivo multimedia existente
  app.put("/api/cms/media/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de archivo inválido" });
      }
      
      // Obtener el archivo actual para verificar permisos
      const existingFile = await storage.getCmsMediaItem(id);
      
      if (!existingFile) {
        return res.status(404).json({ error: "Archivo no encontrado" });
      }
      
      // Verificar permisos
      if (req.user?.role !== "admin" && existingFile.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para actualizar este archivo" });
      }
      
      // Validar datos con Zod
      const updateData = insertCmsMediaSchema.partial().parse(req.body);
      
      // No permitir cambiar el ID de la empresa ni el usuario que lo subió
      delete updateData.companyId;
      delete updateData.uploadedBy;
      
      const updatedFile = await storage.updateCmsMedia(id, updateData);
      
      if (!updatedFile) {
        return res.status(404).json({ error: "Archivo no encontrado" });
      }
      
      res.json(updatedFile);
    } catch (error) {
      console.error("Error al actualizar archivo multimedia:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error al actualizar archivo multimedia" });
    }
  });
  
  // Eliminar un archivo multimedia
  app.delete("/api/cms/media/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de archivo inválido" });
      }
      
      // Obtener el archivo actual para verificar permisos
      const existingFile = await storage.getCmsMediaItem(id);
      
      if (!existingFile) {
        return res.status(404).json({ error: "Archivo no encontrado" });
      }
      
      // Verificar permisos
      if (req.user?.role !== "admin" && existingFile.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para eliminar este archivo" });
      }
      
      await storage.deleteCmsMedia(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error al eliminar archivo multimedia:", error);
      res.status(500).json({ error: "Error al eliminar archivo multimedia" });
    }
  });
  
  /**
   * RUTAS PARA GESTIÓN DE CONFIGURACIÓN DE MARCA
   */
  
  // Obtener configuración de marca
  app.get("/api/cms/branding", verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = Number(req.query.companyId) || req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: "ID de empresa no proporcionado" });
      }
      
      const branding = await storage.getCmsBranding(companyId);
      
      if (!branding) {
        return res.status(404).json({ error: "Configuración de marca no encontrada" });
      }
      
      res.json(branding);
    } catch (error) {
      console.error("Error al obtener configuración de marca:", error);
      res.status(500).json({ error: "Error al obtener configuración de marca" });
    }
  });
  
  // Crear o actualizar configuración de marca
  app.post("/api/cms/branding", verifyAuth, async (req: Request, res: Response) => {
    try {
      // Validar datos con Zod
      const brandingData = insertCmsBrandingSchema.parse(req.body);
      
      // Solo permitir crear configuración para la propia empresa del usuario
      if (req.user?.role !== "admin" && brandingData.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para configurar la marca de esta empresa" });
      }
      
      // Intentar obtener la configuración existente
      const existingBranding = await storage.getCmsBranding(brandingData.companyId);
      
      let result;
      if (existingBranding) {
        // Actualizar configuración existente
        result = await storage.updateCmsBranding(existingBranding.id, brandingData);
      } else {
        // Crear nueva configuración
        result = await storage.createCmsBranding(brandingData);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Error al guardar configuración de marca:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error al guardar configuración de marca" });
    }
  });
  
  // Actualizar configuración de marca
  app.put("/api/cms/branding/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID de configuración inválido" });
      }
      
      // Obtener la configuración actual para verificar permisos
      const existingBranding = await storage.getCmsBranding(id);
      
      if (!existingBranding) {
        return res.status(404).json({ error: "Configuración de marca no encontrada" });
      }
      
      // Verificar permisos
      if (req.user?.role !== "admin" && existingBranding.companyId !== req.user?.companyId) {
        return res.status(403).json({ error: "No tienes permiso para actualizar esta configuración" });
      }
      
      // Validar datos con Zod
      const updateData = insertCmsBrandingSchema.partial().parse(req.body);
      
      // No permitir cambiar el ID de la empresa
      delete updateData.companyId;
      
      const updatedBranding = await storage.updateCmsBranding(id, updateData);
      
      if (!updatedBranding) {
        return res.status(404).json({ error: "Configuración de marca no encontrada" });
      }
      
      res.json(updatedBranding);
    } catch (error) {
      console.error("Error al actualizar configuración de marca:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error al actualizar configuración de marca" });
    }
  });
  
  /**
   * Endpoint público para enviar formularios de contacto
   * No requiere autenticación ya que es para los visitantes del sitio
   */
  app.post("/api/cms/forms/submit", async (req: Request, res: Response) => {
    try {
      const { companyId, formName, formData, pageId } = req.body;
      
      if (!companyId || !formName || !formData) {
        return res.status(400).json({ error: "Datos incompletos" });
      }
      
      const submission = await storage.createCmsFormSubmission({
        companyId,
        formId: formName,
        data: JSON.stringify(formData),
        pageId: pageId || null
      });
      
      res.status(201).json({ success: true, id: submission.id });
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      res.status(500).json({ error: "Error al enviar formulario" });
    }
  });
  
  /**
   * Obtener envíos de formularios
   */
  app.get("/api/cms/forms/submissions", verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = Number(req.query.companyId) || req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: "ID de empresa no proporcionado" });
      }
      
      const submissions = await storage.getCmsFormSubmissions(companyId);
      res.json(submissions);
    } catch (error) {
      console.error("Error al obtener envíos de formularios:", error);
      res.status(500).json({ error: "Error al obtener envíos de formularios" });
    }
  });
}