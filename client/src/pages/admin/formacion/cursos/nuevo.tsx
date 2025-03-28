import React from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { courseLevelEnum } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Book, Check, Clock, Code, CreditCard, Image, Trash } from 'lucide-react';

// Esquema de validación del formulario
const formSchema = z.object({
  title: z.string().min(3, { message: 'El título debe tener al menos 3 caracteres' }).max(100),
  description: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres' }).max(500),
  level: z.enum(courseLevelEnum.options),
  category: z.string().min(2, { message: 'La categoría es obligatoria' }),
  price: z.number().min(0, { message: 'El precio debe ser un número positivo' }),
  duration: z.string().optional(),
  featuredImage: z.string().optional(),
  published: z.boolean().default(false),
});

// Tipo del formulario
type FormValues = z.infer<typeof formSchema>;

// Lista de categorías (esto podría venir de una API en el futuro)
const CATEGORIES = [
  { value: 'food-safety', label: 'Seguridad Alimentaria' },
  { value: 'haccp', label: 'HACCP y Control de Riesgos' },
  { value: 'hygiene', label: 'Higiene y Manipulación' },
  { value: 'nutrition', label: 'Nutrición' },
  { value: 'allergens', label: 'Gestión de Alérgenos' },
  { value: 'regulations', label: 'Normativas y Legislación' },
  { value: 'storage', label: 'Almacenamiento y Conservación' },
  { value: 'sustainability', label: 'Sostenibilidad' },
];

export default function NuevoCursoPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Configurar formulario con valores predeterminados
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      level: 'basic',
      category: 'food-safety',
      price: 0,
      duration: '2 semanas',
      featuredImage: '/uploads/courses/default.jpg',
      published: false,
    },
  });

  // Mutación para crear un nuevo curso
  const createCourseMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Convertir el precio a centavos para almacenarlo en la base de datos
      const courseData = {
        ...data,
        price: data.price * 100, // Convertir a centavos
      };
      
      const response = await apiRequest('POST', '/api/elearning/courses', courseData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el curso');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Mostrar notificación de éxito
      toast({
        title: "Curso creado con éxito",
        description: "El nuevo curso ha sido creado correctamente.",
        variant: "default",
      });
      
      // Invalidar consultas para refrescar la lista de cursos
      queryClient.invalidateQueries({ queryKey: ['/api/elearning/courses'] });
      
      // Redirigir al listado de cursos
      navigate('/admin/formacion');
    },
    onError: (error: Error) => {
      // Mostrar notificación de error
      toast({
        title: "Error al crear el curso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Manejar envío del formulario
  const onSubmit = (data: FormValues) => {
    createCourseMutation.mutate(data);
  };

  // Manejar cancelación
  const handleCancel = () => {
    navigate('/admin/formacion');
  };

  return (
    <div className="container max-w-screen-lg mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCancel}
          className="gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Curso</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="informacion" className="space-y-6">
            <TabsList className="mb-4">
              <TabsTrigger value="informacion" className="flex items-center gap-2">
                <Book className="w-4 h-4" />
                Información Básica
              </TabsTrigger>
              <TabsTrigger value="detalles" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Detalles Adicionales
              </TabsTrigger>
            </TabsList>

            {/* Pestaña de Información Básica */}
            <TabsContent value="informacion" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Curso</CardTitle>
                  <CardDescription>
                    Introduce la información principal del curso que estás creando.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del Curso</FormLabel>
                        <FormControl>
                          <Input placeholder="Introducción a la Seguridad Alimentaria" {...field} />
                        </FormControl>
                        <FormDescription>
                          El título debe ser descriptivo y atractivo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Breve descripción del curso..." 
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Describe brevemente el contenido y los objetivos del curso.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
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
                                <SelectValue placeholder="Selecciona un nivel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="basic">Básico</SelectItem>
                              <SelectItem value="intermediate">Intermedio</SelectItem>
                              <SelectItem value="advanced">Avanzado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Nivel de dificultad del curso.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
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
                                <SelectValue placeholder="Selecciona una categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Categoría principal del curso.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Publicar curso</FormLabel>
                          <FormDescription>
                            El curso estará visible para los estudiantes inmediatamente.
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pestaña de Detalles Adicionales */}
            <TabsContent value="detalles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detalles Adicionales</CardTitle>
                  <CardDescription>
                    Configura detalles adicionales para tu curso.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio (€)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                min={0}
                                step={0.01}
                                className="pl-10"
                                {...field}
                                value={field.value}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Deja en 0 para cursos gratuitos.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duración</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <Input 
                                placeholder="2 semanas" 
                                className="pl-10"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Tiempo estimado para completar el curso.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="featuredImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagen Destacada</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="relative">
                              <Image className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <Input 
                                placeholder="/uploads/courses/imagen.jpg" 
                                className="pl-10"
                                {...field} 
                              />
                            </div>
                            {field.value && (
                              <div className="relative w-full max-w-xl h-40 mt-2 border rounded-md overflow-hidden">
                                <img
                                  src={field.value}
                                  alt="Vista previa"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/uploads/courses/default.jpg";
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2"
                                  onClick={() => form.setValue('featuredImage', '')}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Imagen principal del curso. Usa el Media Manager para subir imágenes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={createCourseMutation.isPending}
              className="gap-2"
            >
              {createCourseMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Crear Curso
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}