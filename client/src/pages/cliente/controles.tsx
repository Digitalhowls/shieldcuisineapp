import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle,
  Search,
  Calendar,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { controlStatusEnum, controlTypeEnum } from "@shared/schema";

interface Control {
  id: number;
  tipo: typeof controlTypeEnum.enumValues[number];
  nombre: string;
  estado: typeof controlStatusEnum.enumValues[number];
  fecha: string;
  responsable?: string;
  puntuacion?: number;
  problemas?: string[];
  acciones?: string[];
  imagenes?: string[];
}

export default function ClienteControles({ empresaId }: { empresaId: number }) {
  // Estado para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Obtener controles
  const { data: controles, isLoading, isError } = useQuery<Control[]>({
    queryKey: [`/api/cliente/empresas/${empresaId}/controles`],
    queryFn: async () => {
      // Simulamos obtención de datos
      return [
        {
          id: 1,
          tipo: "checklist",
          nombre: "Control Temperatura Cámaras",
          estado: "completed",
          fecha: "2025-03-22T10:15:00Z",
          responsable: "Carmen García",
          puntuacion: 100
        },
        {
          id: 2,
          tipo: "form",
          nombre: "Limpieza y Desinfección",
          estado: "completed",
          fecha: "2025-03-20T08:40:00Z",
          responsable: "Miguel Sánchez",
          puntuacion: 90,
          problemas: ["Residuos en esquinas de la cámara de frío"],
          acciones: ["Refuerzo de limpieza en zonas de difícil acceso"]
        },
        {
          id: 3,
          tipo: "form",
          nombre: "Control Recepción Mercancía",
          estado: "completed",
          fecha: "2025-03-18T09:25:00Z",
          responsable: "Laura Martínez",
          puntuacion: 100
        },
        {
          id: 4,
          tipo: "checklist",
          nombre: "Control Temperatura Cámaras",
          estado: "scheduled",
          fecha: "2025-03-29T10:00:00Z"
        },
        {
          id: 5,
          tipo: "form",
          nombre: "Control Almacenamiento",
          estado: "scheduled",
          fecha: "2025-03-30T09:00:00Z"
        },
        {
          id: 6,
          tipo: "form",
          nombre: "Verificación Etiquetado",
          estado: "delayed",
          fecha: "2025-03-15T14:00:00Z",
          problemas: ["Control retrasado por ausencia del responsable"],
          acciones: ["Reprogramación para el día siguiente"]
        },
        {
          id: 7,
          tipo: "checklist",
          nombre: "Auditoría Instalaciones",
          estado: "completed",
          fecha: "2025-03-10T11:30:00Z",
          responsable: "Ana Gómez",
          puntuacion: 85,
          problemas: [
            "Sistema de ventilación requiere mantenimiento", 
            "Señalización incompleta en zona de carga"
          ],
          acciones: [
            "Contactar servicio técnico para revisión", 
            "Instalar señalización adicional"
          ]
        }
      ];
    }
  });

  // Filtrar controles
  const controlesFiltered = controles?.filter(control => {
    const matchSearch = control.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || control.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  // Formatear fecha
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Obtener color y texto de estado
  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'completed': return "bg-success/20 text-success";
      case 'pending': return "bg-warning/20 text-warning";
      case 'delayed': return "bg-error/20 text-error";
      case 'scheduled': return "bg-info/20 text-info";
      default: return "bg-neutral-200 text-neutral-700";
    }
  };

  const obtenerTextoEstado = (estado: string) => {
    switch (estado) {
      case 'completed': return "Completado";
      case 'pending': return "Pendiente";
      case 'delayed': return "Retrasado";
      case 'scheduled': return "Programado";
      default: return estado;
    }
  };

  // Obtener icono de estado
  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'pending': return <Clock className="h-5 w-5 text-warning" />;
      case 'delayed': return <XCircle className="h-5 w-5 text-error" />;
      case 'scheduled': return <Calendar className="h-5 w-5 text-info" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !controles) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No se ha podido cargar la información de controles. Por favor, inténtelo de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar controles..."
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filtrar por estado" />
                  </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Lista de controles */}
      {controlesFiltered?.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No se encontraron controles</h3>
          <p className="text-muted-foreground">
            No hay controles que coincidan con los criterios de búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {controlesFiltered?.map(control => (
            <Card key={control.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Estado (columna izquierda en pantallas grandes) */}
                <div className={`sm:w-16 p-4 flex sm:flex-col items-center justify-center ${
                  control.estado === "completed" ? "bg-green-50" :
                  control.estado === "pending" ? "bg-amber-50" :
                  control.estado === "delayed" ? "bg-red-50" : "bg-blue-50"
                }`}>
                  {obtenerIconoEstado(control.estado)}
                  {control.puntuacion !== undefined && (
                    <div className={`text-sm font-bold sm:mt-2 ml-2 sm:ml-0 ${
                      control.puntuacion >= 90 ? 'text-success' : 
                      control.puntuacion >= 70 ? 'text-warning' : 'text-error'
                    }`}>
                      {control.puntuacion}%
                    </div>
                  )}
                </div>
                
                {/* Contenido principal */}
                <div className="flex-1 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-medium">{control.nombre}</h4>
                      <div className="flex items-center text-sm text-neutral-500">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formatearFecha(control.fecha)}
                        {control.responsable && (
                          <span className="ml-2">· {control.responsable}</span>
                        )}
                      </div>
                    </div>
                    <Badge className={obtenerColorEstado(control.estado)} variant="outline">
                      {obtenerTextoEstado(control.estado)}
                    </Badge>
                  </div>
                  
                  {/* Problemas y acciones */}
                  {(control.problemas?.length || control.acciones?.length) ? (
                    <div className="mt-2 pt-2 border-t">
                      {control.problemas && control.problemas.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-neutral-600 mb-1">
                            Problemas detectados:
                          </p>
                          <ul className="text-sm list-disc pl-4 text-neutral-600">
                            {control.problemas.map((problema, idx) => (
                              <li key={idx}>{problema}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {control.acciones && control.acciones.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-neutral-600 mb-1">
                            Acciones correctivas:
                          </p>
                          <ul className="text-sm list-disc pl-4 text-neutral-600">
                            {control.acciones.map((accion, idx) => (
                              <li key={idx}>{accion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                
                {/* Botón de detalles */}
                <div className="p-4 border-t sm:border-t-0 sm:border-l flex items-center justify-center bg-neutral-50">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/cliente/control/${control.id}`}>
                      Ver<span className="hidden md:inline ml-1">detalles</span>
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}