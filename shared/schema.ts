import { pgTable, serial, text, boolean, timestamp, integer, varchar, foreignKey, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Definición de enumeraciones para los módulos bancarios
export const bankAccountTypeEnum = z.enum(['checking', 'savings', 'credit']);
export const bankTransactionTypeEnum = z.enum(['payment', 'charge', 'transfer', 'deposit', 'withdrawal', 'fee']);

// Definición de enumeraciones para el módulo E-Learning
export const courseLevelEnum = z.enum(['basic', 'intermediate', 'advanced']);
export const lessonTypeEnum = z.enum(['text', 'video', 'interactive', 'quiz']);

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

// E-Learning Student Progress
export const studentProgress = pgTable("student_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
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
  quizzes: many(quizzes),
  progress: many(studentProgress),
  author: one(users, {
    fields: [courses.createdBy],
    references: [users.id],
  }),
  company: one(users, {
    fields: [courses.companyId],
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

export const studentProgressRelations = relations(studentProgress, ({ one }) => ({
  user: one(users, {
    fields: [studentProgress.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [studentProgress.courseId],
    references: [courses.id],
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