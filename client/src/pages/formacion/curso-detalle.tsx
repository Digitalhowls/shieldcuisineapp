import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Clock, 
  Calendar,
  GraduationCap,
  Users,
  BarChart,
  CheckCircle,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Mapa de tipos de curso a colores
const courseTypeColors: Record<string, string> = {
  food_safety: "bg-red-100 text-red-800",
  haccp: "bg-blue-100 text-blue-800",
  allergens: "bg-yellow-100 text-yellow-800",
  hygiene: "bg-green-100 text-green-800",
  management: "bg-purple-100 text-purple-800",
  customer_service: "bg-indigo-100 text-indigo-800"
};

// Función para obtener la clase de color según el tipo de curso
const getCourseTypeClass = (type: any) => {
  return courseTypeColors[type] || "bg-gray-100 text-gray-800";
};

// Mapa de niveles a textos descriptivos
const levelDescriptions: Record<string, string> = {
  beginner: "Este curso está diseñado para personas sin conocimientos previos en el tema.",
  intermediate: "Requiere conocimientos básicos en el área para aprovechar al máximo el contenido.",
  advanced: "Curso para profesionales con experiencia sólida en el tema."
};

// Componente para la tarjeta de lección
function LessonCard({ lesson, index, isCompleted }: any) {
  return (
    <div className={`p-4 border rounded-md mb-3 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-border'}`}>
      <div className="flex gap-3">
        <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
          isCompleted 
            ? 'bg-green-100 text-green-800' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
        </div>
        <div className="flex-1">
          <h4 className="font-medium">{lesson.title}</h4>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{lesson.duration} min</span>
            </div>
            {lesson.type === 'video' && (
              <div className="flex items-center gap-1">
                <Play className="h-4 w-4" />
                <span>Video</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CursoDetalle() {
  const [match, params] = useRoute("/formacion/curso/:id");
  const { toast } = useToast();
  
  // Obtener detalles del curso
  const { 
    data: course,
    isLoading: loadingCourse,
    error: courseError
  } = useQuery({
    queryKey: ["/api/e-learning/courses", params?.id],
    enabled: !!params?.id
  });
  
  // Obtener lecciones del curso
  const { 
    data: lessons,
    isLoading: loadingLessons
  } = useQuery({
    queryKey: ["/api/e-learning/courses", params?.id, "lessons"],
    enabled: !!params?.id
  });
  
  // Obtener progreso del usuario en este curso
  const { 
    data: progress,
    isLoading: loadingProgress
  } = useQuery({
    queryKey: ["/api/e-learning/courses", params?.id, "progress"],
    enabled: !!params?.id
  });
  
  // Mutación para inscribirse en el curso
  const enrollMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/e-learning/courses/${params?.id}/enroll`, {});
    },
    onSuccess: () => {
      toast({
        title: "Inscripción exitosa",
        description: "Te has inscrito al curso correctamente."
      });
      
      // Actualizar datos
      queryClient.invalidateQueries(["/api/e-learning/courses", params?.id, "progress"]);
      queryClient.invalidateQueries(["/api/e-learning/my-courses"]);
    },
    onError: (error) => {
      toast({
        title: "Error en la inscripción",
        description: "No se pudo completar la inscripción. Por favor, intenta nuevamente.",
        variant: "destructive"
      });
    }
  });
  
  // Manejar inscripción
  const handleEnroll = () => {
    enrollMutation.mutate();
  };
  
  if (!match) {
    return <div>Curso no encontrado</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Encabezado del curso */}
      <div>
        <Link href="/formacion/cursos">
          <Button variant="ghost" size="sm">
            &larr; Volver al catálogo
          </Button>
        </Link>
        
        <div className="mt-4">
          {loadingCourse ? (
            <>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-5 w-1/2" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-7 w-24" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getCourseTypeClass(course?.type)}>
                  {course?.type}
                </Badge>
                {progress?.startedAt && !progress?.completedAt && (
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                    En progreso
                  </Badge>
                )}
                {progress?.completedAt && (
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completado
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold">{course?.title}</h1>
              <p className="text-muted-foreground mt-2">
                {course?.description}
              </p>
            </>
          )}
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna lateral con información y acciones */}
        <div className="order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Información del curso</CardTitle>
              <CardDescription>Detalles y estadísticas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingCourse ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Duración total</p>
                      <p className="text-sm text-muted-foreground">
                        {course?.duration} minutos
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Lecciones</p>
                      <p className="text-sm text-muted-foreground">
                        {lessons?.length || 0} lecciones con evaluación final
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Nivel</p>
                      <p className="text-sm text-muted-foreground">
                        {course?.level}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {levelDescriptions[course?.level] || ''}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Estudiantes inscritos</p>
                      <p className="text-sm text-muted-foreground">
                        {course?.enrollmentCount || 0} personas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Actualización</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(course?.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {loadingProgress ? (
                <Skeleton className="h-10 w-full" />
              ) : progress?.startedAt ? (
                <>
                  {/* Usuario ya inscrito - Mostrar progreso */}
                  <div className="w-full">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tu progreso</span>
                      <span>{progress?.progress || 0}%</span>
                    </div>
                    <Progress value={progress?.progress || 0} className="h-2 mb-3" />
                  </div>
                  
                  <Button className="w-full" asChild>
                    <Link href={`/formacion/progreso/${params?.id}`}>
                      {progress?.progress > 0 ? 'Continuar curso' : 'Comenzar curso'}
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  {/* Usuario no inscrito - Mostrar botón para inscribirse */}
                  <Button 
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                    className="w-full"
                  >
                    {enrollMutation.isPending ? 'Procesando...' : 'Inscribirme en este curso'}
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
        
        {/* Columna principal con contenido detallado */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <Tabs defaultValue="content">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="details">Información detallada</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lecciones del curso</CardTitle>
                  <CardDescription>
                    Resumen de las {lessons?.length || 0} lecciones de este curso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loadingLessons ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : lessons && lessons.length > 0 ? (
                    lessons.map((lesson, index) => (
                      <LessonCard 
                        key={lesson.id} 
                        lesson={lesson} 
                        index={index}
                        isCompleted={progress?.completedLessons?.includes(lesson.id) || false}
                      />
                    ))
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      No hay lecciones disponibles para este curso.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Objetivos de aprendizaje</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingCourse ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : course?.objectives ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {course.objectives.map((objective: string, index: number) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      No hay objetivos de aprendizaje especificados para este curso.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="details" className="mt-4 space-y-4">
              {/* Requisitos previos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Requisitos previos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingCourse ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : course?.prerequisites && course.prerequisites.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {course.prerequisites.map((prereq: string, index: number) => (
                        <li key={index}>{prereq}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      No hay requisitos previos para este curso.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Perfil del instructor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Instructor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingCourse ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <Skeleton className="h-5 w-1/3 mt-2" />
                      <Skeleton className="h-4 w-full mt-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : course?.instructor ? (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {course.instructor.avatar ? (
                          <img 
                            src={course.instructor.avatar} 
                            alt={course.instructor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{course.instructor.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {course.instructor.title}
                        </p>
                        <p className="text-sm mt-2">
                          {course.instructor.bio}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Información del instructor no disponible.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Contenido adicional como materiales, certificación, etc. */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Materiales y recursos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingCourse ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : course?.materials && course.materials.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {course.materials.map((material: string, index: number) => (
                        <li key={index}>{material}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      No hay materiales adicionales especificados para este curso.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}