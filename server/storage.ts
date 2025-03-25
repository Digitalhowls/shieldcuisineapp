import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users,
  companies,
  locations,
  warehouses,
  products,
  suppliers,
  inventory,
  inventoryTransactions,
  controlTemplates,
  controlRecords,
  recipes,
  recipeIngredients,
  customers,
  sales,
  saleItems,
  invoices,
  invoiceItems,
  type User,
  type InsertUser,
  type Company,
  type InsertCompany,
  type Location,
  type InsertLocation,
  type Warehouse,
  type InsertWarehouse,
  type Product,
  type InsertProduct,
  type ControlTemplate,
  type InsertControlTemplate,
  type ControlRecord,
  type InsertControlRecord
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Companies
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, data: Partial<InsertCompany>): Promise<Company | undefined>;
  
  // Locations
  getLocations(companyId: number): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  
  // Warehouses
  getWarehouses(locationId: number): Promise<Warehouse[]>;
  getWarehouse(id: number): Promise<Warehouse | undefined>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  
  // Products
  getProducts(companyId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // APPCC Control Templates
  getControlTemplates(companyId: number): Promise<ControlTemplate[]>;
  getControlTemplate(id: number): Promise<ControlTemplate | undefined>;
  createControlTemplate(template: InsertControlTemplate): Promise<ControlTemplate>;
  
  // APPCC Control Records
  getControlRecords(locationId: number): Promise<ControlRecord[]>;
  getTodayControlRecords(locationId: number): Promise<ControlRecord[]>;
  getControlRecord(id: number): Promise<ControlRecord | undefined>;
  createControlRecord(record: InsertControlRecord): Promise<ControlRecord>;
  updateControlRecord(id: number, data: Partial<InsertControlRecord>): Promise<ControlRecord | undefined>;
  
  // Session storage
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }
  
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  // Companies
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }
  
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }
  
  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }
  
  async updateCompany(id: number, data: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updatedCompany] = await db
      .update(companies)
      .set(data)
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }
  
  // Locations
  async getLocations(companyId: number): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.companyId, companyId));
  }
  
  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }
  
  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }
  
  // Warehouses
  async getWarehouses(locationId: number): Promise<Warehouse[]> {
    return await db.select().from(warehouses).where(eq(warehouses.locationId, locationId));
  }
  
  async getWarehouse(id: number): Promise<Warehouse | undefined> {
    const [warehouse] = await db.select().from(warehouses).where(eq(warehouses.id, id));
    return warehouse;
  }
  
  async createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse> {
    const [newWarehouse] = await db.insert(warehouses).values(warehouse).returning();
    return newWarehouse;
  }
  
  // Products
  async getProducts(companyId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.companyId, companyId));
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  
  // APPCC Control Templates
  async getControlTemplates(companyId: number): Promise<ControlTemplate[]> {
    return await db.select().from(controlTemplates).where(eq(controlTemplates.companyId, companyId));
  }
  
  async getControlTemplate(id: number): Promise<ControlTemplate | undefined> {
    const [template] = await db.select().from(controlTemplates).where(eq(controlTemplates.id, id));
    return template;
  }
  
  async createControlTemplate(template: InsertControlTemplate): Promise<ControlTemplate> {
    const [newTemplate] = await db.insert(controlTemplates).values(template).returning();
    return newTemplate;
  }
  
  // APPCC Control Records
  async getControlRecords(locationId: number): Promise<ControlRecord[]> {
    return await db.select().from(controlRecords).where(eq(controlRecords.locationId, locationId));
  }
  
  async getTodayControlRecords(locationId: number): Promise<ControlRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await db
      .select()
      .from(controlRecords)
      .where(eq(controlRecords.locationId, locationId));
    // Temporarily commenting out date filter until we fix the sql template literal issue
    //.where(sql => sql`${controlRecords.scheduledFor} >= ${today.toISOString()} AND ${controlRecords.scheduledFor} < ${tomorrow.toISOString()}`);
  }
  
  async getControlRecord(id: number): Promise<ControlRecord | undefined> {
    const [record] = await db.select().from(controlRecords).where(eq(controlRecords.id, id));
    return record;
  }
  
  async createControlRecord(record: InsertControlRecord): Promise<ControlRecord> {
    const [newRecord] = await db.insert(controlRecords).values(record).returning();
    return newRecord;
  }
  
  async updateControlRecord(id: number, data: Partial<InsertControlRecord>): Promise<ControlRecord | undefined> {
    const [updatedRecord] = await db
      .update(controlRecords)
      .set(data)
      .where(eq(controlRecords.id, id))
      .returning();
    return updatedRecord;
  }
}

export const storage = new DatabaseStorage();
