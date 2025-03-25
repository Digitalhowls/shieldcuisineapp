import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  PlusCircle, 
  Edit, 
  Trash, 
  Search,
  Tag,
  Save,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  XCircle
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Tipos
interface CategoryRule {
  id: number;
  companyId: number;
  name: string;
  pattern: string;
  category: string;
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Esquema para la regla de categoría
const categoryRuleSchema = z.object({
  name: z.string().min(1, { message: "Nombre requerido" }),
  pattern: z.string().min(1, { message: "Patrón requerido" }),
  category: z.string().min(1, { message: "Categoría requerida" }),
  priority: z.number().int().min(1, { message: "Mínimo 1" }).max(100, { message: "Máximo 100" }),
  active: z.boolean().default(true),
});

type CategoryRuleFormValues = z.infer<typeof categoryRuleSchema>;

export default function Categorias() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CategoryRule | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(1); // Hardcodeado para demo
  
  // Consulta para obtener las reglas de categoría
  const rulesQuery = useQuery<CategoryRule[]>({
    queryKey: ['/api/banking/companies', selectedCompanyId, 'category-rules'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/banking/companies/${selectedCompanyId}/category-rules`);
        if (!response.ok) {
          if (response.status === 404) {
            return []; // No hay reglas todavía
          }
          throw new Error('Error al cargar las reglas de categoría');
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching category rules:", error);
        return [];
      }
    }
  });
  
  // Mutación para crear una regla de categoría
  const createRuleMutation = useMutation({
    mutationFn: async (values: CategoryRuleFormValues) => {
      const response = await fetch(`/api/banking/companies/${selectedCompanyId}/category-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear la regla de categoría');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banking/companies', selectedCompanyId, 'category-rules'] });
      
      toast({
        title: "Regla creada",
        description: "La regla de categoría se ha creado correctamente",
      });
      
