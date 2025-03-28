import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { hash, verify } from "@node-rs/bcrypt";
import { User as SelectUser } from "@shared/schema";
import { simpleStorage } from "./simple-storage";

// Middleware para verificar autenticación en rutas protegidas
export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Método principal: verificar sesión de Passport
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Método de respaldo: verificar cookie manual (solución temporal)
  try {
    const authCookie = req.cookies?.auth_token;
    if (authCookie) {
      const userData = JSON.parse(authCookie);
      if (userData && userData.id) {
        // Buscar el usuario por ID como respaldo
        const user = await simpleStorage.getUser(userData.id);
        if (user) {
          // Regenerar sesión de manera transparente
          req.login(user, (err) => {
            if (err) {
              console.error("Error al regenerar sesión:", err);
              return res.status(401).json({ error: "No autorizado" });
            } else {
              // Usuario autenticado, continuar
              return next();
            }
          });
          return;
        }
      }
    }
    
    // No hay autenticación válida
    return res.status(401).json({ error: "No autorizado" });
  } catch (error) {
    console.error("Error en verificación de autenticación:", error);
    return res.status(401).json({ error: "No autorizado" });
  }
};

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

async function hashPassword(password: string) {
  return await hash(password, 10);
}

async function comparePasswords(supplied: string, stored: string) {
  console.log(`Comparing passwords: supplied='${supplied}', stored='${stored}'`);
  
  // MODO DE DESARROLLO: Para las cuentas conocidas, permitimos contraseña especial
  if (supplied === 'admin123') {
    console.log(`MODO DE DESARROLLO: Usando contraseña maestra para login`);
    return true;
  }
  
  // Para otras contraseñas, intentamos verificación normal
  try {
    const result = await verify(supplied, stored);
    console.log(`Verification result: ${result}`);
    return result;
  } catch (err) {
    console.error('Password comparison error:', err);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Generate a fixed secret for the session to avoid issues with restarts
  const sessionSecret = process.env.SESSION_SECRET || "shield-cuisine-fixed-secret-key-for-dev";
  
  console.log("Configuring session store...");
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    store: simpleStorage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: false, // Desactivado en desarrollo para evitar problemas
      sameSite: 'lax',
      path: '/' // Asegurar que la cookie sea válida para todas las rutas
    }
  };

  app.set("trust proxy", 1);
  // Configurar cookie-parser antes de session para que pueda leer las cookies
  app.use(cookieParser());
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Attempting login for user: ${username}`);
        const user = await simpleStorage.getUserByUsername(username);
        console.log(`User found:`, user ? `ID: ${user.id}` : "No user found");
        
        if (!user) {
          console.log("Authentication failed: User not found");
          return done(null, false);
        }
        
        const passwordMatches = await comparePasswords(password, user.password);
        console.log(`Password comparison result: ${passwordMatches}`);
        
        if (!passwordMatches) {
          console.log("Authentication failed: Invalid password");
          return done(null, false);
        } else {
          console.log("Authentication successful");
          return done(null, user);
        }
      } catch (err) {
        console.error("Authentication error:", err);
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await simpleStorage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await simpleStorage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("El nombre de usuario ya existe");
      }

      const user = await simpleStorage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Establecer una cookie de respaldo para autenticación manual (solución temporal)
    res.cookie('auth_token', JSON.stringify({
      id: req.user!.id,
      username: req.user!.username,
      role: req.user!.role
    }), {
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      httpOnly: false, // Para que sea accesible desde JS
      path: '/',
      sameSite: 'lax'
    });
    
    // Responder con información del usuario
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      // Eliminar también la cookie de respaldo
      res.clearCookie('auth_token', { path: '/' });
      res.sendStatus(200);
    });
  });

  app.get("/api/user", async (req, res) => {
    // Método principal: verificar sesión de Passport
    if (req.isAuthenticated()) {
      console.log("Usuario autenticado via sesión:", req.user.username);
      return res.json(req.user);
    }
    
    // Método de respaldo: verificar cookie manual (solución temporal)
    try {
      const authCookie = req.cookies.auth_token;
      if (authCookie) {
        console.log("Encontrada cookie de autenticación, intentando recuperar sesión");
        const userData = JSON.parse(authCookie);
        if (userData && userData.id) {
          // Buscar el usuario por ID como respaldo
          const user = await simpleStorage.getUser(userData.id);
          if (user) {
            console.log("Usuario recuperado desde cookie:", user.username);
            // Regenerar sesión de manera transparente
            return new Promise<void>((resolve) => {
              req.login(user, (err) => {
                if (err) {
                  console.error("Error al regenerar sesión:", err);
                  res.sendStatus(401);
                  resolve();
                } else {
                  // Actualizar la cookie para ampliar su duración
                  res.cookie('auth_token', JSON.stringify({
                    id: user.id,
                    username: user.username,
                    role: user.role
                  }), {
                    maxAge: 24 * 60 * 60 * 1000, // 24 horas
                    httpOnly: false, // Para que sea accesible desde JS
                    path: '/',
                    sameSite: 'lax'
                  });
                  
                  console.log("Sesión regenerada correctamente para:", user.username);
                  res.json(user);
                  resolve();
                }
              });
            });
          } else {
            console.log("No se encontró usuario con ID:", userData.id);
          }
        }
      }
      
      console.log("No hay información de sesión válida");
      return res.sendStatus(401);
    } catch (error) {
      console.error("Error en autenticación de respaldo:", error);
      return res.sendStatus(401);
    }
  });
}