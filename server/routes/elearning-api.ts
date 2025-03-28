import { Request, Response, Router } from "express";
import { verifyAuth } from "../auth";
import { db } from "../db";
import { eq, and, like, desc, sql, isNull, asc, not, gt, lt, gte, lte } from "drizzle-orm";
import { 
  courses, lessons, quizzes, quizQuestions, studentProgress, 
  courseModules, courseEnrollments, certificates,
  courseReviews, courseLicenses, 
  insertCourseSchema, insertLessonSchema, insertQuizSchema, 
  insertQuizQuestionSchema, insertStudentProgressSchema,
  insertCourseModuleSchema, insertCourseEnrollmentSchema, 
  insertCertificateSchema, insertCourseReviewSchema,
  insertCourseLicenseSchema
} from "@shared/schema";
import { z } from "zod";

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(verifyAuth);

// ==========================================================================
// Rutas para gestión de cursos
// ==========================================================================

// Obtener todos los cursos (con filtros opcionales)
router.get("/courses", async (req: Request, res: Response) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;
    
    let query = db.select().from(courses);
    
    // Aplicar filtros si se proporcionan
    if (category) {
      query = query.where(eq(courses.category, category as string));
    }
    
    if (level) {
      query = query.where(eq(courses.level, level as string));
    }
    
    if (search) {
      query = query.where(
        sql`${courses.title} ILIKE ${'%' + (search as string) + '%'} OR ${courses.description} ILIKE ${'%' + (search as string) + '%'}`
      );
    }
    
    // Paginación
    const offset = (Number(page) - 1) * Number(limit);
    
    const result = await query
      .orderBy(desc(courses.createdAt))
      .limit(Number(limit))
      .offset(offset);
    
    // Obtener el conteo total para la paginación
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses);
    
    const totalCount = countResult[0]?.count || 0;
    
    res.status(200).json({
      data: result,
      meta: {
        total: Number(totalCount),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(Number(totalCount) / Number(limit))
      }
    });
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
});

// Obtener un curso específico junto con sus módulos, lecciones y evaluaciones
router.get("/courses/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Obtener el curso
    const [courseData] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, Number(id)));
    
    if (!courseData) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Obtener los módulos del curso
    const courseModulesList = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, Number(id)))
      .orderBy(asc(courseModules.order));
    
    // Obtener las lecciones del curso
    const courseLesson = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, Number(id)))
      .orderBy(asc(lessons.order));
    
    // Obtener las evaluaciones del curso
    const courseQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.courseId, Number(id)));
    
    // Obtener las reseñas/valoraciones del curso
    const courseReviewsList = await db
      .select()
      .from(courseReviews)
      .where(
        and(
          eq(courseReviews.courseId, Number(id)),
          eq(courseReviews.status, 'published')
        )
      );
    
    // Calcular la valoración media
    const averageRating = courseReviewsList.length > 0 
      ? courseReviewsList.reduce((acc, review) => acc + review.rating, 0) / courseReviewsList.length 
      : 0;
    
    // Obtener las licencias disponibles
    const courseLicensesList = await db
      .select()
      .from(courseLicenses)
      .where(
        and(
          eq(courseLicenses.courseId, Number(id)),
          eq(courseLicenses.isActive, true)
        )
      );
    
    // Respuesta con todos los datos del curso
    res.status(200).json({
      course: courseData,
      modules: courseModulesList,
      lessons: courseLesson,
      quizzes: courseQuizzes,
      reviews: {
        items: courseReviewsList,
        averageRating,
        count: courseReviewsList.length
      },
      licenses: courseLicensesList
    });
    
  } catch (error) {
    console.error("Error al obtener curso:", error);
    res.status(500).json({ error: "Error al obtener el curso" });
  }
});

// Crear un nuevo curso
router.post("/courses", async (req: Request, res: Response) => {
  try {
    const data = insertCourseSchema.parse({
      ...req.body,
      createdBy: req.user.id
    });
    
    const [createdCourse] = await db
      .insert(courses)
      .values(data)
      .returning();
    
    res.status(201).json(createdCourse);
  } catch (error) {
    console.error("Error al crear curso:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Error al crear el curso" });
  }
});

