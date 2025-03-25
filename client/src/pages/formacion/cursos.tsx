import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { 
  GraduationCap, 
  Search, 
  BookOpen,
  Clock,
  Users,
  CheckCircle,
  Filter,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Componente para mostrar un curso en el catálogo
function CourseCard({ course, isEnrolled, onEnroll }) {
  return (
    <Card className="overflow-hidden flex flex-col">
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
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-2 flex-grow">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessonCount} lecciones</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration} min.</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.enrollmentCount} inscritos</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Link href={`/formacion/curso/${course.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Ver detalle
            </Button>
          </Link>
          
          {isEnrolled ? (
            <Link href={`/formacion/progreso/${course.id}`} className="flex-1">
              <Button className="w-full">
                Continuar
              </Button>
            </Link>
          ) : (
            <Button 
              className="flex-1"
              onClick={() => onEnroll(course.id)}
            >
              Inscribirse
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default function Cursos() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Obtener todos los cursos
  const { 
    data: courses = [],
    isLoading: loadingCourses
  } = useQuery({
    queryKey: ["/api/e-learning/courses"],
  });
  
  // Obtener los cursos en los que el usuario está inscrito
  const { 
    data: enrolledCourses = [],
    isLoading: loadingEnrolled
  } = useQuery({
    queryKey: ["/api/e-learning/my-courses"],
  });
  
  // Verificar si el usuario ya está inscrito en un curso
  const isUserEnrolled = (courseId) => {
    if (loadingEnrolled) return false;
    return enrolledCourses.some(c => c.courseId === courseId);
  };
  
  // Filtrar cursos en base a la búsqueda y los filtros
  const filteredCourses = courses.filter(course => {
    // Filtrar por búsqueda
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtrar por tipo
    const matchesFilter = !activeFilter || course.type === activeFilter;
    
    return matchesSearch && matchesFilter;
  });
  
  // Mutación para inscribirse en un curso
  const enrollMutation = useMutation({
    mutationFn: async (courseId) => {
      return await apiRequest("POST", `/api/e-learning/courses/${courseId}/enroll`, {});
    },
    onSuccess: () => {
      toast({
        title: "Inscripción exitosa",
        description: "Te has inscrito al curso correctamente.",
      });
      
      // Actualizar datos
      queryClient.invalidateQueries(["/api/e-learning/my-courses"]);
    },
    onError: (error) => {
      toast({
        title: "Error en la inscripción",
        description: "No se pudo completar la inscripción. Por favor, intenta nuevamente.",
        variant: "destructive"
      });
      console.error("Error al inscribirse:", error);
    }
  });
  
  // Manejar la inscripción a un curso
  const handleEnroll = (courseId) => {
    enrollMutation.mutate(courseId);
  };
  
  // Obtener tipos de cursos únicos para los filtros
  const courseTypes = [...new Set(courses.map(course => course.type))];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Catálogo de cursos</h1>
        <p className="text-muted-foreground">
          Explora todos los cursos disponibles para tu formación continua
        </p>
      </div>
      
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar cursos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            variant={!activeFilter ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap"
            onClick={() => setActiveFilter(null)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Todos
          </Button>
          
          {courseTypes.map(type => (
            <Button
              key={type}
              variant={activeFilter === type ? "default" : "outline"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setActiveFilter(activeFilter === type ? null : type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
      
      <Separator />
      
      {/* Lista de cursos */}
      {loadingCourses ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-[180px] w-full" />
              <CardHeader className="p-4 pb-0">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
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
      ) : filteredCourses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={isUserEnrolled(course.id)}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <h3 className="font-medium mb-1">No se encontraron cursos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || activeFilter
                  ? "Intenta con diferentes términos de búsqueda o filtros"
                  : "No hay cursos disponibles en este momento"}
              </p>
              {(searchQuery || activeFilter) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter(null);
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}