import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent 
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import FormControl from "@/components/ui/form-control";
import { 
  Calendar, 
  Clock, 
  ClipboardCheck, 
  ClipboardList, 
  Filter, 
  Search, 
  User, 
  AlertCircle 
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface ControlRecord {
  id: number;
  templateId: number;
  templateName: string;
  type: "checklist" | "form";
  status: "pending" | "completed" | "delayed" | "scheduled";
  scheduledFor: string;
  completedAt?: string;
  responsibleName?: string;
  locationName: string;
}

export default function DailyControls() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState<number | null>(null);
  const [filterResponsible, setFilterResponsible] = useState<string>("all");
  
  // Query to fetch today's control records
  const { 
    data: controlRecords, 
    isLoading, 
    isError,
    error 
  } = useQuery<ControlRecord[]>({
    queryKey: ["/api/control-records/today"],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Mutation to update a control record (complete a control)
  const updateControlMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/control-records/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Control completado",
        description: "El control ha sido registrado correctamente",
      });
      setFormModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/control-records/today"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al completar el control",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Sample control records (for demonstration)
  const sampleControls: ControlRecord[] = [
    {
      id: 1,
      templateId: 1,
      templateName: "Control Temperatura Cámaras",
      type: "checklist",
      status: "completed",
      scheduledFor: "2023-10-12T10:00:00Z",
      completedAt: "2023-10-12T10:30:00Z",
      responsibleName: "Jefe de Cocina",
      locationName: "Cocina Principal"
    },
    {
      id: 2,
      templateId: 2,
      templateName: "Limpieza Zona Preparación",
      type: "checklist",
      status: "pending",
      scheduledFor: "2023-10-12T12:00:00Z",
      responsibleName: "Personal Limpieza",
      locationName: "Zona de Preparación"
    },
    {
      id: 3,
      templateId: 3,
      templateName: "Control Recepción Mercancía",
      type: "form",
      status: "delayed",
      scheduledFor: "2023-10-12T09:00:00Z",
      responsibleName: "Encargado Almacén",
      locationName: "Almacén"
    },
    {
      id: 4,
      templateId: 4,
      templateName: "Control Trazabilidad Producto",
      type: "form",
      status: "scheduled",
      scheduledFor: "2023-10-12T16:00:00Z",
      responsibleName: "Jefe de Cocina",
      locationName: "Cocina Principal"
    }
  ];
  
  const displayedControls = controlRecords || sampleControls;
  
  // Filter controls based on tab, search, and filter
  const filteredControls = displayedControls
    .filter(control => {
      if (activeTab === "all") return true;
      if (activeTab === "pending") return control.status === "pending" || control.status === "delayed";
      if (activeTab === "completed") return control.status === "completed";
      if (activeTab === "scheduled") return control.status === "scheduled";
      return true;
    })
    .filter(control => 
      control.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.locationName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(control => 
      filterResponsible === "all" ? true : control.responsibleName === filterResponsible
    );
  
  // Get list of unique responsible names for filter
  const responsibleNames = Array.from(new Set(displayedControls.map(c => c.responsibleName).filter(Boolean))) as string[];
  
  const handleViewOrPerformControl = (id: number) => {
    setSelectedControlId(id);
    setFormModalOpen(true);
  };
  
  const handleSubmitForm = (formData: any) => {
    if (selectedControlId) {
      updateControlMutation.mutate({
        id: selectedControlId,
        data: {
          status: "completed",
          formData: formData
        }
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-success bg-opacity-10 text-success border-success">Completado</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-warning bg-opacity-10 text-warning border-warning">Pendiente</Badge>;
      case 'delayed':
        return <Badge variant="outline" className="bg-error bg-opacity-10 text-error border-error">Retrasado</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-neutral-100 text-neutral-600 border-neutral-200">Programado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with date and actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-800">Controles Diarios</h2>
            <p className="text-neutral-500">
              {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button variant="outline" className="mr-2">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Ver Calendario
            </Button>
          </div>
        </div>
        
        {/* Tabs and search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="pending">Pendientes</TabsTrigger>
                  <TabsTrigger value="completed">Completados</TabsTrigger>
                  <TabsTrigger value="scheduled">Programados</TabsTrigger>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Buscar controles..."
                    className="pl-9 w-full md:w-[200px] lg:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={filterResponsible} onValueChange={setFilterResponsible}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filtrar por responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los responsables</SelectItem>
                    {responsibleNames.map((name, index) => (
                      <SelectItem key={index} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Controls List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-10">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error instanceof Error ? error.message : "Error al cargar los controles"}
              </AlertDescription>
            </Alert>
          ) : filteredControls.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-neutral-300" />
                <h3 className="mt-2 text-sm font-semibold text-neutral-900">No hay controles</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  No se encontraron controles con los criterios seleccionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredControls.map((control) => (
              <Card key={control.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{control.templateName}</CardTitle>
                      <CardDescription>{control.locationName}</CardDescription>
                    </div>
                    {getStatusBadge(control.status)}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-2">
                    <div className="flex items-center text-neutral-600 text-sm">
                      <User className="h-4 w-4 mr-2 text-neutral-400" />
                      <span>{control.responsibleName || "Sin asignar"}</span>
                    </div>
                    <div className="flex items-center text-neutral-600 text-sm">
                      <Clock className="h-4 w-4 mr-2 text-neutral-400" />
                      <span>
                        {control.status === "completed" ? (
                          <>Completado: {format(new Date(control.completedAt!), "HH:mm", { locale: es })}</>
                        ) : (
                          <>Programado: {format(new Date(control.scheduledFor), "HH:mm", { locale: es })}</>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center text-neutral-600 text-sm">
                      {control.type === "checklist" ? (
                        <>
                          <ClipboardCheck className="h-4 w-4 mr-2 text-neutral-400" />
                          <span>Tipo: Checklist</span>
                        </>
                      ) : (
                        <>
                          <ClipboardList className="h-4 w-4 mr-2 text-neutral-400" />
                          <span>Tipo: Formulario</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-2">
                  {control.status === "completed" ? (
                    <Button variant="outline" onClick={() => handleViewOrPerformControl(control.id)}>
                      Ver Detalle
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleViewOrPerformControl(control.id)}
                      disabled={control.status === "scheduled"}
                      variant={control.status === "scheduled" ? "outline" : "default"}
                    >
                      {control.status === "scheduled" ? "Programado" : "Realizar Control"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* Form Modal for performing or viewing a control */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="max-w-3xl p-0">
          <FormControl 
            title={
              selectedControlId === 3 
                ? "Control Recepción Mercancía" 
                : "Control Temperatura Cámaras"
            }
            onClose={() => setFormModalOpen(false)}
            onSubmit={handleSubmitForm}
            isLoading={updateControlMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