// Actualizar un curso existente
router.put("/courses/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, Number(id)));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para editar este curso" });
    }
    
    const data = insertCourseSchema.parse({
      ...req.body,
      updatedAt: new Date()
    });
    
    const [updatedCourse] = await db
      .update(courses)
      .set(data)
      .where(eq(courses.id, Number(id)))
      .returning();
    
    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error("Error al actualizar curso:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Error al actualizar el curso" });
  }
});

// Eliminar un curso (solo lógicamente, cambiando status)
router.delete("/courses/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, Number(id)));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para eliminar este curso" });
    }
    
    // En lugar de eliminar, simplemente marcamos como no publicado
    const [updatedCourse] = await db
      .update(courses)
      .set({ 
        published: false,
        updatedAt: new Date() 
      })
      .where(eq(courses.id, Number(id)))
      .returning();
    
    res.status(200).json({
      message: "Curso desactivado correctamente",
      course: updatedCourse
    });
  } catch (error) {
    console.error("Error al eliminar curso:", error);
    res.status(500).json({ error: "Error al eliminar el curso" });
  }
});

// ==========================================================================
// Rutas para gestión de módulos
// ==========================================================================

// Obtener todos los módulos de un curso
router.get("/courses/:courseId/modules", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    const result = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, Number(courseId)))
      .orderBy(asc(courseModules.order));
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener módulos:", error);
    res.status(500).json({ error: "Error al obtener los módulos" });
  }
});

// Obtener un módulo específico
router.get("/modules/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [moduleData] = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, Number(id)));
    
    if (!moduleData) {
      return res.status(404).json({ error: "Módulo no encontrado" });
    }
    
    // Obtener las lecciones del módulo
    const moduleLessons = await db
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.courseId, moduleData.courseId),
          // Aquí necesitaríamos agregar moduleId a las lecciones para esta relación
          // Por ahora, podemos usar un enfoque alternativo
        )
      )
      .orderBy(asc(lessons.order));
    
    res.status(200).json({
      module: moduleData,
      lessons: moduleLessons
    });
  } catch (error) {
    console.error("Error al obtener módulo:", error);
    res.status(500).json({ error: "Error al obtener el módulo" });
  }
});

// Crear un nuevo módulo en un curso
router.post("/courses/:courseId/modules", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, Number(courseId)));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para añadir módulos a este curso" });
    }
    
    const data = insertCourseModuleSchema.parse({
      ...req.body,
      courseId: Number(courseId),
      createdBy: req.user.id
    });
    
    const [createdModule] = await db
      .insert(courseModules)
      .values(data)
      .returning();
    
    res.status(201).json(createdModule);
  } catch (error) {
    console.error("Error al crear módulo:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Error al crear el módulo" });
  }
});

// Actualizar un módulo existente
router.put("/modules/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar si el módulo existe
    const [existingModule] = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, Number(id)));
    
    if (!existingModule) {
      return res.status(404).json({ error: "Módulo no encontrado" });
    }
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, existingModule.courseId));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para editar este módulo" });
    }
    
    const data = insertCourseModuleSchema.parse({
      ...req.body,
      updatedAt: new Date()
    });
    
    const [updatedModule] = await db
      .update(courseModules)
      .set(data)
      .where(eq(courseModules.id, Number(id)))
      .returning();
    
    res.status(200).json(updatedModule);
  } catch (error) {
    console.error("Error al actualizar módulo:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Error al actualizar el módulo" });
  }
});

// Eliminar un módulo
router.delete("/modules/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar si el módulo existe
    const [existingModule] = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, Number(id)));
    
    if (!existingModule) {
      return res.status(404).json({ error: "Módulo no encontrado" });
    }
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, existingModule.courseId));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para eliminar este módulo" });
    }
    
    // Eliminar el módulo
    await db
      .delete(courseModules)
      .where(eq(courseModules.id, Number(id)));
    
    res.status(200).json({
      message: "Módulo eliminado correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar módulo:", error);
    res.status(500).json({ error: "Error al eliminar el módulo" });
  }
});

