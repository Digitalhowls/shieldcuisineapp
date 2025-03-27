import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  FolderPlus, 
  Folder, 
  Edit, 
  Trash2, 
  FolderTree, 
  RefreshCcw,
  ChevronRight,
  ChevronDown,
  FilePlus2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Definir tipos
interface MediaCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  parent?: MediaCategory;
  children?: MediaCategory[];
  mediaCount?: number;
}

// Esquema de validación para formulario de categoría
const categorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre debe tener máximo 50 caracteres"),
  slug: z.string().min(2, "El slug debe tener al menos 2 caracteres").max(50, "El slug debe tener máximo 50 caracteres")
    .regex(/^[a-z0-9-]+$/, "El slug solo puede contener letras minúsculas, números y guiones")
    .optional(),
  description: z.string().max(500, "La descripción debe tener máximo 500 caracteres").optional().nullable(),
  parentId: z.number().optional().nullable(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

// Componente principal para gestión de categorías de medios
const MediaCategoryManager: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MediaCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  // Query para obtener categorías
  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
  } = useQuery<MediaCategory[]>({
    queryKey: ["/api/cms/media/categories"],
    queryFn: async () => {
      if (!user?.companyId) {
        return [];
      }
      const response = await fetch(`/api/cms/media/categories?companyId=${user.companyId}`);
      if (!response.ok) {
        throw new Error("Error al cargar las categorías");
      }
      return response.json();
    },
  });

  // Formulario para crear/editar categoría
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: null,
    },
  });

  // Mutaciones para CRUD de categorías
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      return apiRequest("POST", "/api/cms/media/categories", {
        ...data,
        companyId: user?.companyId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media/categories"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la categoría: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues & { id: number }) => {
      const { id, ...updates } = data;
      return apiRequest("PUT", `/api/cms/media/categories/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media/categories"] });
      setIsDialogOpen(false);
      setEditingCategory(null);
      form.reset();
      toast({
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la categoría: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/cms/media/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media/categories"] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la categoría: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Funciones auxiliares
  const openCreateDialog = () => {
    setEditingCategory(null);
    form.reset({
      name: "",
      slug: "",
      description: "",
      parentId: null,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: MediaCategory) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (id: number) => {
    // Verificar si la categoría tiene elementos o subcategorías
    const category = categories.find(c => c.id === id);
    const hasChildren = categories.some(c => c.parentId === id);
    
    if (hasChildren) {
      toast({
        title: "No se puede eliminar",
        description: "Esta categoría contiene subcategorías. Elimina primero las subcategorías.",
        variant: "destructive",
      });
      return;
    }

    if (category?.mediaCount && category.mediaCount > 0) {
      toast({
        title: "Advertencia",
        description: "Esta categoría contiene archivos multimedia. Al eliminarla, los archivos quedarán sin categoría.",
        variant: "destructive",
      });
    }

    if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleFormSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ ...data, id: editingCategory.id });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Función para organizar las categorías en una estructura jerárquica
  const organizeCategories = (cats: MediaCategory[]): MediaCategory[] => {
    const rootCategories: MediaCategory[] = [];
    const categoriesMap: Record<number, MediaCategory> = {};
    
    // Primero, mapear todas las categorías por ID
    cats.forEach(cat => {
      categoriesMap[cat.id] = { ...cat, children: [] };
    });
    
    // Luego, construir la jerarquía
    cats.forEach(cat => {
      if (cat.parentId === null) {
        rootCategories.push(categoriesMap[cat.id]);
      } else if (categoriesMap[cat.parentId]) {
        if (!categoriesMap[cat.parentId].children) {
          categoriesMap[cat.parentId].children = [];
        }
        categoriesMap[cat.parentId].children?.push(categoriesMap[cat.id]);
      }
    });
    
    return rootCategories;
  };

  // Renderizar categorías en la tabla
  const renderCategoryRows = (
    categories: MediaCategory[],
    level = 0,
    parentIdPath: number[] = []
  ) => {
    return categories.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = !!expandedCategories[category.id];
      const currentIdPath = [...parentIdPath, category.id];
      
      return (
        <React.Fragment key={category.id}>
          <TableRow>
            <TableCell>
              <div 
                className="flex items-center"
                style={{ paddingLeft: `${level * 20}px` }}
              >
                {hasChildren ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 mr-1"
                    onClick={() => toggleCategoryExpand(category.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <span className="w-7"></span>
                )}
                <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{category.name}</span>
              </div>
            </TableCell>
            <TableCell>{category.slug}</TableCell>
            <TableCell>
              {category.description ? (
                <span className="truncate max-w-[200px] block">
                  {category.description}
                </span>
              ) : (
                <span className="text-muted-foreground italic text-sm">
                  Sin descripción
                </span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {category.mediaCount || 0} archivos
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
          
          {isExpanded && hasChildren && category.children && (
            renderCategoryRows(category.children, level + 1, currentIdPath)
          )}
        </React.Fragment>
      );
    });
  };

  // Renderizar opciones de categorías para el selector de padre
  const renderCategoryOptions = (
    categories: MediaCategory[],
    level = 0,
    parentIdPath: number[] = []
  ): React.ReactNode => {
    return categories.map((category) => {
      const currentIdPath = [...parentIdPath, category.id];
      
      // Si estamos en modo edición, no permitir seleccionar como padre
      // la misma categoría o sus descendientes
      if (
        editingCategory &&
        (category.id === editingCategory.id || currentIdPath.includes(editingCategory.id))
      ) {
        return null;
      }
      
      return (
        <React.Fragment key={category.id}>
          <SelectItem value={category.id.toString()} disabled={false}>
            {"—".repeat(level)} {category.name}
          </SelectItem>
          
          {category.children && category.children.length > 0 && (
            renderCategoryOptions(category.children, level + 1, currentIdPath)
          )}
        </React.Fragment>
      );
    });
  };

  // Generar slug automáticamente a partir del nombre
  const generateSlug = (name: string) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .replace(/\s+/g, "-") // Reemplazar espacios por guiones
      .replace(/[^\w\-]+/g, "") // Eliminar caracteres especiales
      .replace(/\-\-+/g, "-") // Reemplazar múltiples guiones por uno solo
      .replace(/^-+/, "") // Eliminar guiones del inicio
      .replace(/-+$/, ""); // Eliminar guiones del final
  };

  // Auto-generar slug al cambiar el nombre si el slug no ha sido editado manualmente
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name") {
        const currentSlug = form.getValues("slug");
        if (!currentSlug || currentSlug === generateSlug(form.getValues("name") || "")) {
          form.setValue("slug", generateSlug(value.name || ""));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-48" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-56" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  // Renderizar estado de error
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>
            No se pudieron cargar las categorías de medios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            Se produjo un error al cargar las categorías. Por favor, inténtelo de nuevo.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCcw size={16} />
            <span>Reintentar</span>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Organizar categorías en estructura jerárquica
  const organizedCategories = organizeCategories(categories);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Categorías de Medios</CardTitle>
            <CardDescription>
              Organiza tu biblioteca de medios en categorías jerárquicas
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <FolderPlus size={16} />
            <span>Nueva Categoría</span>
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-md">
              <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                No hay categorías creadas
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Crea categorías para organizar tus archivos multimedia
              </p>
              <Button onClick={openCreateDialog} className="gap-2">
                <FolderPlus size={16} />
                <span>Nueva Categoría</span>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Archivos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderCategoryRows(organizedCategories)}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Modifica los datos de la categoría"
                : "Crea una nueva categoría para organizar tus archivos multimedia"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la categoría" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nombre visible para la categoría
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="slug-de-la-categoria" {...field} />
                    </FormControl>
                    <FormDescription>
                      Identificador único para la categoría (se genera automáticamente)
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
                    <FormLabel>Descripción (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe brevemente esta categoría"
                        className="resize-y"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría padre (opcional)</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value ? parseInt(value) : null)
                      }
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría padre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sin categoría padre</SelectItem>
                        {renderCategoryOptions(organizedCategories)}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Opcionalmente, esta categoría puede ser una subcategoría
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="gap-2">
                  {editingCategory ? (
                    <>
                      <Edit size={16} />
                      <span>Actualizar Categoría</span>
                    </>
                  ) : (
                    <>
                      <FilePlus2 size={16} />
                      <span>Crear Categoría</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaCategoryManager;