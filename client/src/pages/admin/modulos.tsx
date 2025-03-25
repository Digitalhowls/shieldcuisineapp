import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Settings, 
  Plus, 
  BarChart4, 
  Users, 
  ShieldCheck, 
  Wallet, 
  BookOpen,
  ArrowUpRight
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Modulo {
  id: string;
  nombre: string;
  descripcion: string;
  clientes: number;
  activo: boolean;
  precioBase: number;
  opciones: string[];
  iconComponent: React.ReactNode;
}

export default function Modulos() {
  // En un caso real, obtendríamos estos datos de la API
  const { data: modulos, isLoading, isError } = useQuery<Modulo[]>({
    queryKey: ["/api/admin/modulos"],
    queryFn: async () => {
      // Simular obtención de datos
      return [
        {
          id: "appcc",
          nombre: "APPCC",
          descripcion: "Gestión integral de controles APPCC para cumplimiento normativo.",
          clientes: 15,
          activo: true,
          precioBase: 75,
          opciones: ["Checklists dinámicos", "Programación de controles", "Alertas automáticas"],
          iconComponent: <ShieldCheck className="h-8 w-8 text-green-600" />
        },
        {
          id: "almacen",
          nombre: "Almacén",
          descripcion: "Control de inventario, trazabilidad y gestión de proveedores.",
          clientes: 12,
          activo: true,
          precioBase: 60,
          opciones: ["Pedidos automatizados", "Control de stock", "Alertas de caducidad"],
          iconComponent: <Package className="h-8 w-8 text-blue-600" />
        },
        {
          id: "transparencia",
          nombre: "Transparencia",
          descripcion: "Portal de transparencia para clientes y consumidores.",
          clientes: 8,
          activo: true,
          precioBase: 40,
          opciones: ["Portal personalizable", "Comunicación directa", "Acceso por QR"],
          iconComponent: <Users className="h-8 w-8 text-purple-600" />
        },
        {
          id: "banca",
          nombre: "Banca PSD2",
          descripcion: "Integración con APIs bancarias para gestión financiera.",
          clientes: 5,
          activo: true,
          precioBase: 90,
          opciones: ["Conexión multibanco", "Conciliación automática", "Reportes financieros"],
          iconComponent: <Wallet className="h-8 w-8 text-amber-600" />
        },
        {
          id: "elearning",
          nombre: "E-learning",
          descripcion: "Plataforma de formación para empleados en seguridad alimentaria.",
          clientes: 7,
          activo: true,
          precioBase: 50,
          opciones: ["Cursos interactivos", "Certificaciones", "Seguimiento de progreso"],
          iconComponent: <BookOpen className="h-8 w-8 text-indigo-600" />
        },
        {
          id: "analytics",
          nombre: "Analytics",
          descripcion: "Estadísticas avanzadas y Business Intelligence.",
          clientes: 4,
          activo: false,
          precioBase: 80,
          opciones: ["Dashboard personalizable", "Informes programados", "Exportación de datos"],
          iconComponent: <BarChart4 className="h-8 w-8 text-red-600" />
        }
      ];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !modulos) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertDescription>
          No se ha podido cargar la información de módulos. Por favor, inténtelo de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Módulos</h1>
          <p className="text-neutral-500">
            Gestión de módulos disponibles en la plataforma
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Módulo
        </Button>
      </div>
      
      {/* Grid de módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modulos.map(modulo => (
          <Card key={modulo.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-neutral-100">
                    {modulo.iconComponent}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {modulo.nombre}
                      <Badge 
                        variant="outline" 
                        className={modulo.activo ? "bg-green-100 text-green-700" : "bg-neutral-200"}
                      >
                        {modulo.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Base: {formatCurrency(modulo.precioBase)}/mes</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-0">
              <p className="text-sm text-neutral-600 mb-4">{modulo.descripcion}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {modulo.opciones.map((opcion, idx) => (
                  <Badge key={idx} variant="secondary">{opcion}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4 pt-3 bg-neutral-50">
              <p className="text-sm font-medium">
                <Users className="h-4 w-4 inline mr-1" />
                {modulo.clientes} cliente{modulo.clientes !== 1 ? 's' : ''}
              </p>
              <Button variant="outline" size="sm">
                Ver detalles
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}