// ==========================================================================
// Rutas para gestión de lecciones
// ==========================================================================

// Obtener todas las lecciones de un curso
router.get("/courses/:courseId/lessons", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    const result = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, Number(courseId)))
      .orderBy(asc(lessons.order));
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener lecciones:", error);
    res.status(500).json({ error: "Error al obtener las lecciones" });
  }
});

// Obtener una lección específica
router.get("/lessons/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [lessonData] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, Number(id)));
    
    if (!lessonData) {
      return res.status(404).json({ error: "Lección no encontrada" });
    }
    
    res.status(200).json(lessonData);
  } catch (error) {
    console.error("Error al obtener lección:", error);
    res.status(500).json({ error: "Error al obtener la lección" });
  }
});

// Crear una nueva lección en un curso
router.post("/courses/:courseId/lessons", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, Number(courseId)));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para añadir lecciones a este curso" });
    }
    
    const data = insertLessonSchema.parse({
      ...req.body,
      courseId: Number(courseId),
      createdBy: req.user.id
    });
    
    const [createdLesson] = await db
      .insert(lessons)
      .values(data)
      .returning();
    
    res.status(201).json(createdLesson);
  } catch (error) {
    console.error("Error al crear lección:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Error al crear la lección" });
  }
});

// Actualizar una lección existente
router.put("/lessons/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar si la lección existe
    const [existingLesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, Number(id)));
    
    if (!existingLesson) {
      return res.status(404).json({ error: "Lección no encontrada" });
    }
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, existingLesson.courseId));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para editar esta lección" });
    }
    
    const data = insertLessonSchema.parse({
      ...req.body,
      updatedAt: new Date()
    });
    
    const [updatedLesson] = await db
      .update(lessons)
      .set(data)
      .where(eq(lessons.id, Number(id)))
      .returning();
    
    res.status(200).json(updatedLesson);
  } catch (error) {
    console.error("Error al actualizar lección:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Error al actualizar la lección" });
  }
});

// Eliminar una lección
router.delete("/lessons/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar si la lección existe
    const [existingLesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, Number(id)));
    
    if (!existingLesson) {
      return res.status(404).json({ error: "Lección no encontrada" });
    }
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, existingLesson.courseId));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para eliminar esta lección" });
    }
    
    // Eliminar la lección
    await db
      .delete(lessons)
      .where(eq(lessons.id, Number(id)));
    
    res.status(200).json({
      message: "Lección eliminada correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar lección:", error);
    res.status(500).json({ error: "Error al eliminar la lección" });
  }
});

// ==========================================================================
// Rutas para gestión de evaluaciones (quizzes)
// ==========================================================================

// Obtener todas las evaluaciones de un curso
router.get("/courses/:courseId/quizzes", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    const result = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.courseId, Number(courseId)));
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener evaluaciones:", error);
    res.status(500).json({ error: "Error al obtener las evaluaciones" });
  }
});

// Obtener una evaluación específica con sus preguntas
router.get("/quizzes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [quizData] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, Number(id)));
    
    if (!quizData) {
      return res.status(404).json({ error: "Evaluación no encontrada" });
    }
    
    // Obtener preguntas de la evaluación
    const questions = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, Number(id)))
      .orderBy(asc(quizQuestions.order));
    
    res.status(200).json({
      quiz: quizData,
      questions: questions
    });
  } catch (error) {
    console.error("Error al obtener evaluación:", error);
    res.status(500).json({ error: "Error al obtener la evaluación" });
  }
});

// Crear una nueva evaluación en un curso
router.post("/courses/:courseId/quizzes", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, Number(courseId)));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para añadir evaluaciones a este curso" });
    }
    
    const data = insertQuizSchema.parse({
      ...req.body,
      courseId: Number(courseId),
      createdBy: req.user.id
    });
    
    const [createdQuiz] = await db
      .insert(quizzes)
      .values(data)
      .returning();
    
    res.status(201).json(createdQuiz);
  } catch (error) {
    console.error("Error al crear evaluación:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Error al crear la evaluación" });
  }
});

