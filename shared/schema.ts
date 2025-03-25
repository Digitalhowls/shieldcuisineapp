import { pgTable, text, serial, integer, boolean, timestamp, date, doublePrecision, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'company_admin', 'location_manager', 'area_supervisor', 'employee', 'external']);
export const controlStatusEnum = pgEnum('control_status', ['pending', 'completed', 'delayed', 'scheduled']);
export const controlTypeEnum = pgEnum('control_type', ['checklist', 'form']);
export const documentTypeEnum = pgEnum('document_type', ['invoice', 'receipt', 'delivery_note', 'internal_transfer']);
export const businessTypeEnum = pgEnum('business_type', ['restaurant', 'store', 'production', 'catering', 'wholesale']);

// Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default('employee'),
  active: boolean("active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  companyId: integer("company_id"),
  locationId: integer("location_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  taxId: text("tax_id").notNull(),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country").default("España"),
  phone: text("phone"),
  email: text("email"),
  logo: text("logo"),
  businessType: businessTypeEnum("business_type").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country").default("España"),
  phone: text("phone"),
  email: text("email"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  locationId: integer("location_id").notNull().references(() => locations.id),
  type: text("type").notNull(),  // "raw_material", "finished_product", "disposal", etc.
  description: text("description"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").unique(),
  barcode: text("barcode"),
  category: text("category"),
  unit: text("unit").notNull(),  // kg, unit, l, etc.
  hasAllergens: boolean("has_allergens").default(false),
  allergensInfo: jsonb("allergens_info"),
  nutritionalInfo: jsonb("nutritional_info"),
  isRawMaterial: boolean("is_raw_material").default(false),
  isFinishedProduct: boolean("is_finished_product").default(false),
  companyId: integer("company_id").notNull().references(() => companies.id),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  taxId: text("tax_id"),
  contactName: text("contact_name"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country").default("España"),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  companyId: integer("company_id").notNull().references(() => companies.id),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  warehouseId: integer("warehouse_id").notNull().references(() => warehouses.id),
  quantity: doublePrecision("quantity").notNull().default(0),
  unit: text("unit").notNull(),
  batchNumber: text("batch_number"),
  expiryDate: date("expiry_date"),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  purchaseDate: date("purchase_date"),
  purchasePrice: doublePrecision("purchase_price"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  sourceWarehouseId: integer("source_warehouse_id").references(() => warehouses.id),
  destinationWarehouseId: integer("destination_warehouse_id").references(() => warehouses.id),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  batchNumber: text("batch_number"),
  type: text("type").notNull(), // "purchase", "sale", "transfer", "adjustment", "production"
  documentId: integer("document_id"),
  documentType: documentTypeEnum("document_type"),
  userId: integer("user_id").notNull().references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const controlTemplates = pgTable("control_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: controlTypeEnum("type").notNull(),
  frequency: text("frequency").notNull(), // "daily", "weekly", "monthly"
  formStructure: jsonb("form_structure").notNull(),
  requiredRole: userRoleEnum("required_role"),
  locationId: integer("location_id").references(() => locations.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const controlRecords = pgTable("control_records", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull().references(() => controlTemplates.id),
  status: controlStatusEnum("status").notNull().default('pending'),
  scheduledFor: timestamp("scheduled_for"),
  completedAt: timestamp("completed_at"),
  completedBy: integer("completed_by").references(() => users.id),
  formData: jsonb("form_data"),
  locationId: integer("location_id").notNull().references(() => locations.id),
  notes: text("notes"),
  signature: text("signature"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  productId: integer("product_id").notNull().references(() => products.id),
  yield: doublePrecision("yield").notNull(),
  yieldUnit: text("yield_unit").notNull(),
  instructions: text("instructions"),
  allergensInfo: jsonb("allergens_info"),
  nutritionalInfo: jsonb("nutritional_info"),
  companyId: integer("company_id").notNull().references(() => companies.id),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  notes: text("notes"),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  taxId: text("tax_id"),
  contactName: text("contact_name"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country").default("España"),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  companyId: integer("company_id").notNull().references(() => companies.id),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  documentNumber: text("document_number").notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  locationId: integer("location_id").notNull().references(() => locations.id),
  userId: integer("user_id").notNull().references(() => users.id),
  total: doublePrecision("total").notNull(),
  tax: doublePrecision("tax"),
  paymentMethod: text("payment_method"),
  status: text("status").notNull(), // "completed", "pending", "canceled"
  notes: text("notes"),
  invoiced: boolean("invoiced").default(false),
  invoiceId: integer("invoice_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull().references(() => sales.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  discount: doublePrecision("discount").default(0),
  tax: doublePrecision("tax"),
  subtotal: doublePrecision("subtotal").notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  customerId: integer("customer_id").references(() => customers.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  locationId: integer("location_id").notNull().references(() => locations.id),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date"),
  subtotal: doublePrecision("subtotal").notNull(),
  tax: doublePrecision("tax"),
  total: doublePrecision("total").notNull(),
  status: text("status").notNull(), // "paid", "pending", "overdue", "canceled"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  saleId: integer("sale_id").references(() => sales.id),
  description: text("description").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  discount: doublePrecision("discount").default(0),
  tax: doublePrecision("tax"),
  subtotal: doublePrecision("subtotal").notNull(),
});

// Relations
export const userRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  location: one(locations, {
    fields: [users.locationId],
    references: [locations.id],
  }),
}));

export const companyRelations = relations(companies, ({ many }) => ({
  locations: many(locations),
  users: many(users),
}));

export const locationRelations = relations(locations, ({ one, many }) => ({
  company: one(companies, {
    fields: [locations.companyId],
    references: [companies.id],
  }),
  warehouses: many(warehouses),
  users: many(users),
}));

export const warehouseRelations = relations(warehouses, ({ one, many }) => ({
  location: one(locations, {
    fields: [warehouses.locationId],
    references: [locations.id],
  }),
  inventory: many(inventory),
}));

// Insert and Select schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, lastLogin: true, createdAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true, createdAt: true });
export const insertWarehouseSchema = createInsertSchema(warehouses).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({ id: true, createdAt: true });
export const insertControlTemplateSchema = createInsertSchema(controlTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertControlRecordSchema = createInsertSchema(controlRecords).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRecipeSchema = createInsertSchema(recipes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRecipeIngredientSchema = createInsertSchema(recipeIngredients).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, createdAt: true });
export const insertSaleItemSchema = createInsertSchema(saleItems).omit({ id: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true });

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type Warehouse = typeof warehouses.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertControlTemplate = z.infer<typeof insertControlTemplateSchema>;
export type ControlTemplate = typeof controlTemplates.$inferSelect;
export type InsertControlRecord = z.infer<typeof insertControlRecordSchema>;
export type ControlRecord = typeof controlRecords.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipeIngredient = z.infer<typeof insertRecipeIngredientSchema>;
export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type SaleItem = typeof saleItems.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
