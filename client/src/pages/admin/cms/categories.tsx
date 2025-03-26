import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MoreVertical,
  Plus,
  Trash2,
  Pencil,
  Eye,
  FolderTree,
  Search,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

// Tipos para categorías
interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentId?: number;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

// Esquema de validación
const categorySchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  slug: z.string().min(2, { message: "El slug debe tener al menos 2 caracteres" }),
  description: z.string().optional(),
  parentId: z.number().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

// Modos del diálogo
type DialogMode = "create" | "edit" | "delete" | null;

export default function AdminCMSCategoriesPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Formulario para categorías
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: undefined,
    },
  });

  // Obtener categorías
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/cms/categories"],
    queryFn: async () => {
      if (!user?.companyId) {
        return [];
      }
      const response = await fetch(`/api/cms/categories?companyId=${user.companyId}`);
      if (!response.ok) {
        throw new Error("Error al cargar las categorías");
      }
      return response.json();
    },
  });

  // Mutación para crear categoría
  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const response = await apiRequest("POST", "/api/cms/categories", {
        ...data,
        companyId: user?.companyId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/categories"] });
      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada correctamente",
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la categoría",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar categoría
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryFormValues }) => {
      const response = await apiRequest("PUT", `/api/cms/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/categories"] });
      toast({
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada correctamente",
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría",
        variant: "destructive",
      });
    },
  });

  // Mutación para eliminar categoría
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cms/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/categories"] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente",
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      });
    },
  });

  // Función para abrir el diálogo en diferentes modos
  const openDialog = (mode: DialogMode, category?: Category) => {
    setDialogMode(mode);
    
    if (category) {
      setSelectedCategory(category);
      
      if (mode === "edit") {
        form.reset({
          name: category.name,
          slug: category.slug,
          description: category.description,
          parentId: category.parentId,
        });
      }
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
        parentId: undefined,
      });
    }
  };

  // Función para cerrar el diálogo
  const closeDialog = () => {
    setDialogMode(null);
    setSelectedCategory(null);
    form.reset();
  };

  // Función para manejar el envío del formulario
  const onSubmit = (data: CategoryFormValues) => {
    if (dialogMode === "create") {
      createMutation.mutate(data);
    } else if (dialogMode === "edit" && selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data });
    }
  };

  // Generar slug a partir del nombre
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };

  // Filtrar categorías por búsqueda
  const filteredCategories = categories?.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Obtener categoría padre
  const getParentCategory = (parentId?: number) => {
    if (!parentId || !categories) return "—";
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : "—";
  };

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-6 w-3/4 mt-2" />
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
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
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/cms/categories"] })}
            >
              Reintentar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
        <p className="text-muted-foreground mt-2">
          Organiza tu contenido en categorías para una mejor navegación
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar categorías..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button className="gap-2" onClick={() => openDialog("create")}>
          <Plus size={16} />
          <span>Nueva Categoría</span>
        </Button>
      </div>

      {!filteredCategories || filteredCategories.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <div className="flex flex-col items-center space-y-3">
              <FolderTree className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No hay categorías todavía</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "No se encontraron resultados para tu búsqueda." 
                  : "Crea tu primera categoría para organizar tu contenido."}
              </p>
              <Button className="mt-4" onClick={() => openDialog("create")}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva categoría
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableCaption>Lista de categorías del sitio web</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Categoría Padre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>{getParentCategory(category.parentId)}</TableCell>
                  <TableCell className="truncate max-w-md" title={category.description}>
                    {category.description || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openDialog("edit", category)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => openDialog("delete", category)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Diálogo para crear/editar categorías */}
      <Dialog open={dialogMode === "create" || dialogMode === "edit"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Crear Categoría" : "Editar Categoría"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Completa el formulario para crear una nueva categoría."
                : "Modifica los detalles de la categoría seleccionada."}
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
                      <Input 
                        placeholder="Nombre de la categoría" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          // Auto-generar slug solo si es una nueva categoría o si el slug no ha sido modificado manualmente
                          if (dialogMode === "create" || (
                            selectedCategory && selectedCategory.slug === form.getValues("slug")
                          )) {
                            form.setValue("slug", generateSlug(e.target.value));
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="slug-de-la-categoria" 
                        {...field} 
                      />
                    </FormControl>
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
              
              {categories && categories.length > 0 && (
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Categoría Padre (opcional)</FormLabel>
                      <div className="space-y-2">
                        {categories
                          .filter(cat => !selectedCategory || cat.id !== selectedCategory.id)
                          .map((category) => (
                            <FormItem
                              key={category.id}
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value === category.id}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange(category.id);
                                    } else {
                                      field.onChange(undefined);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {category.name}
                              </FormLabel>
                            </FormItem>
                          ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    "Guardando..."
                  ) : dialogMode === "create" ? (
                    "Crear"
                  ) : (
                    "Actualizar"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={dialogMode === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Categoría</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCategory && (
            <div className="py-4">
              <p className="font-medium">{selectedCategory.name}</p>
              <p className="text-sm text-muted-foreground">{selectedCategory.description || "Sin descripción"}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => selectedCategory && deleteMutation.mutate(selectedCategory.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}