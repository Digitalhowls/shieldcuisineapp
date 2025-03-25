import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink, 
  PlayCircle, 
  FileBadge, 
  HelpCircle,
  LucideIcon
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

interface LessonComponentProps {
  lesson: any;
  activeLesson?: any;
  lessonStatus: 'locked' | 'available' | 'completed';
  onSelect: (lessonId: number) => void;
}

function LessonComponent({ lesson, activeLesson, lessonStatus, onSelect }: LessonComponentProps) {
  const isActive = activeLesson?.id === lesson.id;
  
  const getStatusIcon = (): React.ReactNode => {
    if (lessonStatus === 'completed') {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    } else if (lessonStatus === 'locked') {
      return <div className="h-5 w-5 border border-muted-foreground rounded-full flex items-center justify-center text-xs text-muted-foreground">
        {lesson.order}
      </div>;
    } else {
      return <div className="h-5 w-5 border-2 border-primary rounded-full flex items-center justify-center text-xs text-primary font-medium">
        {lesson.order}
      </div>;
    }
  };
  
  return (
    <div 
      className={`p-3 border rounded-md mb-2 ${
        isActive 
          ? 'border-primary bg-primary/5' 
          : 'hover:border-muted-foreground cursor-pointer'
      } ${
        lessonStatus === 'locked' ? 'opacity-50' : ''
      }`}
      onClick={() => lessonStatus !== 'locked' && onSelect(lesson.id)}
    >
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div className="flex-1">
          <h4 className="font-medium text-sm">{lesson.title}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{lesson.duration} min</span>
            {lesson.videoUrl && (
              <Badge variant="outline" className="text-xs px-1 py-0">Video</Badge>
            )}
            {isActive && (
              <Badge variant="default" className="text-xs px-1 py-0">Actual</Badge>
            )}
          </div>
        </div>
        
        {lessonStatus === 'locked' ? (
          <div className="text-muted-foreground">
            <ChevronRight className="h-5 w-5" />
          </div>
        ) : (
          <div className={isActive ? "text-primary" : "text-muted-foreground"}>
            <ChevronRight className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

function QuizComponent({ quiz, isCompleted, onStart }) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{quiz.title}</CardTitle>
          {isCompleted ? (
            <Badge variant="outline" className="bg-green-50">
              <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
              Completado
            </Badge>
          ) : (
            <Badge variant="outline">
              <HelpCircle className="h-3 w-3 mr-1" />
              Cuestionario
            </Badge>
          )}
        </div>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>{quiz.questionCount} preguntas</span>
            </div>
            <div className="flex items-center gap-1">
              <FileBadge className="h-4 w-4" />
              <span>Nota mínima: {quiz.passingScore}%</span>
            </div>
          </div>
          
          {quiz.timeLimit && (
            <p>Tiempo límite: {quiz.timeLimit} minutos</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onStart(quiz.id)}
          className="w-full"
          variant={isCompleted ? "outline" : "default"}
        >
          {isCompleted ? "Ver resultados" : "Iniciar evaluación"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function VideoPlayer({ videoUrl }) {
  // Implementación simplificada, esto podría mejorarse
  return (
    <div className="mt-2 mb-4">
      <div className="rounded-md overflow-hidden bg-black aspect-video flex items-center justify-center">
        {videoUrl ? (
          <iframe
            width="100%"
            height="100%"
            src={videoUrl}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="text-white text-center p-6">
            <PlayCircle className="h-12 w-12 mx-auto mb-2" />
            <p>Video no disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CursoProgreso() {
  const [match, params] = useRoute("/formacion/progreso/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("lesson");
  
  // Estado para el seguimiento de la lección actual
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  
  // Obtener información del curso
  const {
    data: course,
    isLoading: loadingCourse,
    error: errorCourse
  } = useQuery({
    queryKey: ["/api/e-learning/courses", params?.id],
    enabled: !!params?.id
  });
  
  // Obtener lecciones del curso
  const {
    data: lessons,
    isLoading: loadingLessons,
    error: errorLessons
  } = useQuery({
    queryKey: ["/api/e-learning/courses", params?.id, "lessons"],
    enabled: !!params?.id,
    onSuccess: (data) => {
      // Si no hay lección activa y hay datos disponibles, seleccionar la primera
      if (!activeLessonId && data && data.length > 0) {
        setActiveLessonId(data[0].id);
      }
    }
  });
  
  // Obtener cuestionarios del curso
  const {
    data: quizzes,
    isLoading: loadingQuizzes
  } = useQuery({
    queryKey: ["/api/e-learning/courses", params?.id, "quizzes"],
    enabled: !!params?.id
  });
  
  // Obtener información de progreso del usuario
  const {
    data: progress,
    isLoading: loadingProgress
  } = useQuery({
    queryKey: ["/api/e-learning/courses", params?.id, "progress"],
    enabled: !!params?.id
  });
  
  // Obtener detalle de la lección activa
  const {
    data: activeLesson,
    isLoading: loadingActiveLesson
  } = useQuery({
    queryKey: ["/api/e-learning/lessons", activeLessonId],
    enabled: !!activeLessonId
  });
  
  // Mutación para marcar una lección como completada
  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      return await apiRequest("POST", `/api/e-learning/lessons/${lessonId}/complete`);
    },
    onSuccess: () => {
      toast({
        title: "Lección completada",
        description: "Tu progreso ha sido actualizado."
      });
      
      // Actualizar datos de progreso
      queryClient.invalidateQueries(["/api/e-learning/courses", params?.id, "progress"]);
      queryClient.invalidateQueries(["/api/e-learning/my-courses"]);
      
      // Ir a la siguiente lección automáticamente si existe
      if (lessons && activeLessonId) {
        const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
        if (currentIndex < lessons.length - 1) {
          setActiveLessonId(lessons[currentIndex + 1].id);
        } else {
          // Si es la última lección, mostrar los cuestionarios
          setActiveTab("quiz");
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo marcar la lección como completada.",
        variant: "destructive"
      });
    }
  });
  
  // Manejar la selección de lección
  const handleLessonSelect = (lessonId: number) => {
    setActiveLessonId(lessonId);
    setActiveTab("lesson");
  };
  
  // Manejar el inicio de un cuestionario
  const handleStartQuiz = (quizId: number) => {
    navigate(`/formacion/quiz/${quizId}`);
  };
  
  // Completar lección actual
  const handleCompleteLesson = () => {
    if (activeLessonId) {
      completeLessonMutation.mutate(activeLessonId);
    }
  };
  
  // Verificar si una lección está bloqueada, disponible o completada
  const getLessonStatus = (lessonId: number): 'locked' | 'available' | 'completed' => {
    if (!progress || !progress.completedLessons) {
      return 'available'; // Si no hay datos de progreso, asumir disponible
    }
    
    if (progress.completedLessons.includes(lessonId)) {
      return 'completed';
    }
    
    // Si la lección anterior está completada, esta está disponible
    if (lessons) {
      const lessonIndex = lessons.findIndex(l => l.id === lessonId);
      if (lessonIndex === 0) {
        return 'available'; // La primera lección siempre está disponible
      }
      
      const prevLessonId = lessons[lessonIndex - 1].id;
      if (progress.completedLessons.includes(prevLessonId)) {
        return 'available';
      }
    }
    
    return 'locked';
  };
  
  // Obtener la lección activa
  const currentLesson = lessons?.find(l => l.id === activeLessonId);
  const currentLessonStatus = currentLesson ? getLessonStatus(currentLesson.id) : 'locked';
  
  if (!match) {
    return <div>Curso no encontrado</div>;
  }
  
  return (
    <div className="container px-0 mx-auto">
      {/* Encabezado del curso con progreso */}
      <div className="bg-background sticky top-0 z-10 py-2 border-b">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Link href="/formacion/mis-cursos">
              <Button variant="ghost" size="sm">
                &larr; Mis cursos
              </Button>
            </Link>
            
            {!loadingCourse && course ? (
              <Badge variant="outline">{course.type}</Badge>
            ) : null}
          </div>
          
          {loadingCourse || loadingProgress ? (
            <div className="space-y-2 mb-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-2 w-full" />
            </div>
          ) : course && progress ? (
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <h1 className="text-xl font-bold">{course.title}</h1>
                <span className="text-sm">{progress.progress}% completado</span>
              </div>
              <Progress value={progress.progress || 0} className="h-2" />
            </div>
          ) : null}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Sidebar con lista de lecciones */}
        <div className="order-2 lg:order-1">
          <div className="lg:sticky lg:top-36">
            <div className="bg-muted p-3 rounded-t-md">
              <h3 className="font-medium flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Contenido del curso
              </h3>
            </div>
            
            <div className="border rounded-b-md p-3">
              {loadingLessons ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : lessons && lessons.length > 0 ? (
                <div>
                  {lessons.map((lesson) => (
                    <LessonComponent
                      key={lesson.id}
                      lesson={lesson}
                      activeLesson={currentLesson}
                      lessonStatus={getLessonStatus(lesson.id)}
                      onSelect={handleLessonSelect}
                    />
                  ))}
                  
                  {quizzes && quizzes.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-sm mb-2">Evaluaciones</h4>
                      
                      {quizzes.map((quiz) => (
                        <div 
                          key={quiz.id} 
                          className={`p-3 border rounded-md mb-2 hover:border-muted-foreground cursor-pointer ${
                            activeTab === 'quiz' ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => setActiveTab('quiz')}
                        >
                          <div className="flex items-center gap-3">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{quiz.title}</h4>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>{quiz.questionCount} preguntas</span>
                              </div>
                            </div>
                            <div className="text-muted-foreground">
                              <ChevronRight className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No hay lecciones disponibles
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lesson">Lección actual</TabsTrigger>
              <TabsTrigger value="quiz">Evaluaciones</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lesson" className="mt-4">
              {loadingActiveLesson || !activeLesson ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>{activeLesson.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 mr-3">
                        <BookOpen className="h-4 w-4" />
                        <span>Lección {activeLesson.order}</span>
                      </div>
                      
                      {currentLessonStatus === 'completed' && (
                        <Badge variant="outline" className="bg-green-50">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                          Completado
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {activeLesson.videoUrl && (
                      <VideoPlayer videoUrl={activeLesson.videoUrl} />
                    )}
                    
                    <div className="prose prose-sm max-w-none">
                      {/* En un caso real, aquí renderizarías el contenido HTML o Markdown */}
                      <p>{activeLesson.content}</p>
                    </div>
                    
                    {/* Recursos adicionales si existen */}
                    {activeLesson.resources && activeLesson.resources.length > 0 && (
                      <div className="mt-6">
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                            <ChevronDown className="h-4 w-4" />
                            <span>Recursos adicionales</span>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2 pl-6 space-y-2">
                              {activeLesson.resources.map((resource, index) => (
                                <a 
                                  key={index}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  <span>{resource.title}</span>
                                </a>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (lessons) {
                          const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
                          if (currentIndex > 0) {
                            setActiveLessonId(lessons[currentIndex - 1].id);
                          }
                        }
                      }}
                      disabled={lessons && lessons.findIndex(l => l.id === activeLessonId) === 0}
                    >
                      Lección anterior
                    </Button>
                    
                    {currentLessonStatus === 'completed' ? (
                      <Button
                        onClick={() => {
                          if (lessons) {
                            const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
                            if (currentIndex < lessons.length - 1) {
                              setActiveLessonId(lessons[currentIndex + 1].id);
                            } else {
                              setActiveTab("quiz");
                            }
                          }
                        }}
                        disabled={lessons && lessons.findIndex(l => l.id === activeLessonId) === lessons.length - 1}
                      >
                        Siguiente lección
                      </Button>
                    ) : (
                      <Button
                        onClick={handleCompleteLesson}
                        disabled={completeLessonMutation.isPending || currentLessonStatus === 'locked'}
                      >
                        {completeLessonMutation.isPending ? 'Completando...' : 'Marcar como completada'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="quiz" className="mt-4">
              {loadingQuizzes ? (
                <div className="space-y-4">
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-[200px] w-full" />
                </div>
              ) : quizzes && quizzes.length > 0 ? (
                <div>
                  <h2 className="text-xl font-bold mb-4">Evaluaciones del curso</h2>
                  
                  {quizzes.map((quiz) => (
                    <QuizComponent
                      key={quiz.id}
                      quiz={quiz}
                      isCompleted={progress?.completedQuizzes?.includes(quiz.id) || false}
                      onStart={handleStartQuiz}
                    />
                  ))}
                  
                  {progress?.completedQuizzes?.length === quizzes.length && (
                    <Card className="mt-6 bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                            <Award className="h-6 w-6 text-green-600" />
                          </div>
                          <h3 className="text-lg font-medium mb-1">¡Felicidades!</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Has completado todas las lecciones y evaluaciones de este curso.
                          </p>
                          {progress?.certificateUrl ? (
                            <Link href={progress.certificateUrl}>
                              <Button>Ver mi certificado</Button>
                            </Link>
                          ) : (
                            <Button disabled>Procesando tu certificado...</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-6">
                      <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                      <h3 className="font-medium mb-1">No hay evaluaciones disponibles</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Este curso no tiene evaluaciones configuradas actualmente.
                      </p>
                      <Button onClick={() => setActiveTab("lesson")}>
                        Volver a las lecciones
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}