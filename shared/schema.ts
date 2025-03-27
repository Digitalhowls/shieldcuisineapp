import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Definición de enumeraciones para los módulos bancarios
export const bankAccountTypeEnum = z.enum(['checking', 'savings', 'credit']);
export const bankTransactionTypeEnum = z.enum(['payment', 'charge', 'transfer', 'deposit', 'withdrawal', 'fee']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("employee"),
  active: boolean("active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  companyId: integer("company_id"),
  locationId: integer("location_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  // Refine the schema with additional validation
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Debe proporcionar un correo electrónico válido"),
}).omit({ id: true, lastLogin: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// APPCC Control Templates
export const controlTemplates = pgTable("control_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  frequency: text("frequency").notNull(), // daily, weekly, monthly, etc.
  fields: text("fields").notNull(), // JSON string with field configurations
  companyId: integer("company_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertControlTemplateSchema = createInsertSchema(controlTemplates, {
  fields: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: "Fields must be a valid JSON string" }
  ),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type ControlTemplate = typeof controlTemplates.$inferSelect;
export type InsertControlTemplate = z.infer<typeof insertControlTemplateSchema>;

// APPCC Control Records
export const controlRecords = pgTable("control_records", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  locationId: integer("location_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  data: text("data").notNull(), // JSON string with the record data
  comments: text("comments"),
  createdBy: integer("created_by").notNull(),
  completedBy: integer("completed_by"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertControlRecordSchema = createInsertSchema(controlRecords, {
  data: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: "Data must be a valid JSON string" }
  ),
}).omit({ id: true, createdAt: true, updatedAt: true, completedBy: true, completedAt: true });

export type ControlRecord = typeof controlRecords.$inferSelect;
export type InsertControlRecord = z.infer<typeof insertControlRecordSchema>;

// CMS Media Categories
export const mediaCategories = pgTable("media_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  companyId: integer("company_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMediaCategorySchema = createInsertSchema(mediaCategories)
  .omit({ id: true, createdAt: true });

export type MediaCategory = typeof mediaCategories.$inferSelect;
export type InsertMediaCategory = z.infer<typeof insertMediaCategorySchema>;

// CMS Media Files
export const mediaFiles = pgTable("media_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  title: text("title"),
  description: text("description"),
  categoryId: integer("category_id"),
  companyId: integer("company_id"),
  uploadedBy: integer("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMediaFileSchema = createInsertSchema(mediaFiles)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;

// CMS Pages
export const cmsPages = pgTable("cms_pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: text("content").notNull(), // JSON string with the page content/blocks
  status: text("status").notNull().default("draft"), // draft, published
  publishedAt: timestamp("published_at"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  featured: boolean("featured").default(false),
  thumbnail: text("thumbnail"),
  pageType: text("page_type").notNull().default("page"), // page, blog, product, etc.
  companyId: integer("company_id"),
  createdBy: integer("created_by").notNull(),
  lastUpdatedBy: integer("last_updated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCmsPageSchema = createInsertSchema(cmsPages, {
  content: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: "Content must be a valid JSON string" }
  ),
}).omit({ id: true, createdAt: true, updatedAt: true, publishedAt: true, lastUpdatedBy: true });

export type CmsPage = typeof cmsPages.$inferSelect;
export type InsertCmsPage = z.infer<typeof insertCmsPageSchema>;