// Actualizar una evaluación existente
router.put("/quizzes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar si la evaluación existe
    const [existingQuiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, Number(id)));
    
    if (!existingQuiz) {
      return res.status(404).json({ error: "Evaluación no encontrada" });
    }
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, existingQuiz.courseId));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para editar esta evaluación" });
    }
    
    const data = insertQuizSchema.parse({
      ...req.body,
      updatedAt: new Date()
    });
    
    const [updatedQuiz] = await db
      .update(quizzes)
      .set(data)
      .where(eq(quizzes.id, Number(id)))
      .returning();
    
    res.status(200).json(updatedQuiz);
  } catch (error) {
    console.error("Error al actualizar evaluación:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Error al actualizar la evaluación" });
  }
});

// Eliminar una evaluación
router.delete("/quizzes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar si la evaluación existe
    const [existingQuiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, Number(id)));
    
    if (!existingQuiz) {
      return res.status(404).json({ error: "Evaluación no encontrada" });
    }
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, existingQuiz.courseId));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para eliminar esta evaluación" });
    }
    
    // Eliminar todas las preguntas asociadas a la evaluación
    await db
      .delete(quizQuestions)
      .where(eq(quizQuestions.quizId, Number(id)));
    
    // Eliminar la evaluación
    await db
      .delete(quizzes)
      .where(eq(quizzes.id, Number(id)));
    
    res.status(200).json({
      message: "Evaluación eliminada correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar evaluación:", error);
    res.status(500).json({ error: "Error al eliminar la evaluación" });
  }
});

// ==========================================================================
// Rutas para gestión de preguntas de evaluación
// ==========================================================================

// Obtener todas las preguntas de una evaluación
router.get("/quizzes/:quizId/questions", async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    
    const result = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, Number(quizId)))
      .orderBy(asc(quizQuestions.order));
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener preguntas:", error);
    res.status(500).json({ error: "Error al obtener las preguntas" });
  }
});

// Obtener una pregunta específica
router.get("/questions/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [questionData] = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.id, Number(id)));
    
    if (!questionData) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }
    
    res.status(200).json(questionData);
  } catch (error) {
    console.error("Error al obtener pregunta:", error);
    res.status(500).json({ error: "Error al obtener la pregunta" });
  }
});

// Crear una nueva pregunta en una evaluación
router.post("/quizzes/:quizId/questions", async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    
    // Verificar si la evaluación existe
    const [existingQuiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, Number(quizId)));
    
    if (!existingQuiz) {
      return res.status(404).json({ error: "Evaluación no encontrada" });
    }
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, existingQuiz.courseId));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para añadir preguntas a esta evaluación" });
    }
    
    const data = insertQuizQuestionSchema.parse({
      ...req.body,
      quizId: Number(quizId)
    });
    
    const [createdQuestion] = await db
      .insert(quizQuestions)
      .values(data)
      .returning();
    
    res.status(201).json(createdQuestion);
  } catch (error) {
    console.error("Error al crear pregunta:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Error al crear la pregunta" });
  }
});

// Actualizar una pregunta existente
router.put("/questions/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar si la pregunta existe
    const [existingQuestion] = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.id, Number(id)));
    
    if (!existingQuestion) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }
    
    // Verificar si la evaluación existe
    const [existingQuiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, existingQuestion.quizId));
    
    if (!existingQuiz) {
      return res.status(404).json({ error: "Evaluación no encontrada" });
    }
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, existingQuiz.courseId));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para editar esta pregunta" });
    }
    
    const data = insertQuizQuestionSchema.parse({
      ...req.body,
      updatedAt: new Date()
    });
    
    const [updatedQuestion] = await db
      .update(quizQuestions)
      .set(data)
      .where(eq(quizQuestions.id, Number(id)))
      .returning();
    
    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error("Error al actualizar pregunta:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Error al actualizar la pregunta" });
  }
});

