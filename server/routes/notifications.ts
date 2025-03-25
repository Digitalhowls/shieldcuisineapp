/**
 * Rutas de API para el sistema de notificaciones
 */
import { Request, Response, NextFunction, Express } from "express";
import { storage } from "../storage";
import { verifyAuth } from "./auth-middleware";
import { insertNotificationSchema, insertNotificationPreferencesSchema } from "@shared/schema";

/**
 * Registra las rutas para el sistema de notificaciones
 */
export function registerNotificationRoutes(app: Express) {
  /**
   * Obtiene las notificaciones de un usuario
   */
  app.get("/api/notifications", verifyAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).send("No autenticado");
      const notifications = await storage.getUserNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
      res.status(500).send("Error interno del servidor");
    }
  });

  /**
   * Obtiene solo las notificaciones no leídas de un usuario
   */
  app.get("/api/notifications/unread", verifyAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).send("No autenticado");
      const notifications = await storage.getUserUnreadNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error("Error al obtener notificaciones no leídas:", error);
      res.status(500).send("Error interno del servidor");
    }
  });

  /**
   * Crea una nueva notificación para un usuario
   */
  app.post("/api/notifications", verifyAuth, async (req: Request, res: Response) => {
    try {
      const validationResult = insertNotificationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
      }

      const notification = await storage.createNotification(validationResult.data);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error al crear notificación:", error);
      res.status(500).send("Error interno del servidor");
    }
  });

  /**
   * Marca una notificación como leída
   */
  app.put("/api/notifications/:id/read", verifyAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).send("No autenticado");
      
      const notificationId = parseInt(req.params.id, 10);
      if (isNaN(notificationId)) {
        return res.status(400).send("ID de notificación inválido");
      }

      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).send("Notificación no encontrada");
      }
      
      // Verificar que el usuario es dueño de la notificación
      if (updatedNotification.userId !== req.user.id) {
        return res.status(403).send("No autorizado para acceder a esta notificación");
      }
      
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
      res.status(500).send("Error interno del servidor");
    }
  });

  /**
   * Marca todas las notificaciones de un usuario como leídas
   */
  app.put("/api/notifications/read-all", verifyAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).send("No autenticado");
      
      await storage.markAllNotificationsAsRead(req.user.id);
      res.status(200).send("Todas las notificaciones han sido marcadas como leídas");
    } catch (error) {
      console.error("Error al marcar todas las notificaciones como leídas:", error);
      res.status(500).send("Error interno del servidor");
    }
  });

  /**
   * Elimina una notificación específica
   */
  app.delete("/api/notifications/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).send("No autenticado");
      
      const notificationId = parseInt(req.params.id, 10);
      if (isNaN(notificationId)) {
        return res.status(400).send("ID de notificación inválido");
      }
      
      // Primero obtener la notificación para verificar propiedad
      const notification = await storage.getUserNotifications(req.user.id)
        .then(notifications => notifications.find(n => n.id === notificationId));
      
      if (!notification) {
        return res.status(404).send("Notificación no encontrada o no pertenece al usuario");
      }
      
      await storage.deleteNotification(notificationId);
      res.status(200).send("Notificación eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
      res.status(500).send("Error interno del servidor");
    }
  });

  /**
   * Obtiene las preferencias de notificaciones de un usuario
   */
  app.get("/api/notification-preferences", verifyAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).send("No autenticado");
      
      const preferences = await storage.getUserNotificationPreferences(req.user.id);
      
      if (!preferences) {
        // Si no hay preferencias, crear unas por defecto
        const defaultPreferences = {
          userId: req.user.id,
          appccNotifications: true,
          inventoryNotifications: true,
          learningNotifications: true,
          bankingNotifications: true,
          systemNotifications: true,
          securityNotifications: true,
          purchasingNotifications: true,
          emailNotifications: true,
          emailFrequency: "daily"
        };
        
        const newPreferences = await storage.createNotificationPreferences(defaultPreferences);
        return res.json(newPreferences);
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error al obtener preferencias de notificaciones:", error);
      res.status(500).send("Error interno del servidor");
    }
  });

  /**
   * Actualiza las preferencias de notificaciones de un usuario
   */
  app.put("/api/notification-preferences", verifyAuth, async (req: Request, res: Response) => {
    try {
      if (!req.user) return res.status(401).send("No autenticado");
      
      const validationResult = insertNotificationPreferencesSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ errors: validationResult.error.errors });
      }

      // Obtener preferencias actuales o crear nuevas
      let preferences = await storage.getUserNotificationPreferences(req.user.id);
      
      if (!preferences) {
        // Si no hay preferencias, crear unas nuevas con los datos proporcionados
        const newPreferences = {
          userId: req.user.id,
          appccNotifications: true,
          inventoryNotifications: true,
          learningNotifications: true,
          bankingNotifications: true,
          systemNotifications: true,
          securityNotifications: true,
          purchasingNotifications: true,
          emailNotifications: true,
          emailFrequency: "daily",
          ...validationResult.data
        };
        
        const createdPreferences = await storage.createNotificationPreferences(newPreferences);
        return res.json(createdPreferences);
      }
      
      // Si ya existen preferencias, actualizarlas
      const updatedPreferences = await storage.updateNotificationPreferences(
        preferences.id, 
        validationResult.data
      );
      
      res.json(updatedPreferences);
    } catch (error) {
      console.error("Error al actualizar preferencias de notificaciones:", error);
      res.status(500).send("Error interno del servidor");
    }
  });
}