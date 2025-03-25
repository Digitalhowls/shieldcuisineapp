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
import { 
  BookOpen, 
  GraduationCap, 
  Award, 
  Users,
  Clock,
  ArrowRight,
  PlayCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Componente para las tarjetas de resumen
function SummaryCard({ title, value, description, icon, className }: { 
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Componente para mostrar un curso en progreso
function CourseInProgressCard({ curso }: any) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {curso.thumbnail ? (
          <img
            src={curso.thumbnail}
            alt={curso.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <GraduationCap className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <Badge className="absolute top-2 right-2">{curso.type}</Badge>
      </div>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xl truncate">{curso.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Progreso</span>
          <span>{curso.progress}%</span>
        </div>
        <Progress value={curso.progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{curso.completedLessons} / {curso.totalLessons} lecciones</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{curso.duration} min.</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/formacion/progreso/${curso.id}`}>
          <Button variant="default" className="w-full">
            Continuar curso
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Componente para mostrar un curso recomendado
function RecommendedCourseCard({ curso }: any) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {curso.thumbnail ? (
          <img
            src={curso.thumbnail}
            alt={curso.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <GraduationCap className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <Badge className="absolute top-2 right-2">{curso.type}</Badge>
      </div>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-xl truncate">{curso.title}</CardTitle>
        <CardDescription className="line-clamp-2">{curso.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{curso.lessons} lecciones</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{curso.duration} min.</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/formacion/curso/${curso.id}`}>
          <Button variant="outline" className="w-full">
            Ver detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("in-progress");
  
  // Obtener estadísticas de la formación
  const { 
    data: stats,
    isLoading: loadingStats
  } = useQuery({
    queryKey: ["/api/e-learning/dashboard/stats"],
  });
  
  // Obtener cursos en progreso del usuario
  const { 
    data: inProgressCourses,
    isLoading: loadingProgress
  } = useQuery({
    queryKey: ["/api/e-learning/my-courses/in-progress"],
  });
  
  // Obtener cursos completados por el usuario
  const { 
    data: completedCourses,
    isLoading: loadingCompleted
  } = useQuery({
    queryKey: ["/api/e-learning/my-courses/completed"],
  });
  
  // Obtener cursos recomendados
  const { 
    data: recommendedCourses,
    isLoading: loadingRecommended
  } = useQuery({
    queryKey: ["/api/e-learning/courses/recommended"],
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plataforma de formación</h1>
        <p className="text-muted-foreground">
          Bienvenido/a, {user?.name || user?.username}. Accede a tus cursos y formación continua.
        </p>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Cursos totales"
          value={loadingStats ? "..." : stats?.totalCourses || 0}
          description="Cursos disponibles en la plataforma"
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
        />
        
        <SummaryCard
          title="Usuarios activos"
          value={loadingStats ? "..." : stats?.activeUsers || 0}
          description="Alumnos participando en cursos"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        
        <SummaryCard
          title="Cursos completados"
          value={loadingStats ? "..." : stats?.completedCourses || 0}
          description="Formaciones finalizadas en el último mes"
          icon={<Award className="h-4 w-4 text-muted-foreground" />}
        />
        
        <SummaryCard
          title="Tasa de finalización"
          value={loadingStats ? "..." : `${stats?.averageCompletion || 0}%`}
          description="Promedio de finalización de cursos"
          icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      
      {/* Cursos en progreso y recomendados */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="in-progress">En progreso</TabsTrigger>
            <TabsTrigger value="recommended">Recomendados</TabsTrigger>
          </TabsList>
          
          <div>
            {activeTab === "in-progress" ? (
              <Link href="/formacion/mis-cursos">
                <Button variant="ghost" size="sm" className="gap-1">
                  Ver todos mis cursos <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/formacion/cursos">
                <Button variant="ghost" size="sm" className="gap-1">
                  Ver catálogo completo <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        <TabsContent value="in-progress" className="mt-6">
          {loadingProgress ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-[180px] w-full" />
                  <CardHeader className="p-4 pb-0">
                    <Skeleton className="h-5 w-3/4" />
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-2 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : inProgressCourses && inProgressCourses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inProgressCourses.map((curso) => (
                <CourseInProgressCard key={curso.id} curso={curso} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <PlayCircle className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <h3 className="font-medium mb-1">No tienes cursos en progreso</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Inscríbete en un curso para comenzar tu aprendizaje
                  </p>
                  <Link href="/formacion/cursos">
                    <Button>Ver cursos disponibles</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="recommended" className="mt-6">
          {loadingRecommended ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-[180px] w-full" />
                  <CardHeader className="p-4 pb-0">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : recommendedCourses && recommendedCourses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedCourses.map((curso) => (
                <RecommendedCourseCard key={curso.id} curso={curso} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <h3 className="font-medium mb-1">No hay cursos recomendados disponibles</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explora nuestro catálogo completo de cursos de formación
                  </p>
                  <Link href="/formacion/cursos">
                    <Button>Ver todos los cursos</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Certificados recientes */}
      {!loadingCompleted && completedCourses && completedCourses.length > 0 && (
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Certificados obtenidos</h2>
            <Link href="/formacion/mis-cursos?tab=completed">
              <Button variant="ghost" size="sm" className="gap-1">
                Ver todos los certificados <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedCourses.slice(0, 3).map((curso) => (
              <Card key={curso.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl truncate">{curso.title}</CardTitle>
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Completado el {new Date(curso.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link href={`/formacion/certificado/${curso.id}`}>
                    <Button variant="outline" className="w-full">
                      Ver certificado
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}