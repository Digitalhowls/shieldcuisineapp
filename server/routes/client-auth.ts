import { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { companies, locations } from "@shared/schema";

// Secreto para firmar los tokens - normalmente se guardaría en las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || "shieldcuisine-client-portal-secret";

// Define la estructura del payload del token
interface TokenPayload {
  companyId: number;
  locationId?: number;
  portalType: 'client' | 'public';
  expires: number; // timestamp de expiración
}

// Middleware para verificar token JWT
export const verifyClientToken = async (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      
      // Verificar si el token ha expirado
      if (decoded.expires < Date.now()) {
        return res.status(401).json({ error: 'Token expirado' });
      }
      
      // Añadir la información del token al objeto de solicitud
      req.clientPortal = {
        companyId: decoded.companyId,
        locationId: decoded.locationId,
        portalType: decoded.portalType
      };
      
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Error al verificar token' });
  }
};

// Función para registrar las rutas de autenticación de clientes
export function registerClientAuthRoutes(app: Express) {
  // Ruta para validar un token de acceso
  app.post('/api/client/validate-token', async (req: Request, res: Response) => {
    try {
      const { token, companyId } = req.body;
      
      if (!token || !companyId) {
        return res.status(400).json({ error: 'Token y ID de empresa son requeridos' });
      }
      
      try {
        // Verificar el token
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        
        // Verificar si el token ha expirado
        if (decoded.expires < Date.now()) {
          return res.status(401).json({ error: 'Token expirado' });
        }
        
        // Verificar si el token corresponde a la empresa solicitada
        if (decoded.companyId !== parseInt(companyId.toString())) {
          return res.status(401).json({ error: 'Token no válido para esta empresa' });
        }
        
        // Obtener información básica de la empresa
        const company = await storage.getCompany(decoded.companyId);
        
        if (!company) {
          return res.status(404).json({ error: 'Empresa no encontrada' });
        }
        
        // Devolver información básica y el token validado
        return res.status(200).json({
          valid: true,
          companyId: company.id,
          companyName: company.name,
          businessType: company.businessType,
          portalType: decoded.portalType,
          locationId: decoded.locationId
        });
      } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Error al validar token' });
    }
  });
  
  // Ruta para generar un token de acceso (esto estaría protegido en producción)
  app.post('/api/client/generate-token', async (req: Request, res: Response) => {
    try {
      const { companyId, locationId, portalType, expiresInDays } = req.body;
      
      if (!companyId || !portalType) {
        return res.status(400).json({ error: 'ID de empresa y tipo de portal son requeridos' });
      }
      
      // Verificar que la empresa existe
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ error: 'Empresa no encontrada' });
      }
      
      // Si se proporciona locationId, verificar que pertenece a la empresa
      if (locationId) {
        const location = await storage.getLocation(locationId);
        
        if (!location || location.companyId !== companyId) {
          return res.status(404).json({ error: 'Ubicación no encontrada o no pertenece a la empresa' });
        }
      }
      
      // Establecer expiración predeterminada de 30 días si no se especifica
      const daysToExpire = expiresInDays || 30;
      const expirationTime = Date.now() + (daysToExpire * 24 * 60 * 60 * 1000);
      
      // Crear payload
      const payload: TokenPayload = {
        companyId,
        locationId,
        portalType: portalType as 'client' | 'public',
        expires: expirationTime
      };
      
      // Generar token
      const token = jwt.sign(payload, JWT_SECRET);
      
      return res.status(200).json({
        token,
        expires: new Date(expirationTime).toISOString(),
        companyId,
        locationId,
        portalType
      });
    } catch (error) {
      return res.status(500).json({ error: 'Error al generar token' });
    }
  });
  
  // Ruta para obtener datos de la empresa (protegida por token)
  app.get('/api/client/company', verifyClientToken, async (req: Request, res: Response) => {
    try {
      const { companyId } = req.clientPortal;
      
      // Obtener información de la empresa
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ error: 'Empresa no encontrada' });
      }
      
      // Devolver información pública de la empresa
      return res.status(200).json({
        id: company.id,
        name: company.name,
        businessType: company.businessType,
        description: company.description,
        city: company.city,
        website: company.website,
        logo: company.logo
      });
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener información de la empresa' });
    }
  });
  
  // Otras rutas protegidas para datos de cliente pueden añadirse aquí
}

// Extender el objeto Request para incluir información del portal
declare global {
  namespace Express {
    interface Request {
      clientPortal?: {
        companyId: number;
        locationId?: number;
        portalType: 'client' | 'public';
      };
    }
  }
}