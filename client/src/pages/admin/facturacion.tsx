import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Search, 
  FileText, 
  Download, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown,
  Filter,
  Calendar
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Factura {
  id: string;
  clienteId: number;
  clienteNombre: string;
  fecha: string;
  vencimiento: string;
  importe: number;
  estado: "pagada" | "pendiente" | "vencida" | "cancelada";
  metodoPago: string;
  conceptos: {
    descripcion: string;
    cantidad: number;
    precio: number;
    importe: number;
  }[];
}

interface ResumenFacturacion {
  totalFacturado: number;
  pendienteCobro: number;
  facturasMes: number;
  facturasVencidas: number;
  tendenciaMensual: number;
}

export default function Facturacion() {
  // Estado para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Obtener resumen de facturación
  const { data: resumen, isLoading: isLoadingResumen } = useQuery<ResumenFacturacion>({
    queryKey: ["/api/admin/facturacion/resumen"],
    queryFn: async () => {
      // Simular obtención de datos
      return {
        totalFacturado: 145720.50,
        pendienteCobro: 12350.25,
        facturasMes: 32,
        facturasVencidas: 3,
        tendenciaMensual: 8.5
      };
    }
  });
  
  // Obtener facturas
  const { data: facturas, isLoading, isError } = useQuery<Factura[]>({
    queryKey: ["/api/admin/facturacion/facturas"],
    queryFn: async () => {
      // Simular obtención de datos
      return [
        {
          id: "FAC-2025-001",
          clienteId: 1,
          clienteNombre: "Restaurante La Plaza",
          fecha: "2025-03-01",
          vencimiento: "2025-04-01",
          importe: 199.99,
          estado: "pagada",
          metodoPago: "Tarjeta de crédito",
          conceptos: [
            {
              descripcion: "Suscripción mensual - Plan Profesional",
              cantidad: 1,
              precio: 199.99,
              importe: 199.99
            }
          ]
        },
        {
          id: "FAC-2025-002",
          clienteId: 2,
          clienteNombre: "Supermercados Rivera",
          fecha: "2025-03-01",
          vencimiento: "2025-04-01",
          importe: 399.99,
          estado: "pagada",
          metodoPago: "Domiciliación bancaria",
          conceptos: [
            {
              descripcion: "Suscripción mensual - Plan Empresarial",
              cantidad: 1,
              precio: 399.99,
              importe: 399.99
            }
          ]
        },
        {
          id: "FAC-2025-003",
          clienteId: 3,
          clienteNombre: "Catering Eventos Deluxe",
          fecha: "2025-03-01",
          vencimiento: "2025-04-01",
          importe: 199.99,
          estado: "pendiente",
          metodoPago: "Transferencia bancaria",
          conceptos: [
            {
              descripcion: "Suscripción mensual - Plan Profesional",
              cantidad: 1,
              precio: 199.99,
              importe: 199.99
            }
          ]
        },
        {
          id: "FAC-2025-004",
          clienteId: 4,
          clienteNombre: "Alimentos Congelados S.L.",
          fecha: "2025-02-01",
          vencimiento: "2025-03-01",
          importe: 99.99,
          estado: "vencida",
          metodoPago: "Transferencia bancaria",
          conceptos: [
            {
              descripcion: "Suscripción mensual - Plan Básico",
              cantidad: 1,
              precio: 99.99,
              importe: 99.99
            }
          ]
        },
        {
          id: "FAC-2025-005",
          clienteId: 5,
          clienteNombre: "Distribuidora Alimentaria Norte",
          fecha: "2025-03-01",
          vencimiento: "2025-04-01",
          importe: 399.99,
          estado: "pagada",
          metodoPago: "Tarjeta de crédito",
          conceptos: [
            {
              descripcion: "Suscripción mensual - Plan Empresarial",
              cantidad: 1,
              precio: 399.99,
              importe: 399.99
            }
          ]
        }
      ];
    }
  });
  
  // Aplicar filtros
  const facturasFiltradas = facturas?.filter(factura => {
    const matchSearch = factura.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        factura.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || factura.estado === statusFilter;
    
    return matchSearch && matchStatus;
  });
  
  // Formatear fecha
  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Formatear moneda
  const formatMoneda = (importe: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(importe);
  };
  
  // Obtener color de estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pagada': return "bg-green-100 text-green-700";
      case 'pendiente': return "bg-amber-100 text-amber-700";
      case 'vencida': return "bg-red-100 text-red-700";
      case 'cancelada': return "bg-neutral-100 text-neutral-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };
  
  // Traducir estado
  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pagada': return "Pagada";
      case 'pendiente': return "Pendiente";
      case 'vencida': return "Vencida";
      case 'cancelada': return "Cancelada";
      default: return estado;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !facturas) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>
          No se ha podido cargar la información de facturación. Por favor, inténtelo de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Facturación</h1>
        <p className="text-neutral-500">
          Gestión de facturación y cobros
        </p>
      </div>
      
      {/* Resumen de facturación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Total facturado</p>
                <h3 className="text-2xl font-bold mt-1">
                  {resumen ? formatMoneda(resumen.totalFacturado) : "-"}
                </h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Anual acumulado
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Pendiente de cobro</p>
                <h3 className="text-2xl font-bold mt-1">
                  {resumen ? formatMoneda(resumen.pendienteCobro) : "-"}
                </h3>
                <p className="text-xs text-amber-600 mt-1">
                  Facturas pendientes y vencidas
                </p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Facturas este mes</p>
                <h3 className="text-2xl font-bold mt-1">
                  {resumen?.facturasMes || "-"}
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  <span className="text-red-600">{resumen?.facturasVencidas || 0}</span> vencidas
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Tendencia mensual</p>
                <h3 className="text-2xl font-bold mt-1 flex items-center">
                  {resumen ? (
                    <>
                      {resumen.tendenciaMensual > 0 ? (
                        <ArrowUp className="h-5 w-5 text-green-600 mr-1" />
                      ) : (
                        <ArrowDown className="h-5 w-5 text-red-600 mr-1" />
                      )}
                      {Math.abs(resumen.tendenciaMensual)}%
                    </>
                  ) : "-"}
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Comparado con el mes anterior
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente o número de factura..."
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
                    <SelectValue placeholder="Estado" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pagada">Pagadas</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="vencida">Vencidas</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-auto">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de facturas */}
      {facturasFiltradas?.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No se encontraron facturas</h3>
          <p className="text-muted-foreground">
            No hay facturas que coincidan con los criterios de búsqueda.
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Facturas</CardTitle>
            <CardDescription>
              Lista de facturas emitidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facturasFiltradas?.map(factura => (
                <div 
                  key={factura.id} 
                  className="border rounded-lg p-4 grid grid-cols-1 lg:grid-cols-4 gap-4"
                >
                  <div>
                    <h4 className="font-medium">{factura.id}</h4>
                    <p className="text-sm text-neutral-500">{formatFecha(factura.fecha)}</p>
                  </div>
                  <div>
                    <p className="font-medium">{factura.clienteNombre}</p>
                    <p className="text-sm text-neutral-500">
                      Vencimiento: {formatFecha(factura.vencimiento)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      {factura.conceptos[0].descripcion}
                      {factura.conceptos.length > 1 && (
                        <span className="text-neutral-500"> + {factura.conceptos.length - 1} más</span>
                      )}
                    </p>
                    <p className="text-sm text-neutral-500">
                      Método: {factura.metodoPago}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{formatMoneda(factura.importe)}</p>
                      <Badge 
                        variant="outline" 
                        className={getEstadoColor(factura.estado)}
                      >
                        {getEstadoTexto(factura.estado)}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}