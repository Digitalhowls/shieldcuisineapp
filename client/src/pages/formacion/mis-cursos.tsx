import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
  Award,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Componente para mostrar un curso en progreso
function CourseInProgressCard({ course }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <GraduationCap className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <Badge className="absolute top-2 right-2">{course.type}</Badge>
      </div>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xl truncate">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          Inscrito el {new Date(course.startedAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Progreso</span>
          <span>{course.progress}%</span>
        </div>
        <Progress value={course.progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.completedLessons?.length || 0} / {course.totalLessons} lecciones</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration} min.</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/formacion/progreso/${course.courseId}`}>
          <Button className="w-full">
            Continuar curso
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Componente para mostrar un curso completado
function CourseCompletedCard({ course }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <GraduationCap className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <Badge className="absolute top-2 right-2">{course.type}</Badge>
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <Badge className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3">
            <CheckCircle className="h-4 w-4 mr-1" />
            Completado
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xl truncate">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          Completado el {new Date(course.completedAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Inscrito: {new Date(course.startedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span>Nota: {course.finalScore}/100</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link href={`/formacion/certificado/${course.courseId}`}>
          <Button variant="outline" className="flex-1">
            Ver certificado
          </Button>
        </Link>
        <Link href={`/formacion/progreso/${course.courseId}`}>
          <Button variant="outline" className="flex-1">
            Revisar curso
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function MisCursos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("in-progress");
  
  // Obtener cursos del usuario
  const { 
    data: userCourses = [],
    isLoading: loadingCourses
  } = useQuery({
    queryKey: ["/api/e-learning/my-courses"],
  });
  
  // Separar cursos en progreso y completados
  const inProgressCourses = userCourses.filter(course => !course.completedAt);
  const completedCourses = userCourses.filter(course => course.completedAt);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis cursos</h1>
        <p className="text-muted-foreground">
          Gestiona tu progreso en los cursos de formación
        </p>
      </div>
      
      {/* Tabs para alternar entre cursos en progreso y completados */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="in-progress" className="relative">
            En progreso
            {inProgressCourses.length > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 h-5 min-w-5 text-xs">
                {inProgressCourses.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            Completados
            {completedCourses.length > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 h-5 min-w-5 text-xs">
                {completedCourses.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="in-progress" className="mt-6">
          {loadingCourses ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-[180px] w-full" />
                  <CardHeader className="p-4 pb-0">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2">
                    <Skeleton className="h-2 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : inProgressCourses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {inProgressCourses.map((course) => (
                <CourseInProgressCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <h3 className="font-medium mb-1">No tienes cursos en progreso</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Para comenzar, inscríbete en alguno de nuestros cursos disponibles
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
          {loadingCourses ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-[180px] w-full" />
                  <CardHeader className="p-4 pb-0">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <div className="flex gap-2 w-full">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : completedCourses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {completedCourses.map((course) => (
                <CourseCompletedCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <Award className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <h3 className="font-medium mb-1">No tienes cursos completados</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Completa alguno de tus cursos en progreso para obtener certificados
                  </p>
                  <Link href="/formacion/cursos">
                    <Button>Ver cursos disponibles</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Sección de estadísticas de aprendizaje */}
      {userCourses.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Estadísticas de aprendizaje</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cursos totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userCourses.length}</div>
                <p className="text-xs text-muted-foreground">
                  {completedCourses.length} completados, {inProgressCourses.length} en progreso
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tiempo total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userCourses.reduce((total, course) => total + (course.timeSpent || 0), 0)} min
                </div>
                <p className="text-xs text-muted-foreground">
                  Tiempo dedicado a aprendizaje
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Lecciones completadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userCourses.reduce((total, course) => 
                    total + (course.completedLessons?.length || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  De un total de {userCourses.reduce((total, course) => 
                    total + (course.totalLessons || 0), 0)} lecciones
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Certificados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedCourses.length}</div>
                <p className="text-xs text-muted-foreground">
                  Certificados obtenidos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}