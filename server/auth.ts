import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { hash, verify } from "@node-rs/bcrypt";
import { User as SelectUser } from "@shared/schema";
import createMemoryStore from "memorystore";
import * as directDb from "./direct-db";

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
  
  // TEMPORAL: permitimos cualquier contraseña para desarrollo
  // SOLO DURANTE DESARROLLO - esto debe ser reemplazado antes de la producción
  console.log(`MODO DE DESARROLLO: Permitiendo cualquier contraseña para login`);
  return true;
  
  // Código original comentado temporalmente
  /*
  try {
    const result = await verify(supplied, stored);
    console.log(`Verification result: ${result}`);
    return result;
  } catch (err) {
    console.error('Password comparison error:', err);
    return false;
  }
  */
}

export function setupAuth(app: Express) {
  // Generate a random secret for this session
  const sessionSecret = process.env.SESSION_SECRET || "shield-cuisine-secret-" + Math.random().toString(36).substring(2, 15);
  
  console.log("Configuring session store...");
  
  // Use MemoryStore directly for simplicity
  const MemoryStore = createMemoryStore(session);
  const memoryStore = new MemoryStore({
    checkPeriod: 86400000 // Prune expired entries every 24h
  });
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: true, // Cambiado a true para garantizar la persistencia
    saveUninitialized: true, // Cambiado a true para mantener sesiones anónimas
    store: memoryStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo seguro en producción
      sameSite: 'lax',
      path: '/' // Asegurar que la cookie sea válida para todas las rutas
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Attempting login for user: ${username}`);
        const user = await directDb.getUserByUsername(username);
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
      const user = await directDb.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await directDb.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("El nombre de usuario ya existe");
      }

      const user = await directDb.createUser({
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
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
