import { pgTable, serial, text, boolean, timestamp, integer, varchar, foreignKey, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Definición de enumeraciones para los módulos bancarios
export const bankAccountTypeEnum = z.enum(['checking', 'savings', 'credit']);
export const bankTransactionTypeEnum = z.enum(['payment', 'charge', 'transfer', 'deposit', 'withdrawal', 'fee']);

// Definición de enumeraciones para el módulo E-Learning
export const courseLevelEnum = z.enum(['basic', 'intermediate', 'advanced']);
export const lessonTypeEnum = z.enum(['text', 'video', 'interactive', 'quiz']);
export const courseStatusEnum = z.enum(['draft', 'published', 'archived']);
export const enrollmentStatusEnum = z.enum(['pending', 'active', 'completed', 'expired', 'canceled']);
export const certificateTypeEnum = z.enum(['course_completion', 'module_completion', 'achievement']);
export const licenseTypeEnum = z.enum(['single_user', 'team', 'unlimited', 'subscription']);

// Definición de enumeraciones para el módulo de Notificaciones
export const notificationTypeEnum = z.enum([
  'security', 
  'inventory', 
  'appcc_control', 
  'learning', 
  'banking', 
  'purchasing', 
  'cms', 
  'system'
]);

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

// Definimos el enum para los tipos de archivos multimedia
export const mediaFileTypeEnum = z.enum([
  'image', 
  'document', 
  'video', 
  'audio', 
  'other'
]);

// CMS Media Categories
export const cmsMediaCategories = pgTable("cms_media_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  parentId: integer("parent_id"), // Para estructura jerárquica de carpetas
  companyId: integer("company_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCmsMediaCategorySchema = createInsertSchema(cmsMediaCategories)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type CmsMediaCategory = typeof cmsMediaCategories.$inferSelect;
export type InsertCmsMediaCategory = z.infer<typeof insertCmsMediaCategorySchema>;

// CMS Media Files
export const cmsMedia = pgTable("cms_media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt"),
  title: text("title"),
  description: text("description"),
  folder: text("folder"),
  tags: text("tags").array(), // Array de etiquetas
  companyId: integer("company_id").notNull(),
  uploadedBy: integer("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCmsMediaSchema = createInsertSchema(cmsMedia)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type CmsMedia = typeof cmsMedia.$inferSelect;
export type InsertCmsMedia = z.infer<typeof insertCmsMediaSchema>;

// Tabla de relación muchos a muchos entre archivos y categorías
export const cmsMediaToCategories = pgTable("cms_media_to_categories", {
  id: serial("id").primaryKey(),
  mediaId: integer("media_id").notNull(),
  categoryId: integer("category_id").notNull(),
});

export const insertCmsMediaToCategorySchema = createInsertSchema(cmsMediaToCategories)
  .omit({ id: true });

export type CmsMediaToCategory = typeof cmsMediaToCategories.$inferSelect;
export type InsertCmsMediaToCategory = z.infer<typeof insertCmsMediaToCategorySchema>;

// CMS Pages
export const cmsPages = pgTable("cms_pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: text("content").notNull(), // JSON string with the page content/blocks
  status: text("status").notNull().default("draft"), // draft, published, scheduled, archived
  publishedAt: timestamp("published_at"),
  scheduledAt: timestamp("scheduled_at"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  featured: boolean("featured").default(false),
  thumbnail: text("thumbnail"),
  pageType: text("page_type").notNull().default("page"), // page, blog, product, etc.
  visibility: text("visibility").default("public"), // public, private, internal
  companyId: integer("company_id"),
  createdBy: integer("created_by").notNull(),
  lastUpdatedBy: integer("last_updated_by"),
  recurrencePattern: text("recurrence_pattern").default("none"), // none, daily, weekly, monthly
  recurrenceEndDate: timestamp("recurrence_end_date"),
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

// E-Learning Courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  level: text("level").notNull(), // Usar courseLevelEnum
  duration: text("duration").notNull(),
  published: boolean("published").notNull().default(false),
  featuredImage: text("featured_image"),
  companyId: integer("company_id"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCourseSchema = createInsertSchema(courses)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

// E-Learning Lessons
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  courseId: integer("course_id").notNull(),
  lessonType: text("lesson_type").notNull().default("text"), // Usar lessonTypeEnum
  duration: text("duration").notNull(),
  order: integer("order").notNull(),
  videoUrl: text("video_url"),
  attachments: text("attachments"), // JSON string with file info
  published: boolean("published").notNull().default(false),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLessonSchema = createInsertSchema(lessons, {
  attachments: z.string().optional().refine(
    (val) => {
      if (!val) return true;
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: "Attachments must be a valid JSON string" }
  ),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

// E-Learning Quizzes
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  courseId: integer("course_id").notNull(),
  passingScore: integer("passing_score").notNull().default(70),
  timeLimit: text("time_limit"),
  isRequired: boolean("is_required").notNull().default(true),
  published: boolean("published").notNull().default(false),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQuizSchema = createInsertSchema(quizzes)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

// E-Learning Quiz Questions
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  question: text("question").notNull(),
  options: text("options").notNull(), // JSON string with options and correct answers
  explanation: text("explanation"),
  order: integer("order").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions, {
  options: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: "Options must be a valid JSON string" }
  ),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;

// E-Learning Modules (unidades dentro de un curso)
export const courseModules = pgTable("course_modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  courseId: integer("course_id").notNull(),
  order: integer("order").notNull().default(1),
  published: boolean("published").notNull().default(false),
  requiredForCompletion: boolean("required_for_completion").notNull().default(true),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCourseModuleSchema = createInsertSchema(courseModules)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;

// E-Learning Student Progress
export const studentProgress = pgTable("student_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  moduleId: integer("module_id"),
  lessonId: integer("lesson_id"),
  quizId: integer("quiz_id"),
  status: text("status").notNull().default("in_progress"), // not_started, in_progress, completed
  progress: integer("progress").notNull().default(0), // percentage 0-100
  score: integer("score"), // for quizzes
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStudentProgressSchema = createInsertSchema(studentProgress)
  .omit({ id: true, createdAt: true, updatedAt: true, completedAt: true });

export type StudentProgress = typeof studentProgress.$inferSelect;
export type InsertStudentProgress = z.infer<typeof insertStudentProgressSchema>;

// E-Learning Course Enrollments
export const courseEnrollments = pgTable("course_enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  status: text("status").notNull().default("active"), // pending, active, completed, expired, canceled
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  completedAt: timestamp("completed_at"),
  purchaseId: integer("purchase_id"), // Referencia al registro de compra/licencia
  licenseKey: text("license_key"), // Clave de licencia si es aplicable
  issuedBy: integer("issued_by"), // Usuario que asignó el curso (administrador/instructor)
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments)
  .omit({ id: true, createdAt: true, updatedAt: true, completedAt: true, enrolledAt: true });

export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;

// E-Learning Certificates
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  certificateType: text("certificate_type").notNull(), // course_completion, module_completion, achievement
  description: text("description"),
  issuedAt: timestamp("issued_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  certificateUrl: text("certificate_url"),
  certificateCode: text("certificate_code").notNull(), // Código único para verificación
  metadata: text("metadata"), // JSON string con datos adicionales
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCertificateSchema = createInsertSchema(certificates, {
  metadata: z.string().optional().refine(
    (val) => {
      if (!val) return true;
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: "Metadata must be a valid JSON string" }
  ),
}).omit({ id: true, createdAt: true, updatedAt: true, issuedAt: true });

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;

// E-Learning Course Reviews
export const courseReviews = pgTable("course_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  status: text("status").notNull().default("published"), // pending, published, rejected
  isVerifiedPurchase: boolean("is_verified_purchase").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCourseReviewSchema = createInsertSchema(courseReviews)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type CourseReview = typeof courseReviews.$inferSelect;
export type InsertCourseReview = z.infer<typeof insertCourseReviewSchema>;

// E-Learning Course Licenses
export const courseLicenses = pgTable("course_licenses", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  licenseType: text("license_type").notNull(), // single_user, team, unlimited, subscription
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // precio en céntimos (ej: 9900 = 99€)
  maxUsers: integer("max_users"),
  validityDays: integer("validity_days"), // días de validez desde activación
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCourseLicenseSchema = createInsertSchema(courseLicenses)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type CourseLicense = typeof courseLicenses.$inferSelect;
export type InsertCourseLicense = z.infer<typeof insertCourseLicenseSchema>;

// Sistema de Notificaciones
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull(), // security, inventory, appcc_control, learning, banking, system, purchasing, cms
  isRead: boolean("is_read").notNull().default(false),
  url: text("url"), // URL opcional para navegar al hacer clic
  data: text("data"), // JSON string con datos adicionales específicos del tipo
  sourceId: integer("source_id"), // ID opcional de la entidad relacionada (ej: ID de control, curso, etc)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications, {
  type: notificationTypeEnum,
  data: z.string().optional().refine(
    (val) => {
      if (!val) return true;
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: "Data must be a valid JSON string" }
  ),
}).omit({ id: true, createdAt: true });

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Preferencias de Notificaciones por Usuario
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  // Tipos de notificación por módulo
  securityNotifications: boolean("security_notifications").notNull().default(true),
  inventoryNotifications: boolean("inventory_notifications").notNull().default(true),
  appccNotifications: boolean("appcc_notifications").notNull().default(true),
  learningNotifications: boolean("learning_notifications").notNull().default(true),
  bankingNotifications: boolean("banking_notifications").notNull().default(true),
  purchasingNotifications: boolean("purchasing_notifications").notNull().default(true),
  cmsNotifications: boolean("cms_notifications").notNull().default(true),
  systemNotifications: boolean("system_notifications").notNull().default(true),
  // Canales de notificación
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(false),
  smsNotifications: boolean("sms_notifications").notNull().default(false),
  // Frecuencia de emails resumen
  emailFrequency: text("email_frequency").notNull().default("daily"), // daily, weekly, never
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences)
  .omit({ id: true, updatedAt: true });

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;

// CMS Page Versions
export const cmsPageVersions = pgTable("cms_page_versions", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id").notNull(),
  versionNumber: integer("version_number").notNull(),
  content: text("content").notNull(), // JSON string con el contenido
  title: text("title").notNull(),
  description: text("description"),
  author: text("author"),
  changeDescription: text("change_description"),
  isSnapshot: boolean("is_snapshot").default(false).notNull(),
  status: text("status").notNull().default("draft"), // draft, published, scheduled, archived
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCmsPageVersionSchema = createInsertSchema(cmsPageVersions, {
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
}).omit({ id: true, createdAt: true });

export type CmsPageVersion = typeof cmsPageVersions.$inferSelect;
export type InsertCmsPageVersion = z.infer<typeof insertCmsPageVersionSchema>;

// Relaciones entre las tablas E-Learning
// Nota: Las relaciones están temporalmente comentadas porque el módulo 'relations' no está disponible
// Cuando se requiera la configuración completa de relaciones, necesitaremos importar correctamente
// el módulo 'relations' de drizzle-orm
/*
export const courseRelations = relations(courses, ({ many, one }) => ({
  lessons: many(lessons),
  modules: many(courseModules),
  quizzes: many(quizzes),
  progress: many(studentProgress),
  enrollments: many(courseEnrollments),
  reviews: many(courseReviews),
  certificates: many(certificates),
  licenses: many(courseLicenses),
  author: one(users, {
    fields: [courses.createdBy],
    references: [users.id],
  }),
  company: one(users, {
    fields: [courses.companyId],
    references: [users.id],
  }),
}));

export const courseModuleRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseModules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
  author: one(users, {
    fields: [courseModules.createdBy],
    references: [users.id],
  }),
}));

export const lessonRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  progress: many(studentProgress),
  author: one(users, {
    fields: [lessons.createdBy],
    references: [users.id],
  }),
}));

export const quizRelations = relations(quizzes, ({ one, many }) => ({
  course: one(courses, {
    fields: [quizzes.courseId],
    references: [courses.id],
  }),
  questions: many(quizQuestions),
  progress: many(studentProgress),
  author: one(users, {
    fields: [quizzes.createdBy],
    references: [users.id],
  }),
}));

export const quizQuestionRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
}));

export const courseReviewRelations = relations(courseReviews, ({ one }) => ({
  user: one(users, {
    fields: [courseReviews.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [courseReviews.courseId],
    references: [courses.id],
  }),
}));

export const certificateRelations = relations(certificates, ({ one }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
}));

export const courseLicenseRelations = relations(courseLicenses, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseLicenses.courseId],
    references: [courses.id],
  }),
  enrollments: many(courseEnrollments),
  createdBy: one(users, {
    fields: [courseLicenses.createdBy],
    references: [users.id],
  }),
}));

export const courseEnrollmentRelations = relations(courseEnrollments, ({ one }) => ({
  user: one(users, {
    fields: [courseEnrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [courseEnrollments.courseId],
    references: [courses.id],
  }),
  issuedBy: one(users, {
    fields: [courseEnrollments.issuedBy],
    references: [users.id],
  }),
}));

export const studentProgressRelations = relations(studentProgress, ({ one }) => ({
  user: one(users, {
    fields: [studentProgress.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [studentProgress.courseId],
    references: [courses.id],
  }),
  module: one(courseModules, {
    fields: [studentProgress.moduleId],
    references: [courseModules.id],
  }),
  lesson: one(lessons, {
    fields: [studentProgress.lessonId],
    references: [lessons.id],
  }),
  quiz: one(quizzes, {
    fields: [studentProgress.quizId],
    references: [quizzes.id],
  }),
}));
*/