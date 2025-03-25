import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Clipboard, 
  ClipboardCheck, 
  ClipboardList, 
  PlusCircle, 
  Search, 
  AlertCircle,
  ArrowUpDown, 
  Edit, 
  Trash2, 
  Calendar 
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TemplateItem {
  id: number;
  name: string;
  type: "checklist" | "form";
  frequency: string;
  active: boolean;
  createdAt: string;
}

export default function Templates() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterFrequency, setFilterFrequency] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  
  // Query templates from API
  const { 
    data: templates, 
    isLoading, 
    isError,
    error 
  } = useQuery<TemplateItem[]>({
    queryKey: ["/api/control-templates"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const createTemplateMutation = useMutation({
    mutationFn: async (newTemplate: any) => {
      const res = await apiRequest("POST", "/api/control-templates", newTemplate);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Plantilla creada",
        description: "La plantilla ha sido creada exitosamente",
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/control-templates"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear la plantilla",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/control-templates/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla ha sido eliminada exitosamente",
      });
      setTemplateToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["/api/control-templates"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar la plantilla",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Sample templates data (would be replaced by API data)
  const sampleTemplates: TemplateItem[] = [
    {
      id: 1,
      name: "Control Temperatura Cámaras",
      type: "checklist",
      frequency: "daily",
      active: true,
      createdAt: "2023-09-15T10:30:00Z"
    },
    {
      id: 2,
      name: "Limpieza y Desinfección",
      type: "form",
      frequency: "daily",
      active: true,
      createdAt: "2023-09-10T14:15:00Z"
    },
    {
      id: 3,
      name: "Control Recepción Mercancía",
      type: "form",
      frequency: "daily",
      active: true,
      createdAt: "2023-08-22T09:45:00Z"
    },
    {
      id: 4,
      name: "Verificación Etiquetado",
      type: "checklist",
      frequency: "weekly",
      active: true,
      createdAt: "2023-07-30T11:20:00Z"
    },
    {
      id: 5,
      name: "Auditoría Instalaciones",
      type: "form",
      frequency: "monthly",
      active: true,
      createdAt: "2023-06-15T13:10:00Z"
    }
  ];
  
  const displayedTemplates = templates || sampleTemplates;
  
  // Filter templates based on search and filters
  const filteredTemplates = displayedTemplates
    .filter(template => 
      template.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(template => 
      filterType === "all" ? true : template.type === filterType
    )
    .filter(template => 
      filterFrequency === "all" ? true : template.frequency === filterFrequency
    );
  
  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Diaria';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
      default: return frequency;
    }
  };
  
  // Create template placeholder (would be implemented with actual form)
  const handleCreateTemplate = (data: any) => {
    createTemplateMutation.mutate({
      name: data.name,
      type: data.type,
      frequency: data.frequency,
      formStructure: { 
        fields: [
          { id: 1, type: "text", label: "Texto ejemplo", required: true },
          { id: 2, type: "number", label: "Número ejemplo", required: false }
        ] 
      },
      companyId: user?.companyId || 1
    });
  };
  
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-800">Plantillas de Control</h2>
            <p className="text-neutral-500">
              Gestione las plantillas APPCC para su establecimiento
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Nueva Plantilla</span>
            </Button>
          </div>
        </div>
        
        {/* Search and filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1 md:col-span-1">
                <Label htmlFor="search" className="sr-only">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    id="search"
                    placeholder="Buscar plantillas..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="type-filter" className="text-xs block mb-2">Tipo de Plantilla</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="checklist">Checklist</SelectItem>
                    <SelectItem value="form">Formulario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="frequency-filter" className="text-xs block mb-2">Frecuencia</Label>
                <Select value={filterFrequency} onValueChange={setFilterFrequency}>
                  <SelectTrigger id="frequency-filter">
                    <SelectValue placeholder="Todas las frecuencias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las frecuencias</SelectItem>
                    <SelectItem value="daily">Diaria</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Templates list */}
        <Card>
          <CardHeader>
            <CardTitle>Plantillas disponibles</CardTitle>
            <CardDescription>
              {filteredTemplates.length} plantillas encontradas
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : isError ? (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error instanceof Error ? error.message : "Error al cargar las plantillas"}
                </AlertDescription>
              </Alert>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="mx-auto h-12 w-12 text-neutral-300" />
                <h3 className="mt-2 text-sm font-semibold text-neutral-900">No hay plantillas</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  No se encontraron plantillas con los criterios de búsqueda.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden border rounded-md">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <span>Nombre</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tipo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Frecuencia</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Estado</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {filteredTemplates.map((template) => (
                      <tr key={template.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900">{template.name}</div>
                          <div className="text-xs text-neutral-500">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            Creada: {new Date(template.createdAt).toLocaleDateString('es-ES')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {template.type === 'checklist' ? (
                              <>
                                <ClipboardCheck className="h-4 w-4 text-primary mr-2" />
                                <span className="text-sm">Checklist</span>
                              </>
                            ) : (
                              <>
                                <Clipboard className="h-4 w-4 text-secondary mr-2" />
                                <span className="text-sm">Formulario</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 text-neutral-800">
                            {getFrequencyLabel(template.frequency)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            template.active 
                              ? "bg-success bg-opacity-10 text-success" 
                              : "bg-neutral-100 text-neutral-600"
                          }`}>
                            {template.active ? "Activa" : "Inactiva"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-neutral-900">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-neutral-600 hover:text-error"
                            onClick={() => setTemplateToDelete(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Plantilla</DialogTitle>
            <DialogDescription>
              Defina la información básica de la plantilla. Podrá personalizar los campos después.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Plantilla</Label>
              <Input 
                id="name" 
                placeholder="Ej: Control de Temperatura"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Plantilla</Label>
                <Select defaultValue="checklist">
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checklist">Checklist</SelectItem>
                    <SelectItem value="form">Formulario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Seleccione frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diaria</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => handleCreateTemplate({
                name: (document.getElementById('name') as HTMLInputElement)?.value,
                type: (document.querySelector('[id="type"] [data-value]') as HTMLElement)?.getAttribute('data-value'),
                frequency: (document.querySelector('[id="frequency"] [data-value]') as HTMLElement)?.getAttribute('data-value'),
              })}
              disabled={createTemplateMutation.isPending}
            >
              {createTemplateMutation.isPending ? "Creando..." : "Crear Plantilla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={templateToDelete !== null} onOpenChange={() => setTemplateToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar esta plantilla? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateToDelete(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (templateToDelete !== null) {
                  deleteTemplateMutation.mutate(templateToDelete);
                }
              }}
              disabled={deleteTemplateMutation.isPending}
            >
              {deleteTemplateMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