// Eliminar una pregunta
router.delete("/questions/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Verificar si la pregunta existe
    const [existingQuestion] = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.id, Number(id)));
    
    if (!existingQuestion) {
      return res.status(404).json({ error: "Pregunta no encontrada" });
    }
    
    // Verificar si la evaluación existe
    const [existingQuiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, existingQuestion.quizId));
    
    if (!existingQuiz) {
      return res.status(404).json({ error: "Evaluación no encontrada" });
    }
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, existingQuiz.courseId));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para eliminar esta pregunta" });
    }
    
    // Eliminar la pregunta
    await db
      .delete(quizQuestions)
      .where(eq(quizQuestions.id, Number(id)));
    
    res.status(200).json({
      message: "Pregunta eliminada correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar pregunta:", error);
    res.status(500).json({ error: "Error al eliminar la pregunta" });
  }
});

// ==========================================================================
// Rutas para la gestión de inscripciones de estudiantes
// ==========================================================================

// Obtener todas las inscripciones de un usuario
router.get("/my-enrollments", async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    const result = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId))
      .orderBy(desc(courseEnrollments.enrolledAt));
    
    // Obtener información básica de los cursos inscritos
    const courseIds = result.map(enrollment => enrollment.courseId);
    
    let courseData = [];
    if (courseIds.length > 0) {
      // Nota: Esta consulta se simplifica para mayor compatibilidad
      courseData = await db
        .select()
        .from(courses)
        .where(sql`${courses.id} IN (${courseIds.join(',')})`);
    }
    
    // Combinar datos de inscripción con datos de cursos
    const enrollmentsWithCourseInfo = result.map(enrollment => {
      const course = courseData.find(c => c.id === enrollment.courseId);
      return {
        ...enrollment,
        courseTitle: course?.title || 'Curso no disponible',
        courseImage: course?.featuredImage || null,
        courseLevel: course?.level || null
      };
    });
    
    res.status(200).json(enrollmentsWithCourseInfo);
  } catch (error) {
    console.error("Error al obtener inscripciones:", error);
    res.status(500).json({ error: "Error al obtener las inscripciones" });
  }
});

// Obtener inscripciones a un curso específico (para administradores)
router.get("/courses/:courseId/enrollments", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, Number(courseId)));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para ver las inscripciones de este curso" });
    }
    
    const result = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.courseId, Number(courseId)))
      .orderBy(desc(courseEnrollments.enrolledAt));
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error al obtener inscripciones:", error);
    res.status(500).json({ error: "Error al obtener las inscripciones" });
  }
});

// Inscribirse a un curso
router.post("/courses/:courseId/enroll", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, Number(courseId)));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Verificar si el usuario ya está inscrito
    const [existingEnrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.courseId, Number(courseId))
        )
      );
    
    if (existingEnrollment) {
      return res.status(400).json({ error: "Ya estás inscrito en este curso" });
    }
    
    // Crear la inscripción
    const [enrollment] = await db
      .insert(courseEnrollments)
      .values({
        userId,
        courseId: Number(courseId),
        status: 'active',
        enrolledAt: new Date()
      })
      .returning();
    
    // Crear entradas de progreso para todas las lecciones del curso
    const courseLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, Number(courseId)));
    
    if (courseLessons.length > 0) {
      const progressEntries = courseLessons.map(lesson => ({
        userId,
        courseId: Number(courseId),
        lessonId: lesson.id,
        status: 'not_started',
        progress: 0
      }));
      
      await db
        .insert(studentProgress)
        .values(progressEntries);
    }
    
    res.status(201).json({
      message: "Inscripción completada con éxito",
      enrollment
    });
  } catch (error) {
    console.error("Error al inscribirse:", error);
    res.status(500).json({ error: "Error al procesar la inscripción" });
  }
});

// Cancelar inscripción a un curso
router.post("/courses/:courseId/unenroll", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    // Verificar si la inscripción existe
    const [existingEnrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.courseId, Number(courseId))
        )
      );
    
    if (!existingEnrollment) {
      return res.status(404).json({ error: "No estás inscrito en este curso" });
    }
    
    // Actualizar el estado de la inscripción a 'canceled'
    const [updatedEnrollment] = await db
      .update(courseEnrollments)
      .set({ 
        status: 'canceled',
        updatedAt: new Date()
      })
      .where(eq(courseEnrollments.id, existingEnrollment.id))
      .returning();
    
    res.status(200).json({
      message: "Inscripción cancelada con éxito",
      enrollment: updatedEnrollment
    });
  } catch (error) {
    console.error("Error al cancelar inscripción:", error);
    res.status(500).json({ error: "Error al cancelar la inscripción" });
  }
});

