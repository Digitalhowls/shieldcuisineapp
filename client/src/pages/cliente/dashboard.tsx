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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  Trophy,
  BarChart4,
  Calendar,
  ClipboardCheck,
  ThermometerSun
} from "lucide-react";
import { controlStatusEnum, controlTypeEnum } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DashboardData {
  estadisticas: {
    totalControles: number;
    controlesCompletados: number;
    controlesUltimos30Dias: number;
    tasaCumplimiento: number;
    problemasCriticos: number;
  };
  ultimosControles: ControlResumen[];
  proximosControles: ControlResumen[];
  historialTemperaturas?: {
    fecha: string;
    valor: number;
  }[];
}

interface ControlResumen {
  id: number;
  tipo: typeof controlTypeEnum.enumValues[number];
  nombre: string;
  estado: typeof controlStatusEnum.enumValues[number];
  fecha: string;
  responsable?: string;
  puntuacion?: number;
  problemas?: string[];
}

export default function ClienteDashboard({ empresaId }: { empresaId: number }) {
  // Obteniendo datos del dashboard
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: [`/api/cliente/empresas/${empresaId}/dashboard`],
    queryFn: async () => {
      // Simulamos obtención de datos del dashboard
      return {
        estadisticas: {
          totalControles: 124,
          controlesCompletados: 118,
          controlesUltimos30Dias: 14,
          tasaCumplimiento: 95.2,
          problemasCriticos: 0
        },
        ultimosControles: [
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
            problemas: ["Residuos en esquinas de la cámara de frío"]
          },
          {
            id: 3,
            tipo: "form",
            nombre: "Control Recepción Mercancía",
            estado: "completed",
            fecha: "2025-03-18T09:25:00Z",
            responsable: "Laura Martínez",
            puntuacion: 100
          }
        ],
        proximosControles: [
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
          }
        ],
        historialTemperaturas: [
          { fecha: "2025-03-22", valor: 2.4 },
          { fecha: "2025-03-21", valor: 2.5 },
          { fecha: "2025-03-20", valor: 2.3 },
          { fecha: "2025-03-19", valor: 2.6 },
          { fecha: "2025-03-18", valor: 2.4 },
          { fecha: "2025-03-17", valor: 2.1 },
          { fecha: "2025-03-16", valor: 2.3 }
        ]
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No se ha podido cargar la información del dashboard. Por favor, inténtelo de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  // Funciones auxiliares
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

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

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Controles completados</p>
                <h3 className="text-2xl font-bold mt-1">
                  {data.estadisticas.controlesCompletados} 
                  <span className="text-sm font-medium text-neutral-400 ml-1">
                    / {data.estadisticas.totalControles}
                  </span>
                </h3>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <ClipboardCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Tasa de cumplimiento</p>
                <h3 className="text-2xl font-bold mt-1">{data.estadisticas.tasaCumplimiento}%</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Últimos 30 días</p>
                <h3 className="text-2xl font-bold mt-1">{data.estadisticas.controlesUltimos30Dias}</h3>
              </div>
              <div className="p-2 bg-violet-100 rounded-full">
                <Calendar className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Problemas críticos</p>
                <h3 className="text-2xl font-bold mt-1">{data.estadisticas.problemasCriticos}</h3>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Últimos controles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimos controles realizados</CardTitle>
          <CardDescription>
            Controles de seguridad alimentaria completados recientemente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.ultimosControles.map(control => (
              <div key={control.id} className="border rounded-lg overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 pb-3 gap-4">
                  <div>
                    <div className="flex items-center mb-1">
                      <Badge className={obtenerColorEstado(control.estado)} variant="outline">
                        {obtenerTextoEstado(control.estado)}
                      </Badge>
                      {control.puntuacion !== undefined && (
                        <span className={`ml-2 text-sm font-medium ${control.puntuacion >= 90 ? 'text-success' : control.puntuacion >= 70 ? 'text-warning' : 'text-error'}`}>
                          {control.puntuacion}%
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium">{control.nombre}</h4>
                    <p className="text-sm text-neutral-500">
                      {formatearFecha(control.fecha)}
                      {control.responsable && ` · ${control.responsable}`}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/cliente/control/${control.id}`}>
                      Ver detalles
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                
                {control.problemas && control.problemas.length > 0 && (
                  <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-sm text-amber-800">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 mt-0.5 mr-2 text-amber-500" />
                      <div>
                        <strong>Aspectos a mejorar:</strong>
                        <ul className="list-disc ml-4 mt-1">
                          {control.problemas.map((problema, idx) => (
                            <li key={idx}>{problema}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-neutral-50 flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cliente/controles">
              Ver todos los controles
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      {/* Próximos controles */}
      {data.proximosControles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos controles programados</CardTitle>
            <CardDescription>
              Controles que se realizarán en los próximos días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.proximosControles.map(control => (
                <div key={control.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{control.nombre}</h4>
                    <p className="text-sm text-neutral-500">{formatearFecha(control.fecha)}</p>
                  </div>
                  <Badge className={obtenerColorEstado(control.estado)} variant="outline">
                    {obtenerTextoEstado(control.estado)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}