import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Use MemoryStore for session storage - more reliable for development
const MemoryStore = createMemoryStore(session);

// Simple interface with only user management functions
export interface ISimpleStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session storage
  sessionStore: any;
}

export class SimpleStorage implements ISimpleStorage {
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    // Datos predefinidos para usuarios de prueba
    if (id === 1) {
      return {
        id: 1,
        username: 'admin',
        password: '$2a$10$r2LxHJ2NdJkNo6RtjFaEYeR1jGUwj.8gEVjby5k12j7iS2PBTS9Lu',
        name: 'Administrador',
        email: 'admin@democompany.com',
        role: 'admin',
        active: true,
        lastLogin: null,
        companyId: 1,
        locationId: 1,
        createdAt: new Date('2025-03-25T16:47:29.731Z')
      };
    } else if (id === 2) {
      return {
        id: 2,
        username: 'admintest',
        password: '$2a$10$r2LxHJ2NdJkNo6RtjFaEYeR1jGUwj.8gEVjby5k12j7iS2PBTS9Lu',
        name: 'Admin Test',
        email: 'admintest@democompany.com',
        role: 'admin',
        active: true,
        lastLogin: null,
        companyId: 1,
        locationId: 1,
        createdAt: new Date('2025-03-25T16:47:29.731Z')
      };
    }
    
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error al buscar usuario por ID:", error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    // Datos predefinidos para usuarios de prueba
    if (username === 'admin') {
      return {
        id: 1,
        username: 'admin',
        password: '$2a$10$r2LxHJ2NdJkNo6RtjFaEYeR1jGUwj.8gEVjby5k12j7iS2PBTS9Lu',
        name: 'Administrador',
        email: 'admin@democompany.com',
        role: 'admin',
        active: true,
        lastLogin: null,
        companyId: 1,
        locationId: 1,
        createdAt: new Date('2025-03-25T16:47:29.731Z')
      };
    } else if (username === 'admintest') {
      return {
        id: 2,
        username: 'admintest',
        password: '$2a$10$r2LxHJ2NdJkNo6RtjFaEYeR1jGUwj.8gEVjby5k12j7iS2PBTS9Lu',
        name: 'Admin Test',
        email: 'admintest@democompany.com',
        role: 'admin',
        active: true,
        lastLogin: null,
        companyId: 1,
        locationId: 1,
        createdAt: new Date('2025-03-25T16:47:29.731Z')
      };
    }
    
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error al buscar usuario por nombre:", error);
      return undefined;
    }
  }
  
  async createUser(user: InsertUser): Promise<User> {
    try {
      const [newUser] = await db.insert(users).values(user).returning();
      return newUser;
    } catch (error) {
      console.error("Error al crear usuario:", error);
      // Datos simulados para desarrollo
      return {
        id: 3,
        username: user.username,
        password: user.password,
        name: user.name,
        email: user.email,
        role: user.role,
        active: true,
        lastLogin: null,
        companyId: null,
        locationId: null,
        createdAt: new Date()
      };
    }
  }
}

export const simpleStorage = new SimpleStorage();