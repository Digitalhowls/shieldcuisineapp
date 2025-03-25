import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardCheck, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  AlertCircle,
  Building2,
  MapPin,
  Filter,
  ChevronRight,
  Eye
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { controlStatusEnum, controlTypeEnum } from "@shared/schema";

interface PublicControl {
  id: number;
  templateId: number;
  templateName: string;
  type: typeof controlTypeEnum.enumValues[number];
  status: typeof controlStatusEnum.enumValues[number];
  scheduledFor: string;
  completedAt?: string;
  companyId: number;
  companyName: string;
  locationId: number;
  locationName: string;
  public: boolean;
  controlData: {
    summary: string;
    issues: string[];
    correctiveActions: string[];
    responsible: string;
    temperature?: number;
    images?: string[];
    score?: number;
  };
}

export default function Controles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Fetch public controls data
  const { data: controls, isLoading, isError } = useQuery<PublicControl[]>({
    queryKey: ["/api/public/controls"],
    queryFn: async () => {
      try {
        // Mock data for now - will be replaced with actual API call
        // const res = await apiRequest("GET", "/api/public/controls");
        // return await res.json();
        return [
          {
            id: 1,
            templateId: 1,
            templateName: "Control Temperatura Cámaras",
            type: "checklist",
            status: "completed",
            scheduledFor: "2025-03-22T10:00:00Z",
            completedAt: "2025-03-22T10:15:00Z",
            companyId: 1,
            companyName: "Restaurante La Huerta",
            locationId: 1,
            locationName: "Sede Principal",
            public: true,
            controlData: {
              summary: "Control de temperaturas en cámaras frigoríficas realizado correctamente",
              issues: [],
              correctiveActions: [],
              responsible: "Carmen García",
              temperature: 2.4,
              score: 100
            }
          },
          {
            id: 2,
            templateId: 2,
            templateName: "Limpieza y Desinfección",
            type: "form",
            status: "completed",
            scheduledFor: "2025-03-23T08:00:00Z",
            completedAt: "2025-03-23T08:40:00Z",
            companyId: 2,
            companyName: "Pastelería Dulce Momento",
            locationId: 5,
            locationName: "Tienda Centro",
            public: true,
            controlData: {
              summary: "Limpieza general de superficies en contacto con alimentos",
              issues: ["Residuos en esquinas de la cámara de frío"],
              correctiveActions: ["Refuerzo de limpieza en zonas de difícil acceso"],
              responsible: "Miguel Sánchez",
              score: 90
            }
          },
          {
            id: 3,
            templateId: 3,
            templateName: "Control Recepción Mercancía",
            type: "form",
            status: "completed",
            scheduledFor: "2025-03-24T09:00:00Z",
            completedAt: "2025-03-24T09:25:00Z",
            companyId: 3,
            companyName: "Catering Escolar Nutritivo",
            locationId: 7,
            locationName: "Cocina Central",
            public: true,
            controlData: {
              summary: "Recepción de productos frescos verificada",
              issues: [],
              correctiveActions: [],
              responsible: "Laura Martínez",
              temperature: 3.8,
              score: 100
            }
          },
          {
            id: 4,
            templateId: 4,
            templateName: "Verificación Etiquetado",
            type: "checklist",
            status: "delayed",
            scheduledFor: "2025-03-20T14:00:00Z",
            companyId: 4,
            companyName: "Panadería Tradicional",
            locationId: 9,
            locationName: "Obrador Central",
            public: true,
            controlData: {
              summary: "Pendiente de realización",
              issues: ["Control retrasado por ausencia del responsable"],
              correctiveActions: ["Reprogramación para el día siguiente"],
              responsible: "Carlos Ruiz"
            }
          },
          {
            id: 5,
            templateId: 5,
            templateName: "Auditoría Instalaciones",
            type: "form",
            status: "completed",
            scheduledFor: "2025-03-15T11:00:00Z",
            completedAt: "2025-03-15T13:30:00Z",
            companyId: 5,
            companyName: "Distribución Alimentaria Norte",
            locationId: 12,
            locationName: "Almacén Logístico",
            public: true,
            controlData: {
              summary: "Auditoría completa de instalaciones de almacenamiento",
              issues: ["Sistema de ventilación requiere mantenimiento", "Señalización incompleta en zona de carga"],
              correctiveActions: ["Contactar servicio técnico para revisión", "Instalar señalización adicional"],
              responsible: "Ana Gómez",
              score: 85
            }
          }
        ];
      } catch (error) {
        console.error("Error fetching controls:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Filter controls based on search, status, type and date range
  const filteredControls = controls?.filter(control => {
    const matchesSearch = 
      control.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || control.status === statusFilter;
    const matchesType = typeFilter === "all" || control.type === typeFilter;
    
    let matchesDate = true;
    if (dateRange && (dateRange.from || dateRange.to)) {
      const controlDate = new Date(control.completedAt || control.scheduledFor);
      if (dateRange.from) {
        matchesDate = matchesDate && controlDate >= dateRange.from;
      }
      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && controlDate <= endOfDay;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success/20 text-success">Completado</Badge>;
      case "pending":
        return <Badge className="bg-warning/20 text-warning">Pendiente</Badge>;
      case "delayed":
        return <Badge className="bg-error/20 text-error">Retrasado</Badge>;
      case "scheduled":
        return <Badge className="bg-info/20 text-info">Programado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "checklist":
        return <ClipboardCheck className="h-5 w-5 text-primary" />;
      case "form":
        return <ClipboardCheck className="h-5 w-5 text-secondary" />;
      default:
        return <ClipboardCheck className="h-5 w-5" />;
    }
  };

  const getScoreBadge = (score?: number) => {
    if (score === undefined) return null;
    
    let colorClass = "bg-success/20 text-success";
    if (score < 70) colorClass = "bg-error/20 text-error";
    else if (score < 90) colorClass = "bg-warning/20 text-warning";
    
    return <Badge className={colorClass}>{score}%</Badge>;
  };

  const formatDateTimeDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "dd MMM yyyy - HH:mm", { locale: es });
  };

  return (
    <div className="space-y-4 p-4 pt-0">
      <div className="flex flex-col space-y-2 mt-2">
        <h2 className="text-2xl font-bold">Controles APPCC Públicos</h2>
        <p className="text-muted-foreground">
          Consulta los controles de seguridad alimentaria realizados por nuestras empresas
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, empresa o ubicación..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                    {(statusFilter !== "all" || typeFilter !== "all" || dateRange.from || dateRange.to) && (
                      <Badge className="ml-2 bg-primary text-white">
                        {(statusFilter !== "all" ? 1 : 0) + 
                         (typeFilter !== "all" ? 1 : 0) + 
                         ((dateRange.from || dateRange.to) ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filtrar controles</h4>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Estado</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
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
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo</label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los tipos</SelectItem>
                          <SelectItem value="checklist">Checklist</SelectItem>
                          <SelectItem value="form">Formulario</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rango de fechas</label>
                      <div className="grid gap-2">
                        <CalendarPicker
                          mode="range"
                          selected={dateRange}
                          onSelect={setDateRange}
                          locale={es}
                          className="border rounded-md p-3"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setStatusFilter("all");
                        setTypeFilter("all");
                        setDateRange(undefined);
                      }}>
                        Limpiar
                      </Button>
                      <Button size="sm" onClick={() => setIsFiltersOpen(false)}>
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ha ocurrido un error al cargar los controles. Por favor, inténtelo de nuevo.
          </AlertDescription>
        </Alert>
      ) : filteredControls?.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No se encontraron controles</h3>
          <p className="text-muted-foreground">
            No hay controles que coincidan con los criterios de búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredControls?.map(control => (
            <Card key={control.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(control.type)}
                      <CardTitle>{control.templateName}</CardTitle>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{control.companyName}</span>
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground ml-2" />
                        <span>{control.locationName}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(control.status)}
                    {getScoreBadge(control.controlData.score)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="space-y-2">
                  {control.status === "completed" ? (
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-success mr-2" />
                      <div>
                        <span className="font-medium">Completado:</span>{" "}
                        {control.completedAt && formatDateTimeDisplay(control.completedAt)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                      <div>
                        <span className="font-medium">Programado:</span>{" "}
                        {formatDateTimeDisplay(control.scheduledFor)}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm">
                    {control.controlData.summary}
                  </p>
                  
                  {control.controlData.issues.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Incidencias detectadas:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground pl-2">
                        {control.controlData.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="border-t bg-muted/50 justify-between py-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {control.controlData.responsible && `Responsable: ${control.controlData.responsible}`}
                  </span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/transparencia/control/${control.id}`}>
                    <Eye className="mr-1 h-4 w-4" />
                    Ver detalles
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}