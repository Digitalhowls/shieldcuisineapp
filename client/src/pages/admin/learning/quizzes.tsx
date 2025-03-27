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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileQuestion,
  BookOpen,
  Clock,
  Award,
  BarChart,
  Pencil,
  Copy,
} from "lucide-react";

// Esquema para las preguntas
const questionSchema = z.object({
  question: z.string().min(5, {
    message: "La pregunta debe tener al menos 5 caracteres.",
  }),
  options: z.array(
    z.object({
      text: z.string().min(1, {
        message: "La opción debe tener al menos 1 caracter.",
      }),
      isCorrect: z.boolean().default(false),
    })
  ).min(2, {
    message: "Debe haber al menos 2 opciones.",
  }),
  explanation: z.string().optional(),
});

// Esquema para validación del formulario de cuestionario
const quizFormSchema = z.object({
  title: z.string().min(3, {
    message: "El título debe tener al menos 3 caracteres.",
  }),
  description: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  courseId: z.string({
    required_error: "El curso es requerido.",
  }),
  passingScore: z.number(),
  timeLimit: z.string().optional(),
  isRequired: z.boolean().default(true),
  published: z.boolean().default(false),
  questions: z.array(questionSchema).min(1, {
    message: "Debe haber al menos 1 pregunta.",
  }),
});

// Tipo para curso (simplificado)
type Course = {
  id: string;
  title: string;
};

// Tipo para las opciones de respuesta
type QuizOption = {
  text: string;
  isCorrect: boolean;
};

// Tipo para las preguntas
type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  explanation?: string;
};

