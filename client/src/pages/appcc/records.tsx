import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
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
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import FormControl from "@/components/ui/form-control";
import { 
  Calendar, 
  CheckCircle, 
  ClipboardCheck, 
  ClipboardList, 
  Download, 
  FileText, 
  Filter, 
  Printer, 
  Search, 
  AlertCircle, 
  FileOutput,
  User
} from "lucide-react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange, DateRangePicker } from "@/components/ui/date-range-picker";
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

export default function Records() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState<number | null>(null);
  const [filterTemplate, setFilterTemplate] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  // Query to fetch control records
  const { 
    data: controlRecords, 
    isLoading, 
    isError,
    error 
  } = useQuery<ControlRecord[]>({
    queryKey: ["/api/control-records"],
    staleTime: 1000 * 60 * 5, // 5 minutes
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
      type: "form",
      status: "completed",
      scheduledFor: "2023-10-11T12:00:00Z",
      completedAt: "2023-10-11T12:45:00Z",
      responsibleName: "Personal Limpieza",
      locationName: "Zona de Preparación"
    },
    {
      id: 3,
      templateId: 3,
      templateName: "Control Recepción Mercancía",
      type: "form",
      status: "completed",
      scheduledFor: "2023-10-10T09:00:00Z",
      completedAt: "2023-10-10T09:25:00Z",
      responsibleName: "Encargado Almacén",
      locationName: "Almacén"
    },
    {
      id: 4,
      templateId: 1,
      templateName: "Control Temperatura Cámaras",
      type: "checklist",
      status: "completed",
      scheduledFor: "2023-10-09T10:00:00Z",
      completedAt: "2023-10-09T10:15:00Z",
      responsibleName: "Jefe de Cocina",
      locationName: "Cocina Principal"
    },
    {
      id: 5,
      templateId: 4,
      templateName: "Verificación Etiquetado",
      type: "checklist",
      status: "completed",
      scheduledFor: "2023-10-05T14:00:00Z",
      completedAt: "2023-10-05T14:30:00Z",
      responsibleName: "Responsable Calidad",
      locationName: "Zona de Envasado"
    }
  ];
  
  const displayedControls = controlRecords || sampleControls;
  
  // Get list of unique template names for filter
  const templateNames = Array.from(new Set(displayedControls.map(c => ({
    id: c.templateId,
    name: c.templateName
  })))).reduce((acc, curr) => {
    if (!acc.some(item => item.id === curr.id)) {
      acc.push(curr);
    }
    return acc;
  }, [] as { id: number, name: string }[]);
  
  // Filter controls based on search, filters, and date range
  const filteredControls = displayedControls
    .filter(control => {
      // Filter by date range
      const controlDate = new Date(control.completedAt || control.scheduledFor);
      return (!dateRange.from || controlDate >= dateRange.from) && 
             (!dateRange.to || controlDate <= dateRange.to);
    })
    .filter(control => 
      control.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (control.responsibleName && control.responsibleName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(control => 
      filterTemplate === "all" ? true : control.templateId.toString() === filterTemplate
    )
    .filter(control => 
      filterStatus === "all" ? true : control.status === filterStatus
    );
  
  const handleViewControl = (id: number) => {
    setSelectedControlId(id);
    setFormModalOpen(true);
  };
  
  const handleExportPDF = (id: number) => {
    toast({
      title: "Exportando PDF",
      description: "El documento se está generando...",
    });
    // In a real implementation, this would trigger a PDF export
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
        {/* Header with title and export button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-800">Registros APPCC</h2>
            <p className="text-neutral-500">
              Historial de controles y registros completados
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="mr-2">
                  <FileOutput className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => {
                    toast({
                      title: "Exportando a PDF",
                      description: "Los registros están siendo exportados a PDF"
                    });
                  }}>
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar a PDF
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => {
                    toast({
                      title: "Exportando a Excel",
                      description: "Los registros están siendo exportados a Excel"
                    });
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar a Excel
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => {
                    toast({
                      title: "Imprimiendo",
                      description: "Enviando a impresora..."
                    });
                  }}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Search filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-xs mb-2 block">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    id="search"
                    placeholder="Buscar registros..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="template-filter" className="text-xs mb-2 block">Plantilla</Label>
                <Select value={filterTemplate} onValueChange={setFilterTemplate}>
                  <SelectTrigger id="template-filter">
                    <SelectValue placeholder="Todas las plantillas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las plantillas</SelectItem>
                    {templateNames.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status-filter" className="text-xs mb-2 block">Estado</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="completed">Completados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="delayed">Retrasados</SelectItem>
                    <SelectItem value="scheduled">Programados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs mb-2 block">Rango de fechas</Label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  locale={es}
                  placeholder="Seleccionar rango"
                  align="start"
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Records List */}
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
                {error instanceof Error ? error.message : "Error al cargar los registros"}
              </AlertDescription>
            </Alert>
          ) : filteredControls.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-neutral-300" />
                <h3 className="mt-2 text-sm font-semibold text-neutral-900">No hay registros</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  No se encontraron registros con los criterios seleccionados.
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
                      <CardDescription>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(control.completedAt || control.scheduledFor), "d MMM yyyy", { locale: es })}</span>
                          <span>·</span>
                          <span>{control.locationName}</span>
                        </div>
                      </CardDescription>
                    </div>
                    {getStatusBadge(control.status)}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                    <div className="flex items-center text-neutral-600 text-sm">
                      <User className="h-4 w-4 mr-2 text-neutral-400" />
                      <span>Responsable: {control.responsibleName || "Sin asignar"}</span>
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
                  {control.status === "completed" && (
                    <>
                      <Button variant="outline" className="mr-2" onClick={() => handleExportPDF(control.id)}>
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/appcc/control/${control.id}`}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </Link>
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* Form Modal for viewing a control */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="max-w-3xl p-0">
          <FormControl 
            title={
              selectedControlId === 3 
                ? "Control Recepción Mercancía" 
                : "Control Temperatura Cámaras"
            }
            onClose={() => setFormModalOpen(false)}
            onSubmit={() => {}}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
