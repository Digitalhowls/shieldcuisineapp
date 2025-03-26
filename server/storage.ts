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
  courses,
  lessons,
  quizzes,
  questions,
  options,
  userCourses,
  quizAttempts,
  userAnswers,
  notifications,
  notificationPreferences,
  cmsPages,
  cmsCategories,
  cmsPageCategories,
  cmsTags,
  cmsPageTags,
  cmsMedia,
  cmsBranding,
  cmsMenus,
  cmsMenuItems,
  cmsFormSubmissions,
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
  type Course,
  type InsertCourse,
  type Lesson,
  type InsertLesson,
  type Quiz,
  type InsertQuiz,
  type Question,
  type InsertQuestion,
  type Option,
  type InsertOption,
  type UserCourse,
  type InsertUserCourse,
  type QuizAttempt,
  type InsertQuizAttempt,
  type UserAnswer,
  type InsertUserAnswer,
  type ControlTemplate,
  type InsertControlTemplate,
  type ControlRecord,
  type InsertControlRecord,
  type Notification,
  type InsertNotification,
  type NotificationPreferences,
  type InsertNotificationPreferences,
  type CmsPage,
  type InsertCmsPage,
  type CmsCategory,
  type InsertCmsCategory,
  type CmsPageCategory,
  type InsertCmsPageCategory,
  type CmsTag,
  type InsertCmsTag,
  type CmsPageTag,
  type InsertCmsPageTag,
  type CmsMedia,
  type InsertCmsMedia,
  type CmsBranding,
  type InsertCmsBranding,
  type CmsMenu,
  type InsertCmsMenu,
  type CmsMenuItem,
  type InsertCmsMenuItem,
  type CmsFormSubmission,
  type InsertCmsFormSubmission
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Use MemoryStore for session storage - more reliable for development
const MemoryStore = createMemoryStore(session);

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
  
  // E-Learning Courses
  getCourses(companyId: number): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, data: Partial<InsertCourse>): Promise<Course | undefined>;
  getUserCourses(userId: number): Promise<(UserCourse & { course: Course })[]>;
  
  // E-Learning Lessons
  getLessons(courseId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, data: Partial<InsertLesson>): Promise<Lesson | undefined>;
  
  // E-Learning Quizzes
  getQuizzes(courseId: number): Promise<Quiz[]>;
  getLessonQuiz(lessonId: number): Promise<Quiz | undefined>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  
  // E-Learning Questions & Options
  getQuestions(quizId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  getOptions(questionId: number): Promise<Option[]>;
  createOption(option: InsertOption): Promise<Option>;
  
  // E-Learning User Interactions
  enrollUserInCourse(userCourse: InsertUserCourse): Promise<UserCourse>;
  getUserCourse(userId: number, courseId: number): Promise<UserCourse | undefined>;
  updateUserCourseProgress(id: number, data: Partial<InsertUserCourse>): Promise<UserCourse | undefined>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  submitUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer>;
  getQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]>;
  getQuizResults(attemptId: number): Promise<{ attempt: QuizAttempt; answers: UserAnswer[] }>;
  
  // Notifications
  getUserNotifications(userId: number): Promise<Notification[]>;
  getUserUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  deleteNotification(id: number): Promise<void>;
  
  // Notification Preferences
  getUserNotificationPreferences(userId: number): Promise<NotificationPreferences | undefined>;
  createNotificationPreferences(preferences: InsertNotificationPreferences): Promise<NotificationPreferences>;
  updateNotificationPreferences(id: number, data: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences | undefined>;
  
  // CMS Pages
  getCmsPages(companyId: number): Promise<CmsPage[]>;
  getCmsPage(id: number): Promise<CmsPage | undefined>;
  getCmsPageBySlug(companyId: number, slug: string): Promise<CmsPage | undefined>;
  createCmsPage(page: InsertCmsPage): Promise<CmsPage>;
  updateCmsPage(id: number, data: Partial<InsertCmsPage>): Promise<CmsPage | undefined>;
  deleteCmsPage(id: number): Promise<void>;
  
  // CMS Categories
  getCmsCategories(companyId: number): Promise<CmsCategory[]>;
  getCmsCategory(id: number): Promise<CmsCategory | undefined>;
  getCmsCategoryBySlug(companyId: number, slug: string): Promise<CmsCategory | undefined>;
  createCmsCategory(category: InsertCmsCategory): Promise<CmsCategory>;
  updateCmsCategory(id: number, data: Partial<InsertCmsCategory>): Promise<CmsCategory | undefined>;
  deleteCmsCategory(id: number): Promise<void>;
  
  // CMS Page Categories (Junction table)
  getCmsPageCategories(pageId: number): Promise<CmsPageCategory[]>;
  addCmsPageToCategory(pageCategory: InsertCmsPageCategory): Promise<CmsPageCategory>;
  removeCmsPageFromCategory(pageId: number, categoryId: number): Promise<void>;
  
  // CMS Tags
  getCmsTags(companyId: number): Promise<CmsTag[]>;
  getCmsTag(id: number): Promise<CmsTag | undefined>;
  createCmsTag(tag: InsertCmsTag): Promise<CmsTag>;
  updateCmsTag(id: number, data: Partial<InsertCmsTag>): Promise<CmsTag | undefined>;
  deleteCmsTag(id: number): Promise<void>;
  
  // CMS Page Tags (Junction table)
  getCmsPageTags(pageId: number): Promise<CmsPageTag[]>;
  addCmsPageTag(pageTag: InsertCmsPageTag): Promise<CmsPageTag>;
  removeCmsPageTag(pageId: number, tagId: number): Promise<void>;
  
  // CMS Media
  getCmsMedia(companyId: number): Promise<CmsMedia[]>;
  getCmsMediaItem(id: number): Promise<CmsMedia | undefined>;
  createCmsMedia(media: InsertCmsMedia): Promise<CmsMedia>;
  updateCmsMedia(id: number, data: Partial<InsertCmsMedia>): Promise<CmsMedia | undefined>;
  deleteCmsMedia(id: number): Promise<void>;
  
  // CMS Branding
  getCmsBranding(companyId: number): Promise<CmsBranding | undefined>;
  createCmsBranding(branding: InsertCmsBranding): Promise<CmsBranding>;
  updateCmsBranding(id: number, data: Partial<InsertCmsBranding>): Promise<CmsBranding | undefined>;
  
  // CMS Menus
  getCmsMenus(companyId: number): Promise<CmsMenu[]>;
  getCmsMenu(id: number): Promise<CmsMenu | undefined>;
  getCmsMenuByLocation(companyId: number, location: string): Promise<CmsMenu | undefined>;
  createCmsMenu(menu: InsertCmsMenu): Promise<CmsMenu>;
  updateCmsMenu(id: number, data: Partial<InsertCmsMenu>): Promise<CmsMenu | undefined>;
  deleteCmsMenu(id: number): Promise<void>;
  
  // CMS Menu Items
  getCmsMenuItems(menuId: number): Promise<CmsMenuItem[]>;
  getCmsMenuItem(id: number): Promise<CmsMenuItem | undefined>;
  createCmsMenuItem(menuItem: InsertCmsMenuItem): Promise<CmsMenuItem>;
  updateCmsMenuItem(id: number, data: Partial<InsertCmsMenuItem>): Promise<CmsMenuItem | undefined>;
  deleteCmsMenuItem(id: number): Promise<void>;
  
  // CMS Form Submissions
  getCmsFormSubmissions(companyId: number, pageId?: number): Promise<CmsFormSubmission[]>;
  getCmsFormSubmission(id: number): Promise<CmsFormSubmission | undefined>;
  createCmsFormSubmission(submission: InsertCmsFormSubmission): Promise<CmsFormSubmission>;
  deleteCmsFormSubmission(id: number): Promise<void>;
  
  // Session storage
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }
  
  // E-Learning Courses
  async getCourses(companyId: number): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.companyId, companyId));
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }
  
  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }
  
  async updateCourse(id: number, data: Partial<InsertCourse>): Promise<Course | undefined> {
    const [updatedCourse] = await db
      .update(courses)
      .set(data)
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }
  
  async getUserCourses(userId: number): Promise<(UserCourse & { course: Course })[]> {
    const userCoursesData = await db.select().from(userCourses).where(eq(userCourses.userId, userId));
    const result = [];

    for (const uc of userCoursesData) {
      const course = await this.getCourse(uc.courseId);
      if (course) {
        result.push({
          ...uc,
          course
        });
      }
    }
    
    return result;
  }
  
  // E-Learning Lessons
  async getLessons(courseId: number): Promise<Lesson[]> {
    return await db.select().from(lessons).where(eq(lessons.courseId, courseId));
  }
  
  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }
  
  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [newLesson] = await db.insert(lessons).values(lesson).returning();
    return newLesson;
  }
  
  async updateLesson(id: number, data: Partial<InsertLesson>): Promise<Lesson | undefined> {
    const [updatedLesson] = await db
      .update(lessons)
      .set(data)
      .where(eq(lessons.id, id))
      .returning();
    return updatedLesson;
  }
  
  // E-Learning Quizzes
  async getQuizzes(courseId: number): Promise<Quiz[]> {
    return await db.select().from(quizzes).where(eq(quizzes.courseId, courseId));
  }
  
  async getLessonQuiz(lessonId: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.lessonId, lessonId));
    return quiz;
  }
  
  async getQuiz(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }
  
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }
  
  // E-Learning Questions & Options
  async getQuestions(quizId: number): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.quizId, quizId));
  }
  
  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }
  
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }
  
  async getOptions(questionId: number): Promise<Option[]> {
    return await db.select().from(options).where(eq(options.questionId, questionId));
  }
  
  async getOption(id: number): Promise<Option | undefined> {
    const [option] = await db.select().from(options).where(eq(options.id, id));
    return option;
  }
  
  async createOption(option: InsertOption): Promise<Option> {
    const [newOption] = await db.insert(options).values(option).returning();
    return newOption;
  }
  
  // E-Learning User Interactions
  async enrollUserInCourse(userCourse: InsertUserCourse): Promise<UserCourse> {
    const [newUserCourse] = await db.insert(userCourses).values(userCourse).returning();
    return newUserCourse;
  }
  
  async getUserCourse(userId: number, courseId: number): Promise<UserCourse | undefined> {
    const [userCourse] = await db
      .select()
      .from(userCourses)
      .where(eq(userCourses.userId, userId))
      .where(eq(userCourses.courseId, courseId));
    return userCourse;
  }
  
  async updateUserCourseProgress(id: number, data: Partial<InsertUserCourse>): Promise<UserCourse | undefined> {
    const [updatedUserCourse] = await db
      .update(userCourses)
      .set(data)
      .where(eq(userCourses.id, id))
      .returning();
    return updatedUserCourse;
  }
  
  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [newAttempt] = await db.insert(quizAttempts).values(attempt).returning();
    return newAttempt;
  }
  
  async getQuizAttempt(id: number): Promise<QuizAttempt | undefined> {
    const [attempt] = await db.select().from(quizAttempts).where(eq(quizAttempts.id, id));
    return attempt;
  }
  
  async getQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .where(eq(quizAttempts.quizId, quizId));
  }
  
  async getUserQuizAttempts(userId: number): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId));
  }
  
  async updateQuizAttempt(id: number, data: Partial<InsertQuizAttempt>): Promise<QuizAttempt | undefined> {
    const [updatedAttempt] = await db
      .update(quizAttempts)
      .set(data)
      .where(eq(quizAttempts.id, id))
      .returning();
    return updatedAttempt;
  }
  
  async submitUserAnswer(answer: InsertUserAnswer): Promise<UserAnswer> {
    const [newAnswer] = await db.insert(userAnswers).values(answer).returning();
    return newAnswer;
  }
  
  async getUserAnswers(attemptId: number): Promise<UserAnswer[]> {
    return await db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.quizAttemptId, attemptId));
  }
  
  async getQuizResults(attemptId: number): Promise<{ attempt: QuizAttempt; answers: UserAnswer[] }> {
    const attempt = await this.getQuizAttempt(attemptId);
    if (!attempt) {
      throw new Error("Quiz attempt not found");
    }
    
    const answers = await this.getUserAnswers(attemptId);
    
    return {
      attempt,
      answers
    };
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
  
  // Notifications
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }
  
  async getUserUnreadNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .where(eq(notifications.read, false));
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }
  
  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }
  
  // Notification Preferences
  async getUserNotificationPreferences(userId: number): Promise<NotificationPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return preferences;
  }
  
  async createNotificationPreferences(preferences: InsertNotificationPreferences): Promise<NotificationPreferences> {
    const [newPreferences] = await db.insert(notificationPreferences).values(preferences).returning();
    return newPreferences;
  }
  
  async updateNotificationPreferences(id: number, data: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences | undefined> {
    const [updatedPreferences] = await db
      .update(notificationPreferences)
      .set(data)
      .where(eq(notificationPreferences.id, id))
      .returning();
    return updatedPreferences;
  }
  
  // CMS Pages
  async getCmsPages(companyId: number): Promise<CmsPage[]> {
    return await db.select().from(cmsPages).where(eq(cmsPages.companyId, companyId));
  }
  
  async getCmsPage(id: number): Promise<CmsPage | undefined> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.id, id));
    return page;
  }
  
  async getCmsPageBySlug(companyId: number, slug: string): Promise<CmsPage | undefined> {
    const [page] = await db
      .select()
      .from(cmsPages)
      .where(eq(cmsPages.companyId, companyId))
      .where(eq(cmsPages.slug, slug));
    return page;
  }
  
  async createCmsPage(page: InsertCmsPage): Promise<CmsPage> {
    const [newPage] = await db.insert(cmsPages).values(page).returning();
    return newPage;
  }
  
  async updateCmsPage(id: number, data: Partial<InsertCmsPage>): Promise<CmsPage | undefined> {
    const [updatedPage] = await db
      .update(cmsPages)
      .set(data)
      .where(eq(cmsPages.id, id))
      .returning();
    return updatedPage;
  }
  
  async deleteCmsPage(id: number): Promise<void> {
    await db.delete(cmsPages).where(eq(cmsPages.id, id));
  }
  
  // CMS Categories
  async getCmsCategories(companyId: number): Promise<CmsCategory[]> {
    return await db.select().from(cmsCategories).where(eq(cmsCategories.companyId, companyId));
  }
  
  async getCmsCategory(id: number): Promise<CmsCategory | undefined> {
    const [category] = await db.select().from(cmsCategories).where(eq(cmsCategories.id, id));
    return category;
  }
  
  async getCmsCategoryBySlug(companyId: number, slug: string): Promise<CmsCategory | undefined> {
    const [category] = await db
      .select()
      .from(cmsCategories)
      .where(eq(cmsCategories.companyId, companyId))
      .where(eq(cmsCategories.slug, slug));
    return category;
  }
  
  async createCmsCategory(category: InsertCmsCategory): Promise<CmsCategory> {
    const [newCategory] = await db.insert(cmsCategories).values(category).returning();
    return newCategory;
  }
  
  async updateCmsCategory(id: number, data: Partial<InsertCmsCategory>): Promise<CmsCategory | undefined> {
    const [updatedCategory] = await db
      .update(cmsCategories)
      .set(data)
      .where(eq(cmsCategories.id, id))
      .returning();
    return updatedCategory;
  }
  
  async deleteCmsCategory(id: number): Promise<void> {
    await db.delete(cmsCategories).where(eq(cmsCategories.id, id));
  }
  
  // CMS Page Categories (Junction table)
  async getCmsPageCategories(pageId: number): Promise<CmsPageCategory[]> {
    return await db.select().from(cmsPageCategories).where(eq(cmsPageCategories.pageId, pageId));
  }
  
  async addCmsPageToCategory(pageCategory: InsertCmsPageCategory): Promise<CmsPageCategory> {
    const [newPageCategory] = await db.insert(cmsPageCategories).values(pageCategory).returning();
    return newPageCategory;
  }
  
  async removeCmsPageFromCategory(pageId: number, categoryId: number): Promise<void> {
    await db
      .delete(cmsPageCategories)
      .where(eq(cmsPageCategories.pageId, pageId))
      .where(eq(cmsPageCategories.categoryId, categoryId));
  }
}

export const storage = new DatabaseStorage();