// ==========================================================================
// Rutas para la gestión del progreso de estudiantes
// ==========================================================================

// Obtener el progreso de un estudiante en un curso
router.get("/courses/:courseId/progress", async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, Number(courseId)));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Verificar si el usuario está inscrito
    const [existingEnrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.courseId, Number(courseId))
        )
      );
    
    if (!existingEnrollment || existingEnrollment.status !== 'active') {
      return res.status(403).json({ error: "No tienes acceso a este curso" });
    }
    
    // Obtener todo el progreso del usuario en este curso
    const progress = await db
      .select()
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.userId, userId),
          eq(studentProgress.courseId, Number(courseId))
        )
      );
    
    // Calcular el progreso general
    const totalLessonsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(lessons)
      .where(eq(lessons.courseId, Number(courseId)));
    
    const totalLessons = totalLessonsResult[0]?.count || 0;
    const completedLessons = progress.filter(p => p.status === 'completed').length;
    
    const totalProgress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;
    
    res.status(200).json({
      courseProgress: totalProgress,
      completedLessons,
      totalLessons,
      lessonProgress: progress
    });
  } catch (error) {
    console.error("Error al obtener progreso:", error);
    res.status(500).json({ error: "Error al obtener el progreso" });
  }
});

// Actualizar el progreso de una lección
router.post("/lessons/:lessonId/progress", async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { progress, status } = req.body;
    const userId = req.user.id;
    
    // Verificar si la lección existe
    const [existingLesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, Number(lessonId)));
    
    if (!existingLesson) {
      return res.status(404).json({ error: "Lección no encontrada" });
    }
    
    // Verificar si el usuario está inscrito en el curso
    const [existingEnrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.courseId, existingLesson.courseId)
        )
      );
    
    if (!existingEnrollment || existingEnrollment.status !== 'active') {
      return res.status(403).json({ error: "No tienes acceso a este curso" });
    }
    
    // Verificar si ya existe un registro de progreso
    const [existingProgress] = await db
      .select()
      .from(studentProgress)
      .where(
        and(
          eq(studentProgress.userId, userId),
          eq(studentProgress.lessonId, Number(lessonId))
        )
      );
    
    let updatedProgress;
    
    if (existingProgress) {
      // Actualizar el progreso existente
      [updatedProgress] = await db
        .update(studentProgress)
        .set({ 
          progress: Number(progress), 
          status, 
          completedAt: status === 'completed' ? new Date() : existingProgress.completedAt,
          updatedAt: new Date()
        })
        .where(eq(studentProgress.id, existingProgress.id))
        .returning();
    } else {
      // Crear un nuevo registro de progreso
      [updatedProgress] = await db
        .insert(studentProgress)
        .values({
          userId,
          courseId: existingLesson.courseId,
          lessonId: Number(lessonId),
          progress: Number(progress),
          status,
          completedAt: status === 'completed' ? new Date() : null
        })
        .returning();
    }
    
    // Verificar si todas las lecciones están completadas para actualizar el estado de inscripción
    if (status === 'completed') {
      const allLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, existingLesson.courseId));
      
      const allProgress = await db
        .select()
        .from(studentProgress)
        .where(
          and(
            eq(studentProgress.userId, userId),
            eq(studentProgress.courseId, existingLesson.courseId),
            not(isNull(studentProgress.lessonId))
          )
        );
      
      const allCompleted = allLessons.every(lesson => 
        allProgress.some(p => 
          p.lessonId === lesson.id && p.status === 'completed'
        )
      );
      
      if (allCompleted) {
        // Actualizar el estado de inscripción a 'completed'
        await db
          .update(courseEnrollments)
          .set({ 
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(courseEnrollments.id, existingEnrollment.id));
        
        // Aquí podríamos generar un certificado de finalización
      }
    }
    
    res.status(200).json({
      message: "Progreso actualizado con éxito",
      progress: updatedProgress
    });
  } catch (error) {
    console.error("Error al actualizar progreso:", error);
    res.status(500).json({ error: "Error al actualizar el progreso" });
  }
});