      setIsDialogOpen(false);
      setEditingRule(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la regla: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    },
  });
  
  // En un entorno real, implementaríamos también las mutaciones para editar y eliminar reglas
  // Aquí simulamos estas funciones por simplicidad
  
  const updateRuleMutation = useMutation({
    mutationFn: async (rule: CategoryRule) => {
      // En un entorno real, llamaríamos a la API para actualizar la regla
      // Aquí simulamos la mutación exitosa
      return new Promise<CategoryRule>((resolve) => {
        setTimeout(() => {
          resolve(rule);
        }, 500);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banking/companies', selectedCompanyId, 'category-rules'] });
      
      toast({
        title: "Regla actualizada",
        description: "La regla de categoría se ha actualizado correctamente",
      });
      
      setIsDialogOpen(false);
      setEditingRule(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la regla: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    },
  });
  
  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: number) => {
      // En un entorno real, llamaríamos a la API para eliminar la regla
      // Aquí simulamos la mutación exitosa
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banking/companies', selectedCompanyId, 'category-rules'] });
      
      toast({
        title: "Regla eliminada",
        description: "La regla de categoría se ha eliminado correctamente",
      });
      
      setIsDeleteDialogOpen(false);
      setDeletingRuleId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la regla: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    },
  });
  
  // Formulario para la regla de categoría
  const form = useForm<CategoryRuleFormValues>({
    resolver: zodResolver(categoryRuleSchema),
    defaultValues: {
      name: "",
      pattern: "",
      category: "",
      priority: 1,
      active: true,
    },
  });
  
  // Manejar envío del formulario
  const onSubmit = (values: CategoryRuleFormValues) => {
    if (editingRule) {
      updateRuleMutation.mutate({
        ...editingRule,
        ...values,
      });
    } else {
      createRuleMutation.mutate(values);
    }
  };
  
  // Abrir el diálogo para editar una regla
  const handleEditRule = (rule: CategoryRule) => {
    setEditingRule(rule);
    form.reset({
      name: rule.name,
      pattern: rule.pattern,
      category: rule.category,
      priority: rule.priority,
      active: rule.active,
    });
    setIsDialogOpen(true);
  };
  
  // Abrir el diálogo para crear una nueva regla
  const handleNewRule = () => {
    setEditingRule(null);
    form.reset({
      name: "",
      pattern: "",
      category: "",
      priority: 1,
      active: true,
    });
    setIsDialogOpen(true);
  };
  
  // Confirmar eliminación de una regla
  const handleDeleteRule = (ruleId: number) => {
    setDeletingRuleId(ruleId);
    setIsDeleteDialogOpen(true);
  };
  
  // Ejecutar eliminación de regla
  const confirmDeleteRule = () => {
    if (deletingRuleId !== null) {
      deleteRuleMutation.mutate(deletingRuleId);
    }
  };
  
  // Filtrar reglas por búsqueda
  const filteredRules = rulesQuery.data
    ? rulesQuery.data.filter(rule => 
        filter === "" || 
        rule.name.toLowerCase().includes(filter.toLowerCase()) ||
        rule.category.toLowerCase().includes(filter.toLowerCase()) ||
        rule.pattern.toLowerCase().includes(filter.toLowerCase())
      )
    : [];
  
  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => navigate("/banca")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle>Categorías de Transacciones</CardTitle>
              <CardDescription>
                Configure reglas para categorizar automáticamente las transacciones bancarias
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar regla..."
                  className="pl-8"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              
              <Button onClick={handleNewRule}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nueva Regla
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rulesQuery.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : rulesQuery.error ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="mb-4">Error al cargar las reglas de categoría.</p>
              <Button onClick={() => rulesQuery.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
              </Button>
            </div>
          ) : !rulesQuery.data || rulesQuery.data.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="mb-4">No se encontraron reglas de categoría. Cree una nueva regla para comenzar a categorizar automáticamente las transacciones.</p>
              <Button onClick={handleNewRule}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nueva Regla
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Nombre</TableHead>
                    <TableHead className="w-[200px]">Categoría</TableHead>
                    <TableHead>Patrón</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Tag className="mr-1 h-3 w-3" />
                          {rule.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{rule.pattern}</TableCell>
                      <TableCell>{rule.priority}</TableCell>
                      <TableCell>
                        {rule.active ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Activa
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            <XCircle className="mr-1 h-3 w-3" />
                            Inactiva
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditRule(rule)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredRules.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No se encontraron reglas que coincidan con su búsqueda
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredRules.length} de {rulesQuery.data?.length || 0} reglas
          </div>
          
          <Button variant="outline" onClick={() => navigate("/banca/cuenta/1")}>
            Ver transacciones
          </Button>
        </CardFooter>
      </Card>
      
      {/* Diálogo para crear/editar regla */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Editar Regla" : "Nueva Regla"}</DialogTitle>
            <DialogDescription>
              {editingRule 
                ? "Modifique los detalles de la regla de categorización" 
                : "Cree una nueva regla para categorizar automáticamente las transacciones"}
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
                      <Input placeholder="Facturas de luz" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nombre descriptivo para identificar esta regla
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
                    <FormControl>
                      <Input placeholder="Suministros" {...field} />
                    </FormControl>
                    <FormDescription>
                      Categoría que se asignará a las transacciones que coincidan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pattern"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patrón</FormLabel>
                    <FormControl>
                      <Input placeholder="ELECTRICIDAD|IBERDROLA" {...field} />
                    </FormControl>
                    <FormDescription>
                      Texto a buscar en la descripción de las transacciones (use | para separar alternativas)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="100" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Orden de prioridad
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-3 rounded-md pt-6">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Activa</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createRuleMutation.isPending || updateRuleMutation.isPending}
                >
                  {(createRuleMutation.isPending || updateRuleMutation.isPending) ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {editingRule ? "Actualizando..." : "Creando..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingRule ? "Actualizar" : "Crear"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar regla?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la regla de categorización.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteRule}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteRuleMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}