// Tipo para cuestionarios
type Quiz = {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  passingScore: number;
  timeLimit?: string;
  isRequired: boolean;
  published: boolean;
  questions: QuizQuestion[];
  attempts: number;
  avgScore: number;
  createdAt: string;
  updatedAt: string;
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

// Datos de ejemplo para cuestionarios
const mockQuizzes: Quiz[] = [
  {
    id: "quiz-1",
    title: "Evaluación Final: Manipulación de Alimentos",
    description: "Cuestionario final sobre los principios básicos de la manipulación higiénica de alimentos.",
    courseId: "course-1",
    courseName: "Manipulación Higiénica de Alimentos",
    passingScore: 70,
    timeLimit: "30 minutos",
    isRequired: true,
    published: true,
    questions: [
      {
        id: "q1-1",
        question: "¿Cuál es la temperatura de seguridad para mantener alimentos calientes?",
        options: [
          { text: "Mayor a 65°C", isCorrect: true },
          { text: "Entre 5°C y 65°C", isCorrect: false },
          { text: "Menor a 5°C", isCorrect: false },
          { text: "Temperatura ambiente", isCorrect: false },
        ],
        explanation: "Los alimentos calientes deben mantenerse a temperaturas superiores a 65°C para evitar la proliferación de microorganismos.",
      },
      {
        id: "q1-2",
        question: "¿Cuál de los siguientes es un método correcto para descongelar alimentos?",
        options: [
          { text: "A temperatura ambiente", isCorrect: false },
          { text: "En el refrigerador", isCorrect: true },
          { text: "Con agua caliente", isCorrect: false },
          { text: "Bajo la luz solar", isCorrect: false },
        ],
        explanation: "La descongelación en refrigerador es segura porque mantiene el alimento a temperaturas que inhiben el crecimiento bacteriano.",
      },
      {
        id: "q1-3",
        question: "¿Cuándo debe lavarse las manos un manipulador de alimentos?",
        options: [
          { text: "Solo al inicio de la jornada", isCorrect: false },
          { text: "Solo después de ir al baño", isCorrect: false },
          { text: "Antes y después de manipular alimentos crudos", isCorrect: false },
          { text: "Todas las anteriores y después de tocar dinero o realizar cualquier actividad que pueda contaminar", isCorrect: true },
        ],
      },
    ],
    attempts: 124,
    avgScore: 78.5,
    createdAt: "2025-01-20",
    updatedAt: "2025-01-25",
  },
  {
    id: "quiz-2",
    title: "Test de Conocimientos: Principios APPCC",
    description: "Evaluación de conocimientos sobre los siete principios del sistema APPCC y su aplicación práctica.",
    courseId: "course-2",
    courseName: "Implementación del Sistema APPCC",
    passingScore: 80,
    timeLimit: "45 minutos",
    isRequired: true,
    published: true,
    questions: [
      {
        id: "q2-1",
        question: "¿Cuál es el primer principio del sistema APPCC?",
        options: [
          { text: "Establecer acciones correctivas", isCorrect: false },
          { text: "Realizar un análisis de peligros", isCorrect: true },
          { text: "Determinar los puntos críticos de control", isCorrect: false },
          { text: "Establecer procedimientos de verificación", isCorrect: false },
        ],
        explanation: "El primer principio del APPCC es realizar un análisis de peligros, identificando qué puede salir mal en cada etapa del proceso.",
      },
      {
        id: "q2-2",
        question: "¿Qué es un punto crítico de control (PCC)?",
        options: [
          { text: "Cualquier etapa del proceso de producción de alimentos", isCorrect: false },
          { text: "Una etapa en la que se puede aplicar control y que es esencial para prevenir, eliminar o reducir a niveles aceptables un peligro para la seguridad alimentaria", isCorrect: true },
          { text: "Un registro de temperaturas", isCorrect: false },
          { text: "Una medida correctiva cuando algo sale mal", isCorrect: false },
        ],
      },
    ],
    attempts: 86,
    avgScore: 75.2,
    createdAt: "2025-02-10",
    updatedAt: "2025-02-15",
  },
  {
    id: "quiz-3",
    title: "Evaluación: Identificación de Alérgenos",
    description: "Test para evaluar la capacidad de identificar y gestionar alérgenos en el entorno de la cocina.",
    courseId: "course-3",
    courseName: "Alérgenos en la Cocina",
    passingScore: 85,
    timeLimit: "20 minutos",
    isRequired: true,
    published: true,
    questions: [
      {
        id: "q3-1",
        question: "¿Cuáles de los siguientes alimentos contienen gluten?",
        options: [
          { text: "Arroz y maíz", isCorrect: false },
          { text: "Trigo y cebada", isCorrect: true },
          { text: "Patatas y zanahorias", isCorrect: false },
          { text: "Leche y huevos", isCorrect: false },
        ],
      },
      {
        id: "q3-2",
        question: "¿Qué medida es más efectiva para prevenir la contaminación cruzada con alérgenos?",
        options: [
          { text: "Usar los mismos utensilios para todos los alimentos", isCorrect: false },
          { text: "Separar físicamente la preparación de alimentos con alérgenos", isCorrect: true },
          { text: "Cocinar todos los alimentos a alta temperatura", isCorrect: false },
          { text: "No es necesario tomar medidas especiales", isCorrect: false },
        ],
        explanation: "La separación física durante la preparación es clave para evitar la transferencia de alérgenos entre diferentes alimentos.",
      },
    ],
    attempts: 78,
    avgScore: 88.7,
    createdAt: "2025-02-20",
    updatedAt: "2025-02-25",
  },
  {
    id: "quiz-4",
    title: "Borrador: Evaluación sobre Control de Plagas",
    description: "Cuestionario en desarrollo sobre métodos de prevención y control de plagas en establecimientos alimentarios.",
    courseId: "course-5",
    courseName: "Control de Plagas en Establecimientos de Alimentación",
    passingScore: 75,
    isRequired: true,
    published: false,
    questions: [
      {
        id: "q4-1",
        question: "¿Cuál es el primer paso en un programa efectivo de control de plagas?",
        options: [
          { text: "Aplicación de insecticidas", isCorrect: false },
          { text: "Inspección y diagnóstico", isCorrect: true },
          { text: "Contratar un servicio profesional", isCorrect: false },
          { text: "Cerrar temporalmente el establecimiento", isCorrect: false },
        ],
      },
    ],
    attempts: 0,
    avgScore: 0,
    createdAt: "2025-03-10",
    updatedAt: "2025-03-10",
  },
];

export default function QuizzesPage() {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);

  // Formulario de cuestionario
  const quizForm = useForm<z.infer<typeof quizFormSchema>>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: "",
      description: "",
      courseId: "",
      passingScore: 70,
      timeLimit: "",
      isRequired: true,
      published: false,
      questions: [
        {
          question: "",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
          explanation: "",
        },
      ],
    },
  });

  // Field array para manejar preguntas dinámicamente
  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: quizForm.control,
    name: "questions",
  });

  // Filtrar cuestionarios
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = courseFilter === "all" || quiz.courseId === courseFilter;
    const matchesPublished =
      publishedFilter === "all" ||
      (publishedFilter === "published" && quiz.published) ||
      (publishedFilter === "draft" && !quiz.published);
    
    return matchesSearch && matchesCourse && matchesPublished;
  });

  // Función para editar un cuestionario
  const handleEditQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    
    // Preparar datos para el formulario
    const formattedQuestions = quiz.questions.map(q => ({
      question: q.question,
      options: q.options,
      explanation: q.explanation || "",
    }));
    
    quizForm.reset({
      title: quiz.title,
      description: quiz.description,
      courseId: quiz.courseId,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit || "",
      isRequired: quiz.isRequired,
      published: quiz.published,
      questions: formattedQuestions,
    });
    
    setIsEditingQuiz(true);
  };

  // Función para duplicar un cuestionario
  const handleDuplicateQuiz = (quiz: Quiz) => {
    const newQuiz: Quiz = {
      ...quiz,
      id: `quiz-${quizzes.length + 1}`,
      title: `Copia de ${quiz.title}`,
      published: false,
      attempts: 0,
      avgScore: 0,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    
    setQuizzes([...quizzes, newQuiz]);
    
    toast({
      title: "Cuestionario duplicado",
      description: `Se ha creado una copia de "${quiz.title}".`,
    });
  };

  // Función para guardar un cuestionario (nuevo o editado)
  const onSubmitQuiz = (values: z.infer<typeof quizFormSchema>) => {
    const courseName = mockCourses.find(course => course.id === values.courseId)?.title || "";
    
    // Generar IDs para las preguntas
    const questionsWithIds = values.questions.map((q, index) => ({
      id: currentQuiz 
        ? currentQuiz.questions[index]?.id || `q${quizzes.length + 1}-${index + 1}`
        : `q${quizzes.length + 1}-${index + 1}`,
      question: q.question,
      options: q.options,
      explanation: q.explanation,
    }));
    
    if (currentQuiz) {
      // Actualizar cuestionario existente
      const updatedQuizzes = quizzes.map((quiz) =>
        quiz.id === currentQuiz.id
          ? {
              ...quiz,
              title: values.title,
              description: values.description,
              courseId: values.courseId,
              courseName,
              passingScore: values.passingScore,
              timeLimit: values.timeLimit,
              isRequired: values.isRequired,
              published: values.published,
              questions: questionsWithIds,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : quiz
      );
      setQuizzes(updatedQuizzes);
      toast({
        title: "Cuestionario actualizado",
        description: `El cuestionario "${values.title}" ha sido actualizado correctamente.`,
      });
    } else {
      // Crear nuevo cuestionario
      const newQuiz: Quiz = {
        id: `quiz-${quizzes.length + 1}`,
        title: values.title,
        description: values.description,
        courseId: values.courseId,
        courseName,
        passingScore: values.passingScore,
        timeLimit: values.timeLimit,
        isRequired: values.isRequired,
        published: values.published,
        questions: questionsWithIds,
        attempts: 0,
        avgScore: 0,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setQuizzes([...quizzes, newQuiz]);
      toast({
        title: "Cuestionario creado",
        description: `El cuestionario "${values.title}" ha sido creado correctamente.`,
      });
    }
    quizForm.reset();
    setIsAddingQuiz(false);
    setIsEditingQuiz(false);
    setCurrentQuiz(null);
  };

  // Función para eliminar un cuestionario
  const handleDeleteQuiz = () => {
    if (quizToDelete) {
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizToDelete.id));
      toast({
        title: "Cuestionario eliminado",
        description: `El cuestionario "${quizToDelete.title}" ha sido eliminado correctamente.`,
        variant: "destructive",
      });
      setQuizToDelete(null);
    }
  };

  // Función para abrir el formulario de nuevo cuestionario
  const handleAddQuiz = () => {
    quizForm.reset({
      title: "",
      description: "",
      courseId: "",
      passingScore: 70,
      timeLimit: "",
      isRequired: true,
      published: false,
      questions: [
        {
          question: "",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
          explanation: "",
        },
      ],
    });
    setCurrentQuiz(null);
    setIsAddingQuiz(true);
  };

  // Función para añadir una nueva pregunta al formulario
  const handleAddQuestion = () => {
    appendQuestion({
      question: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      explanation: "",
    });
  };

  // Función para añadir una nueva opción a una pregunta
  const handleAddOption = (questionIndex: number) => {
    const currentOptions = quizForm.getValues(`questions.${questionIndex}.options`);
    quizForm.setValue(`questions.${questionIndex}.options`, [
      ...currentOptions,
      { text: "", isCorrect: false },
    ]);
  };

  // Función para eliminar una opción de una pregunta
  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = quizForm.getValues(`questions.${questionIndex}.options`);
    if (currentOptions.length <= 2) {
      toast({
        title: "Error",
        description: "Debe haber al menos 2 opciones por pregunta.",
        variant: "destructive",
      });
      return;
    }
    const newOptions = [...currentOptions];
    newOptions.splice(optionIndex, 1);
    quizForm.setValue(`questions.${questionIndex}.options`, newOptions);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cuestionarios</h1>
          <p className="text-muted-foreground">
            Gestione los cuestionarios y evaluaciones de los cursos
          </p>
        </div>
        <Button onClick={handleAddQuiz}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cuestionario
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar cuestionarios..."
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

      {/* Lista de cuestionarios */}
      <div className="space-y-4">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className={expandedQuiz === quiz.id ? "ring-2 ring-primary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    <FileQuestion className="h-5 w-5 mr-2 text-primary" />
                    {quiz.title}
                    {!quiz.published && (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100"
                      >
                        Borrador
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">{quiz.description}</CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditQuiz(quiz)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicateQuiz(quiz)}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Duplicar</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setQuizToDelete(quiz)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Está seguro de eliminar este cuestionario?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará permanentemente el cuestionario "{quiz.title}" y
                          todas sus preguntas. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setQuizToDelete(null)}>
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteQuiz}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{quiz.courseName}</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Puntuación mínima: {quiz.passingScore}%</span>
                </div>
                {quiz.timeLimit && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Tiempo: {quiz.timeLimit}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <FileQuestion className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{quiz.questions.length} preguntas</span>
                </div>
              </div>
              
              {quiz.published && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm font-medium">Intentos</span>
                      </div>
                      <span className="font-bold">{quiz.attempts}</span>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <BarChart className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm font-medium">Puntuación media</span>
                      </div>
                      <span className="font-bold">{quiz.avgScore.toFixed(1)}%</span>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="text-xs text-muted-foreground">
                Actualizado: {quiz.updatedAt}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
              >
                {expandedQuiz === quiz.id ? "Ocultar preguntas" : "Ver preguntas"}
              </Button>
            </CardFooter>
            
            {/* Preguntas expandidas */}
            {expandedQuiz === quiz.id && (
              <div className="px-6 pb-6">
                <Accordion type="single" collapsible className="w-full">
                  {quiz.questions.map((question, index) => (
                    <AccordionItem key={question.id} value={question.id}>
                      <AccordionTrigger className="text-left">
                        <span className="font-medium">
                          {index + 1}. {question.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-6">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`flex items-start p-2 rounded ${
                                option.isCorrect
                                  ? "bg-green-50 border border-green-200"
                                  : "bg-muted/50"
                              }`}
                            >
                              {option.isCorrect ? (
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                              )}
                              <span>{option.text}</span>
                            </div>
                          ))}
                          
                          {question.explanation && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-sm font-medium text-blue-800">Explicación:</p>
                              <p className="text-sm text-blue-700">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </Card>
        ))}
        
        {filteredQuizzes.length === 0 && (
          <div className="text-center py-10">
            <div className="text-muted-foreground">No se encontraron cuestionarios</div>
          </div>
        )}
      </div>

      {/* Modal para añadir/editar cuestionario */}
      <Dialog
        open={isAddingQuiz || isEditingQuiz}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingQuiz(false);
            setIsEditingQuiz(false);
            setCurrentQuiz(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditingQuiz ? "Editar Cuestionario" : "Nuevo Cuestionario"}
            </DialogTitle>
            <DialogDescription>
              {isEditingQuiz
                ? "Edite los detalles del cuestionario existente"
                : "Complete los detalles para crear un nuevo cuestionario"}
            </DialogDescription>
          </DialogHeader>
          <Form {...quizForm}>
            <form
              onSubmit={quizForm.handleSubmit(onSubmitQuiz)}
              className="space-y-6"
            >
              <FormField
                control={quizForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del Cuestionario</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Evaluación Final: Manipulación de Alimentos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={quizForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describa el contenido y objetivo del cuestionario..."
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={quizForm.control}
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

                <FormField
                  control={quizForm.control}
                  name="passingScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puntuación mínima (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="100" {...field} />
                      </FormControl>
                      <FormDescription>
                        Porcentaje mínimo para aprobar
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={quizForm.control}
                  name="timeLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiempo límite (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 30 minutos" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        Tiempo máximo para completar el cuestionario
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={quizForm.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Obligatorio</FormLabel>
                        <FormDescription>
                          Es necesario aprobar este cuestionario para completar el curso
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

                <FormField
                  control={quizForm.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Publicar Cuestionario</FormLabel>
                        <FormDescription>
                          Establecer el cuestionario como publicado lo hará visible para los usuarios
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
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Preguntas</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddQuestion}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Pregunta
                  </Button>
                </div>

                {questionFields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Pregunta {index + 1}</CardTitle>
                        {questionFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeQuestion(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar pregunta</span>
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={quizForm.control}
                        name={`questions.${index}.question`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texto de la pregunta</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: ¿Cuál es la temperatura de seguridad para mantener alimentos calientes?"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <FormLabel>Opciones de respuesta</FormLabel>
                        <FormDescription className="mb-2">
                          Marque la casilla junto a la(s) respuesta(s) correcta(s)
                        </FormDescription>
                        
                        {quizForm.getValues(`questions.${index}.options`).map((_, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2 mb-2">
                            <FormField
                              control={quizForm.control}
                              name={`questions.${index}.options.${optionIndex}.isCorrect`}
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={quizForm.control}
                              name={`questions.${index}.options.${optionIndex}.text`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      placeholder={`Opción ${optionIndex + 1}`}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleRemoveOption(index, optionIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleAddOption(index)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir Opción
                        </Button>
                      </div>

                      <FormField
                        control={quizForm.control}
                        name={`questions.${index}.explanation`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Explicación (opcional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Explicación de la respuesta correcta..."
                                className="min-h-20"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Esta explicación se mostrará después de responder la pregunta
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingQuiz(false);
                    setIsEditingQuiz(false);
                    setCurrentQuiz(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditingQuiz ? "Actualizar Cuestionario" : "Crear Cuestionario"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function QuizzesPage() {
  return <Quizzes />;
}