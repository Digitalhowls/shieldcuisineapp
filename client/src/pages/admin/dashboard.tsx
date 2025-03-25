import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Building2, 
  Package, 
  Users,
  CreditCard,
  Activity
} from "lucide-react";

export default function Dashboard() {
  // En un caso real, obtendríamos estos datos de la API
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => {
      // Simular obtención de datos
      return {
        clientes: 15,
        clientesActivos: 12,
        modulos: 28,
        modulosActivos: 22,
        facturacionMensual: 14520,
        usuariosActivos: 45
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

  // Formatear moneda (euros)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard Administrativo</h1>
        <p className="text-neutral-500">
          Panel de control para la gestión de clientes, módulos y facturación
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Clientes</p>
                <h3 className="text-2xl font-bold mt-1">
                  {data.clientesActivos} 
                  <span className="text-sm font-medium text-neutral-400 ml-1">
                    / {data.clientes}
                  </span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Clientes activos / total
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Módulos</p>
                <h3 className="text-2xl font-bold mt-1">
                  {data.modulosActivos} 
                  <span className="text-sm font-medium text-neutral-400 ml-1">
                    / {data.modulos}
                  </span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Módulos activos / total
                </p>
              </div>
              <div className="p-2 bg-violet-100 rounded-full">
                <Package className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500">Facturación Mensual</p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatCurrency(data.facturacionMensual)}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Ingresos recurrentes
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Información adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="h-5 w-5 mr-2" />
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-neutral-500">Próximamente: registro de actividad del sistema</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Usuarios activos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2" />
              Usuarios activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total de usuarios activos:</span>
                <span className="font-medium">{data.usuariosActivos}</span>
              </div>
              <p className="text-neutral-500">Próximamente: desglose por tipo de usuario</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}