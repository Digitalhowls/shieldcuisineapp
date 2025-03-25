import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  Clock, 
  CheckCircle,
  PlayCircle,
  FileText,
  Award,
  ArrowLeft,
  Download,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Componente para mostrar un examen en la lista
function QuizCard({ quiz, isCompleted, onStart }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{quiz.title}</CardTitle>
          {isCompleted && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completado
            </Badge>
          )}
        </div>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{quiz.questionCount} preguntas</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{quiz.timeLimit} minutos</span>
            </div>
          </div>
          <div>
            Puntuación mínima: {quiz.passingScore}%
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant={isCompleted ? "outline" : "default"} 
          className="w-full"
          onClick={() => onStart(quiz.id)}
        >
          {isCompleted ? "Revisar resultados" : "Iniciar examen"}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Componente para reproducir videos
function VideoPlayer({ videoUrl }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative rounded-md overflow-hidden bg-black aspect-video">
      {videoUrl ? (
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          controlsList="nodownload"
        >
          <source src={videoUrl} type="video/mp4" />
          Tu navegador no soporta el tag de video.
        </video>
      ) : (
        <div className="flex items-center justify-center h-full bg-muted">
          <PlayCircle className="h-16 w-16 text-muted-foreground opacity-50" />
        </div>
      )}
    </div>
  );
}

