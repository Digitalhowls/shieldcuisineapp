/**
 * Rutas de API para el módulo CMS y Constructor Web
 */
import { Request, Response, NextFunction, Express } from "express";
import { storage } from "../storage";
import { 
  insertCmsPageSchema, 
  insertCmsCategorySchema, 
  insertCmsTagSchema, 
  insertCmsMediaSchema,
  insertCmsBrandingSchema,
  insertCmsMenuSchema,
  insertCmsMenuItemSchema,
  insertCmsFormSubmissionSchema,
  insertCmsPageCategorySchema,
  insertCmsPageTagSchema,
  insertCmsPageVersionSchema
} from "@shared/schema";

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
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "No autorizado" });
  }
  
  if (!req.user || !['admin', 'company_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: "Acceso prohibido. Se requiere rol de administrador" });
  }
  
  next();
};

/**
 * Registra las rutas para el módulo CMS
 */
export function registerCmsRoutes(app: Express) {
  
  /**
   * Endpoint público para enviar formularios de contacto
   * No requiere autenticación ya que es para los visitantes del sitio
   */
  app.post("/api/cms/forms/submit", async (req: Request, res: Response) => {
    try {
      const { companyId, pageId, formId, data } = req.body;
      
      if (!companyId || !formId || !data) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }
      
      const formSubmission = await storage.createCmsFormSubmission({
        companyId,
        formId,
        pageId: pageId || null,
        data,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || null,
        processed: false
      });
      
      // Enviar notificación si hay un correo electrónico de destino
      if (data.destinationEmail) {
        try {
          // TODO: Implementar envío de correo electrónico
          // Por ahora, marcar como procesado
          console.log(`[CMS] Formulario ${formId} enviado. Se enviaría correo a: ${data.destinationEmail}`);
        } catch (emailError) {
          console.error("[CMS] Error al enviar notificación por correo:", emailError);
        }
      }
      
      return res.status(201).json({ 
        success: true, 
        message: "Formulario enviado correctamente", 
        id: formSubmission.id 
      });
    } catch (error) {
      console.error("[CMS] Error al procesar envío de formulario:", error);
      return res.status(500).json({ error: "Error al procesar el formulario" });
    }
  });
  
  /**
   * Obtener envíos de formularios (requiere autenticación)
   */
  app.get("/api/cms/forms/submissions", verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = parseInt(req.query.companyId as string);
      const pageId = req.query.pageId ? parseInt(req.query.pageId as string) : undefined;
      
      if (!companyId || isNaN(companyId)) {
        return res.status(400).json({ error: "ID de empresa no válido" });
      }
      
      // Verificar que el usuario tiene acceso a esta empresa
      if (req.user && req.user.role !== 'admin' && req.user.companyId !== companyId) {
        return res.status(403).json({ error: "No tienes permisos para acceder a estos datos" });
      }
      
      const submissions = await storage.getCmsFormSubmissions(companyId, pageId);
      return res.json(submissions);
    } catch (error) {
      console.error("[CMS] Error al obtener envíos de formularios:", error);
      return res.status(500).json({ error: "Error al obtener los envíos de formularios" });
    }
  });
  
  /**
   * Rutas para páginas CMS
   */
  
  // Obtener todas las páginas de una compañía
  app.get("/api/cms/pages", verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId || 1; // Fallback a compañía 1 si no existe
      const pages = await storage.getCmsPages(companyId);
      res.json(pages);
    } catch (error) {
      console.error("Error al obtener páginas CMS:", error);
      res.status(500).json({ error: "Error al obtener páginas CMS" });
    }
  });
  
  // Obtener una página por ID
  app.get("/api/cms/pages/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const pageId = parseInt(req.params.id);
      const page = await storage.getCmsPage(pageId);
      
      if (!page) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria de la página
      if (page.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para ver esta página" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error al obtener página CMS:", error);
      res.status(500).json({ error: "Error al obtener página CMS" });
    }
  });
  
  // Obtener una página por slug
  app.get("/api/cms/companies/:companyId/pages/:slug", async (req: Request, res: Response) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const slug = req.params.slug;
      
      const page = await storage.getCmsPageBySlug(companyId, slug);
      
      if (!page) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      // Si es una página no pública y el usuario no está autenticado
      if (page.visibility !== 'public' && !req.isAuthenticated()) {
        return res.status(403).json({ error: "No tienes permiso para ver esta página" });
      }
      
      // Si es una página interna y el usuario no pertenece a la compañía
      if (page.visibility === 'internal' && 
          req.isAuthenticated() && 
          req.user?.companyId !== companyId && 
          req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para ver esta página" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error al obtener página CMS por slug:", error);
      res.status(500).json({ error: "Error al obtener página CMS" });
    }
  });
  
  // Crear una nueva página
  app.post("/api/cms/pages", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: "Compañía no especificada" });
      }
      
      const pageData = insertCmsPageSchema.parse({
        ...req.body,
        companyId
      });
      
      const newPage = await storage.createCmsPage(pageData);
      
      // Si se especifican categorías, agregarlas
      if (req.body.categories && Array.isArray(req.body.categories)) {
        for (const categoryId of req.body.categories) {
          await storage.addCmsPageToCategory({
            pageId: newPage.id,
            categoryId: parseInt(categoryId)
          });
        }
      }
      
      // Si se especifican etiquetas, agregarlas
      if (req.body.tags && Array.isArray(req.body.tags)) {
        for (const tagId of req.body.tags) {
          await storage.addCmsPageTag({
            pageId: newPage.id,
            tagId: parseInt(tagId)
          });
        }
      }
      
      // Crear notificación para administradores de la empresa
      // TODO: implementar notificaciones para el módulo CMS
      
      res.status(201).json(newPage);
    } catch (error) {
      console.error("Error al crear página CMS:", error);
      res.status(500).json({ error: "Error al crear página CMS" });
    }
  });
  
  // Actualizar una página existente
  app.put("/api/cms/pages/:id", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const pageId = parseInt(req.params.id);
      const existingPage = await storage.getCmsPage(pageId);
      
      if (!existingPage) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria de la página
      if (existingPage.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para editar esta página" });
      }
      
      const pageData = req.body;
      delete pageData.id; // Asegurarse de que no se actualice el ID
      delete pageData.companyId; // No permitir cambiar la compañía
      
      const updatedPage = await storage.updateCmsPage(pageId, pageData);
      
      // Si se especifican categorías, actualizar las relaciones
      if (req.body.categories && Array.isArray(req.body.categories)) {
        // Obtener categorías actuales
        const currentCategories = await storage.getCmsPageCategories(pageId);
        const currentCategoryIds = currentCategories.map(c => c.categoryId);
        const newCategoryIds = req.body.categories.map(id => parseInt(id));
        
        // Eliminar categorías que ya no están en la lista
        for (const cat of currentCategories) {
          if (!newCategoryIds.includes(cat.categoryId)) {
            await storage.removeCmsPageFromCategory(pageId, cat.categoryId);
          }
        }
        
        // Agregar nuevas categorías
        for (const categoryId of newCategoryIds) {
          if (!currentCategoryIds.includes(categoryId)) {
            await storage.addCmsPageToCategory({
              pageId,
              categoryId
            });
          }
        }
      }
      
      // Si se especifican etiquetas, actualizar las relaciones
      if (req.body.tags && Array.isArray(req.body.tags)) {
        // Obtener etiquetas actuales
        const currentTags = await storage.getCmsPageTags(pageId);
        const currentTagIds = currentTags.map(t => t.tagId);
        const newTagIds = req.body.tags.map(id => parseInt(id));
        
        // Eliminar etiquetas que ya no están en la lista
        for (const tag of currentTags) {
          if (!newTagIds.includes(tag.tagId)) {
            await storage.removeCmsPageTag(pageId, tag.tagId);
          }
        }
        
        // Agregar nuevas etiquetas
        for (const tagId of newTagIds) {
          if (!currentTagIds.includes(tagId)) {
            await storage.addCmsPageTag({
              pageId,
              tagId
            });
          }
        }
      }
      
      res.json(updatedPage);
    } catch (error) {
      console.error("Error al actualizar página CMS:", error);
      res.status(500).json({ error: "Error al actualizar página CMS" });
    }
  });
  
  // Eliminar una página
  app.delete("/api/cms/pages/:id", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const pageId = parseInt(req.params.id);
      const existingPage = await storage.getCmsPage(pageId);
      
      if (!existingPage) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria de la página
      if (existingPage.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para eliminar esta página" });
      }
      
      // Eliminar las relaciones con categorías
      const pageCategories = await storage.getCmsPageCategories(pageId);
      for (const pc of pageCategories) {
        await storage.removeCmsPageFromCategory(pageId, pc.categoryId);
      }
      
      // Eliminar las relaciones con etiquetas
      const pageTags = await storage.getCmsPageTags(pageId);
      for (const pt of pageTags) {
        await storage.removeCmsPageTag(pageId, pt.tagId);
      }
      
      // Eliminar la página
      await storage.deleteCmsPage(pageId);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error al eliminar página CMS:", error);
      res.status(500).json({ error: "Error al eliminar página CMS" });
    }
  });
  
  /**
   * Rutas para categorías CMS
   */
  
  // Obtener todas las categorías de una compañía
  app.get("/api/cms/categories", verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId || 1; // Fallback a compañía 1 si no existe
      const categories = await storage.getCmsCategories(companyId);
      res.json(categories);
    } catch (error) {
      console.error("Error al obtener categorías CMS:", error);
      res.status(500).json({ error: "Error al obtener categorías CMS" });
    }
  });
  
  // Obtener una categoría por ID
  app.get("/api/cms/categories/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCmsCategory(categoryId);
      
      if (!category) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria de la categoría
      if (category.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para ver esta categoría" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error al obtener categoría CMS:", error);
      res.status(500).json({ error: "Error al obtener categoría CMS" });
    }
  });
  
  // Crear una nueva categoría
  app.post("/api/cms/categories", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: "Compañía no especificada" });
      }
      
      const categoryData = insertCmsCategorySchema.parse({
        ...req.body,
        companyId
      });
      
      const newCategory = await storage.createCmsCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error al crear categoría CMS:", error);
      res.status(500).json({ error: "Error al crear categoría CMS" });
    }
  });
  
  // Actualizar una categoría existente
  app.put("/api/cms/categories/:id", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const existingCategory = await storage.getCmsCategory(categoryId);
      
      if (!existingCategory) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria de la categoría
      if (existingCategory.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para editar esta categoría" });
      }
      
      const categoryData = req.body;
      delete categoryData.id; // Asegurarse de que no se actualice el ID
      delete categoryData.companyId; // No permitir cambiar la compañía
      
      const updatedCategory = await storage.updateCmsCategory(categoryId, categoryData);
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error al actualizar categoría CMS:", error);
      res.status(500).json({ error: "Error al actualizar categoría CMS" });
    }
  });
  
  // Eliminar una categoría
  app.delete("/api/cms/categories/:id", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.id);
      const existingCategory = await storage.getCmsCategory(categoryId);
      
      if (!existingCategory) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria de la categoría
      if (existingCategory.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para eliminar esta categoría" });
      }
      
      await storage.deleteCmsCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      console.error("Error al eliminar categoría CMS:", error);
      res.status(500).json({ error: "Error al eliminar categoría CMS" });
    }
  });
  
  /**
   * Rutas para Media (imágenes y archivos)
   */
  
  // Obtener todos los elementos media de una compañía
  app.get("/api/cms/media", verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId || 1;
      const mediaItems = await storage.getCmsMedia(companyId);
      res.json(mediaItems);
    } catch (error) {
      console.error("Error al obtener elementos media:", error);
      res.status(500).json({ error: "Error al obtener elementos media" });
    }
  });
  
  // Obtener un elemento media por ID
  app.get("/api/cms/media/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const mediaId = parseInt(req.params.id);
      const media = await storage.getCmsMediaItem(mediaId);
      
      if (!media) {
        return res.status(404).json({ error: "Elemento media no encontrado" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria
      if (media.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para ver este elemento media" });
      }
      
      res.json(media);
    } catch (error) {
      console.error("Error al obtener elemento media:", error);
      res.status(500).json({ error: "Error al obtener elemento media" });
    }
  });
  
  // Crear un nuevo elemento media
  app.post("/api/cms/media", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: "Compañía no especificada" });
      }
      
      const mediaData = insertCmsMediaSchema.parse({
        ...req.body,
        companyId
      });
      
      const newMedia = await storage.createCmsMedia(mediaData);
      res.status(201).json(newMedia);
    } catch (error) {
      console.error("Error al crear elemento media:", error);
      res.status(500).json({ error: "Error al crear elemento media" });
    }
  });
  
  // Actualizar un elemento media existente
  app.put("/api/cms/media/:id", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const mediaId = parseInt(req.params.id);
      const existingMedia = await storage.getCmsMediaItem(mediaId);
      
      if (!existingMedia) {
        return res.status(404).json({ error: "Elemento media no encontrado" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria
      if (existingMedia.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para editar este elemento media" });
      }
      
      const mediaData = req.body;
      delete mediaData.id;
      delete mediaData.companyId;
      
      const updatedMedia = await storage.updateCmsMedia(mediaId, mediaData);
      res.json(updatedMedia);
    } catch (error) {
      console.error("Error al actualizar elemento media:", error);
      res.status(500).json({ error: "Error al actualizar elemento media" });
    }
  });
  
  // Eliminar un elemento media
  app.delete("/api/cms/media/:id", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const mediaId = parseInt(req.params.id);
      const existingMedia = await storage.getCmsMediaItem(mediaId);
      
      if (!existingMedia) {
        return res.status(404).json({ error: "Elemento media no encontrado" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria
      if (existingMedia.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para eliminar este elemento media" });
      }
      
      await storage.deleteCmsMedia(mediaId);
      res.status(204).send();
    } catch (error) {
      console.error("Error al eliminar elemento media:", error);
      res.status(500).json({ error: "Error al eliminar elemento media" });
    }
  });
  
  /**
   * Rutas para configuración de branding
   */
  
  // Obtener configuración de branding para una compañía
  app.get("/api/cms/branding", verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId || 1;
      const branding = await storage.getCmsBranding(companyId);
      
      if (!branding) {
        return res.status(404).json({ error: "Configuración de branding no encontrada" });
      }
      
      res.json(branding);
    } catch (error) {
      console.error("Error al obtener configuración de branding:", error);
      res.status(500).json({ error: "Error al obtener configuración de branding" });
    }
  });
  
  // Crear o actualizar configuración de branding
  app.post("/api/cms/branding", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: "Compañía no especificada" });
      }
      
      // Verificar si ya existe una configuración de branding
      const existingBranding = await storage.getCmsBranding(companyId);
      
      if (existingBranding) {
        // Actualizar la configuración existente
        const brandingData = req.body;
        delete brandingData.id;
        delete brandingData.companyId;
        
        const updatedBranding = await storage.updateCmsBranding(existingBranding.id, brandingData);
        return res.json(updatedBranding);
      } else {
        // Crear nueva configuración
        const brandingData = insertCmsBrandingSchema.parse({
          ...req.body,
          companyId
        });
        
        const newBranding = await storage.createCmsBranding(brandingData);
        return res.status(201).json(newBranding);
      }
    } catch (error) {
      console.error("Error al crear/actualizar configuración de branding:", error);
      res.status(500).json({ error: "Error al crear/actualizar configuración de branding" });
    }
  });
  
  /**
   * Rutas para menús
   */
  
  // Obtener todos los menús de una compañía
  app.get("/api/cms/menus", verifyAuth, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId || 1;
      const menus = await storage.getCmsMenus(companyId);
      res.json(menus);
    } catch (error) {
      console.error("Error al obtener menús:", error);
      res.status(500).json({ error: "Error al obtener menús" });
    }
  });
  
  // Obtener un menú por ID
  app.get("/api/cms/menus/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const menuId = parseInt(req.params.id);
      const menu = await storage.getCmsMenu(menuId);
      
      if (!menu) {
        return res.status(404).json({ error: "Menú no encontrado" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria
      if (menu.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para ver este menú" });
      }
      
      // Obtener los elementos del menú
      const menuItems = await storage.getCmsMenuItems(menuId);
      
      res.json({
        ...menu,
        items: menuItems
      });
    } catch (error) {
      console.error("Error al obtener menú:", error);
      res.status(500).json({ error: "Error al obtener menú" });
    }
  });
  
  // Obtener un menú por ubicación
  app.get("/api/cms/companies/:companyId/menus/:location", async (req: Request, res: Response) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const location = req.params.location;
      
      const menu = await storage.getCmsMenuByLocation(companyId, location);
      
      if (!menu) {
        return res.status(404).json({ error: "Menú no encontrado" });
      }
      
      // Obtener los elementos del menú
      const menuItems = await storage.getCmsMenuItems(menu.id);
      
      res.json({
        ...menu,
        items: menuItems
      });
    } catch (error) {
      console.error("Error al obtener menú por ubicación:", error);
      res.status(500).json({ error: "Error al obtener menú por ubicación" });
    }
  });
  
  // Crear un nuevo menú
  app.post("/api/cms/menus", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId;
      
      if (!companyId) {
        return res.status(400).json({ error: "Compañía no especificada" });
      }
      
      const menuData = insertCmsMenuSchema.parse({
        ...req.body,
        companyId
      });
      
      const newMenu = await storage.createCmsMenu(menuData);
      
      // Si se especifican elementos del menú, crearlos
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          await storage.createCmsMenuItem({
            ...item,
            menuId: newMenu.id
          });
        }
      }
      
      res.status(201).json(newMenu);
    } catch (error) {
      console.error("Error al crear menú:", error);
      res.status(500).json({ error: "Error al crear menú" });
    }
  });
  
  // Actualizar un menú existente
  app.put("/api/cms/menus/:id", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const menuId = parseInt(req.params.id);
      const existingMenu = await storage.getCmsMenu(menuId);
      
      if (!existingMenu) {
        return res.status(404).json({ error: "Menú no encontrado" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria
      if (existingMenu.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para editar este menú" });
      }
      
      const menuData = req.body;
      delete menuData.id;
      delete menuData.companyId;
      delete menuData.items; // Los elementos del menú se actualizan por separado
      
      const updatedMenu = await storage.updateCmsMenu(menuId, menuData);
      res.json(updatedMenu);
    } catch (error) {
      console.error("Error al actualizar menú:", error);
      res.status(500).json({ error: "Error al actualizar menú" });
    }
  });
  
  // Eliminar un menú
  app.delete("/api/cms/menus/:id", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const menuId = parseInt(req.params.id);
      const existingMenu = await storage.getCmsMenu(menuId);
      
      if (!existingMenu) {
        return res.status(404).json({ error: "Menú no encontrado" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria
      if (existingMenu.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para eliminar este menú" });
      }
      
      // Eliminar todos los elementos del menú
      const menuItems = await storage.getCmsMenuItems(menuId);
      for (const item of menuItems) {
        await storage.deleteCmsMenuItem(item.id);
      }
      
      // Eliminar el menú
      await storage.deleteCmsMenu(menuId);
      res.status(204).send();
    } catch (error) {
      console.error("Error al eliminar menú:", error);
      res.status(500).json({ error: "Error al eliminar menú" });
    }
  });
  
  /**
   * Rutas para elementos de menú
   */
  
  // Obtener elementos de un menú
  app.get("/api/cms/menus/:menuId/items", verifyAuth, async (req: Request, res: Response) => {
    try {
      const menuId = parseInt(req.params.menuId);
      const menu = await storage.getCmsMenu(menuId);
      
      if (!menu) {
        return res.status(404).json({ error: "Menú no encontrado" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria
      if (menu.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para ver los elementos de este menú" });
      }
      
      const menuItems = await storage.getCmsMenuItems(menuId);
      res.json(menuItems);
    } catch (error) {
      console.error("Error al obtener elementos de menú:", error);
      res.status(500).json({ error: "Error al obtener elementos de menú" });
    }
  });
  
  // Crear un nuevo elemento de menú
  app.post("/api/cms/menus/:menuId/items", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const menuId = parseInt(req.params.menuId);
      const menu = await storage.getCmsMenu(menuId);
      
      if (!menu) {
        return res.status(404).json({ error: "Menú no encontrado" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria
      if (menu.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para añadir elementos a este menú" });
      }
      
      const menuItemData = insertCmsMenuItemSchema.parse({
        ...req.body,
        menuId
      });
      
      const newMenuItem = await storage.createCmsMenuItem(menuItemData);
      res.status(201).json(newMenuItem);
    } catch (error) {
      console.error("Error al crear elemento de menú:", error);
      res.status(500).json({ error: "Error al crear elemento de menú" });
    }
  });
  
  // Actualizar un elemento de menú existente
  app.put("/api/cms/menu-items/:id", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const menuItemId = parseInt(req.params.id);
      const existingMenuItem = await storage.getCmsMenuItem(menuItemId);
      
      if (!existingMenuItem) {
        return res.status(404).json({ error: "Elemento de menú no encontrado" });
      }
      
      // Obtener el menú para verificar la propiedad
      const menu = await storage.getCmsMenu(existingMenuItem.menuId);
      
      if (!menu) {
        return res.status(404).json({ error: "Menú no encontrado" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria
      if (menu.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para editar este elemento de menú" });
      }
      
      const menuItemData = req.body;
      delete menuItemData.id;
      delete menuItemData.menuId; // No permitir cambiar a qué menú pertenece
      
      const updatedMenuItem = await storage.updateCmsMenuItem(menuItemId, menuItemData);
      res.json(updatedMenuItem);
    } catch (error) {
      console.error("Error al actualizar elemento de menú:", error);
      res.status(500).json({ error: "Error al actualizar elemento de menú" });
    }
  });
  
  // Eliminar un elemento de menú
  app.delete("/api/cms/menu-items/:id", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const menuItemId = parseInt(req.params.id);
      const existingMenuItem = await storage.getCmsMenuItem(menuItemId);
      
      if (!existingMenuItem) {
        return res.status(404).json({ error: "Elemento de menú no encontrado" });
      }
      
      // Obtener el menú para verificar la propiedad
      const menu = await storage.getCmsMenu(existingMenuItem.menuId);
      
      if (!menu) {
        return res.status(404).json({ error: "Menú no encontrado" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria
      if (menu.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para eliminar este elemento de menú" });
      }
      
      await storage.deleteCmsMenuItem(menuItemId);
      res.status(204).send();
    } catch (error) {
      console.error("Error al eliminar elemento de menú:", error);
      res.status(500).json({ error: "Error al eliminar elemento de menú" });
    }
  });
  
  /**
   * Rutas para envíos de formularios
   */
  
  // Obtener todos los envíos de formularios de una compañía
  app.get("/api/cms/form-submissions", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const companyId = req.user?.companyId || 1;
      const pageId = req.query.pageId ? parseInt(req.query.pageId as string) : undefined;
      
      const submissions = await storage.getCmsFormSubmissions(companyId, pageId);
      res.json(submissions);
    } catch (error) {
      console.error("Error al obtener envíos de formularios:", error);
      res.status(500).json({ error: "Error al obtener envíos de formularios" });
    }
  });
  
  // Crear un nuevo envío de formulario (endpoint público)
  app.post("/api/cms/companies/:companyId/form-submissions", async (req: Request, res: Response) => {
    try {
      const companyId = parseInt(req.params.companyId);
      
      // Validar los datos del formulario
      const formData = insertCmsFormSubmissionSchema.parse({
        ...req.body,
        companyId
      });
      
      // Verificar que la página existe y pertenece a la compañía correcta
      if (formData.pageId) {
        const page = await storage.getCmsPage(formData.pageId);
        
        if (!page || page.companyId !== companyId) {
          return res.status(400).json({ error: "Página inválida" });
        }
      }
      
      const newSubmission = await storage.createCmsFormSubmission(formData);
      
      // Enviar notificación a los administradores de la compañía
      // TODO: implementar notificaciones para los envíos de formularios
      
      res.status(201).json({ success: true, id: newSubmission.id });
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      res.status(500).json({ error: "Error al enviar formulario" });
    }
  });
  
  // Eliminar un envío de formulario
  app.delete("/api/cms/form-submissions/:id", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.id);
      const submission = await storage.getCmsFormSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ error: "Envío de formulario no encontrado" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria
      if (submission.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para eliminar este envío de formulario" });
      }
      
      await storage.deleteCmsFormSubmission(submissionId);
      res.status(204).send();
    } catch (error) {
      console.error("Error al eliminar envío de formulario:", error);
      res.status(500).json({ error: "Error al eliminar envío de formulario" });
    }
  });

  /**
   * Rutas para historial de versiones de páginas
   */
  
  // Obtener todas las versiones de una página
  app.get("/api/cms/pages/:pageId/versions", verifyAuth, async (req: Request, res: Response) => {
    try {
      const pageId = parseInt(req.params.pageId);
      const page = await storage.getCmsPage(pageId);
      
      if (!page) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria de la página
      if (page.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para ver el historial de esta página" });
      }
      
      const versions = await storage.getCmsPageVersions(pageId);
      res.json(versions);
    } catch (error) {
      console.error("Error al obtener historial de versiones:", error);
      res.status(500).json({ error: "Error al obtener historial de versiones" });
    }
  });
  
  // Obtener una versión específica
  app.get("/api/cms/pages/:pageId/versions/:versionId", verifyAuth, async (req: Request, res: Response) => {
    try {
      const pageId = parseInt(req.params.pageId);
      const versionId = req.params.versionId;
      
      const page = await storage.getCmsPage(pageId);
      
      if (!page) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria de la página
      if (page.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para ver esta versión" });
      }
      
      const version = await storage.getCmsPageVersion(versionId);
      
      if (!version || version.pageId !== pageId) {
        return res.status(404).json({ error: "Versión no encontrada" });
      }
      
      res.json(version);
    } catch (error) {
      console.error("Error al obtener versión:", error);
      res.status(500).json({ error: "Error al obtener versión" });
    }
  });
  
  // Crear una nueva versión
  app.post("/api/cms/pages/:pageId/versions", verifyAuth, async (req: Request, res: Response) => {
    try {
      const pageId = parseInt(req.params.pageId);
      const page = await storage.getCmsPage(pageId);
      
      if (!page) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria de la página
      if (page.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para crear versiones de esta página" });
      }
      
      // Obtener número de la última versión
      const versions = await storage.getCmsPageVersions(pageId);
      const lastVersion = versions.length > 0 ? versions[0] : null;
      const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
      
      const versionData = insertCmsPageVersionSchema.parse({
        ...req.body,
        pageId,
        versionNumber: nextVersionNumber,
        author: req.user?.fullName || req.user?.username || "Unknown",
      });
      
      const newVersion = await storage.createCmsPageVersion(versionData);
      res.status(201).json(newVersion);
    } catch (error) {
      console.error("Error al crear versión:", error);
      res.status(500).json({ error: "Error al crear versión" });
    }
  });
  
  // Restaurar una versión
  app.post("/api/cms/pages/:pageId/versions/:versionId/restore", verifyAuth, async (req: Request, res: Response) => {
    try {
      const pageId = parseInt(req.params.pageId);
      const versionId = req.params.versionId;
      
      const page = await storage.getCmsPage(pageId);
      
      if (!page) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria de la página
      if (page.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para restaurar versiones de esta página" });
      }
      
      const version = await storage.getCmsPageVersion(versionId);
      
      if (!version || version.pageId !== pageId) {
        return res.status(404).json({ error: "Versión no encontrada" });
      }
      
      // Guardar el estado actual como una nueva versión para poder deshacer la restauración
      const versions = await storage.getCmsPageVersions(pageId);
      const nextVersionNumber = versions.length > 0 ? versions[0].versionNumber + 1 : 1;
      
      await storage.createCmsPageVersion({
        pageId,
        versionNumber: nextVersionNumber,
        content: page.content,
        title: page.title,
        description: page.description || undefined,
        author: req.user?.fullName || req.user?.username || "Unknown",
        changeDescription: "Estado antes de restaurar versión " + version.versionNumber,
        isSnapshot: true,
        status: page.status,
      });
      
      // Actualizar la página con el contenido de la versión
      await storage.updateCmsPage(pageId, {
        content: version.content,
        title: version.title,
        status: version.status,
      });
      
      res.status(200).json({ message: "Versión restaurada correctamente" });
    } catch (error) {
      console.error("Error al restaurar versión:", error);
      res.status(500).json({ error: "Error al restaurar versión" });
    }
  });
  
  // Comparar dos versiones
  app.get("/api/cms/pages/:pageId/versions/compare", verifyAuth, async (req: Request, res: Response) => {
    try {
      const pageId = parseInt(req.params.pageId);
      const versionId1 = req.query.v1 as string;
      const versionId2 = req.query.v2 as string;
      
      if (!versionId1 || !versionId2) {
        return res.status(400).json({ error: "Se requieren dos IDs de versión para comparar" });
      }
      
      const page = await storage.getCmsPage(pageId);
      
      if (!page) {
        return res.status(404).json({ error: "Página no encontrada" });
      }
      
      // Verificar que el usuario pertenece a la compañía propietaria de la página
      if (page.companyId !== req.user?.companyId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: "No tienes permiso para comparar versiones de esta página" });
      }
      
      const versionA = await storage.getCmsPageVersion(versionId1);
      const versionB = await storage.getCmsPageVersion(versionId2);
      
      if (!versionA || versionA.pageId !== pageId || !versionB || versionB.pageId !== pageId) {
        return res.status(404).json({ error: "Una o ambas versiones no fueron encontradas" });
      }
      
      // Obtener diferencias entre las versiones
      // En un caso real, aquí se usaría una biblioteca para detectar diferencias en JSON
      // Para esta implementación, devolvemos un ejemplo simple
      
      // Convertir contenido de JSON string a objetos para comparación
      let contentA, contentB;
      try {
        contentA = JSON.parse(versionA.content);
        contentB = JSON.parse(versionB.content);
      } catch (e) {
        // Si hay error en el parsing, usar el contenido raw
        contentA = versionA.content;
        contentB = versionB.content;
      }
      
      // Generar HTML para visualización
      // En un caso real, habría una función que convierte bloques en HTML
      const contentHtmlA = typeof contentA === 'string' ? contentA : JSON.stringify(contentA, null, 2);
      const contentHtmlB = typeof contentB === 'string' ? contentB : JSON.stringify(contentB, null, 2);
      
      // Ejemplo de diferencias (en un sistema real se calcularían automáticamente)
      const differences = [
        {
          type: 'modified',
          description: 'Se modificó el título',
        }
      ];
      
      if (versionA.title !== versionB.title) {
        differences.push({
          type: 'modified',
          description: `Título cambiado de "${versionA.title}" a "${versionB.title}"`,
        });
      }
      
      // Comparación muy básica de contenido (en una implementación real sería más sofisticada)
      if (versionA.content !== versionB.content) {
        differences.push({
          type: 'modified',
          description: 'Contenido modificado',
        });
      }
      
      res.json({
        versionA: {
          ...versionA,
          contentHtml: contentHtmlA,
        },
        versionB: {
          ...versionB,
          contentHtml: contentHtmlB,
        },
        differences,
      });
    } catch (error) {
      console.error("Error al comparar versiones:", error);
      res.status(500).json({ error: "Error al comparar versiones" });
    }
  });
}