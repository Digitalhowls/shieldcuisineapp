import { pgTable, text, serial, integer, boolean, timestamp, date, doublePrecision, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'company_admin', 'location_manager', 'area_supervisor', 'employee', 'external']);
export const controlStatusEnum = pgEnum('control_status', ['pending', 'completed', 'delayed', 'scheduled']);
export const controlTypeEnum = pgEnum('control_type', ['checklist', 'form']);
export const documentTypeEnum = pgEnum('document_type', ['invoice', 'receipt', 'delivery_note', 'internal_transfer', 'purchase_order', 'goods_receipt']);

export const purchaseOrderStatusEnum = pgEnum('purchase_order_status', ['draft', 'sent', 'confirmed', 'partially_received', 'completed', 'cancelled']);
export const businessTypeEnum = pgEnum('business_type', ['restaurant', 'store', 'production', 'catering', 'wholesale']);
export const bankAccountTypeEnum = pgEnum('bank_account_type', ['checking', 'savings', 'credit']);
export const bankTransactionTypeEnum = pgEnum('bank_transaction_type', ['payment', 'charge', 'transfer', 'deposit', 'withdrawal', 'fee']);
export const notificationTypeEnum = pgEnum('notification_type', [
  'appcc_control', // Controles APPCC pendientes o completados
  'inventory', // Notificaciones relacionadas con inventario (stock bajo, etc)
  'learning', // Notificaciones de formación (nuevos cursos, completados, etc)
  'banking', // Alertas bancarias (nuevas transacciones, etc)
  'system', // Notificaciones del sistema
  'security', // Alertas de seguridad
  'purchasing', // Notificaciones relacionadas con compras
  'cms' // Notificaciones del CMS (nuevas publicaciones, comentarios, etc)
]);

// Enums para CMS
export const contentStatusEnum = pgEnum('content_status', ['draft', 'scheduled', 'published', 'archived']);
export const contentVisibilityEnum = pgEnum('content_visibility', ['public', 'private', 'internal']);
export const contentTypeEnum = pgEnum('content_type', ['page', 'blog_post', 'course_page', 'landing_page']);

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
  website: text("website"),
  description: text("description"),
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

// Tablas para integración bancaria
export const bankConnections = pgTable("bank_connections", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  provider: text("provider").notNull(), // 'psd2', 'plaid', 'tink', etc.
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  consentId: text("consent_id"), // ID de consentimiento PSD2
  status: text("status").notNull(), // 'active', 'expired', 'revoked'
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata"), // Información adicional específica del proveedor
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  connectionId: integer("connection_id").notNull().references(() => bankConnections.id),
  accountId: text("account_id").notNull(), // ID externo proporcionado por el banco
  accountNumber: text("account_number"), // Número de cuenta (IBAN)
  accountName: text("account_name").notNull(),
  bankName: text("bank_name").notNull(),
  type: bankAccountTypeEnum("type").notNull(),
  currency: text("currency").notNull().default("EUR"),
  balance: doublePrecision("balance").notNull().default(0),
  availableBalance: doublePrecision("available_balance"),
  lastSyncAt: timestamp("last_sync_at"),
  active: boolean("active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bankTransactions = pgTable("bank_transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => bankAccounts.id),
  externalId: text("external_id").notNull(), // ID proporcionado por el banco
  type: bankTransactionTypeEnum("type").notNull(),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull().default("EUR"),
  description: text("description"),
  category: text("category"),
  counterpartyName: text("counterparty_name"),
  counterpartyAccount: text("counterparty_account"),
  reference: text("reference"),
  transactionDate: timestamp("transaction_date").notNull(),
  valueDate: timestamp("value_date"),
  status: text("status").notNull(), // 'booked', 'pending'
  bookingDate: timestamp("booking_date"),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bankCategoriesRules = pgTable("bank_categories_rules", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  pattern: text("pattern").notNull(), // Patrón regex para coincidir con la descripción
  category: text("category").notNull(),
  priority: integer("priority").notNull().default(1),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tablas para sistema de notificaciones
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: notificationTypeEnum("type").notNull(),
  icon: text("icon"), // Nombre del icono (para frontend)
  url: text("url"), // URL opcional para redireccionar al hacer clic
  isRead: boolean("is_read").notNull().default(false),
  metadata: jsonb("metadata"), // Datos adicionales específicos del tipo de notificación
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // Fecha opcional de caducidad
});