// ==========================================================================
// Rutas para la gestión de certificados
// ==========================================================================

// Obtener todos los certificados de un usuario
router.get("/my-certificates", async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    const userCertificates = await db
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.issuedAt));
    
    res.status(200).json(userCertificates);
  } catch (error) {
    console.error("Error al obtener certificados:", error);
    res.status(500).json({ error: "Error al obtener los certificados" });
  }
});

// Obtener un certificado específico
router.get("/certificates/:code", async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    const [certificate] = await db
      .select()
      .from(certificates)
      .where(eq(certificates.certificateCode, code));
    
    if (!certificate) {
      return res.status(404).json({ error: "Certificado no encontrado" });
    }
    
    res.status(200).json(certificate);
  } catch (error) {
    console.error("Error al obtener certificado:", error);
    res.status(500).json({ error: "Error al obtener el certificado" });
  }
});

// ==========================================================================
// Rutas para integración de IA para generación de contenido
// ==========================================================================

// Generar contenido para una lección con IA
router.post("/ai/generate-lesson", async (req: Request, res: Response) => {
  try {
    const { title, prompt, courseId } = req.body;
    
    if (!title || !prompt || !courseId) {
      return res.status(400).json({ error: "Faltan campos requeridos: title, prompt y courseId" });
    }
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, Number(courseId)));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para generar contenido para este curso" });
    }
    
    // Aquí se implementaría la lógica de generación con IA (Perplexity/OpenAI/Claude)
    // Por ahora, devolvemos un mensaje temporal
    res.status(200).json({
      message: "Generación de contenido con IA pendiente de implementación",
      lessonTemplate: {
        title,
        content: "<p>Contenido generado por IA estará disponible pronto.</p>",
        courseId: Number(courseId),
        lessonType: "text",
        duration: "15 min",
        order: 1
      }
    });
  } catch (error) {
    console.error("Error al generar contenido con IA:", error);
    res.status(500).json({ error: "Error al generar contenido con IA" });
  }
});

// Generar preguntas de evaluación con IA
router.post("/ai/generate-quiz-questions", async (req: Request, res: Response) => {
  try {
    const { quizId, numberOfQuestions, topic } = req.body;
    
    if (!quizId || !numberOfQuestions || !topic) {
      return res.status(400).json({ error: "Faltan campos requeridos: quizId, numberOfQuestions y topic" });
    }
    
    // Verificar si la evaluación existe
    const [existingQuiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, Number(quizId)));
    
    if (!existingQuiz) {
      return res.status(404).json({ error: "Evaluación no encontrada" });
    }
    
    // Verificar si el curso existe
    const [existingCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, existingQuiz.courseId));
    
    if (!existingCourse) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    
    // Asegurar que el usuario tiene permisos (es el creador o un administrador)
    if (existingCourse.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tienes permisos para generar preguntas para esta evaluación" });
    }
    
    // Aquí se implementaría la lógica de generación con IA (Perplexity/OpenAI/Claude)
    // Por ahora, devolvemos un mensaje temporal
    res.status(200).json({
      message: "Generación de preguntas con IA pendiente de implementación",
      questionTemplates: [
        {
          quizId: Number(quizId),
          question: "¿Pregunta de ejemplo generada por IA?",
          options: JSON.stringify([
            { text: "Opción 1", isCorrect: false },
            { text: "Opción 2", isCorrect: true },
            { text: "Opción 3", isCorrect: false },
            { text: "Opción 4", isCorrect: false }
          ]),
          explanation: "Explicación de la respuesta correcta",
          order: 1
        }
      ]
    });
  } catch (error) {
    console.error("Error al generar preguntas con IA:", error);
    res.status(500).json({ error: "Error al generar preguntas con IA" });
  }
});

export { router as default };