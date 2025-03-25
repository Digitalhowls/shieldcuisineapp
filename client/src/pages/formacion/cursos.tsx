import { useQuery } from "@tanstack/react-query";
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Search, Plus, BookOpen, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

// Componente de tarjeta de curso para reutilizar
function CourseCard({ course, isEnrolled, onEnroll }) {
  return (
    <Card className="overflow-hidden">
      <div 
        className="h-36 bg-cover bg-center bg-slate-100" 
        style={{ 
          backgroundImage: course.thumbnail 
            ? `url(${course.thumbnail})` 
            : undefined 
        }}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>{course.title}</CardTitle>
          <Badge variant={course.type === 'food_safety' ? 'default' : 'secondary'}>
            {course.type === 'food_safety' && 'Seguridad'}
            {course.type === 'haccp' && 'APPCC'}
            {course.type === 'allergens' && 'Alérgenos'}
            {course.type === 'hygiene' && 'Higiene'}
            {course.type === 'management' && 'Gestión'}
            {course.type === 'customer_service' && 'Atención'}
          </Badge>
        </div>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessonCount} lecciones</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration} min</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/formacion/cursos/${course.id}`}>
          <Button variant="outline">Detalles</Button>
        </Link>
        
        {isEnrolled ? (
          <Link href={`/formacion/progreso/${course.id}`}>
            <Button>Continuar</Button>
          </Link>
        ) : (
          <Button onClick={() => onEnroll(course.id)}>Inscribirme</Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function Cursos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const isAdmin = user?.role === 'admin' || user?.role === 'company_admin';
  
  // Obtener lista de cursos
  const { 
    data: courses, 
    isLoading, 
    error,
  } = useQuery({
    queryKey: ["/api/e-learning/courses"],
    enabled: !!user?.companyId
  });
  
  // Obtener cursos en los que el usuario está inscrito
  const { data: enrolledCourses } = useQuery({
    queryKey: ["/api/e-learning/my-courses"],
    enabled: !!user
  });
  
  // Función para determinar si el usuario está inscrito en un curso
  const isEnrolled = (courseId) => {
    if (!enrolledCourses) return false;
    return enrolledCourses.some(c => c.courseId === courseId);
  };
  
  // Filtrar cursos según búsqueda y tipo
  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || course.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  // Manejar inscripción en curso
  const handleEnroll = async (courseId) => {
    try {
      const response = await fetch("/api/e-learning/courses/" + courseId + "/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error("Error al inscribirse en el curso");
      }
      
      toast({
        title: "Inscripción exitosa",
        description: "Te has inscrito correctamente en el curso",
      });
      
      // Invalidar la caché para actualizar los cursos inscritos
      queryClient.invalidateQueries(["/api/e-learning/my-courses"]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  if (error) {
    toast({
      title: "Error al cargar los cursos",
      description: "No se pudieron cargar los cursos disponibles.",
      variant: "destructive"
    });
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Catálogo de cursos</h1>
          <p className="text-muted-foreground">
            Explora los cursos disponibles para mejorar tus habilidades
          </p>
        </div>
        
        {isAdmin && (
          <div>
            <Link href="/formacion/cursos/nuevo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear curso
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select 
          value={filterType} 
          onValueChange={setFilterType}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="food_safety">Seguridad alimentaria</SelectItem>
            <SelectItem value="haccp">APPCC</SelectItem>
            <SelectItem value="allergens">Alérgenos</SelectItem>
            <SelectItem value="hygiene">Higiene</SelectItem>
            <SelectItem value="management">Gestión</SelectItem>
            <SelectItem value="customer_service">Atención al cliente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-36 w-full" />
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredCourses?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id}
              course={course}
              isEnrolled={isEnrolled(course.id)}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <h3 className="font-medium text-lg mb-1">No se encontraron cursos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No hay cursos disponibles que coincidan con tu búsqueda
              </p>
              {searchTerm || filterType !== "all" ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                >
                  Limpiar filtros
                </Button>
              ) : isAdmin ? (
                <Link href="/formacion/cursos/nuevo">
                  <Button>Crear el primer curso</Button>
                </Link>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}