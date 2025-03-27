import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Book,
  Users,
  Calendar,
  Clock,
  Eye,
  Filter,
  ListFilter,
  MoreVertical,
  ChevronRight,
} from "lucide-react";

// Esquema para validación del formulario del curso
const courseFormSchema = z.object({
  title: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres.",
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  category: z.string(),
  level: z.string(),
  duration: z.string().min(1, {
    message: "La duración es requerida.",
  }),
  published: z.boolean().default(false),
  featuredImage: z.string().optional(),
});

// Tipo para cursos
type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  published: boolean;
  lessons: number;
  students: number;
  featuredImage?: string;
  createdAt: string;
};

// Datos de ejemplo para cursos
const mockCourses: Course[] = [
  {
    id: "course-1",
    title: "Manipulación Higiénica de Alimentos",
    description: "Curso básico para la manipulación adecuada y segura de alimentos en establecimientos de restauración.",
    category: "Seguridad Alimentaria",
    level: "Básico",
    duration: "4 horas",
    published: true,
    lessons: 8,
    students: 124,
    featuredImage: "https://placehold.co/600x400/png",
    createdAt: "2025-01-10",
  },
  {
    id: "course-2",
    title: "Implementación del Sistema APPCC",
    description: "Aprende a implementar correctamente el sistema de Análisis de Peligros y Puntos de Control Crítico.",
    category: "APPCC",
    level: "Intermedio",
    duration: "10 horas",
    published: true,
    lessons: 15,
    students: 86,
    featuredImage: "https://placehold.co/600x400/png",
    createdAt: "2025-01-25",
  },
  {
    id: "course-3",
    title: "Alérgenos en la Cocina",
    description: "Identificación y gestión de alérgenos alimentarios en el entorno de la cocina profesional.",
    category: "Seguridad Alimentaria",
    level: "Básico",
    duration: "3 horas",
    published: true,
    lessons: 6,
    students: 97,
    featuredImage: "https://placehold.co/600x400/png",
    createdAt: "2025-02-05",
  },
  {
    id: "course-4",
    title: "Buenas Prácticas de Higiene en Cocina",
    description: "Prácticas recomendadas para mantener la higiene en entornos de cocina profesional.",
    category: "Seguridad Alimentaria",
    level: "Básico",
    duration: "5 horas",
    published: true,
    lessons: 10,
    students: 152,
    featuredImage: "https://placehold.co/600x400/png",
    createdAt: "2025-02-15",
  },
  {
    id: "course-5",
    title: "Control de Plagas en Establecimientos de Alimentación",
    description: "Estrategias para prevenir y controlar plagas en restaurantes y otros establecimientos alimentarios.",
    category: "Seguridad Alimentaria",
    level: "Intermedio",
    duration: "4 horas",
    published: false,
    lessons: 7,
    students: 0,
    featuredImage: "https://placehold.co/600x400/png",
    createdAt: "2025-03-01",
  },
  {
    id: "course-6",
    title: "Auditoría Interna de Sistemas APPCC",
    description: "Aprende a realizar auditorías internas efectivas del sistema APPCC en tu establecimiento.",
    category: "APPCC",
    level: "Avanzado",
    duration: "8 horas",
    published: false,
    lessons: 12,
    students: 0,
    featuredImage: "https://placehold.co/600x400/png",
    createdAt: "2025-03-10",
  },
];

