import { useQuery } from "@tanstack/react-query";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { BookOpen, Users, Award, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Obtener mis cursos en progreso
  const { 
    data: misCursos, 
    isLoading: cargandoCursos, 
    error: errorCursos 
  } = useQuery({
    queryKey: ["/api/e-learning/my-courses"],
    enabled: !!user
  });
  
  // Obtener estadísticas generales si el usuario es administrador
  const isAdmin = user?.role === 'admin' || user?.role === 'company_admin';
  const {
    data: stats,
    isLoading: cargandoStats,
    error: errorStats
  } = useQuery({
    queryKey: ["/api/e-learning/stats"],
    enabled: isAdmin
  });
  
  if (errorCursos || errorStats) {
    toast({
      title: "Error al cargar los datos",
      description: "No se pudieron cargar los cursos o estadísticas.",
      variant: "destructive"
    });
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel izquierdo: Mis cursos / progreso reciente */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Mis cursos en progreso</h2>
          
          {cargandoCursos ? (
            <div className="space-y-3">
              <Skeleton className="h-[125px] w-full rounded-lg" />
              <Skeleton className="h-[125px] w-full rounded-lg" />
            </div>
          ) : misCursos && misCursos.length > 0 ? (
            <div className="space-y-3">
              {misCursos.slice(0, 3).map((curso) => (
                <Card key={curso.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{curso.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {curso.progress}% completado
                        </span>
                      </div>
                      <Progress value={curso.progress} className="h-2 mb-3" />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {curso.duration} min · {curso.lessonsCompleted}/{curso.totalLessons} lecciones
                          </span>
                        </div>
                        <Link href={`/formacion/progreso/${curso.id}`}>
                          <Button size="sm" variant="outline">Continuar</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Link href="/formacion/mis-cursos">
                <Button variant="link" className="mt-1 px-0">
                  Ver todos mis cursos
                </Button>
              </Link>
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
        </div>
        
        {/* Panel derecho: Estadísticas / logros recientes */}
        <div className="space-y-4">
          {isAdmin && (
            <>
              <h2 className="text-2xl font-bold">Estadísticas generales</h2>
              
              {cargandoStats ? (
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-[100px] w-full rounded-lg" />
                  <Skeleton className="h-[100px] w-full rounded-lg" />
                  <Skeleton className="h-[100px] w-full rounded-lg" />
                  <Skeleton className="h-[100px] w-full rounded-lg" />
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <BookOpen className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-2xl font-bold">{stats.totalCourses}</h3>
                        <p className="text-sm text-muted-foreground">Cursos totales</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Users className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
                        <p className="text-sm text-muted-foreground">Usuarios activos</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Award className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-2xl font-bold">{stats.completedCourses}</h3>
                        <p className="text-sm text-muted-foreground">Cursos completados</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Clock className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-2xl font-bold">{stats.averageCompletion}%</h3>
                        <p className="text-sm text-muted-foreground">Tasa de finalización</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
              
              <div className="flex justify-between items-center mt-4">
                <Link href="/formacion/cursos">
                  <Button>Gestionar cursos</Button>
                </Link>
                
                <Link href="/formacion/usuarios">
                  <Button variant="outline">Ver progreso de usuarios</Button>
                </Link>
              </div>
            </>
          )}
          
          {!isAdmin && (
            <>
              <h2 className="text-2xl font-bold">Logros y certificados</h2>
              
              {cargandoCursos ? (
                <Skeleton className="h-[200px] w-full rounded-lg" />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-6">
                      <Award className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                      <h3 className="font-medium mb-1">Completa cursos para obtener certificados</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Los certificados demuestran tu conocimiento y habilidades adquiridas
                      </p>
                      <Link href="/formacion/cursos">
                        <Button>Explorar cursos</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Cursos destacados</h2>
        
        {cargandoCursos ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-[250px] w-full rounded-lg" />
            <Skeleton className="h-[250px] w-full rounded-lg" />
            <Skeleton className="h-[250px] w-full rounded-lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cursos destacados (simulados por ahora) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Seguridad alimentaria</CardTitle>
                <CardDescription>Fundamentos y buenas prácticas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground mb-3">
                  <span>11 lecciones</span>
                  <span>120 min</span>
                </div>
                <Link href="/formacion/cursos/1">
                  <Button className="w-full">Ver curso</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Gestión de APPCC</CardTitle>
                <CardDescription>Control y prevención de riesgos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground mb-3">
                  <span>8 lecciones</span>
                  <span>90 min</span>
                </div>
                <Link href="/formacion/cursos/2">
                  <Button className="w-full">Ver curso</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Alérgenos alimentarios</CardTitle>
                <CardDescription>Identificación y gestión</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground mb-3">
                  <span>6 lecciones</span>
                  <span>60 min</span>
                </div>
                <Link href="/formacion/cursos/3">
                  <Button className="w-full">Ver curso</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}