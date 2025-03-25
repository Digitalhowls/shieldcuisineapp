import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertCircle,
  ClipboardCheck,
  ThermometerSun,
  Undo2,
  ArrowRight
} from "lucide-react";
import { controlStatusEnum, controlTypeEnum } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface ControlDetalle {
  id: number;
  tipo: typeof controlTypeEnum.enumValues[number];
  nombre: string;
  estado: typeof controlStatusEnum.enumValues[number];
  fecha: string;
  responsable?: string;
  puntuacion?: number;
  resumen?: string;
  secciones: {
    id: string;
    titulo: string;
    descripcion?: string;
    campos: {
      id: string;
      tipo: string;
      etiqueta: string;
      valor: any;
      estado?: "ok" | "warning" | "error";
      notas?: string;
    }[];
  }[];
  problemas?: string[];
  acciones?: string[];
  observaciones?: string;
  imagenes?: string[];
  firma?: {
    nombre: string;
    cargo: string;
    fecha: string;
  };
}

export default function ClienteControlDetalle() {
  // Obtener ID del control de la URL
  const params = useParams<{ controlId: string }>();
  const controlId = params?.controlId;
  
  // También obtener parámetros de empresa y token
  const searchParams = new URLSearchParams(window.location.search);
  const empresaId = searchParams.get('empresa');
  const token = searchParams.get('token');
  
  // Obtener detalles del control
  const { data: control, isLoading, isError } = useQuery<ControlDetalle>({
    queryKey: [`/api/cliente/control/${controlId}`],
    queryFn: async () => {
      // Simulamos obtención de datos
      return {
        id: parseInt(controlId || "0"),
        tipo: "checklist",
        nombre: "Control Temperatura Cámaras",
        estado: "completed",
        fecha: "2025-03-22T10:15:00Z",
        responsable: "Carmen García",
        puntuacion: 100,
        resumen: "Control de temperaturas en cámaras frigoríficas realizado correctamente. Todas las temperaturas están dentro de los rangos establecidos.",
        secciones: [
          {
            id: "seccion1",
            titulo: "Cámara Refrigeración Principal",
            campos: [
              {
                id: "campo1",
                tipo: "temperatura",
                etiqueta: "Temperatura actual",
                valor: 2.4,
                estado: "ok"
              },
              {
                id: "campo2",
                tipo: "checkbox",
                etiqueta: "Limpieza adecuada",
                valor: true,
                estado: "ok"
              },
              {
                id: "campo3",
                tipo: "checkbox",
                etiqueta: "Estiba correcta",
                valor: true,
                estado: "ok"
              }
            ]
          },
          {
            id: "seccion2",
            titulo: "Cámara Congelación",
            campos: [
              {
                id: "campo4",
                tipo: "temperatura",
                etiqueta: "Temperatura actual",
                valor: -18.5,
                estado: "ok"
              },
              {
                id: "campo5",
                tipo: "checkbox",
                etiqueta: "Limpieza adecuada",
                valor: true,
                estado: "ok"
              },
              {
                id: "campo6",
                tipo: "checkbox",
                etiqueta: "Estiba correcta",
                valor: true,
                estado: "ok"
              }
            ]
          }
        ],
        firma: {
          nombre: "Carmen García",
          cargo: "Responsable de Calidad",
          fecha: "2025-03-22T10:20:00Z"
        }
      };
    },
    enabled: !!controlId
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !control) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No se ha podido cargar la información del control. Por favor, inténtelo de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  // Formatear fecha
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  // Renderizar valor de un campo
  const renderizarValorCampo = (campo: any) => {
    switch (campo.tipo) {
      case 'temperatura':
        return (
          <div className="flex items-center">
            <span className={`text-lg font-semibold ${
              campo.estado === "ok" ? "text-success" :
              campo.estado === "warning" ? "text-warning" : 
              campo.estado === "error" ? "text-error" : ""
            }`}>
              {campo.valor} °C
            </span>
            {campo.estado === "ok" && (
              <CheckCircle className="ml-2 h-4 w-4 text-success" />
            )}
            {campo.estado === "warning" && (
              <AlertCircle className="ml-2 h-4 w-4 text-warning" />
            )}
            {campo.estado === "error" && (
              <XCircle className="ml-2 h-4 w-4 text-error" />
            )}
          </div>
        );
      case 'checkbox':
        return campo.valor ? 
          <div className="flex items-center text-success"><CheckCircle className="h-5 w-5 mr-1" /> Correcto</div> : 
          <div className="flex items-center text-error"><XCircle className="h-5 w-5 mr-1" /> Incorrecto</div>;
      default:
        return <span>{campo.valor}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Botón volver */}
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm"
          asChild
        >
          <Link href={`/cliente/controles?empresa=${empresaId}&token=${token}`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver a controles
          </Link>
        </Button>
      </div>
      
      {/* Encabezado */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <Badge className={obtenerColorEstado(control.estado)} variant="outline">
              {obtenerTextoEstado(control.estado)}
            </Badge>
            {control.puntuacion !== undefined && (
              <Badge className={`ml-auto ${
                control.puntuacion >= 90 ? 'bg-success/20 text-success' : 
                control.puntuacion >= 70 ? 'bg-warning/20 text-warning' : 
                'bg-error/20 text-error'
              }`}>
                {control.puntuacion}%
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl">{control.nombre}</CardTitle>
          <CardDescription className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatearFecha(control.fecha)}
            {control.responsable && (
              <div className="flex items-center ml-3">
                <User className="h-4 w-4 mr-1" />
                {control.responsable}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        {control.resumen && (
          <CardContent>
            <p>{control.resumen}</p>
          </CardContent>
        )}
      </Card>
      
      {/* Secciones del control */}
      {control.secciones.map(seccion => (
        <Card key={seccion.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{seccion.titulo}</CardTitle>
            {seccion.descripcion && (
              <CardDescription>{seccion.descripcion}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {seccion.campos.map(campo => (
                <div key={campo.id} className="grid grid-cols-3 gap-4 items-center">
                  <div className="col-span-1 text-neutral-600">{campo.etiqueta}</div>
                  <div className="col-span-2">
                    {renderizarValorCampo(campo)}
                    {campo.notas && (
                      <p className="text-sm text-neutral-500 mt-1">{campo.notas}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Problemas y acciones */}
      {(control.problemas?.length || control.acciones?.length) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Incidencias y acciones correctivas</CardTitle>
          </CardHeader>
          <CardContent>
            {control.problemas && control.problemas.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Problemas detectados:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {control.problemas.map((problema, idx) => (
                    <li key={idx}>{problema}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {control.acciones && control.acciones.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Acciones correctivas:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {control.acciones.map((accion, idx) => (
                    <li key={idx}>{accion}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Firma */}
      {control.firma && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Validación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <p className="text-neutral-600">
                  <span className="font-medium">Firmado por:</span> {control.firma.nombre}
                </p>
                <p className="text-neutral-600">
                  <span className="font-medium">Cargo:</span> {control.firma.cargo}
                </p>
                <p className="text-neutral-600">
                  <span className="font-medium">Fecha:</span> {formatearFecha(control.firma.fecha)}
                </p>
              </div>
              <div className="mt-4 sm:mt-0 p-4 border rounded-md bg-neutral-50">
                <div className="flex items-center justify-center h-16 w-32">
                  <span className="text-neutral-400 italic">Firma digital</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Observaciones */}
      {control.observaciones && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Observaciones adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{control.observaciones}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}