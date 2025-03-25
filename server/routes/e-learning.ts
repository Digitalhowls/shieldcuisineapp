/**
 * Rutas de API para la plataforma de e-learning
 */
import { Request, Response, NextFunction, Express } from "express";
import { storage } from "../storage";
import { 
  insertCourseSchema, 
  insertLessonSchema, 
  insertQuizSchema, 
  insertQuestionSchema,
  insertOptionSchema,
  insertUserCourseSchema,
  insertQuizAttemptSchema,
  insertUserAnswerSchema
} from "@shared/schema";

/**
 * Middleware para verificar autenticación
 */
const verifyAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "No autenticado" });
  }
  next();
};

/**
 * Middleware para verificar roles de administrador
 */
const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "No autenticado" });
  }
  
  const userRole = req.user?.role || "";
  const adminRoles = ["admin", "company_admin"];
  
  if (!adminRoles.includes(userRole)) {
    return res.status(403).json({ error: "Permisos insuficientes" });
  }
  
  next();
};

/**
 * Registra las rutas para la plataforma e-learning
 */
export function registerELearningRoutes(app: Express) {
  /**
   * Rutas para Cursos
   */
  // Obtener todos los cursos de una compañía
  app.get("/api/e-learning/courses", verifyAuth, async (req: Request, res: Response) => {
    try {
      // Si el usuario es administrador, puede ver todos los cursos de su compañía
      // Si no, solo ve los cursos en que está inscrito
      const userRole = req.user?.role || "";
      const adminRoles = ["admin", "company_admin"];
      
      if (adminRoles.includes(userRole)) {
        const companyId = req.user?.companyId;
        const courses = await storage.getCourses(companyId);
        res.json(courses);
      } else {
        // Obtener cursos en los que el usuario está inscrito
        const userCourses = await storage.getUserCourses(req.user!.id);
        res.json(userCourses.map(uc => uc.course));
      }
    } catch (error) {
      console.error("Error al obtener cursos:", error);
      res.status(500).json({ error: "Error al obtener cursos" });
    }
  });

  // Obtener un curso específico
  app.get("/api/e-learning/courses/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ error: "ID de curso inválido" });
      }
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Curso no encontrado" });
      }
      
      // Comprobación de permisos si no es admin
      const userRole = req.user?.role || "";
      const adminRoles = ["admin", "company_admin"];
      
      if (!adminRoles.includes(userRole)) {
        // Verificar si el usuario está inscrito en este curso
        const userCourse = await storage.getUserCourse(req.user!.id, courseId);
        if (!userCourse) {
          return res.status(403).json({ error: "No tienes acceso a este curso" });
        }
      }
      
      // Obtener lecciones del curso
      const lessons = await storage.getLessons(courseId);
      
      // Obtener exámenes del curso
      const quizzes = await storage.getQuizzes(courseId);
      
      res.json({
        course,
        lessons,
        quizzes
      });
    } catch (error) {
      console.error("Error al obtener detalles del curso:", error);
      res.status(500).json({ error: "Error al obtener detalles del curso" });
    }
  });

  // Crear un nuevo curso
  app.post("/api/e-learning/courses", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validatedData);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error al crear curso:", error);
      res.status(400).json({ error: "Datos del curso inválidos" });
    }
  });

  // Actualizar un curso
  app.put("/api/e-learning/courses/:id", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ error: "ID de curso inválido" });
      }
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Curso no encontrado" });
      }
      
      // Verificar que el curso pertenezca a la compañía del usuario admin
      if (course.companyId !== req.user!.companyId) {
        return res.status(403).json({ error: "No tienes permisos para modificar este curso" });
      }
      
      const validatedData = insertCourseSchema.partial().parse(req.body);
      const updatedCourse = await storage.updateCourse(courseId, validatedData);
      
      res.json(updatedCourse);
    } catch (error) {
      console.error("Error al actualizar curso:", error);
      res.status(400).json({ error: "Datos del curso inválidos" });
    }
  });

  /**
   * Rutas para Lecciones
   */
  // Obtener todas las lecciones de un curso
  app.get("/api/e-learning/courses/:courseId/lessons", verifyAuth, async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ error: "ID de curso inválido" });
      }
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Curso no encontrado" });
      }
      
      // Verificar acceso si no es admin
      const userRole = req.user?.role || "";
      const adminRoles = ["admin", "company_admin"];
      
      if (!adminRoles.includes(userRole)) {
        // Verificar si el usuario está inscrito en este curso
        const userCourse = await storage.getUserCourse(req.user!.id, courseId);
        if (!userCourse) {
          return res.status(403).json({ error: "No tienes acceso a este curso" });
        }
      }
      
      const lessons = await storage.getLessons(courseId);
      res.json(lessons);
    } catch (error) {
      console.error("Error al obtener lecciones:", error);
      res.status(500).json({ error: "Error al obtener lecciones" });
    }
  });

  // Obtener una lección específica
  app.get("/api/e-learning/lessons/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const lessonId = parseInt(req.params.id);
      if (isNaN(lessonId)) {
        return res.status(400).json({ error: "ID de lección inválido" });
      }
      
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lección no encontrada" });
      }
      
      // Verificar acceso si no es admin
      const userRole = req.user?.role || "";
      const adminRoles = ["admin", "company_admin"];
      
      if (!adminRoles.includes(userRole)) {
        // Obtener el curso al que pertenece la lección
        const course = await storage.getCourse(lesson.courseId);
        if (!course) {
          return res.status(404).json({ error: "Curso no encontrado" });
        }
        
        // Verificar si el usuario está inscrito en este curso
        const userCourse = await storage.getUserCourse(req.user!.id, lesson.courseId);
        if (!userCourse) {
          return res.status(403).json({ error: "No tienes acceso a esta lección" });
        }
      }
      
      // Buscar si hay un quiz asociado a esta lección
      const quiz = await storage.getLessonQuiz(lessonId);
      
      res.json({
        lesson,
        quiz
      });
    } catch (error) {
      console.error("Error al obtener lección:", error);
      res.status(500).json({ error: "Error al obtener lección" });
    }
  });

  // Crear una nueva lección
  app.post("/api/e-learning/courses/:courseId/lessons", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ error: "ID de curso inválido" });
      }
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Curso no encontrado" });
      }
      
      // Verificar que el curso pertenezca a la compañía del usuario admin
      if (course.companyId !== req.user!.companyId) {
        return res.status(403).json({ error: "No tienes permisos para modificar este curso" });
      }
      
      const validatedData = insertLessonSchema.parse({
        ...req.body,
        courseId
      });
      
      const lesson = await storage.createLesson(validatedData);
      res.status(201).json(lesson);
    } catch (error) {
      console.error("Error al crear lección:", error);
      res.status(400).json({ error: "Datos de la lección inválidos" });
    }
  });

  // Actualizar una lección
  app.put("/api/e-learning/lessons/:id", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const lessonId = parseInt(req.params.id);
      if (isNaN(lessonId)) {
        return res.status(400).json({ error: "ID de lección inválido" });
      }
      
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lección no encontrada" });
      }
      
      // Verificar que el usuario tenga permisos para la compañía a la que pertenece la lección
      const course = await storage.getCourse(lesson.courseId);
      if (!course || course.companyId !== req.user!.companyId) {
        return res.status(403).json({ error: "No tienes permisos para modificar esta lección" });
      }
      
      const validatedData = insertLessonSchema.partial().parse(req.body);
      const updatedLesson = await storage.updateLesson(lessonId, validatedData);
      
      res.json(updatedLesson);
    } catch (error) {
      console.error("Error al actualizar lección:", error);
      res.status(400).json({ error: "Datos de la lección inválidos" });
    }
  });

  /**
   * Rutas para Exámenes (Quizzes)
   */
  // Crear un nuevo examen
  app.post("/api/e-learning/courses/:courseId/quizzes", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ error: "ID de curso inválido" });
      }
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Curso no encontrado" });
      }
      
      // Verificar que el curso pertenezca a la compañía del usuario admin
      if (course.companyId !== req.user!.companyId) {
        return res.status(403).json({ error: "No tienes permisos para modificar este curso" });
      }
      
      const validatedData = insertQuizSchema.parse({
        ...req.body,
        courseId
      });
      
      const quiz = await storage.createQuiz(validatedData);
      res.status(201).json(quiz);
    } catch (error) {
      console.error("Error al crear examen:", error);
      res.status(400).json({ error: "Datos del examen inválidos" });
    }
  });

  // Obtener un examen específico
  app.get("/api/e-learning/quizzes/:id", verifyAuth, async (req: Request, res: Response) => {
    try {
      const quizId = parseInt(req.params.id);
      if (isNaN(quizId)) {
        return res.status(400).json({ error: "ID de examen inválido" });
      }
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Examen no encontrado" });
      }
      
      // Verificar acceso si no es admin
      const userRole = req.user?.role || "";
      const adminRoles = ["admin", "company_admin"];
      
      if (!adminRoles.includes(userRole)) {
        // Verificar si el usuario está inscrito en el curso al que pertenece este examen
        const userCourse = await storage.getUserCourse(req.user!.id, quiz.courseId);
        if (!userCourse) {
          return res.status(403).json({ error: "No tienes acceso a este examen" });
        }
      }
      
      // Obtener preguntas del examen
      const questions = await storage.getQuestions(quizId);
      
      // Si es admin, incluir opciones correctas
      if (adminRoles.includes(userRole)) {
        const questionsWithOptions = await Promise.all(
          questions.map(async (question) => {
            const options = await storage.getOptions(question.id);
            return {
              ...question,
              options
            };
          })
        );
        
        res.json({
          quiz,
          questions: questionsWithOptions
        });
      } else {
        // Si es estudiante, no incluir indicación de respuestas correctas
        const questionsWithOptions = await Promise.all(
          questions.map(async (question) => {
            const options = await storage.getOptions(question.id);
            return {
              ...question,
              options: options.map(opt => ({
                ...opt,
                isCorrect: undefined // No enviar cuál es la respuesta correcta
              }))
            };
          })
        );
        
        res.json({
          quiz,
          questions: questionsWithOptions
        });
      }
    } catch (error) {
      console.error("Error al obtener examen:", error);
      res.status(500).json({ error: "Error al obtener examen" });
    }
  });

  /**
   * Rutas para Preguntas y Opciones
   */
  // Crear una nueva pregunta
  app.post("/api/e-learning/quizzes/:quizId/questions", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const quizId = parseInt(req.params.quizId);
      if (isNaN(quizId)) {
        return res.status(400).json({ error: "ID de examen inválido" });
      }
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Examen no encontrado" });
      }
      
      // Verificar permisos para el curso al que pertenece el quiz
      const course = await storage.getCourse(quiz.courseId);
      if (!course || course.companyId !== req.user!.companyId) {
        return res.status(403).json({ error: "No tienes permisos para modificar este examen" });
      }
      
      const validatedData = insertQuestionSchema.parse({
        ...req.body,
        quizId
      });
      
      const question = await storage.createQuestion(validatedData);
      
      // Si se incluyen opciones, crearlas también
      if (req.body.options && Array.isArray(req.body.options)) {
        for (const optionData of req.body.options) {
          const validatedOption = insertOptionSchema.parse({
            ...optionData,
            questionId: question.id
          });
          
          await storage.createOption(validatedOption);
        }
      }
      
      // Obtener la pregunta completa con sus opciones
      const createdQuestion = await storage.getQuestion(question.id);
      const options = await storage.getOptions(question.id);
      
      res.status(201).json({
        ...createdQuestion,
        options
      });
    } catch (error) {
      console.error("Error al crear pregunta:", error);
      res.status(400).json({ error: "Datos de la pregunta inválidos" });
    }
  });

  // Crear una nueva opción para una pregunta
  app.post("/api/e-learning/questions/:questionId/options", verifyAdmin, async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.questionId);
      if (isNaN(questionId)) {
        return res.status(400).json({ error: "ID de pregunta inválido" });
      }
      
      const question = await storage.getQuestion(questionId);
      if (!question) {
        return res.status(404).json({ error: "Pregunta no encontrada" });
      }
      
      // Verificar permisos
      const quiz = await storage.getQuiz(question.quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Examen no encontrado" });
      }
      
      const course = await storage.getCourse(quiz.courseId);
      if (!course || course.companyId !== req.user!.companyId) {
        return res.status(403).json({ error: "No tienes permisos para modificar esta pregunta" });
      }
      
      const validatedData = insertOptionSchema.parse({
        ...req.body,
        questionId
      });
      
      const option = await storage.createOption(validatedData);
      res.status(201).json(option);
    } catch (error) {
      console.error("Error al crear opción:", error);
      res.status(400).json({ error: "Datos de la opción inválidos" });
    }
  });

  /**
   * Rutas para Inscripción y Progreso del Usuario
   */
  // Inscribir un usuario en un curso
  app.post("/api/e-learning/courses/:courseId/enroll", verifyAuth, async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ error: "ID de curso inválido" });
      }
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Curso no encontrado" });
      }
      
      // Verificar si el usuario ya está inscrito
      const existingEnrollment = await storage.getUserCourse(req.user!.id, courseId);
      if (existingEnrollment) {
        return res.status(409).json({ error: "Ya estás inscrito en este curso", enrollment: existingEnrollment });
      }
      
      // Obtener primera lección del curso
      const lessons = await storage.getLessons(courseId);
      const firstLessonId = lessons.length > 0 ? lessons[0].id : null;
      
      const enrollmentData = {
        userId: req.user!.id,
        courseId,
        progress: 0,
        currentLessonId: firstLessonId,
        startedAt: new Date(),
      };
      
      const enrollment = await storage.enrollUserInCourse(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error al inscribir usuario:", error);
      res.status(500).json({ error: "Error al inscribir usuario en el curso" });
    }
  });

  // Actualizar progreso en un curso
  app.put("/api/e-learning/user-courses/:id/progress", verifyAuth, async (req: Request, res: Response) => {
    try {
      const userCourseId = parseInt(req.params.id);
      if (isNaN(userCourseId)) {
        return res.status(400).json({ error: "ID de inscripción inválido" });
      }
      
      const userCourse = await storage.getUserCourse(userCourseId);
      if (!userCourse) {
        return res.status(404).json({ error: "Inscripción no encontrada" });
      }
      
      // Verificar que la inscripción pertenezca al usuario actual
      if (userCourse.userId !== req.user!.id) {
        return res.status(403).json({ error: "No tienes permisos para modificar esta inscripción" });
      }
      
      const validatedData = insertUserCourseSchema.partial().parse(req.body);
      const updatedUserCourse = await storage.updateUserCourseProgress(userCourseId, validatedData);
      
      res.json(updatedUserCourse);
    } catch (error) {
      console.error("Error al actualizar progreso:", error);
      res.status(400).json({ error: "Datos de progreso inválidos" });
    }
  });

  // Iniciar un intento de examen
  app.post("/api/e-learning/quizzes/:quizId/attempts", verifyAuth, async (req: Request, res: Response) => {
    try {
      const quizId = parseInt(req.params.quizId);
      if (isNaN(quizId)) {
        return res.status(400).json({ error: "ID de examen inválido" });
      }
      
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Examen no encontrado" });
      }
      
      // Obtener la inscripción del usuario para el curso
      const userCourse = await storage.getUserCourse(req.user!.id, quiz.courseId);
      if (!userCourse) {
        return res.status(403).json({ error: "No estás inscrito en este curso" });
      }
      
      const attemptData = {
        userId: req.user!.id,
        quizId,
        userCourseId: userCourse.id,
        startedAt: new Date()
      };
      
      const attempt = await storage.createQuizAttempt(attemptData);
      res.status(201).json(attempt);
    } catch (error) {
      console.error("Error al iniciar intento de examen:", error);
      res.status(500).json({ error: "Error al iniciar intento de examen" });
    }
  });

  // Enviar respuesta a una pregunta
  app.post("/api/e-learning/attempts/:attemptId/answers", verifyAuth, async (req: Request, res: Response) => {
    try {
      const attemptId = parseInt(req.params.attemptId);
      if (isNaN(attemptId)) {
        return res.status(400).json({ error: "ID de intento inválido" });
      }
      
      const attempt = await storage.getQuizAttempt(attemptId);
      if (!attempt) {
        return res.status(404).json({ error: "Intento de examen no encontrado" });
      }
      
      // Verificar que el intento pertenezca al usuario actual
      if (attempt.userId !== req.user!.id) {
        return res.status(403).json({ error: "No tienes permisos para este intento de examen" });
      }
      
      // Verificar si ya se completó el intento
      if (attempt.completedAt) {
        return res.status(409).json({ error: "Este intento de examen ya fue completado" });
      }
      
      const { questionId, optionId, text } = req.body;
      if (!questionId) {
        return res.status(400).json({ error: "Se requiere ID de pregunta" });
      }
      
      // Verificar que la pregunta pertenezca al examen del intento
      const question = await storage.getQuestion(questionId);
      if (!question || question.quizId !== attempt.quizId) {
        return res.status(400).json({ error: "La pregunta no pertenece a este examen" });
      }
      
      // Determinar si la respuesta es correcta
      let isCorrect = false;
      if (optionId) {
        const option = await storage.getOption(optionId);
        if (!option || option.questionId !== questionId) {
          return res.status(400).json({ error: "La opción no pertenece a esta pregunta" });
        }
        isCorrect = option.isCorrect;
      }
      
      const answerData = {
        quizAttemptId: attemptId,
        questionId,
        optionId: optionId || null,
        text: text || null,
        isCorrect
      };
      
      const answer = await storage.submitUserAnswer(answerData);
      res.status(201).json(answer);
    } catch (error) {
      console.error("Error al enviar respuesta:", error);
      res.status(400).json({ error: "Datos de respuesta inválidos" });
    }
  });

  // Finalizar un intento de examen
  app.post("/api/e-learning/attempts/:attemptId/complete", verifyAuth, async (req: Request, res: Response) => {
    try {
      const attemptId = parseInt(req.params.attemptId);
      if (isNaN(attemptId)) {
        return res.status(400).json({ error: "ID de intento inválido" });
      }
      
      const attempt = await storage.getQuizAttempt(attemptId);
      if (!attempt) {
        return res.status(404).json({ error: "Intento de examen no encontrado" });
      }
      
      // Verificar que el intento pertenezca al usuario actual
      if (attempt.userId !== req.user!.id) {
        return res.status(403).json({ error: "No tienes permisos para este intento de examen" });
      }
      
      // Verificar si ya se completó el intento
      if (attempt.completedAt) {
        return res.status(409).json({ error: "Este intento de examen ya fue completado" });
      }
      
      // Obtener todas las respuestas del intento
      const answers = await storage.getUserAnswers(attemptId);
      
      // Obtener todas las preguntas del examen
      const questions = await storage.getQuestions(attempt.quizId);
      
      // Calcular puntuación
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;
      
      for (const question of questions) {
        totalPoints += question.points || 1;
        
        // Buscar si hay una respuesta para esta pregunta
        const answer = answers.find(a => a.questionId === question.id);
        if (answer && answer.isCorrect) {
          correctAnswers++;
          earnedPoints += question.points || 1;
        }
      }
      
      // Calcular porcentaje de puntuación
      const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);
      
      // Obtener puntuación mínima para aprobar
      const quiz = await storage.getQuiz(attempt.quizId);
      const passingScore = quiz ? quiz.passingScore : 70; // Por defecto 70%
      
      // Determinar si ha aprobado
      const passed = scorePercentage >= passingScore;
      
      // Calcular tiempo empleado
      const startTime = new Date(attempt.startedAt).getTime();
      const endTime = new Date().getTime();
      const timeSpent = Math.floor((endTime - startTime) / 1000); // Tiempo en segundos
      
      // Actualizar el intento
      const updateData = {
        completedAt: new Date(),
        score: scorePercentage,
        passed,
        timeSpent
      };
      
      const completedAttempt = await storage.updateQuizAttempt(attemptId, updateData);
      
      // Si el intento está asociado a un curso, actualizar progreso
      if (attempt.userCourseId) {
        // Obtener el curso actual
        const userCourse = await storage.getUserCourse(attempt.userCourseId);
        
        if (userCourse) {
          // Obtener todas las lecciones y quizzes del curso
          const lessons = await storage.getLessons(userCourse.courseId);
          const quizzes = await storage.getQuizzes(userCourse.courseId);
          
          // Contar total de items completables (lecciones + quizzes)
          const totalItems = lessons.length + quizzes.length;
          
          // Contabilizar lecciones y quizzes completados
          let completedItems = 0;
          
          // Contar quizzes aprobados
          const quizAttempts = await storage.getUserQuizAttempts(req.user!.id, userCourse.courseId);
          const passedQuizIds = new Set(
            quizAttempts
              .filter(att => att.passed)
              .map(att => att.quizId)
          );
          
          completedItems += passedQuizIds.size;
          
          // Contar lecciones vistas (simplificado, asumimos que todas las lecciones hasta la actual están vistas)
          if (userCourse.currentLessonId) {
            const currentLessonIndex = lessons.findIndex(lesson => lesson.id === userCourse.currentLessonId);
            if (currentLessonIndex >= 0) {
              completedItems += currentLessonIndex;
            }
          }
          
          // Calcular nuevo progreso porcentual
          const newProgress = Math.round((completedItems / totalItems) * 100);
          
          // Actualizar progreso del curso
          await storage.updateUserCourseProgress(userCourse.id, { progress: newProgress });
        }
      }
      
      res.json({
        attempt: completedAttempt,
        score: scorePercentage,
        passed,
        correctAnswers,
        totalQuestions: questions.length,
        timeSpent
      });
    } catch (error) {
      console.error("Error al completar intento de examen:", error);
      res.status(500).json({ error: "Error al completar intento de examen" });
    }
  });

  // Obtener resultados de un intento de examen
  app.get("/api/e-learning/attempts/:attemptId/results", verifyAuth, async (req: Request, res: Response) => {
    try {
      const attemptId = parseInt(req.params.attemptId);
      if (isNaN(attemptId)) {
        return res.status(400).json({ error: "ID de intento inválido" });
      }
      
      // Obtener el intento y las respuestas
      const { attempt, answers } = await storage.getQuizResults(attemptId);
      
      if (!attempt) {
        return res.status(404).json({ error: "Intento de examen no encontrado" });
      }
      
      // Verificar que el intento pertenezca al usuario actual o sea admin
      const userRole = req.user?.role || "";
      const adminRoles = ["admin", "company_admin"];
      
      if (attempt.userId !== req.user!.id && !adminRoles.includes(userRole)) {
        return res.status(403).json({ error: "No tienes permisos para ver estos resultados" });
      }
      
      // Verificar que el intento esté completado
      if (!attempt.completedAt) {
        return res.status(400).json({ error: "Este intento de examen no ha sido completado" });
      }
      
      // Obtener detalles del quiz
      const quiz = await storage.getQuiz(attempt.quizId);
      
      // Obtener todas las preguntas con sus opciones
      const questions = await storage.getQuestions(attempt.quizId);
      const questionsWithOptions = await Promise.all(
        questions.map(async (question) => {
          const options = await storage.getOptions(question.id);
          return {
            ...question,
            options,
            userAnswer: answers.find(a => a.questionId === question.id)
          };
        })
      );
      
      res.json({
        attempt,
        quiz,
        questions: questionsWithOptions
      });
    } catch (error) {
      console.error("Error al obtener resultados:", error);
      res.status(500).json({ error: "Error al obtener resultados del examen" });
    }
  });
}