export default function CoursesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");

  // Formulario de curso
  const courseForm = useForm<z.infer<typeof courseFormSchema>>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Seguridad Alimentaria",
      level: "Básico",
      duration: "",
      published: false,
      featuredImage: "",
    },
  });

  // Filtrar cursos
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    const matchesPublished =
      publishedFilter === "all" ||
      (publishedFilter === "published" && course.published) ||
      (publishedFilter === "draft" && !course.published);
    
    return matchesSearch && matchesCategory && matchesLevel && matchesPublished;
  });

  // Función para editar un curso
  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course);
    courseForm.reset({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      published: course.published,
      featuredImage: course.featuredImage,
    });
    setIsEditingCourse(true);
  };

  // Función para guardar un curso (nuevo o editado)
  const onSubmitCourse = (values: z.infer<typeof courseFormSchema>) => {
    if (currentCourse) {
      // Actualizar curso existente
      const updatedCourses = courses.map((course) =>
        course.id === currentCourse.id
          ? { ...course, ...values }
          : course
      );
      setCourses(updatedCourses);
      toast({
        title: "Curso actualizado",
        description: `El curso "${values.title}" ha sido actualizado correctamente.`,
      });
    } else {
      // Crear nuevo curso
      const newCourse: Course = {
        id: `course-${courses.length + 1}`,
        ...values,
        students: 0,
        lessons: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCourses([...courses, newCourse]);
      toast({
        title: "Curso creado",
        description: `El curso "${values.title}" ha sido creado correctamente.`,
      });
    }
    courseForm.reset();
    setIsAddingCourse(false);
    setIsEditingCourse(false);
    setCurrentCourse(null);
  };

  // Función para eliminar un curso
  const handleDeleteCourse = () => {
    if (courseToDelete) {
      setCourses(courses.filter((course) => course.id !== courseToDelete.id));
      toast({
        title: "Curso eliminado",
        description: `El curso "${courseToDelete.title}" ha sido eliminado correctamente.`,
        variant: "destructive",
      });
      setCourseToDelete(null);
    }
  };

  // Función para abrir el formulario de nuevo curso
  const handleAddCourse = () => {
    courseForm.reset({
      title: "",
      description: "",
      category: "Seguridad Alimentaria",
      level: "Básico",
      duration: "",
      published: false,
      featuredImage: "",
    });
    setCurrentCourse(null);
    setIsAddingCourse(true);
  };

  // Obtener categorías únicas
  const uniqueCategories = Array.from(new Set(courses.map((course) => course.category)));
  // Obtener niveles únicos
  const uniqueLevels = Array.from(new Set(courses.map((course) => course.level)));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
          <p className="text-muted-foreground">
            Gestione los cursos de la plataforma de aprendizaje
          </p>
        </div>
        <Button onClick={handleAddCourse}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Curso
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar cursos..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  {uniqueLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={publishedFilter} onValueChange={setPublishedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="published">Publicados</SelectItem>
                  <SelectItem value="draft">Borradores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            {course.featuredImage && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.featuredImage}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {!course.published && (
                  <Badge
                    variant="outline"
                    className="absolute top-2 right-2 bg-amber-100 text-amber-800 hover:bg-amber-100"
                  >
                    Borrador
                  </Badge>
                )}
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditCourse(course)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setCourseToDelete(course)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Está seguro de eliminar este curso?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará permanentemente el curso "{course.title}" y
                          todo su contenido. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCourseToDelete(null)}>
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteCourse}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge variant="outline">{course.level}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Book className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{course.lessons} lecciones</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{course.students} alumnos</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div className="text-xs text-muted-foreground">
                Creado: {course.createdAt}
              </div>
              <Button variant="ghost" size="sm" className="gap-1">
                <Eye className="h-4 w-4" />
                Ver
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-10">
          <div className="text-muted-foreground">No se encontraron cursos</div>
        </div>
      )}

      {/* Modal para añadir/editar curso */}
      <Dialog
        open={isAddingCourse || isEditingCourse}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingCourse(false);
            setIsEditingCourse(false);
            setCurrentCourse(null);
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {isEditingCourse ? "Editar Curso" : "Nuevo Curso"}
            </DialogTitle>
            <DialogDescription>
              {isEditingCourse
                ? "Edite los detalles del curso existente"
                : "Complete los detalles para crear un nuevo curso"}
            </DialogDescription>
          </DialogHeader>
          <Form {...courseForm}>
            <form
              onSubmit={courseForm.handleSubmit(onSubmitCourse)}
              className="space-y-6"
            >
              <FormField
                control={courseForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del Curso</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Manipulación Higiénica de Alimentos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={courseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describa el contenido del curso..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={courseForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Seguridad Alimentaria">
                            Seguridad Alimentaria
                          </SelectItem>
                          <SelectItem value="APPCC">APPCC</SelectItem>
                          <SelectItem value="Higiene">Higiene</SelectItem>
                          <SelectItem value="Nutrición">Nutrición</SelectItem>
                          <SelectItem value="Gestión">Gestión</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={courseForm.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nivel</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un nivel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Básico">Básico</SelectItem>
                          <SelectItem value="Intermedio">Intermedio</SelectItem>
                          <SelectItem value="Avanzado">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={courseForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duración</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 4 horas" {...field} />
                    </FormControl>
                    <FormDescription>
                      Especifique la duración total del curso
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={courseForm.control}
                name="featuredImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagen Destacada (URL)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://ejemplo.com/imagen.jpg"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      URL de la imagen que se mostrará como portada del curso
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={courseForm.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publicar Curso</FormLabel>
                      <FormDescription>
                        Establecer el curso como publicado lo hará visible para los usuarios
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingCourse(false);
                    setIsEditingCourse(false);
                    setCurrentCourse(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditingCourse ? "Actualizar Curso" : "Crear Curso"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}