export default function CursoProgreso() {
  const [match, params] = useRoute("/formacion/progreso/:id");
  const { toast } = useToast();
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [completingLesson, setCompletingLesson] = useState(false);
  
  // Obtener detalles del curso
  const { 
    data: course,
    isLoading: loadingCourse
  } = useQuery({
    queryKey: ["/api/e-learning/courses", params?.id],
    enabled: !!params?.id,
    onSuccess: (data) => {
      // Si no hay lección seleccionada, establecer la primera lección o la próxima incompleta
      if (!currentLessonId && data?.lessons?.length > 0) {
        // Buscar la primera lección no completada
        const nextIncompleteIndex = data.lessons.findIndex(
          l => !(data.completedLessons || []).includes(l.id)
        );
        
        // Si todas están completas o no se encontró, usar la primera
        if (nextIncompleteIndex === -1 || data.lessons.length === 0) {
          setCurrentLessonId(data.lessons[0]?.id);
        } else {
          setCurrentLessonId(data.lessons[nextIncompleteIndex]?.id);
        }
      }
    }
  });
  
  // Obtener lecciones del curso
  const { 
    data: lessons = [],
    isLoading: loadingLessons
  } = useQuery({
    queryKey: ["/api/e-learning/courses", params?.id, "lessons"],
    enabled: !!params?.id
  });
  
  // Obtener exámenes del curso
  const { 
    data: quizzes = [],
    isLoading: loadingQuizzes
  } = useQuery({
    queryKey: ["/api/e-learning/courses", params?.id, "quizzes"],
    enabled: !!params?.id
  });
  
  // Mutación para marcar una lección como completada
  const markLessonCompletedMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      return await apiRequest("POST", `/api/e-learning/lessons/${lessonId}/complete`, {});
    },
    onSuccess: () => {
      toast({
        title: "Lección completada",
        description: "Has completado esta lección correctamente."
      });
      
      // Actualizar datos
      queryClient.invalidateQueries(["/api/e-learning/courses", params?.id]);
      queryClient.invalidateQueries(["/api/e-learning/my-courses"]);
      
      setCompletingLesson(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo marcar la lección como completada. Intenta nuevamente.",
        variant: "destructive"
      });
      setCompletingLesson(false);
    }
  });
  
  // Manejar cambio de lección
  const handleLessonChange = (lessonId: number) => {
    setCurrentLessonId(lessonId);
  };
  
  // Manejar completar lección
  const handleCompleteLesson = () => {
    if (!currentLessonId) return;
    
    // Verificar si ya está completada
    const isAlreadyCompleted = (course?.completedLessons || []).includes(currentLessonId);
    if (isAlreadyCompleted) {
      toast({
        title: "Lección ya completada",
        description: "Esta lección ya ha sido marcada como completada anteriormente."
      });
      return;
    }
    
    setCompletingLesson(true);
    markLessonCompletedMutation.mutate(currentLessonId);
  };
  
  // Manejar inicio de examen
  const handleStartQuiz = (quizId: number) => {
    // Redireccionar a la página del examen
    window.location.href = `/formacion/examen/${quizId}`;
  };
  
  // Obtener la lección actual
  const currentLesson = lessons.find(l => l.id === currentLessonId);
  
  // Verificar si todas las lecciones están completadas
  const allLessonsCompleted = course?.completedLessons?.length === lessons.length && lessons.length > 0;
  
  // Verificar si todos los exámenes están completados
  const allQuizzesCompleted = course?.completedQuizzes?.length === quizzes.length && quizzes.length > 0;
  
  // Verificar si el curso está completado
  const courseCompleted = course?.completedAt !== null;
  
  if (!match) {
    return <div>Curso no encontrado</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div>
        <Link href="/formacion/mis-cursos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver a mis cursos
          </Button>
        </Link>
        
        {loadingCourse ? (
          <>
            <Skeleton className="h-8 w-2/3 mb-2" />
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-4/5" />
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{course?.title}</h1>
              <Badge className={`bg-blue-100 text-blue-800 ${course?.type}`}>
                {course?.type}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progreso del curso</span>
                  <span>{course?.progress || 0}%</span>
                </div>
                <Progress value={course?.progress || 0} className="h-2" />
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna de navegación */}
        <div className="order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Contenido del curso</CardTitle>
              <CardDescription>
                {loadingLessons ? (
                  <Skeleton className="h-4 w-3/4" />
                ) : (
                  `${lessons.length} lecciones · ${
                    course?.completedLessons?.length || 0
                  } completadas`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              {loadingLessons ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : lessons.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {lessons.map((lesson, index) => {
                    const isCompleted = course?.completedLessons?.includes(lesson.id);
                    const isCurrent = currentLessonId === lesson.id;
                    
                    return (
                      <AccordionItem 
                        key={lesson.id} 
                        value={`lesson-${lesson.id}`}
                        className={`${isCurrent ? 'bg-accent/50 border-primary' : ''} rounded-md mb-1`}
                      >
                        <AccordionTrigger className="px-3 py-2 text-left">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center h-6 w-6 rounded-full text-xs ${
                              isCompleted 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {isCompleted ? <CheckCircle className="h-3 w-3" /> : index + 1}
                            </div>
                            <span className="text-sm font-medium">{lesson.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-2">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{lesson.duration} min</span>
                              </div>
                              {lesson.type && (
                                <Badge variant="outline" className="text-xs">
                                  {lesson.type}
                                </Badge>
                              )}
                            </div>
                            <Button 
                              variant={isCurrent ? "default" : "outline"} 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleLessonChange(lesson.id)}
                            >
                              {isCurrent ? "Viendo ahora" : "Ver lección"}
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No hay lecciones disponibles para este curso.
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Sección de exámenes */}
          {quizzes.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Evaluaciones</CardTitle>
                <CardDescription>
                  {course?.completedQuizzes?.length || 0}/{quizzes.length} completadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingQuizzes ? (
                    <>
                      <Skeleton className="h-28 w-full" />
                      <Skeleton className="h-28 w-full" />
                    </>
                  ) : (
                    quizzes.map((quiz) => (
                      <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        isCompleted={course?.completedQuizzes?.includes(quiz.id)}
                        onStart={handleStartQuiz}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Certificado (visible solo cuando el curso está completado) */}
          {courseCompleted && (
            <Card className="mt-4 border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                  <Award className="h-5 w-5" />
                  ¡Curso completado!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Has completado este curso satisfactoriamente. Puedes descargar tu certificado.
                </p>
                {course?.certificateUrl ? (
                  <div className="space-y-2">
                    <a href={course.certificateUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver certificado
                      </Button>
                    </a>
                    <a href={course.certificateUrl} download>
                      <Button className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar certificado
                      </Button>
                    </a>
                  </div>
                ) : (
                  <Button disabled className="w-full">
                    Certificado en proceso
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Columna principal con contenido de la lección */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          {loadingLessons || !currentLesson ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-[300px] w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {currentLessonId ? (
                      <>Lección {currentLesson.order}: {currentLesson.title}</>
                    ) : (
                      "Selecciona una lección"
                    )}
                  </CardTitle>
                  {(course?.completedLessons || []).includes(currentLessonId) && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completada
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video de la lección (si existe) */}
                {currentLesson.videoUrl && (
                  <VideoPlayer videoUrl={currentLesson.videoUrl} />
                )}
                
                {/* Contenido de la lección */}
                <div className="prose prose-sm max-w-none">
                  {currentLesson.content}
                </div>
                
                {/* Recursos adicionales */}
                {currentLesson.resources && currentLesson.resources.length > 0 && (
                  <div className="pt-4">
                    <h3 className="font-medium mb-2">Recursos adicionales</h3>
                    <ul className="space-y-2">
                      {currentLesson.resources.map((resource, index) => (
                        <li key={index}>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {resource.title || resource.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between flex-wrap gap-2">
                {/* Botón para lección anterior */}
                {currentLessonId && lessons.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
                      if (currentIndex > 0) {
                        handleLessonChange(lessons[currentIndex - 1].id);
                      }
                    }}
                    disabled={lessons.findIndex(l => l.id === currentLessonId) === 0}
                  >
                    Lección anterior
                  </Button>
                )}
                
                {/* Botón para marcar como completada */}
                <Button
                  onClick={handleCompleteLesson}
                  disabled={
                    completingLesson || 
                    (course?.completedLessons || []).includes(currentLessonId) ||
                    !currentLessonId
                  }
                >
                  {completingLesson ? (
                    "Procesando..."
                  ) : (course?.completedLessons || []).includes(currentLessonId) ? (
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completada
                    </span>
                  ) : (
                    "Marcar como completada"
                  )}
                </Button>
                
                {/* Botón para siguiente lección */}
                {currentLessonId && lessons.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
                      if (currentIndex < lessons.length - 1) {
                        handleLessonChange(lessons[currentIndex + 1].id);
                      }
                    }}
                    disabled={lessons.findIndex(l => l.id === currentLessonId) === lessons.length - 1}
                  >
                    Siguiente lección
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}