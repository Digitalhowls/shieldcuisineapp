import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Book, 
  BookOpen, 
  Bookmark, 
  Calendar, 
  Clock3, 
  Coins, 
  FileText, 
  GraduationCap, 
  LayoutDashboard, 
  ListChecks, 
  Plus, 
  Settings, 
  Users 
} from 'lucide-react';
import { queryClient } from '@/lib/queryClient';

// Componente de tarjeta de curso
function CourseCard({ course }: { course: any }) {
  const [_, navigate] = useLocation();

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative h-40 overflow-hidden">
        {course.featuredImage ? (
          <img 
            src={course.featuredImage} 
            alt={course.title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}
        <Badge className="absolute top-2 right-2" variant={course.published ? "default" : "outline"}>
          {course.published ? "Publicado" : "Borrador"}
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold truncate">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2 h-10">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-primary" />
              <span>{course.category || "Sin categoría"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="capitalize">{course.level || "Básico"}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <Clock3 className="w-4 h-4 text-primary" />
              <span>{course.duration || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-primary" />
              <span>{course.price ? `${(course.price / 100).toFixed(2)}€` : "Gratis"}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/admin/formacion/cursos/${course.id}`)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Gestionar
          </Button>
          <Button 
            size="sm"
            variant="default"
            className="flex-1"
            onClick={() => navigate(`/admin/formacion/cursos/${course.id}/editar`)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de tarjeta de estadística
function StatCard({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

// Componente principal del panel de administración
export default function AdminFormacionPage() {
  const [_, navigate] = useLocation();
  
  // Consulta para obtener los cursos
  const { data: coursesData, isLoading: isLoadingCourses, error: coursesError } = useQuery({
    queryKey: ['/api/elearning/courses'],
  });

  // Extraer cursos y metadata
  const courses = coursesData?.data || [];
  const metadata = coursesData?.meta || { total: 0 };

  // Función para crear un nuevo curso
  const handleCreateCourse = () => {
    navigate('/admin/formacion/cursos/nuevo');
  };

  return (
    <div className="container max-w-screen-xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plataforma de Formación</h1>
          <p className="text-muted-foreground">
            Gestiona cursos, estudiantes y certificaciones de tu plataforma e-learning.
          </p>
        </div>
        <Button onClick={handleCreateCourse}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo Curso
        </Button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-6">
        <StatCard 
          title="Total Cursos" 
          value={metadata.total || 0} 
          icon={<Book className="h-4 w-4 text-muted-foreground" />}
          description="Cursos activos en la plataforma"
        />
        <StatCard 
          title="Estudiantes Activos" 
          value="--" 
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Usuarios con inscripciones activas"
        />
        <StatCard 
          title="Certificados Emitidos" 
          value="--" 
          icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
          description="Certificaciones completadas"
        />
        <StatCard 
          title="Finalización Promedio" 
          value="--%" 
          icon={<ListChecks className="h-4 w-4 text-muted-foreground" />}
          description="Tasa de finalización de cursos"
        />
      </div>

      {/* Tabs para diferentes secciones */}
      <Tabs defaultValue="cursos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cursos" className="flex items-center">
            <Book className="w-4 h-4 mr-2" /> Cursos
          </TabsTrigger>
          <TabsTrigger value="estudiantes" className="flex items-center">
            <Users className="w-4 h-4 mr-2" /> Estudiantes
          </TabsTrigger>
          <TabsTrigger value="certificados" className="flex items-center">
            <GraduationCap className="w-4 h-4 mr-2" /> Certificados
          </TabsTrigger>
          <TabsTrigger value="informes" className="flex items-center">
            <LayoutDashboard className="w-4 h-4 mr-2" /> Informes
          </TabsTrigger>
          <TabsTrigger value="configuracion" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" /> Configuración
          </TabsTrigger>
        </TabsList>
        
        {/* Contenido de la pestaña Cursos */}
        <TabsContent value="cursos" className="space-y-4">
          {isLoadingCourses ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando cursos...</p>
            </div>
          ) : coursesError ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-2">Error al cargar los cursos</p>
              <Button 
                variant="outline" 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/elearning/courses'] })}
              >
                Reintentar
              </Button>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center border rounded-lg p-8 bg-muted/10">
              <Book className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No hay cursos disponibles</h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando tu primer curso para la plataforma de formación
              </p>
              <Button onClick={handleCreateCourse}>
                <Plus className="w-4 h-4 mr-2" /> Crear Curso
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Contenido de las otras pestañas (por implementar) */}
        <TabsContent value="estudiantes">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Estudiantes</CardTitle>
              <CardDescription>
                Visualiza y gestiona los estudiantes inscritos en tus cursos.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>Esta sección estará disponible pronto</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="certificados">
          <Card>
            <CardHeader>
              <CardTitle>Certificados</CardTitle>
              <CardDescription>
                Gestiona los certificados emitidos y configura plantillas personalizadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>Esta sección estará disponible pronto</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="informes">
          <Card>
            <CardHeader>
              <CardTitle>Informes y Estadísticas</CardTitle>
              <CardDescription>
                Obtén datos detallados sobre el rendimiento de tu plataforma formativa.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <LayoutDashboard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>Esta sección estará disponible pronto</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="configuracion">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                Ajusta las opciones de tu plataforma de formación.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>Esta sección estará disponible pronto</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}