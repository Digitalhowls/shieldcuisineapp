import { useState } from "react";
import { useLocation, Link } from "wouter";
import Sidebar from "@/components/sidebar";
import TopBar from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { ShieldCheck, LayoutGrid, Warehouse, Store, Receipt, Utensils, PiggyBank } from "lucide-react";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  
  const modules = [
    {
      id: "appcc",
      title: "APPCC y Cumplimiento",
      description: "Controla y registra digitalmente todos los procesos APPCC, eliminando el papel y facilitando las auditorías.",
      icon: <ShieldCheck className="h-12 w-12 text-primary" />,
      path: "/appcc"
    },
    {
      id: "almacen",
      title: "Almacén y Trazabilidad",
      description: "Gestiona entradas, salidas, traslados y trazabilidad completa de alimentos e insumos.",
      icon: <Warehouse className="h-12 w-12 text-primary" />,
      path: "/almacen"
    },
    {
      id: "tpv",
      title: "TPV",
      description: "Sistema de punto de venta adaptado a distintos tipos de negocio: restaurante, tienda o industria.",
      icon: <Store className="h-12 w-12 text-primary" />,
      path: "/tpv"
    },
    {
      id: "facturas",
      title: "Facturación y Finanzas",
      description: "Automatiza la generación de facturas y el control de impuestos para contabilidad.",
      icon: <Receipt className="h-12 w-12 text-primary" />,
      path: "/facturas"
    },
    {
      id: "escandallos",
      title: "Escandallos y Fichas Técnicas",
      description: "Gestiona recetas, ingredientes, costos y etiquetado para productos elaborados.",
      icon: <Utensils className="h-12 w-12 text-primary" />,
      path: "/escandallos"
    },
    {
      id: "banca",
      title: "Banca y Finanzas",
      description: "Gestiona conexiones bancarias, cuentas, transacciones y categorización de gastos e ingresos.",
      icon: <PiggyBank className="h-12 w-12 text-primary" />,
      path: "/banca"
    }
  ];
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Panel Principal" 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-neutral-800">Bienvenido, {user?.name}</h2>
                <p className="text-neutral-500">
                  {new Date().toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {modules.map((module) => (
                <Card key={module.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      {module.icon}
                      <LayoutGrid className="h-5 w-5 text-neutral-300" />
                    </div>
                    <CardTitle className="mt-4">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Link href={module.path}>
                      <Button className="w-full">Acceder</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Controles Pendientes Hoy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">5</div>
                    <div className="ml-2 px-2 py-1 text-xs bg-warning bg-opacity-10 text-warning rounded-full">
                      Requiere Atención
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Productos Bajos de Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">3</div>
                    <div className="ml-2 px-2 py-1 text-xs bg-error bg-opacity-10 text-error rounded-full">
                      Crítico
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Tasa de Cumplimiento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-2xl font-bold">92%</div>
                    <div className="ml-2 px-2 py-1 text-xs bg-success bg-opacity-10 text-success rounded-full">
                      <i className="fas fa-arrow-up mr-1"></i>3%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-8 w-8 rounded-full bg-primary-light bg-opacity-20 flex items-center justify-center">
                        <i className="fas fa-check text-primary"></i>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-800">
                        <span className="font-medium">María Rodriguez</span> completó el control <span className="font-medium">Temperatura Cámaras</span>
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">Hace 45 minutos</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-8 w-8 rounded-full bg-warning bg-opacity-20 flex items-center justify-center">
                        <i className="fas fa-exclamation-triangle text-warning"></i>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-800">
                        <span className="font-medium">Sistema</span> detectó temperatura fuera de rango en <span className="font-medium">Cámara 2</span>
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">Hace 1 hora</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-8 w-8 rounded-full bg-info bg-opacity-20 flex items-center justify-center">
                        <i className="fas fa-pencil-alt text-info"></i>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-800">
                        <span className="font-medium">Carlos Sánchez</span> modificó la plantilla <span className="font-medium">Control Recepción</span>
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">Hace 3 horas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Ver Todas las Actividades</Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
