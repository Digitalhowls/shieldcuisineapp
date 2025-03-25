import { useState, useRef } from "react";
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
  Calendar,
  CalendarClock,
  Eye 
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TemplateBuilder, { TemplateData } from "@/components/appcc/template-builder";
import ScheduleControl, { ScheduleData } from "@/components/appcc/schedule-control";
import DynamicControlForm from "@/components/appcc/dynamic-control-form";

interface TemplateItem {
  id: number;
  name: string;
  description?: string;
  type: "checklist" | "form";
  frequency: string;
  formStructure: string;
  requiredRole?: string;
  active: boolean;
  createdAt: string;
  companyId: number;
  locationId?: number;
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
      description: "Control diario de temperaturas de cámaras frigoríficas",
      type: "checklist",
      frequency: "daily",
      formStructure: JSON.stringify({
        sections: [{
          id: "s1",
          title: "Control de Temperaturas",
          fields: [
            { id: "t1", type: "temperature", label: "Temperatura Cámara 1", required: true, temperatureRange: { min: 1, max: 4, unit: "C" } },
            { id: "t2", type: "temperature", label: "Temperatura Cámara 2", required: true, temperatureRange: { min: -18, max: -20, unit: "C" } }
          ]
        }]
      }),
      active: true,
      createdAt: "2023-09-15T10:30:00Z",
      companyId: 1
    },
    {
      id: 2,
      name: "Limpieza y Desinfección",
      description: "Registro de limpieza diaria",
      type: "form",
      frequency: "daily",
      formStructure: JSON.stringify({
        sections: [{
          id: "s1",
          title: "Registro de Limpieza",
          fields: [
            { id: "c1", type: "checkbox", label: "Cocina limpia", required: true },
            { id: "c2", type: "checkbox", label: "Superficies desinfectadas", required: true }
          ]
        }]
      }),
      active: true,
      createdAt: "2023-09-10T14:15:00Z",
      companyId: 1
    },
    {
      id: 3,
      name: "Control Recepción Mercancía",
      description: "Registro para control de recepción de materias primas",
      type: "form",
      frequency: "daily",
      formStructure: JSON.stringify({
        sections: [{
          id: "s1",
          title: "Datos del Proveedor",
          fields: [
            { id: "p1", type: "text", label: "Proveedor", required: true },
            { id: "p2", type: "text", label: "Nº Albarán", required: true }
          ]
        }]
      }),
      active: true,
      createdAt: "2023-08-22T09:45:00Z",
      companyId: 1
    },
    {
      id: 4,
      name: "Verificación Etiquetado",
      description: "Control semanal de etiquetado de productos",
      type: "checklist",
      frequency: "weekly",
      formStructure: JSON.stringify({
        sections: [{
          id: "s1",
          title: "Verificación",
          fields: [
            { id: "e1", type: "checkbox", label: "Etiquetas correctas", required: true },
            { id: "e2", type: "checkbox", label: "Fechas visibles", required: true }
          ]
        }]
      }),
      active: true,
      createdAt: "2023-07-30T11:20:00Z",
      companyId: 1
    },
    {
      id: 5,
      name: "Auditoría Instalaciones",
      description: "Inspección mensual de instalaciones",
      type: "form",
      frequency: "monthly",
      formStructure: JSON.stringify({
        sections: [{
          id: "s1",
          title: "Inspección General",
          fields: [
            { id: "i1", type: "textarea", label: "Observaciones", required: true },
            { id: "i2", type: "signature", label: "Firma del Inspector", required: true }
          ]
        }]
      }),
      active: true,
      createdAt: "2023-06-15T13:10:00Z",
      companyId: 1
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
  
  // State for template-related dialogs and actions
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [isTemplateBuilderOpen, setIsTemplateBuilderOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isViewFormOpen, setIsViewFormOpen] = useState(false);
  
  // Create or update a template
  const handleSaveTemplate = (data: TemplateData) => {
    // Convert the template data to the format expected by the API
    const formStructureJson = JSON.stringify({
      sections: data.sections
    });
    
    // For a new template
    if (!selectedTemplate) {
      createTemplateMutation.mutate({
        name: data.name,
        description: data.description,
        type: data.type,
        frequency: data.frequency,
        formStructure: formStructureJson,
        requiredRole: data.requiredRole,
        active: data.active,
        companyId: user?.companyId || 1
      });
    } else {
      // For updating an existing template - we would implement this with a proper updateTemplateMutation
      toast({
        title: "Actualización pendiente",
        description: "La funcionalidad de actualización será implementada en la próxima versión",
      });
    }
    setIsTemplateBuilderOpen(false);
  };
  
  // Sample locations and users for schedule dialog
  const locations = [
    { id: 1, name: "Cocina Principal" },
    { id: 2, name: "Almacén Central" },
    { id: 3, name: "Zona de Preparación" }
  ];
  
  const users = [
    { id: 1, name: "Administrador", role: "admin" },
    { id: 2, name: "Jefe de Cocina", role: "area_supervisor" },
    { id: 3, name: "Responsable Almacén", role: "employee" }
  ];
  
  // Handle scheduling a control
  const handleScheduleControl = (data: ScheduleData) => {
    // We would implement this with a proper scheduleControlMutation
    console.log("Programando control:", data);
    toast({
      title: "Control programado",
      description: "El control ha sido programado exitosamente",
    });
    setIsScheduleDialogOpen(false);
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-neutral-600 hover:text-neutral-900"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsTemplateBuilderOpen(true);
                            }}
                            title="Editar plantilla"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-neutral-600 hover:text-primary"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsViewFormOpen(true);
                            }}
                            title="Ver formulario"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-neutral-600 hover:text-success"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsScheduleDialogOpen(true);
                            }}
                            title="Programar control"
                          >
                            <CalendarClock className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-neutral-600 hover:text-error"
                            onClick={() => setTemplateToDelete(template.id)}
                            title="Eliminar plantilla"
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
              onClick={() => {
                // Initializar el constructor de plantillas con valores básicos
                setSelectedTemplate(null);
                setIsCreateDialogOpen(false);
                setIsTemplateBuilderOpen(true);
              }}
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
      
      {/* Template Builder Dialog */}
      <Dialog open={isTemplateBuilderOpen} onOpenChange={setIsTemplateBuilderOpen}>
        <DialogContent className="max-w-5xl">
          <TemplateBuilder 
            initialData={selectedTemplate ? {
              name: selectedTemplate.name,
              description: selectedTemplate.description || "",
              type: selectedTemplate.type,
              frequency: selectedTemplate.frequency as any,
              active: selectedTemplate.active,
              requiredRole: selectedTemplate.requiredRole,
              sections: JSON.parse(selectedTemplate.formStructure).sections
            } : undefined}
            onSave={handleSaveTemplate}
            onCancel={() => setIsTemplateBuilderOpen(false)}
            isLoading={createTemplateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Schedule Control Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedTemplate && (
            <ScheduleControl
              template={selectedTemplate}
              locations={locations}
              users={users}
              onSchedule={handleScheduleControl}
              onCancel={() => setIsScheduleDialogOpen(false)}
              isLoading={false}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* View Form Dialog */}
      <Dialog open={isViewFormOpen} onOpenChange={setIsViewFormOpen}>
        <DialogContent className="max-w-4xl">
          {selectedTemplate && (
            <DynamicControlForm
              template={selectedTemplate}
              onSubmit={data => {
                console.log("Form data:", data);
                setIsViewFormOpen(false);
              }}
              onCancel={() => setIsViewFormOpen(false)}
              isReadOnly={true}
              currentUser={user as any}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
