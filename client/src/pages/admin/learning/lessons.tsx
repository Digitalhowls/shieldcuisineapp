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
  FileVideo,
  Book,
  BookOpen,
  Clock,
  Link,
  List,
  MoveUp,
  MoveDown,
} from "lucide-react";

// Esquema para validación del formulario de lección
const lessonFormSchema = z.object({
  title: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres.",
  }),
  content: z.string().min(10, {
    message: "El contenido debe tener al menos 10 caracteres.",
  }),
  courseId: z.string({
    required_error: "El curso es requerido.",
  }),
  lessonType: z.string(),
  duration: z.string().min(1, {
    message: "La duración es requerida.",
  }),
  order: z.coerce.number().int().positive(),
  videoUrl: z.string().optional(),
  attachments: z.string().optional(),
  published: z.boolean().default(false),
});

// Tipo para lecciones
type Lesson = {
  id: string;
  title: string;
  content: string;
  courseId: string;
  courseName: string;
  lessonType: string;
  duration: string;
  order: number;
  videoUrl?: string;
  attachments?: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

// Tipo para cursos (simplificado)
type Course = {
  id: string;
  title: string;
};

// Datos de ejemplo para cursos
const mockCourses: Course[] = [
  { id: "course-1", title: "Manipulación Higiénica de Alimentos" },
  { id: "course-2", title: "Implementación del Sistema APPCC" },
  { id: "course-3", title: "Alérgenos en la Cocina" },
  { id: "course-4", title: "Buenas Prácticas de Higiene en Cocina" },
  { id: "course-5", title: "Control de Plagas en Establecimientos de Alimentación" },
  { id: "course-6", title: "Auditoría Interna de Sistemas APPCC" },
];

// Datos de ejemplo para lecciones
const mockLessons: Lesson[] = [
  {
    id: "lesson-1",
    title: "Introducción a la Manipulación de Alimentos",
    content: "En esta lección introductoria, aprenderemos los conceptos básicos sobre la manipulación segura de alimentos...",
    courseId: "course-1",
    courseName: "Manipulación Higiénica de Alimentos",
    lessonType: "video",
    duration: "15 minutos",
    order: 1,
    videoUrl: "https://example.com/videos/intro-manipulacion.mp4",
    attachments: ["Manual básico.pdf", "Checklist de higiene.pdf"],
    published: true,
    createdAt: "2025-01-15",
    updatedAt: "2025-01-20",
  },
  {
    id: "lesson-2",
    title: "Higiene Personal",
    content: "La higiene personal es fundamental para prevenir la contaminación de los alimentos...",
    courseId: "course-1",
    courseName: "Manipulación Higiénica de Alimentos",
    lessonType: "text",
    duration: "20 minutos",
    order: 2,
    attachments: ["Guía de higiene personal.pdf"],
    published: true,
    createdAt: "2025-01-16",
    updatedAt: "2025-01-20",
  },
  {
    id: "lesson-3",
    title: "Contaminación Cruzada",
    content: "La contaminación cruzada ocurre cuando los patógenos se transfieren de un alimento a otro...",
    courseId: "course-1",
    courseName: "Manipulación Higiénica de Alimentos",
    lessonType: "video",
    duration: "25 minutos",
    order: 3,
    videoUrl: "https://example.com/videos/contaminacion-cruzada.mp4",
    published: true,
    createdAt: "2025-01-17",
    updatedAt: "2025-01-20",
  },
  {
    id: "lesson-4",
    title: "Principios del Sistema APPCC",
    content: "El sistema APPCC se basa en siete principios fundamentales que permiten identificar, evaluar y controlar los peligros...",
    courseId: "course-2",
    courseName: "Implementación del Sistema APPCC",
    lessonType: "text",
    duration: "30 minutos",
    order: 1,
    attachments: ["Principios APPCC.pdf", "Ejemplos prácticos.pdf"],
    published: true,
    createdAt: "2025-02-01",
    updatedAt: "2025-02-05",
  },
  {
    id: "lesson-5",
    title: "Establecimiento de Límites Críticos",
    content: "Los límites críticos son los criterios que separan lo aceptable de lo inaceptable en los puntos críticos de control...",
    courseId: "course-2",
    courseName: "Implementación del Sistema APPCC",
    lessonType: "video",
    duration: "20 minutos",
    order: 2,
    videoUrl: "https://example.com/videos/limites-criticos.mp4",
    published: true,
    createdAt: "2025-02-02",
    updatedAt: "2025-02-05",
  },
  {
    id: "lesson-6",
    title: "Identificación de los Principales Alérgenos",
    content: "En esta lección aprenderemos a identificar los 14 alérgenos de declaración obligatoria...",
    courseId: "course-3",
    courseName: "Alérgenos en la Cocina",
    lessonType: "video",
    duration: "25 minutos",
    order: 1,
    videoUrl: "https://example.com/videos/alergenos-identificacion.mp4",
    published: true,
    createdAt: "2025-02-10",
    updatedAt: "2025-02-15",
  },
  {
    id: "lesson-7",
    title: "Nueva Lección: Etiquetado de Alérgenos",
    content: "Borrador de la lección sobre etiquetado correcto de alérgenos en menús y productos...",
    courseId: "course-3",
    courseName: "Alérgenos en la Cocina",
    lessonType: "text",
    duration: "15 minutos",
    order: 2,
    published: false,
    createdAt: "2025-03-01",
    updatedAt: "2025-03-01",
  },
];

export default function LessonsPage() {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");

  // Formulario de lección
  const lessonForm = useForm<z.infer<typeof lessonFormSchema>>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: "",
      content: "",
      courseId: "",
      lessonType: "text",
      duration: "",
      order: 1,
      videoUrl: "",
      attachments: "",
      published: false,
    },
  });

  // Filtrar lecciones
  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = courseFilter === "all" || lesson.courseId === courseFilter;
    const matchesType = typeFilter === "all" || lesson.lessonType === typeFilter;
    const matchesPublished =
      publishedFilter === "all" ||
      (publishedFilter === "published" && lesson.published) ||
      (publishedFilter === "draft" && !lesson.published);
    
    return matchesSearch && matchesCourse && matchesType && matchesPublished;
  });

  // Función para editar una lección
  const handleEditLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    lessonForm.reset({
      title: lesson.title,
      content: lesson.content,
      courseId: lesson.courseId,
      lessonType: lesson.lessonType,
      duration: lesson.duration,
      order: lesson.order,
      videoUrl: lesson.videoUrl || "",
      attachments: lesson.attachments ? lesson.attachments.join(", ") : "",
      published: lesson.published,
    });
    setIsEditingLesson(true);
  };

  // Función para guardar una lección (nueva o editada)
  const onSubmitLesson = (values: z.infer<typeof lessonFormSchema>) => {
    const courseName = mockCourses.find(course => course.id === values.courseId)?.title || "";
    
    // Procesar attachments
    const attachmentsArray = values.attachments
      ? values.attachments.split(",").map(item => item.trim()).filter(Boolean)
      : undefined;
    
    if (currentLesson) {
      // Actualizar lección existente
      const updatedLessons = lessons.map((lesson) =>
        lesson.id === currentLesson.id
          ? {
              ...lesson,
              ...values,
              courseName,
              attachments: attachmentsArray,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : lesson
      );
      setLessons(updatedLessons);
      toast({
        title: "Lección actualizada",
        description: `La lección "${values.title}" ha sido actualizada correctamente.`,
      });
    } else {
      // Crear nueva lección
      const newLesson: Lesson = {
        id: `lesson-${lessons.length + 1}`,
        ...values,
        courseName,
        attachments: attachmentsArray,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setLessons([...lessons, newLesson]);
      toast({
        title: "Lección creada",
        description: `La lección "${values.title}" ha sido creada correctamente.`,
      });
    }
    lessonForm.reset();
    setIsAddingLesson(false);
    setIsEditingLesson(false);
    setCurrentLesson(null);
  };

  // Función para eliminar una lección
  const handleDeleteLesson = () => {
    if (lessonToDelete) {
      setLessons(lessons.filter((lesson) => lesson.id !== lessonToDelete.id));
      toast({
        title: "Lección eliminada",
        description: `La lección "${lessonToDelete.title}" ha sido eliminada correctamente.`,
        variant: "destructive",
      });
      setLessonToDelete(null);
    }
  };

  // Función para abrir el formulario de nueva lección
  const handleAddLesson = () => {
    lessonForm.reset({
      title: "",
      content: "",
      courseId: "",
      lessonType: "text",
      duration: "",
      order: 1,
      videoUrl: "",
      attachments: "",
      published: false,
    });
    setCurrentLesson(null);
    setIsAddingLesson(true);
  };

  // Función para mover una lección hacia arriba (orden -1)
  const handleMoveUp = (lessonId: string) => {
    const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);
    if (lessonIndex <= 0) return; // Ya está al principio o no encontrado
    
    const currentLesson = lessons[lessonIndex];
    const prevLesson = lessons[lessonIndex - 1];
    
    // Solo mover si son del mismo curso
    if (currentLesson.courseId !== prevLesson.courseId) {
      toast({
        title: "No se puede mover",
        description: "Solo se pueden reordenar lecciones dentro del mismo curso.",
        variant: "destructive",
      });
      return;
    }
    
    // Intercambiar órdenes
    const updatedLessons = [...lessons];
    updatedLessons[lessonIndex] = { ...currentLesson, order: prevLesson.order };
    updatedLessons[lessonIndex - 1] = { ...prevLesson, order: currentLesson.order };
    
    setLessons(updatedLessons);
    toast({
      title: "Lección movida",
      description: `La lección "${currentLesson.title}" ha sido movida hacia arriba.`,
    });
  };

  // Función para mover una lección hacia abajo (orden +1)
  const handleMoveDown = (lessonId: string) => {
    const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);
    if (lessonIndex === -1 || lessonIndex >= lessons.length - 1) return; // No encontrado o ya está al final
    
    const currentLesson = lessons[lessonIndex];
    const nextLesson = lessons[lessonIndex + 1];
    
    // Solo mover si son del mismo curso
    if (currentLesson.courseId !== nextLesson.courseId) {
      toast({
        title: "No se puede mover",
        description: "Solo se pueden reordenar lecciones dentro del mismo curso.",
        variant: "destructive",
      });
      return;
    }
    
    // Intercambiar órdenes
    const updatedLessons = [...lessons];
    updatedLessons[lessonIndex] = { ...currentLesson, order: nextLesson.order };
    updatedLessons[lessonIndex + 1] = { ...nextLesson, order: currentLesson.order };
    
    setLessons(updatedLessons);
    toast({
      title: "Lección movida",
      description: `La lección "${currentLesson.title}" ha sido movida hacia abajo.`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lecciones</h1>
          <p className="text-muted-foreground">
            Gestione el contenido de las lecciones para los cursos
          </p>
        </div>
        <Button onClick={handleAddLesson}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Lección
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
                  placeholder="Buscar lecciones..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cursos</SelectItem>
                  {mockCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="interactive">Interactivo</SelectItem>
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

      {/* Tabla de lecciones */}
      <Card>
        <CardHeader>
          <CardTitle>Lecciones</CardTitle>
          <CardDescription>
            Lista de todas las lecciones de la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLessons
                .sort((a, b) => {
                  // Primero ordenar por curso
                  if (a.courseId !== b.courseId) {
                    return a.courseId.localeCompare(b.courseId);
                  }
                  // Luego por orden dentro del curso
                  return a.order - b.order;
                })
                .map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>
                    <div className="font-medium max-w-sm truncate">
                      {lesson.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {lesson.courseName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lesson.lessonType === "text" ? (
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Texto</span>
                      </div>
                    ) : lesson.lessonType === "video" ? (
                      <div className="flex items-center">
                        <FileVideo className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Video</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Book className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Interactivo</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{lesson.duration}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveUp(lesson.id)}
                        className="h-8 w-8"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <span className="mx-2">{lesson.order}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveDown(lesson.id)}
                        className="h-8 w-8"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lesson.published ? (
                      <Badge className="bg-green-50 text-green-700 hover:bg-green-50">
                        Publicado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                        Borrador
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{lesson.updatedAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditLesson(lesson)}
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
                            onClick={() => setLessonToDelete(lesson)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Está seguro de eliminar esta lección?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente la lección "{lesson.title}" y
                              todo su contenido. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setLessonToDelete(null)}>
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteLesson}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLessons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No se encontraron lecciones
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal para añadir/editar lección */}
      <Dialog
        open={isAddingLesson || isEditingLesson}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingLesson(false);
            setIsEditingLesson(false);
            setCurrentLesson(null);
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {isEditingLesson ? "Editar Lección" : "Nueva Lección"}
            </DialogTitle>
            <DialogDescription>
              {isEditingLesson
                ? "Edite los detalles de la lección existente"
                : "Complete los detalles para crear una nueva lección"}
            </DialogDescription>
          </DialogHeader>
          <Form {...lessonForm}>
            <form
              onSubmit={lessonForm.handleSubmit(onSubmitLesson)}
              className="space-y-6"
            >
              <FormField
                control={lessonForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título de la Lección</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Introducción a la Manipulación de Alimentos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={lessonForm.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Curso</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un curso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={lessonForm.control}
                  name="lessonType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Lección</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="interactive">Interactivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={lessonForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 15 minutos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={lessonForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orden</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Posición de la lección en el curso
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={lessonForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contenido de la lección..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={lessonForm.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Video (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://ejemplo.com/videos/leccion.mp4"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Para lecciones de tipo video
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={lessonForm.control}
                name="attachments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Archivos Adjuntos (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nombre de los archivos separados por comas"
                        className="min-h-16"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Ej: Manual básico.pdf, Checklist de higiene.pdf
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={lessonForm.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publicar Lección</FormLabel>
                      <FormDescription>
                        Establecer la lección como publicada la hará visible para los usuarios
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
                    setIsAddingLesson(false);
                    setIsEditingLesson(false);
                    setCurrentLesson(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditingLesson ? "Actualizar Lección" : "Crear Lección"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LessonsPage() {
  return <Lessons />;
}