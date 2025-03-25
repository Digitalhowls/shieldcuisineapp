import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para verificar que el usuario está autenticado
 */
export function verifyAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
}

/**
 * Middleware para verificar que el usuario tiene el rol adecuado
 */
export function verifyRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    const userRole = req.user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ error: 'No autorizado para esta acción' });
    }
    
    next();
  };
}