// Tablas para módulo de compras
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  locationId: integer("location_id").notNull().references(() => locations.id),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  warehouseId: integer("warehouse_id").notNull().references(() => warehouses.id),
  status: purchaseOrderStatusEnum("status").notNull().default('draft'),
  orderDate: date("order_date").notNull(),
  expectedDeliveryDate: date("expected_delivery_date"),
  subtotal: doublePrecision("subtotal").notNull().default(0),
  tax: doublePrecision("tax").default(0),
  total: doublePrecision("total").notNull().default(0),
  paymentTerms: text("payment_terms"),
  shippingMethod: text("shipping_method"),
  notes: text("notes"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").notNull().references(() => purchaseOrders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  discount: doublePrecision("discount").default(0),
  tax: doublePrecision("tax").default(0),
  subtotal: doublePrecision("subtotal").notNull(),
  receivedQuantity: doublePrecision("received_quantity").default(0),
  notes: text("notes"),
});

export const goodsReceipts = pgTable("goods_receipts", {
  id: serial("id").primaryKey(),
  receiptNumber: text("receipt_number").notNull(),
  purchaseOrderId: integer("purchase_order_id").notNull().references(() => purchaseOrders.id),
  warehouseId: integer("warehouse_id").notNull().references(() => warehouses.id),
  receivedBy: integer("received_by").notNull().references(() => users.id),
  receiptDate: date("receipt_date").notNull(),
  deliveryNoteNumber: text("delivery_note_number"),
  carrierName: text("carrier_name"),
  status: text("status").notNull().default('completed'), // 'completed', 'partial', 'pending_quality_check'
  notes: text("notes"),
  signature: text("signature"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const goodsReceiptItems = pgTable("goods_receipt_items", {
  id: serial("id").primaryKey(),
  goodsReceiptId: integer("goods_receipt_id").notNull().references(() => goodsReceipts.id),
  purchaseOrderItemId: integer("purchase_order_item_id").notNull().references(() => purchaseOrderItems.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: doublePrecision("quantity").notNull(),
  unit: text("unit").notNull(),
  batchNumber: text("batch_number"),
  expiryDate: date("expiry_date"),
  locationInWarehouse: text("location_in_warehouse"),
  qualityCheck: boolean("quality_check").default(true),
  notes: text("notes"),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  appccNotifications: boolean("appcc_notifications").notNull().default(true),
  inventoryNotifications: boolean("inventory_notifications").notNull().default(true),
  learningNotifications: boolean("learning_notifications").notNull().default(true),
  bankingNotifications: boolean("banking_notifications").notNull().default(true),
  systemNotifications: boolean("system_notifications").notNull().default(true),
  securityNotifications: boolean("security_notifications").notNull().default(true),
  purchasingNotifications: boolean("purchasing_notifications").notNull().default(true),
  cmsNotifications: boolean("cms_notifications").notNull().default(true),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  emailFrequency: text("email_frequency").notNull().default("daily"), // "immediate", "daily", "weekly"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tablas para el módulo CMS y Constructor Web
export const cmsPages = pgTable("cms_pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: jsonb("content").notNull(), // Contenido en formato de bloques
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  status: contentStatusEnum("status").notNull().default('draft'),
  visibility: contentVisibilityEnum("visibility").notNull().default('public'),
  type: contentTypeEnum("type").notNull(),
  authorId: integer("author_id").references(() => users.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  thumbnail: text("thumbnail"),
  publishedAt: timestamp("published_at"),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cmsCategories = pgTable("cms_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  companyId: integer("company_id").notNull().references(() => companies.id),
  parentId: integer("parent_id").references(() => cmsCategories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cmsPageCategories = pgTable("cms_page_categories", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id").notNull().references(() => cmsPages.id, { onDelete: 'cascade' }),
  categoryId: integer("category_id").notNull().references(() => cmsCategories.id, { onDelete: 'cascade' }),
});

export const cmsTags = pgTable("cms_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cmsPageTags = pgTable("cms_page_tags", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id").notNull().references(() => cmsPages.id, { onDelete: 'cascade' }),
  tagId: integer("tag_id").notNull().references(() => cmsTags.id, { onDelete: 'cascade' }),
});

export const cmsMediaCategories = pgTable("cms_media_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  parentId: integer("parent_id").references(() => cmsMediaCategories.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cmsMedia = pgTable("cms_media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // tamaño en bytes
  path: text("path").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  title: text("title"),
  description: text("description"),
  folder: text("folder").default(""),
  tags: text("tags").array(),
  companyId: integer("company_id").notNull().references(() => companies.id),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cmsMediaToCategories = pgTable("cms_media_to_categories", {
  id: serial("id").primaryKey(),
  mediaId: integer("media_id").notNull().references(() => cmsMedia.id, { onDelete: 'cascade' }),
  categoryId: integer("category_id").notNull().references(() => cmsMediaCategories.id, { onDelete: 'cascade' }),
});

export const cmsBranding = pgTable("cms_branding", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id).unique(),
  logo: text("logo"),
  favicon: text("favicon"),
  primaryColor: text("primary_color").default("#1e40af"),
  secondaryColor: text("secondary_color").default("#60a5fa"),
  accentColor: text("accent_color").default("#f59e0b"),
  backgroundColor: text("background_color").default("#ffffff"),
  textColor: text("text_color").default("#111827"),
  headingFont: text("heading_font").default("Inter"),
  bodyFont: text("body_font").default("Inter"),
  customDomain: text("custom_domain"),
  subdomain: text("subdomain"),
  socialImage: text("social_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cmsMenus = pgTable("cms_menus", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(), // "header", "footer", "sidebar", etc.
  companyId: integer("company_id").notNull().references(() => companies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cmsMenuItems = pgTable("cms_menu_items", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id").notNull().references(() => cmsMenus.id, { onDelete: 'cascade' }),
  parentId: integer("parent_id").references(() => cmsMenuItems.id),
  label: text("label").notNull(),
  url: text("url"),
  pageId: integer("page_id").references(() => cmsPages.id),
  order: integer("order").notNull().default(0),
  target: text("target").default("_self"), // "_self", "_blank"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cmsFormSubmissions = pgTable("cms_form_submissions", {
  id: serial("id").primaryKey(),
  formId: text("form_id").notNull(), // Identificador del formulario
  pageId: integer("page_id").references(() => cmsPages.id),
  data: jsonb("data").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  companyId: integer("company_id").notNull().references(() => companies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processed: boolean("processed").default(false),
  processedAt: timestamp("processed_at"),
});

// Relations
export const userRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  location: one(locations, {
    fields: [users.locationId],
    references: [locations.id],
  }),
  notifications: many(notifications),
  notificationPreferences: one(notificationPreferences),
}));

export const companyRelations = relations(companies, ({ many }) => ({
  locations: many(locations),
  users: many(users),
  bankConnections: many(bankConnections),
  bankAccounts: many(bankAccounts),
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

export const bankConnectionRelations = relations(bankConnections, ({ one, many }) => ({
  company: one(companies, {
    fields: [bankConnections.companyId],
    references: [companies.id],
  }),
  accounts: many(bankAccounts),
}));

export const bankAccountRelations = relations(bankAccounts, ({ one, many }) => ({
  company: one(companies, {
    fields: [bankAccounts.companyId],
    references: [companies.id],
  }),
  connection: one(bankConnections, {
    fields: [bankAccounts.connectionId],
    references: [bankConnections.id],
  }),
  transactions: many(bankTransactions),
}));

export const bankTransactionRelations = relations(bankTransactions, ({ one }) => ({
  account: one(bankAccounts, {
    fields: [bankTransactions.accountId],
    references: [bankAccounts.id],
  }),
  invoice: one(invoices, {
    fields: [bankTransactions.invoiceId],
    references: [invoices.id],
  }),
}));

// Relations for purchasing module
export const purchaseOrderRelations = relations(purchaseOrders, ({ one, many }) => ({
  company: one(companies, {
    fields: [purchaseOrders.companyId],
    references: [companies.id],
  }),
  location: one(locations, {
    fields: [purchaseOrders.locationId],
    references: [locations.id],
  }),
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
  warehouse: one(warehouses, {
    fields: [purchaseOrders.warehouseId],
    references: [warehouses.id],
  }),
  createdByUser: one(users, {
    fields: [purchaseOrders.createdBy],
    references: [users.id],
  }),
  approvedByUser: one(users, {
    fields: [purchaseOrders.approvedBy],
    references: [users.id],
  }),
  items: many(purchaseOrderItems),
  goodsReceipts: many(goodsReceipts),
}));

// Relations for CMS module
export const cmsPagesRelations = relations(cmsPages, ({ one, many }) => ({
  company: one(companies, {
    fields: [cmsPages.companyId],
    references: [companies.id],
  }),
  author: one(users, {
    fields: [cmsPages.authorId],
    references: [users.id],
  }),
  categories: many(cmsPageCategories),
  tags: many(cmsPageTags),
  menuItems: many(cmsMenuItems),
  formSubmissions: many(cmsFormSubmissions),
}));

export const cmsCategoriesRelations = relations(cmsCategories, ({ one, many }) => ({
  company: one(companies, {
    fields: [cmsCategories.companyId],
    references: [companies.id],
  }),
  parent: one(cmsCategories, {
    fields: [cmsCategories.parentId],
    references: [cmsCategories.id],
  }),
  children: many(cmsCategories, { relationName: "parent" }),
  pages: many(cmsPageCategories),
}));

export const cmsPageCategoriesRelations = relations(cmsPageCategories, ({ one }) => ({
  page: one(cmsPages, {
    fields: [cmsPageCategories.pageId],
    references: [cmsPages.id],
  }),
  category: one(cmsCategories, {
    fields: [cmsPageCategories.categoryId],
    references: [cmsCategories.id],
  }),
}));

export const cmsTagsRelations = relations(cmsTags, ({ one, many }) => ({
  company: one(companies, {
    fields: [cmsTags.companyId],
    references: [companies.id],
  }),
  pages: many(cmsPageTags),
}));

export const cmsPageTagsRelations = relations(cmsPageTags, ({ one }) => ({
  page: one(cmsPages, {
    fields: [cmsPageTags.pageId],
    references: [cmsPages.id],
  }),
  tag: one(cmsTags, {
    fields: [cmsPageTags.tagId],
    references: [cmsTags.id],
  }),
}));

export const cmsMediaCategoriesRelations = relations(cmsMediaCategories, ({ one, many }) => ({
  company: one(companies, {
    fields: [cmsMediaCategories.companyId],
    references: [companies.id],
  }),
  parent: one(cmsMediaCategories, {
    fields: [cmsMediaCategories.parentId],
    references: [cmsMediaCategories.id],
  }),
  children: many(cmsMediaCategories, { relationName: "parent" }),
  media: many(cmsMediaToCategories),
}));

export const cmsMediaToCategoriesRelations = relations(cmsMediaToCategories, ({ one }) => ({
  media: one(cmsMedia, {
    fields: [cmsMediaToCategories.mediaId],
    references: [cmsMedia.id],
  }),
  category: one(cmsMediaCategories, {
    fields: [cmsMediaToCategories.categoryId],
    references: [cmsMediaCategories.id],
  }),
}));

export const cmsMediaRelations = relations(cmsMedia, ({ one, many }) => ({
  company: one(companies, {
    fields: [cmsMedia.companyId],
    references: [companies.id],
  }),
  uploader: one(users, {
    fields: [cmsMedia.uploadedBy],
    references: [users.id],
  }),
  categories: many(cmsMediaToCategories),
}));

export const cmsBrandingRelations = relations(cmsBranding, ({ one }) => ({
  company: one(companies, {
    fields: [cmsBranding.companyId],
    references: [companies.id],
  }),
}));

export const cmsMenusRelations = relations(cmsMenus, ({ one, many }) => ({
  company: one(companies, {
    fields: [cmsMenus.companyId],
    references: [companies.id],
  }),
  items: many(cmsMenuItems),
}));

export const cmsMenuItemsRelations = relations(cmsMenuItems, ({ one, many }) => ({
  menu: one(cmsMenus, {
    fields: [cmsMenuItems.menuId],
    references: [cmsMenus.id],
  }),
  parent: one(cmsMenuItems, {
    fields: [cmsMenuItems.parentId],
    references: [cmsMenuItems.id],
  }),
  children: many(cmsMenuItems, { relationName: "parent" }),
  page: one(cmsPages, {
    fields: [cmsMenuItems.pageId],
    references: [cmsPages.id],
  }),
}));

export const cmsFormSubmissionsRelations = relations(cmsFormSubmissions, ({ one }) => ({
  company: one(companies, {
    fields: [cmsFormSubmissions.companyId],
    references: [companies.id],
  }),
  page: one(cmsPages, {
    fields: [cmsFormSubmissions.pageId],
    references: [cmsPages.id],
  }),
}));

export const purchaseOrderItemRelations = relations(purchaseOrderItems, ({ one, many }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  product: one(products, {
    fields: [purchaseOrderItems.productId],
    references: [products.id],
  }),
  goodsReceiptItems: many(goodsReceiptItems),
}));

export const goodsReceiptRelations = relations(goodsReceipts, ({ one, many }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [goodsReceipts.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  warehouse: one(warehouses, {
    fields: [goodsReceipts.warehouseId],
    references: [warehouses.id],
  }),
  receivedByUser: one(users, {
    fields: [goodsReceipts.receivedBy],
    references: [users.id],
  }),
  items: many(goodsReceiptItems),
}));

export const goodsReceiptItemRelations = relations(goodsReceiptItems, ({ one }) => ({
  goodsReceipt: one(goodsReceipts, {
    fields: [goodsReceiptItems.goodsReceiptId],
    references: [goodsReceipts.id],
  }),
  purchaseOrderItem: one(purchaseOrderItems, {
    fields: [goodsReceiptItems.purchaseOrderItemId],
    references: [purchaseOrderItems.id],
  }),
  product: one(products, {
    fields: [goodsReceiptItems.productId],
    references: [products.id],
  }),
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

// Esquemas para módulo de compras
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true });
export const insertGoodsReceiptSchema = createInsertSchema(goodsReceipts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGoodsReceiptItemSchema = createInsertSchema(goodsReceiptItems).omit({ id: true });

// Esquemas para entidades bancarias
export const insertBankConnectionSchema = createInsertSchema(bankConnections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBankTransactionSchema = createInsertSchema(bankTransactions).omit({ id: true, createdAt: true });
export const insertBankCategoryRuleSchema = createInsertSchema(bankCategoriesRules).omit({ id: true, createdAt: true, updatedAt: true });

// Esquemas para notificaciones
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({ id: true, createdAt: true, updatedAt: true });

// Esquemas para el módulo CMS
export const insertCmsPageSchema = createInsertSchema(cmsPages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCmsCategorySchema = createInsertSchema(cmsCategories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCmsPageCategorySchema = createInsertSchema(cmsPageCategories).omit({ id: true });
export const insertCmsTagSchema = createInsertSchema(cmsTags).omit({ id: true, createdAt: true });
export const insertCmsPageTagSchema = createInsertSchema(cmsPageTags).omit({ id: true });
export const insertCmsMediaSchema = createInsertSchema(cmsMedia).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCmsMediaCategorySchema = createInsertSchema(cmsMediaCategories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCmsMediaToCategorySchema = createInsertSchema(cmsMediaToCategories).omit({ id: true });
export const insertCmsBrandingSchema = createInsertSchema(cmsBranding).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCmsMenuSchema = createInsertSchema(cmsMenus).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCmsMenuItemSchema = createInsertSchema(cmsMenuItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCmsFormSubmissionSchema = createInsertSchema(cmsFormSubmissions).omit({ id: true, createdAt: true });

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

// Tipos para el módulo de compras
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertGoodsReceipt = z.infer<typeof insertGoodsReceiptSchema>;
export type GoodsReceipt = typeof goodsReceipts.$inferSelect;
export type InsertGoodsReceiptItem = z.infer<typeof insertGoodsReceiptItemSchema>;
export type GoodsReceiptItem = typeof goodsReceiptItems.$inferSelect;

// Tipos para entidades bancarias
export type InsertBankConnection = z.infer<typeof insertBankConnectionSchema>;
export type BankConnection = typeof bankConnections.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankTransaction = z.infer<typeof insertBankTransactionSchema>;
export type BankTransaction = typeof bankTransactions.$inferSelect;
export type InsertBankCategoryRule = z.infer<typeof insertBankCategoryRuleSchema>;
export type BankCategoryRule = typeof bankCategoriesRules.$inferSelect;

// Tipos para notificaciones
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;

// Tipos para CMS
export type InsertCmsPage = z.infer<typeof insertCmsPageSchema>;
export type CmsPage = typeof cmsPages.$inferSelect;
export type InsertCmsCategory = z.infer<typeof insertCmsCategorySchema>;
export type CmsCategory = typeof cmsCategories.$inferSelect;
export type InsertCmsPageCategory = z.infer<typeof insertCmsPageCategorySchema>;
export type CmsPageCategory = typeof cmsPageCategories.$inferSelect;
export type InsertCmsTag = z.infer<typeof insertCmsTagSchema>;
export type CmsTag = typeof cmsTags.$inferSelect;
export type InsertCmsPageTag = z.infer<typeof insertCmsPageTagSchema>;
export type CmsPageTag = typeof cmsPageTags.$inferSelect;
export type InsertCmsMedia = z.infer<typeof insertCmsMediaSchema>;
export type CmsMedia = typeof cmsMedia.$inferSelect;
export type InsertCmsMediaCategory = z.infer<typeof insertCmsMediaCategorySchema>;
export type CmsMediaCategory = typeof cmsMediaCategories.$inferSelect;
export type InsertCmsMediaToCategory = z.infer<typeof insertCmsMediaToCategorySchema>;
export type CmsMediaToCategory = typeof cmsMediaToCategories.$inferSelect;
export type InsertCmsBranding = z.infer<typeof insertCmsBrandingSchema>;
export type CmsBranding = typeof cmsBranding.$inferSelect;
export type InsertCmsMenu = z.infer<typeof insertCmsMenuSchema>;
export type CmsMenu = typeof cmsMenus.$inferSelect;
export type InsertCmsMenuItem = z.infer<typeof insertCmsMenuItemSchema>;
export type CmsMenuItem = typeof cmsMenuItems.$inferSelect;
export type InsertCmsFormSubmission = z.infer<typeof insertCmsFormSubmissionSchema>;
export type CmsFormSubmission = typeof cmsFormSubmissions.$inferSelect;

// E-Learning Platform Tables
export const courseTypes = pgEnum('course_type', ['food_safety', 'haccp', 'allergens', 'hygiene', 'management', 'customer_service']);

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  type: courseTypes("type").notNull(),
  level: integer("level").default(1),
  duration: integer("duration"), // in minutes
  thumbnail: text("thumbnail"),
  active: boolean("active").default(true),
  requiredScore: integer("required_score").default(70),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  videoUrl: text("video_url"),
  order: integer("order").notNull(),
  duration: integer("duration"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: 'set null' }),
  title: text("title").notNull(),
  description: text("description"),
  passingScore: integer("passing_score").default(70),
  timeLimit: integer("time_limit"), // in minutes
  randomizeQuestions: boolean("randomize_questions").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id, { onDelete: 'cascade' }).notNull(),
  text: text("text").notNull(),
  type: text("type").notNull(), // multiple_choice, true_false, matching
  points: integer("points").default(1),
  order: integer("order"),
  imageUrl: text("image_url"),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const options = pgTable("options", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").default(false),
  order: integer("order"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userCourses = pgTable("user_courses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer("course_id").references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0),
  certificate: text("certificate"),
  expiresAt: timestamp("expires_at"),
  currentLessonId: integer("current_lesson_id").references(() => lessons.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  quizId: integer("quiz_id").references(() => quizzes.id, { onDelete: 'cascade' }).notNull(),
  userCourseId: integer("user_course_id").references(() => userCourses.id, { onDelete: 'cascade' }),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  passed: boolean("passed").default(false),
  timeSpent: integer("time_spent"), // in seconds
  createdAt: timestamp("created_at").defaultNow()
});

export const userAnswers = pgTable("user_answers", {
  id: serial("id").primaryKey(),
  quizAttemptId: integer("quiz_attempt_id").references(() => quizAttempts.id, { onDelete: 'cascade' }).notNull(),
  questionId: integer("question_id").references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  optionId: integer("option_id").references(() => options.id, { onDelete: 'cascade' }),
  text: text("text"), // For open answers
  isCorrect: boolean("is_correct").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Relationships for E-Learning
export const courseRelations = relations(courses, ({ one, many }) => ({
  company: one(companies, { fields: [courses.companyId], references: [companies.id] }),
  lessons: many(lessons),
  quizzes: many(quizzes),
  userCourses: many(userCourses),
}));

export const lessonRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, { fields: [lessons.courseId], references: [courses.id] }),
  quizzes: many(quizzes),
}));

export const quizRelations = relations(quizzes, ({ one, many }) => ({
  course: one(courses, { fields: [quizzes.courseId], references: [courses.id] }),
  lesson: one(lessons, { fields: [quizzes.lessonId], references: [lessons.id] }),
  questions: many(questions),
  attempts: many(quizAttempts),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, { fields: [questions.quizId], references: [quizzes.id] }),
  options: many(options),
  userAnswers: many(userAnswers),
}));

export const optionRelations = relations(options, ({ one, many }) => ({
  question: one(questions, { fields: [options.questionId], references: [questions.id] }),
  userAnswers: many(userAnswers),
}));

export const userCourseRelations = relations(userCourses, ({ one, many }) => ({
  user: one(users, { fields: [userCourses.userId], references: [users.id] }),
  course: one(courses, { fields: [userCourses.courseId], references: [courses.id] }),
  currentLesson: one(lessons, { fields: [userCourses.currentLessonId], references: [lessons.id] }),
  quizAttempts: many(quizAttempts),
}));

export const quizAttemptRelations = relations(quizAttempts, ({ one, many }) => ({
  user: one(users, { fields: [quizAttempts.userId], references: [users.id] }),
  quiz: one(quizzes, { fields: [quizAttempts.quizId], references: [quizzes.id] }),
  userCourse: one(userCourses, { fields: [quizAttempts.userCourseId], references: [userCourses.id] }),
  userAnswers: many(userAnswers),
}));

export const userAnswerRelations = relations(userAnswers, ({ one }) => ({
  quizAttempt: one(quizAttempts, { fields: [userAnswers.quizAttemptId], references: [quizAttempts.id] }),
  question: one(questions, { fields: [userAnswers.questionId], references: [questions.id] }),
  option: one(options, { fields: [userAnswers.optionId], references: [options.id] }),
}));

// Relaciones para notificaciones
export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, { fields: [notificationPreferences.userId], references: [users.id] }),
}));

// Insert schemas for E-Learning
export const insertCourseSchema = createInsertSchema(courses);
export const insertLessonSchema = createInsertSchema(lessons);
export const insertQuizSchema = createInsertSchema(quizzes);
export const insertQuestionSchema = createInsertSchema(questions);
export const insertOptionSchema = createInsertSchema(options);
export const insertUserCourseSchema = createInsertSchema(userCourses);
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts);
export const insertUserAnswerSchema = createInsertSchema(userAnswers);

// Types for E-Learning
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertOption = z.infer<typeof insertOptionSchema>;
export type Option = typeof options.$inferSelect;
export type InsertUserCourse = z.infer<typeof insertUserCourseSchema>;
export type UserCourse = typeof userCourses.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertUserAnswer = z.infer<typeof insertUserAnswerSchema>;
export type UserAnswer = typeof userAnswers.$inferSelect;
