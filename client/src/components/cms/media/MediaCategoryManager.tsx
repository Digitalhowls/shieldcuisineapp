import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";

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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  FolderTree,
  Plus,
  Trash2,
  Edit,
  Folder,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";

// Definir los tipos
interface MediaCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  children?: MediaCategory[];
}

// Esquema de validación para el formulario
const categorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  parentId: z.number().nullable(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryTreeProps {
  categories: MediaCategory[];
  onEdit: (category: MediaCategory) => void;
  onDelete: (categoryId: number) => void;
  level?: number;
}

// Componente para mostrar la estructura de árbol de categorías
const CategoryTree: React.FC<CategoryTreeProps> = ({ 
  categories, 
  onEdit, 
  onDelete, 
  level = 0 
}) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <ul className={`pl-${level > 0 ? 4 : 0} space-y-1`}>
      {categories.map((category) => (
        <li key={category.id} className="py-1">
          <div className="flex items-center justify-between group">
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground mr-1" />
              <Folder className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm">{category.name}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(category)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive" 
                  onClick={() => onDelete(category.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {category.children && category.children.length > 0 && (
            <CategoryTree
              categories={category.children}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

// Componente principal para gestionar categorías
const MediaCategoryManager: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Formulario
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: null,
    },
  });

  // Obtener categorías
  const {
    data: categories,
    isLoading,
    error,
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

  // Mutación para crear categoría
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const categoryData = {
        ...data,
        slug: slugify(data.name),
        companyId: user?.companyId,
      };
      return apiRequest("POST", "/api/cms/media/categories", categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media/categories"] });
      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada correctamente",
      });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la categoría: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar categoría
  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues & { id: number }) => {
      const { id, ...categoryData } = data;
      const updatedData = {
        ...categoryData,
        slug: slugify(categoryData.name),
      };
      return apiRequest("PUT", `/api/cms/media/categories/${id}`, updatedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media/categories"] });
      toast({
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada correctamente",
      });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la categoría: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar categoría
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
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la categoría: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Funciones para gestionar el diálogo
  const openDialog = (category?: MediaCategory) => {
    if (category) {
      setSelectedCategory(category);
      form.reset({
        name: category.name,
        description: category.description || "",
        parentId: category.parentId,
      });
    } else {
      setSelectedCategory(null);
      form.reset({
        name: "",
        description: "",
        parentId: null,
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCategory(null);
    form.reset();
  };

  // Función para manejar la eliminación
  const handleDeleteClick = (categoryId: number) => {
    const category = findCategoryById(categories || [], categoryId);
    if (category) {
      setSelectedCategory(category);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteCategoryMutation.mutate(selectedCategory.id);
    }
  };

  // Función para buscar una categoría por ID
  const findCategoryById = (categoriesList: MediaCategory[], id: number): MediaCategory | null => {
    for (const category of categoriesList) {
      if (category.id === id) {
        return category;
      }
      if (category.children?.length) {
        const found = findCategoryById(category.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Función para aplanar la estructura de árbol para la selección en el formulario
  const flattenCategories = (categoriesList: MediaCategory[], parentPath = "", result: { id: number; name: string; path: string }[] = []) => {
    for (const category of categoriesList) {
      const path = parentPath ? `${parentPath} > ${category.name}` : category.name;
      result.push({
        id: category.id,
        name: category.name,
        path,
      });
      if (category.children?.length) {
        flattenCategories(category.children, path, result);
      }
    }
    return result;
  };

  // Organizar categorías en estructura de árbol
  const organizeCategories = (categoriesList: MediaCategory[]): MediaCategory[] => {
    const categoryMap: Record<number, MediaCategory> = {};
    const result: MediaCategory[] = [];

    // Crear un mapa para un acceso rápido
    categoriesList.forEach(category => {
      categoryMap[category.id] = { ...category, children: [] };
    });

    // Organizar en estructura jerárquica
    categoriesList.forEach(category => {
      if (category.parentId === null) {
        result.push(categoryMap[category.id]);
      } else if (categoryMap[category.parentId]) {
        if (!categoryMap[category.parentId].children) {
          categoryMap[category.parentId].children = [];
        }
        categoryMap[category.parentId].children?.push(categoryMap[category.id]);
      } else {
        // Si el padre no existe, añadir a nivel superior
        result.push(categoryMap[category.id]);
      }
    });

    return result;
  };

  const onSubmit = (data: CategoryFormValues) => {
    if (selectedCategory) {
      updateCategoryMutation.mutate({ ...data, id: selectedCategory.id });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-60" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center py-2">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-60" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar estado de error
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No se pudieron cargar las categorías. Por favor, inténtelo de nuevo.</p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cms/media/categories"] })}
          >
            Reintentar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const organizedCategories = categories ? organizeCategories(categories) : [];
  const flatCategories = categories ? flattenCategories(organizedCategories) : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Categorías de Medios</h3>
        <Button onClick={() => openDialog()} className="gap-1">
          <Plus size={16} />
          <span>Nueva Categoría</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderTree size={16} className="text-primary" />
            <CardTitle className="text-base">Estructura de Categorías</CardTitle>
          </div>
          <CardDescription>
            Organiza tus archivos multimedia en categorías
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organizedCategories.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p>No hay categorías definidas.</p>
              <p className="text-sm">Crea una nueva categoría para empezar a organizar tus archivos.</p>
            </div>
          ) : (
            <div className="border rounded-md p-4">
              <CategoryTree
                categories={organizedCategories}
                onEdit={openDialog}
                onDelete={handleDeleteClick}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de creación/edición de categoría */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Editar Categoría" : "Nueva Categoría"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "Modifica los detalles de la categoría existente"
                : "Crea una nueva categoría para organizar tus archivos multimedia"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      Este nombre se mostrará en la biblioteca de medios
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
                        placeholder="Descripción (opcional)"
                        className="resize-none"
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
                    <FormLabel>Categoría Padre</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin categoría padre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sin categoría padre</SelectItem>
                        {flatCategories
                          .filter(cat => !selectedCategory || cat.id !== selectedCategory.id)
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.path}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecciona una categoría padre para crear una jerarquía
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <span>Guardando...</span>
                  ) : selectedCategory ? (
                    "Actualizar"
                  ) : (
                    "Crear"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la categoría "<strong>{selectedCategory?.name}</strong>"?
              {selectedCategory?.children && selectedCategory.children.length > 0 && (
                <p className="text-destructive mt-2">
                  ¡Atención! Esta categoría tiene subcategorías que también se eliminarán.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaCategoryManager;