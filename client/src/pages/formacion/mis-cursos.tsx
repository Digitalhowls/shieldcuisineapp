import { useQuery } from "@tanstack/react-query";
import { 
  Card, CardContent, CardHeader, 
  CardTitle, CardDescription 
} from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  BookOpen, Calendar, Clock, Award, CheckCircle2 
} from "lucide-react";

// Componente para mostrar un curso en progreso
function CourseInProgress({ course }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>{course.description}</CardDescription>
          </div>
          <Badge>{course.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progreso</span>
              <span>{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.completedLessons || 0}/{course.totalLessons} lecciones</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Iniciado el {new Date(course.startedAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <Link href={`/formacion/progreso/${course.courseId}`}>
            <Button className="w-full">Continuar</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para mostrar un curso completado
function CompletedCourse({ course }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription>{course.description}</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completado
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Completado el {new Date(course.completedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.totalLessons} lecciones</span>
            </div>
            {course.certificate && (
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>Certificado disponible</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Link href={`/formacion/progreso/${course.courseId}`}>
              <Button variant="outline" className="flex-1">
                Ver contenido
              </Button>
            </Link>
            
            {course.certificate && (
              <Link href={`/formacion/certificado/${course.certificateId || course.id}`}>
                <Button className="flex-1">
                  Ver certificado
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MisCursos() {
  const { toast } = useToast();
  
  // Obtener los cursos del usuario
  const { 
    data: userCourses,
    isLoading,
    error
  } = useQuery({
    queryKey: ["/api/e-learning/my-courses"]
  });
  
  if (error) {
    toast({
      title: "Error al cargar los cursos",
      description: "No se pudieron cargar tus cursos.",
      variant: "destructive"
    });
  }
  
  // Filtrar cursos en progreso y completados
  const inProgressCourses = userCourses?.filter(course => !course.completedAt) || [];
  const completedCourses = userCourses?.filter(course => course.completedAt) || [];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis cursos</h1>
        <p className="text-muted-foreground">
          Gestiona tus cursos en progreso y completados
        </p>
      </div>
      
      <Tabs defaultValue="in-progress">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="in-progress">
            En progreso ({inProgressCourses.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completados ({completedCourses.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="in-progress" className="mt-6">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-1/3 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-2 w-full" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : inProgressCourses.length > 0 ? (
            <div className="space-y-6">
              {inProgressCourses.map(course => (
                <CourseInProgress key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <h3 className="font-medium mb-1">No tienes cursos en progreso</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Inscríbete en cursos para comenzar tu aprendizaje
                  </p>
                  <Link href="/formacion/cursos">
                    <Button>Ver cursos disponibles</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-1/3 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-1/2" />
                        <Skeleton className="h-9 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : completedCourses.length > 0 ? (
            <div className="space-y-6">
              {completedCourses.map(course => (
                <CompletedCourse key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <Award className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <h3 className="font-medium mb-1">No tienes cursos completados</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Completa tu primer curso para obtener un certificado
                  </p>
                  {inProgressCourses.length > 0 ? (
                    <Link href="/formacion">
                      <Button>Volver a mis cursos en progreso</Button>
                    </Link>
                  ) : (
                    <Link href="/formacion/cursos">
                      <Button>Ver cursos disponibles</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}