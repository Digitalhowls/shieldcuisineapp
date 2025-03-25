import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, CheckCircle2, Lock, Timer, Users, Award } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Función para formatear el tipo de curso
function formatCourseType(type) {
  const typesMap = {
    'food_safety': 'Seguridad alimentaria',
    'haccp': 'APPCC',
    'allergens': 'Alérgenos',
    'hygiene': 'Higiene',
    'management': 'Gestión',
    'customer_service': 'Atención al cliente'
  };
  
  return typesMap[type] || type;
}

export default function CursoDetalle() {
  const [match, params] = useRoute("/formacion/cursos/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'company_admin';
  
  // Obtener detalle del curso
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
    enabled: !!params?.id
  });
  
  // Obtener información de inscripción del usuario en este curso
  const {
    data: enrollment,
    isLoading: loadingEnrollment
  } = useQuery({
    queryKey: ["/api/e-learning/courses", params?.id, "enrollment"],
    enabled: !!params?.id && !!user
  });
  
  // Mutación para inscribirse en el curso
  const enrollMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/e-learning/courses/${params?.id}/enroll`);
    },
    onSuccess: () => {
      toast({
        title: "¡Inscripción exitosa!",
        description: "Te has inscrito en el curso correctamente."
      });
      queryClient.invalidateQueries(["/api/e-learning/courses", params?.id, "enrollment"]);
      queryClient.invalidateQueries(["/api/e-learning/my-courses"]);
    },
    onError: (error) => {
      toast({
        title: "Error en la inscripción",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleEnroll = () => {
    enrollMutation.mutate();
  };
  
  const handleContinue = () => {
    navigate(`/formacion/progreso/${params?.id}`);
  };
  
  // Manejar errores de carga
  if (errorCourse || errorLessons) {
    toast({
      title: "Error al cargar el curso",
      description: "No se pudo cargar la información del curso.",
      variant: "destructive"
    });
  }
  
  if (!match) {
    return <div>Curso no encontrado</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Encabezado del curso */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 space-y-6">
          {loadingCourse ? (
            <>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </>
          ) : course ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link href="/formacion/cursos">
                    <Button variant="ghost" size="sm">
                      &larr; Volver a cursos
                    </Button>
                  </Link>
                  <Badge>{formatCourseType(course.type)}</Badge>
                  {isAdmin && (
                    <Link href={`/formacion/cursos/${params?.id}/editar`}>
                      <Button variant="outline" size="sm">
                        Editar curso
                      </Button>
                    </Link>
                  )}
                </div>
                <h1 className="text-3xl font-bold">{course.title}</h1>
                <p className="text-muted-foreground mt-2">
                  {course.description}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>
                    {lessons?.length || 0} lecciones
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-primary" />
                  <span>
                    {course.duration} minutos
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>
                    Certificado al completar
                  </span>
                </div>
                
                {course.level && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>
                      Nivel {course.level === 1 ? "básico" : course.level === 2 ? "intermedio" : "avanzado"}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : null}
          
          {/* Tabs para mostrar contenido o información */}
          <Tabs defaultValue="content" className="mt-6">
            <TabsList>
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="info">Información adicional</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-4">
                  <h3 className="font-medium">Lecciones del curso</h3>
                </div>
                
                {loadingLessons ? (
                  <div className="p-4 space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : lessons && lessons.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {lessons.map((lesson, index) => (
                      <AccordionItem key={lesson.id} value={`lesson-${lesson.id}`}>
                        <AccordionTrigger className="px-4 py-2 hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{lesson.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{lesson.duration} min</span>
                                {enrollment ? (
                                  enrollment.completedLessons?.includes(lesson.id) ? (
                                    <span className="flex items-center text-green-600">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Completado
                                    </span>
                                  ) : null
                                ) : (
                                  <span className="flex items-center">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Requiere inscripción
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-2">
                          {enrollment ? (
                            <div className="ml-11 mb-3">
                              <p className="text-sm text-muted-foreground">
                                {lesson.content?.substring(0, 150)}
                                {lesson.content?.length > 150 ? '...' : ''}
                              </p>
                              {lesson.videoUrl && (
                                <div className="mt-2">
                                  <Badge variant="outline">Incluye video</Badge>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="ml-11">
                              <p className="text-sm text-muted-foreground">
                                Inscríbete en el curso para acceder a este contenido.
                              </p>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-muted-foreground">No hay lecciones disponibles.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="info" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sobre este curso</CardTitle>
                  <CardDescription>
                    Información adicional y requisitos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Lo que aprenderás</h4>
                      <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                        <li>Conceptos fundamentales de {formatCourseType(course?.type)}</li>
                        <li>Aplicación práctica en entornos de trabajo</li>
                        <li>Cumplimiento de normativas y regulaciones</li>
                        <li>Mejores prácticas del sector</li>
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-1">Requisitos previos</h4>
                      <p className="text-muted-foreground">
                        No se requieren conocimientos previos para iniciar este curso.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-1">Público objetivo</h4>
                      <p className="text-muted-foreground">
                        Personal de establecimientos alimentarios, responsables de calidad, 
                        gerentes y cualquier profesional del sector alimentario.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-1">Certificación</h4>
                      <p className="text-muted-foreground">
                        Al completar el curso y aprobar la evaluación final, obtendrás un 
                        certificado que acredita tus conocimientos en {formatCourseType(course?.type)}.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="lg:w-1/3">
          <div className="sticky top-20">
            <Card>
              <CardContent className="pt-6">
                {loadingCourse || loadingEnrollment ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[180px] w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    {/* Imagen del curso */}
                    {course?.thumbnail ? (
                      <div 
                        className="h-48 bg-cover bg-center bg-slate-100 rounded-md mb-4" 
                        style={{ backgroundImage: `url(${course.thumbnail})` }}
                      />
                    ) : (
                      <div className="h-48 bg-slate-100 rounded-md mb-4 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-slate-300" />
                      </div>
                    )}
                    
                    {enrollment ? (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Tu progreso</span>
                            <span className="text-sm">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress || 0} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <Button 
                            className="w-full" 
                            onClick={handleContinue}
                          >
                            {enrollment.progress > 0 ? 'Continuar curso' : 'Comenzar curso'}
                          </Button>
                          
                          <div className="text-center text-sm text-muted-foreground">
                            Te inscribiste el {new Date(enrollment.startedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleEnroll}
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending ? 'Inscribiendo...' : 'Inscribirme en este curso'}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}